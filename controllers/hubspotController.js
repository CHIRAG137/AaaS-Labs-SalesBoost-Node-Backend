const hubspotService = require("../services/hubspotService");

const getAllSchemas = async (req, res) => {
  const { hubspotApiKey } = req.body;

  if (!hubspotApiKey) {
    return res
      .status(400)
      .json({ error: "Missing HubSpot API key in request body." });
  }
  try {
    const data = await hubspotService.fetchAllSchemas(hubspotApiKey);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const exportHubspotData = async (req, res) => {
  const {
    hubspotApiKey,
    objectType,
    objectProperties,
    associatedObjectType,
    exportName,
    format,
    query,
    filters,
    sorts,
  } = req.body;

  if (!hubspotApiKey || !objectType || !objectProperties?.length) {
    return res
      .status(400)
      .json({
        error:
          "Missing required fields: hubspotApiKey, objectType, or objectProperties",
      });
  }

  const payload = {
    exportType: "VIEW",
    format: format || "XLS",
    exportName: exportName || `export_${objectType}`,
    objectType,
    objectProperties,
    associatedObjectType: associatedObjectType || null,
    language: "EN",
    exportInternalValuesOptions: ["NAMES"],
    overrideAssociatedObjectsPerDefinitionPerRowLimit: true,
    publicCrmSearchRequest: {
      query: query || "",
      filters: filters || [],
      sorts: sorts || [],
    },
  };

  try {
    const exportResult = await hubspotService.exportObjectData(
      hubspotApiKey,
      payload
    );
    res.json(exportResult);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllSchemas,
  exportHubspotData,
};
