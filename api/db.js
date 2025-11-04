const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key for backend operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Save a complete assessment to the database
 * @param {Object} data - Assessment data from frontend
 * @returns {Promise<string>} - Assessment ID (UUID)
 */
async function saveAssessment(data) {
  try {
    // Insert main assessment record
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .insert([{
        company_name: data.companyName,
        company_size: data.companySize,
        monthly_transactions: data.monthlyTransactions,
        primary_market: data.primaryMarket,
        overall_score: data.overallScore,
        risk_level: data.riskLevel,
        percentile: data.percentile
      }])
      .select()
      .single();

    if (assessmentError) throw assessmentError;

    const assessmentId = assessment.id;

    // Insert category scores
    if (data.categoryScores && data.categoryScores.length > 0) {
      const scoresData = data.categoryScores.map(score => ({
        assessment_id: assessmentId,
        category: score.category,
        score: score.score,
        max_score: score.maxScore,
        percentage: score.percentage
      }));

      const { error: scoresError } = await supabase
        .from('scores')
        .insert(scoresData);

      if (scoresError) throw scoresError;
    }

    // Insert individual question responses
    if (data.responses && data.responses.length > 0) {
      const responsesData = data.responses.map(resp => ({
        assessment_id: assessmentId,
        question_id: resp.questionId,
        question_text: resp.questionText,
        answer: resp.answer,
        points_earned: resp.pointsEarned
      }));

      const { error: responsesError } = await supabase
        .from('responses')
        .insert(responsesData);

      if (responsesError) throw responsesError;
    }

    // Insert identified gaps/weaknesses
    if (data.criticalGaps && data.criticalGaps.length > 0) {
      const gapsData = data.criticalGaps.map(gap => ({
        assessment_id: assessmentId,
        category: gap.category,
        issue: gap.issue,
        severity: gap.severity,
        impact: gap.impact
      }));

      const { error: gapsError } = await supabase
        .from('gaps')
        .insert(gapsData);

      if (gapsError) throw gapsError;
    }

    return assessmentId;

  } catch (error) {
    console.error('Error saving assessment:', error);
    throw error;
  }
}

/**
 * Retrieve a complete assessment by ID
 * @param {string} id - Assessment UUID
 * @returns {Promise<Object|null>} - Complete assessment data or null if not found
 */
async function getAssessment(id) {
  try {
    const { data: assessment, error } = await supabase
      .from('assessments')
      .select(`
        *,
        scores(*),
        responses(*),
        gaps(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      throw error;
    }

    return assessment;

  } catch (error) {
    console.error('Error retrieving assessment:', error);
    throw error;
  }
}

/**
 * Update assessment with email address (when user submits email)
 * @param {string} id - Assessment UUID
 * @param {string} email - User's email address
 * @returns {Promise<Object>} - Updated assessment
 */
async function updateAssessmentEmail(id, email) {
  try {
    const { data, error } = await supabase
      .from('assessments')
      .update({
        email,
        completed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data;

  } catch (error) {
    console.error('Error updating assessment email:', error);
    throw error;
  }
}

/**
 * Get assessment statistics (for admin dashboard)
 * @returns {Promise<Object>} - Statistics object
 */
async function getAssessmentStats() {
  try {
    const { count: totalAssessments } = await supabase
      .from('assessments')
      .select('*', { count: 'exact', head: true });

    const { count: completedAssessments } = await supabase
      .from('assessments')
      .select('*', { count: 'exact', head: true })
      .not('email', 'is', null);

    const { data: avgScore } = await supabase
      .rpc('avg_overall_score');

    const conversionRate = totalAssessments > 0
      ? ((completedAssessments / totalAssessments) * 100).toFixed(2)
      : 0;

    return {
      totalAssessments,
      completedAssessments,
      conversionRate,
      averageScore: avgScore || 0
    };

  } catch (error) {
    console.error('Error getting assessment stats:', error);
    throw error;
  }
}

module.exports = {
  saveAssessment,
  getAssessment,
  updateAssessmentEmail,
  getAssessmentStats,
  supabase // Export client for direct queries if needed
};
