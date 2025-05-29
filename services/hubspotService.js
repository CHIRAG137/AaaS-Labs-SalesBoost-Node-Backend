const axios = require("axios");

const HUBSPOT_BASE_URL = "https://api.hubapi.com";

const fetchAllSchemas = async (apiKey) => {
  try {
    const response = await axios.get(
      `${HUBSPOT_BASE_URL}/crm-object-schemas/v3/schemas?archived=false`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    // Extract schema names from response
    const schemaNames = response.data.results.map((schema) => schema.name);

    // Additional predefined schemas
    const additionalSchemas = ["companies", "contacts", "deals"];

    // Combine fetched schemas with predefined ones (removing duplicates)
    const allSchemaNames = [...new Set([...schemaNames, ...additionalSchemas])];

    return allSchemaNames;
  } catch (error) {
    console.error("Error fetching object schemas:", error.message);
    throw error;
  }
};

const exportObjectData = async (hubspotApiKey, payload) => {
  try {
    const response = await axios.post(`${HUBSPOT_BASE_URL}/crm/v3/exports/export/async`, payload, {
      headers: {
        Authorization: `Bearer ${hubspotApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error exporting object data:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to export data');
  }
};

module.exports = {
  fetchAllSchemas, exportObjectData
};
