const express = require("express");
const router = express.Router();
const hubspotController = require("../controllers/hubspotController");

router.post("/schemas", hubspotController.getAllSchemas);
router.post("/export", hubspotController.exportHubspotData);

module.exports = router;
