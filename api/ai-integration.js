/**
 * AI Integration using Claude API
 *
 * Handles all communication with Anthropic's Claude API
 * Implements caching strategy to reduce costs
 */

const Anthropic = require('@anthropic-ai/sdk');
const {
  generateExecutiveSummaryPrompt,
  generateFullAnalysisPrompt,
  generateCategoryDeepDivePrompt
} = require('./ai-prompts');

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// In-memory cache (in production, use Redis)
const cache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate cache key from assessment data
 * Excludes company name and email to maximize cache hits
 */
function generateCacheKey(assessmentData, type) {
  const { overallScore, riskLevel, categoryScores, responses } = assessmentData;

  // Create fingerprint of responses (not including company-specific info)
  const responseFingerprint = responses
    .map(r => `${r.questionId}:${r.answer}:${r.pointsEarned}`)
    .sort()
    .join('|');

  const categoryFingerprint = categoryScores
    .map(c => `${c.category}:${c.percentage}`)
    .join('|');

  const fingerprint = `${type}:${overallScore}:${riskLevel}:${categoryFingerprint}:${responseFingerprint}`;

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  return `ai_${type}_${Math.abs(hash)}`;
}

/**
 * Get from cache if exists and not expired
 */
function getFromCache(key) {
  const cached = cache.get(key);
  if (!cached) return null;

  const { data, timestamp } = cached;
  const age = Date.now() - timestamp;

  if (age > CACHE_TTL) {
    cache.delete(key);
    return null;
  }

  console.log(`[CACHE HIT] ${key} (saved API call)`);
  return data;
}

/**
 * Store in cache
 */
function setInCache(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
  console.log(`[CACHE STORE] ${key}`);
}

/**
 * Personalize cached response with company-specific information
 */
function personalizeResponse(cachedResponse, companyName, primaryMarket) {
  if (!cachedResponse) return null;

  // Replace placeholder company name with actual name
  let personalized = cachedResponse
    .replace(/\[COMPANY\]/g, companyName)
    .replace(/\[MARKET\]/g, primaryMarket);

  return personalized;
}

/**
 * Call Claude API with retry logic
 */
async function callClaudeAPI(prompt, maxTokens = 4000) {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[AI REQUEST] Attempt ${attempt}/${maxRetries}`);

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: maxTokens,
        temperature: 0.7,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      // Extract text from response
      const responseText = message.content[0].text;

      console.log(`[AI SUCCESS] Generated ${responseText.length} characters`);
      return responseText;

    } catch (error) {
      lastError = error;
      console.error(`[AI ERROR] Attempt ${attempt} failed:`, error.message);

      // Don't retry on authentication errors
      if (error.status === 401 || error.status === 403) {
        throw new Error('Invalid API key. Set ANTHROPIC_API_KEY environment variable.');
      }

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`[AI RETRY] Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  throw new Error(`AI generation failed after ${maxRetries} attempts: ${lastError.message}`);
}

/**
 * Generate Executive Summary (Tier 1 - Free Preview)
 */
async function generateExecutiveSummary(assessmentData) {
  const { companyName, primaryMarket } = assessmentData;

  // Check cache first
  const cacheKey = generateCacheKey(assessmentData, 'executive_summary');
  const cached = getFromCache(cacheKey);

  if (cached) {
    return personalizeResponse(cached, companyName, primaryMarket);
  }

  // Prepare assessment data with placeholder company name for caching
  const cacheableData = {
    ...assessmentData,
    companyName: '[COMPANY]',
    primaryMarket: '[MARKET]'
  };

  // Generate prompt
  const prompt = generateExecutiveSummaryPrompt(cacheableData);

  // Call Claude API
  const summary = await callClaudeAPI(prompt, 1000);

  // Cache the generic version
  setInCache(cacheKey, summary);

  // Return personalized version
  return personalizeResponse(summary, companyName, primaryMarket);
}

/**
 * Generate Full Analysis (Tier 2 - Email-Gated)
 */
async function generateFullAnalysis(assessmentData) {
  const { companyName, primaryMarket } = assessmentData;

  // Check cache first
  const cacheKey = generateCacheKey(assessmentData, 'full_analysis');
  const cached = getFromCache(cacheKey);

  if (cached) {
    const personalized = personalizeResponse(cached, companyName, primaryMarket);
    return JSON.parse(personalized);
  }

  // Prepare cacheable data
  const cacheableData = {
    ...assessmentData,
    companyName: '[COMPANY]',
    primaryMarket: '[MARKET]'
  };

  // Generate prompt
  const prompt = generateFullAnalysisPrompt(cacheableData);

  // Call Claude API (needs LOTS of tokens for comprehensive analysis - responses can be 30K+ chars)
  const analysisText = await callClaudeAPI(prompt, 16000);

  // Parse JSON response
  let analysis;
  try {
    // Try to extract JSON if wrapped in markdown code blocks
    const jsonMatch = analysisText.match(/```json\s*([\s\S]*?)\s*```/) ||
                      analysisText.match(/```\s*([\s\S]*?)\s*```/);

    let jsonText;
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
      console.log('[AI PARSE] Extracted JSON from code block');
    } else {
      jsonText = analysisText.trim();
      console.log('[AI PARSE] Using raw response as JSON');
    }

    // Attempt to parse
    analysis = JSON.parse(jsonText);
    console.log('[AI PARSE] Successfully parsed JSON');

  } catch (parseError) {
    console.error('[AI PARSE ERROR] Failed to parse JSON:', parseError.message);
    console.error('[AI PARSE ERROR] Response length:', analysisText.length);
    console.error('[AI PARSE ERROR] First 1000 chars:', analysisText.substring(0, 1000));
    console.error('[AI PARSE ERROR] Last 500 chars:', analysisText.substring(analysisText.length - 500));

    // Save to file for debugging
    const fs = require('fs');
    const debugPath = `debug-ai-response-${Date.now()}.txt`;
    fs.writeFileSync(debugPath, analysisText);
    console.error(`[AI PARSE ERROR] Full response saved to: ${debugPath}`);

    throw new Error('AI generated invalid JSON response - check debug file for details');
  }

  // Cache the generic version (as stringified JSON)
  setInCache(cacheKey, JSON.stringify(analysis));

  // Return personalized version
  const personalizedJSON = personalizeResponse(JSON.stringify(analysis), companyName, primaryMarket);
  return JSON.parse(personalizedJSON);
}

/**
 * Generate Category Deep-Dive (For Email Sequence)
 */
async function generateCategoryDeepDive(assessmentData, category) {
  const { companyName, primaryMarket } = assessmentData;

  // Check cache
  const cacheKey = generateCacheKey(assessmentData, `deepdive_${category.toLowerCase().replace(/\s+/g, '_')}`);
  const cached = getFromCache(cacheKey);

  if (cached) {
    const personalized = personalizeResponse(cached, companyName, primaryMarket);
    return JSON.parse(personalized);
  }

  // Prepare cacheable data
  const cacheableData = {
    ...assessmentData,
    companyName: '[COMPANY]',
    primaryMarket: '[MARKET]'
  };

  // Generate prompt
  const prompt = generateCategoryDeepDivePrompt(cacheableData, category);

  // Call Claude API
  const emailContent = await callClaudeAPI(prompt, 2000);

  // Parse JSON response
  let email;
  try {
    const jsonMatch = emailContent.match(/```json\s*([\s\S]*?)\s*```/) ||
                      emailContent.match(/```\s*([\s\S]*?)\s*```/);

    if (jsonMatch) {
      email = JSON.parse(jsonMatch[1]);
    } else {
      email = JSON.parse(emailContent);
    }
  } catch (parseError) {
    // If not JSON, treat as plain text
    email = {
      subject: `Deep Dive: ${category} Analysis for [COMPANY]`,
      body: emailContent
    };
  }

  // Cache generic version
  setInCache(cacheKey, JSON.stringify(email));

  // Return personalized version
  const personalizedJSON = personalizeResponse(JSON.stringify(email), companyName, primaryMarket);
  return JSON.parse(personalizedJSON);
}

/**
 * Get cache statistics (for monitoring)
 */
function getCacheStats() {
  const now = Date.now();
  const entries = Array.from(cache.entries());

  const stats = {
    totalEntries: entries.length,
    validEntries: entries.filter(([_, v]) => (now - v.timestamp) < CACHE_TTL).length,
    expiredEntries: entries.filter(([_, v]) => (now - v.timestamp) >= CACHE_TTL).length,
    oldestEntry: entries.length > 0
      ? Math.floor((now - Math.min(...entries.map(([_, v]) => v.timestamp))) / 1000 / 60)
      : 0,
    cacheHitRate: 'Track this in production with Redis'
  };

  return stats;
}

/**
 * Clear expired cache entries (call periodically)
 */
function cleanCache() {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, value] of cache.entries()) {
    if ((now - value.timestamp) >= CACHE_TTL) {
      cache.delete(key);
      cleaned++;
    }
  }

  console.log(`[CACHE CLEAN] Removed ${cleaned} expired entries`);
  return cleaned;
}

module.exports = {
  generateExecutiveSummary,
  generateFullAnalysis,
  generateCategoryDeepDive,
  getCacheStats,
  cleanCache
};
