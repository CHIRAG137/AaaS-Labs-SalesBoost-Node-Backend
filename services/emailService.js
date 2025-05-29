const { google } = require("googleapis");
const { logger } = require("../utils/winston");
const { getAdminAuthClient, createUserAuthClient } = require("../utils/googleAuth");
const { formatGmailDate } = require("../utils/date");

/**
 * Build Gmail query string based on start and end ISO dates.
 * @param {string} startISO - Start date in ISO format
 * @param {string} endISO - End date in ISO format
 * @returns {string} Gmail query string
 */
function buildGmailQuery(startISO, endISO) {
  const start = formatGmailDate(startISO);
  const endDate = new Date(endISO);
  // Add one day to include messages on the end date.
  endDate.setDate(endDate.getDate() + 1);
  const end = formatGmailDate(endDate.toISOString());
  return `after:${start} before:${end}`;
}

/**
 * Fetch sent email count for a user using user-specific impersonation.
 * @param {string} userEmail - User email to impersonate
 * @param {Object} dateRange - Date range object with startISO and endISO
 * @returns {Promise<number>} Count of sent emails
 */
async function getSentEmailCount(userEmail, dateRange) {
  try {
    const userAuth = await createUserAuthClient(userEmail, ["https://www.googleapis.com/auth/gmail.readonly"]);
    const query = buildGmailQuery(dateRange.startISO, dateRange.endISO);
    const gmail = google.gmail({ version: "v1", auth: userAuth });
    
    let sentCount = 0;
    let pageToken;
    
    do {
      const res = await gmail.users.messages.list({
        userId: "me",
        labelIds: ["SENT"],
        maxResults: 250,
        pageToken,
        q: query,
      });
      
      if (res.data.messages) {
        sentCount += res.data.messages.length;
      }
      
      pageToken = res.data.nextPageToken;
    } while (pageToken);
    
    return sentCount;
  } catch (error) {
    logger.error(`Error getting sent email count for ${userEmail}: ${error.message}`);
    return 0;
  }
}

/**
 * Generate email usage report for all users within a date range
 * @param {Object} dateRange - Date range object with startISO and endISO
 * @returns {Promise<Array>} Email report for all users
 */
async function generateEmailReport(dateRange) {
  try {
    const adminAuth = await getAdminAuthClient();
    const admin = google.admin({ version: "directory_v1", auth: adminAuth });
    
    const res = await admin.users.list({
      customer: "my_customer",
      maxResults: 100,
      orderBy: "email",
    });
    
    const users = res.data.users.map((user) => user.primaryEmail);
    const emailReport = [];
    
    for (const userEmail of users) {
      try {
        const count = await getSentEmailCount(userEmail, dateRange);
        emailReport.push({ email: userEmail, email_sent: count });
        logger.info(`Processed ${userEmail}: ${count} emails sent`);
      } catch (error) {
        logger.error(`Failed to process ${userEmail}: ${error.message}`);
        emailReport.push({ email: userEmail, email_sent: 0 });
      }
    }
    
    return emailReport;
  } catch (error) {
    logger.error(`Error generating email report: ${error.message}`);
    throw error;
  }
}

module.exports = { generateEmailReport };