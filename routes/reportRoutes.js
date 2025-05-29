const express = require('express');
const { getEmailReport } = require('../controllers/emailReportController');

const router = express.Router();

/**
 * @route GET /api/reports/email
 * @desc Get email usage report
 * @access Private (API Key)
 * @query {string} reportType - Type of report (daily, weekly, monthly, quarterly)
 */
router.get('/email', getEmailReport);

module.exports = router;