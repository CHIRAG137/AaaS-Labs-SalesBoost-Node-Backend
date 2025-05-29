// Extending the existing date.js with additional functions

/**
 * Get standardized date ranges for different report types
 * @param {string} reportType - Type of report (daily, weekly, monthly)
 * @returns {Object} Object with start and end dates
 */
function getReportDates(reportType) {
    const now = new Date();
    let start = new Date(now);
    
    switch (reportType.toLowerCase()) {
      case 'daily':
        start.setDate(now.getDate() - 1);
        break;
      case 'weekly':
        start.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'quarterly':
        start.setMonth(now.getMonth() - 3);
        break;
      default:
        // Default to weekly
        start.setDate(now.getDate() - 7);
    }
    
    // Set times to get full days
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
  }
  
  /**
   * Get the full date range object with ISO strings and timestamps
   * @param {string} reportType - Type of report (daily, weekly, monthly)
   * @returns {Object} Object with dates in different formats
   */
  function getDateRange(reportType) {
    const { start, end } = getReportDates(reportType);
    return {
      startISO: start.toISOString(),
      endISO: end.toISOString(),
      startTimestamp: start.getTime(),
      endTimestamp: end.getTime(),
    };
  }
  
  /**
   * Format a date string (ISO) into Gmail query format (YYYY/MM/DD) using PST
   * @param {string} dateString - ISO date string
   * @returns {string} Gmail query formatted date
   */
  function formatGmailDate(dateString) {
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" })
      .replace(/-/g, "/");
  }
  
  module.exports = { getReportDates, getDateRange, formatGmailDate };