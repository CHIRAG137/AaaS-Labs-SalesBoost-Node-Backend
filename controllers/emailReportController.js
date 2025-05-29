const { generateEmailReport } = require("../services/emailService");
const { getDateRange } = require("../utils/date");
const { logger } = require("../utils/winston");

/**
 * Get email count report for a specific period
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getEmailReport(req, res) {
  try {
    const { reportType = 'weekly' } = req.query;
    logger.info(`📅 Fetching ${reportType.toUpperCase()} email count...`);
    
    const dateRange = getDateRange(reportType);
    const emailReport = await generateEmailReport(dateRange);
    
    res.status(200).json({
      success: true,
      reportType,
      dateRange: {
        start: dateRange.startISO,
        end: dateRange.endISO
      },
      data: emailReport
    });
  } catch (error) {
    logger.error(`Email report error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to generate email report",
      error: error.message
    });
  }
}

/**
 * Run email report as a scheduled task (no HTTP response)
 * @param {string} reportType - Type of report to generate
 * @returns {Promise<Array>} Generated email report
 */
async function runScheduledEmailReport(reportType = 'daily') {
  try {
    logger.info(`📅 Running scheduled ${reportType.toUpperCase()} email report...`);
    const dateRange = getDateRange(reportType);
    return await generateEmailReport(dateRange);
  } catch (error) {
    logger.error(`Scheduled email report error: ${error.message}`);
    throw error;
  }
}

module.exports = { getEmailReport, runScheduledEmailReport };