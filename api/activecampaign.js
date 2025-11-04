/**
 * ActiveCampaign Integration Helper
 *
 * Handles contact creation, tagging, and automation triggers
 * Documentation: https://developers.activecampaign.com/
 */

const fetch = require('node-fetch');

const AC_API_URL = process.env.AC_API_URL;
const AC_API_KEY = process.env.AC_API_KEY;

/**
 * Create or update a contact in ActiveCampaign
 * Uses the contact/sync endpoint which creates if not exists, updates if exists
 *
 * @param {Object} contactData - Contact information
 * @returns {Promise<Object>} - Created/updated contact
 */
async function createOrUpdateContact(contactData) {
  try {
    const response = await fetch(`${AC_API_URL}/api/3/contact/sync`, {
      method: 'POST',
      headers: {
        'Api-Token': AC_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contact: {
          email: contactData.email,
          firstName: contactData.firstName || '',
          lastName: contactData.lastName || '',
          phone: contactData.phone || '',
          fieldValues: contactData.fieldValues || []
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ActiveCampaign API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.contact;

  } catch (error) {
    console.error('Error creating/updating contact:', error);
    throw error;
  }
}

/**
 * Add tags to a contact
 * Creates tags if they don't exist
 *
 * @param {string} contactId - ActiveCampaign contact ID
 * @param {string} riskLevel - CRITICAL, HIGH, MODERATE, or LOW
 * @returns {Promise<void>}
 */
async function tagContact(contactId, riskLevel) {
  try {
    // Map risk levels to tags
    const tagMap = {
      'CRITICAL': ['Lead Magnet', 'Critical Risk', 'High Priority', 'Hot Lead'],
      'HIGH': ['Lead Magnet', 'High Risk', 'Medium Priority'],
      'MODERATE': ['Lead Magnet', 'Moderate Risk', 'Low Priority'],
      'LOW': ['Lead Magnet', 'Low Risk', 'Nurture']
    };

    const tags = tagMap[riskLevel] || ['Lead Magnet'];

    // Add each tag to the contact
    for (const tagName of tags) {
      // First, get or create the tag
      const tagResponse = await fetch(`${AC_API_URL}/api/3/tags`, {
        method: 'POST',
        headers: {
          'Api-Token': AC_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tag: {
            tag: tagName,
            tagType: 'contact',
            description: `Auto-generated from Brokerage Intelligence Platform`
          }
        })
      });

      let tagId;
      if (tagResponse.ok) {
        const tagData = await tagResponse.json();
        tagId = tagData.tag.id;
      } else {
        // Tag might already exist, try to find it
        const searchResponse = await fetch(`${AC_API_URL}/api/3/tags?search=${encodeURIComponent(tagName)}`, {
          headers: {
            'Api-Token': AC_API_KEY
          }
        });

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          if (searchData.tags && searchData.tags.length > 0) {
            tagId = searchData.tags[0].id;
          }
        }
      }

      // Now associate tag with contact
      if (tagId) {
        await fetch(`${AC_API_URL}/api/3/contactTags`, {
          method: 'POST',
          headers: {
            'Api-Token': AC_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contactTag: {
              contact: contactId,
              tag: tagId
            }
          })
        });
      }
    }

  } catch (error) {
    console.error('Error tagging contact:', error);
    // Don't throw - tagging is not critical, just log the error
  }
}

/**
 * Add contact to an automation
 *
 * @param {string} contactId - ActiveCampaign contact ID
 * @param {number} automationId - ActiveCampaign automation ID
 * @returns {Promise<Object>}
 */
async function addToAutomation(contactId, automationId) {
  try {
    const response = await fetch(`${AC_API_URL}/api/3/contactAutomations`, {
      method: 'POST',
      headers: {
        'Api-Token': AC_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contactAutomation: {
          contact: contactId,
          automation: automationId
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to add to automation: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.contactAutomation;

  } catch (error) {
    console.error('Error adding contact to automation:', error);
    throw error;
  }
}

/**
 * Update custom field values for a contact
 *
 * @param {string} contactId - ActiveCampaign contact ID
 * @param {Object} fields - Key-value pairs of custom fields
 * @returns {Promise<void>}
 */
async function updateCustomFields(contactId, fields) {
  try {
    // First, get all field definitions to map names to IDs
    const fieldsResponse = await fetch(`${AC_API_URL}/api/3/fields`, {
      headers: {
        'Api-Token': AC_API_KEY
      }
    });

    if (!fieldsResponse.ok) {
      throw new Error('Failed to fetch field definitions');
    }

    const fieldsData = await fieldsResponse.json();
    const fieldMap = {};

    // Create a map of field titles to field IDs
    fieldsData.fields.forEach(field => {
      fieldMap[field.title] = field.id;
    });

    // Update each field value
    for (const [fieldName, fieldValue] of Object.entries(fields)) {
      const fieldId = fieldMap[fieldName];

      if (fieldId) {
        await fetch(`${AC_API_URL}/api/3/fieldValues`, {
          method: 'POST',
          headers: {
            'Api-Token': AC_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fieldValue: {
              contact: contactId,
              field: fieldId,
              value: String(fieldValue)
            }
          })
        });
      }
    }

  } catch (error) {
    console.error('Error updating custom fields:', error);
    // Don't throw - field updates are not critical
  }
}

/**
 * Check if ActiveCampaign is configured
 *
 * @returns {boolean}
 */
function isConfigured() {
  return !!(AC_API_URL && AC_API_KEY);
}

module.exports = {
  createOrUpdateContact,
  tagContact,
  addToAutomation,
  updateCustomFields,
  isConfigured
};
