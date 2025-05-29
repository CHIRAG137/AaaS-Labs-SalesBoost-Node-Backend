const { google } = require("googleapis");
const { getAdminAuthClient } = require("../utils/googleAuth");
const { logger } = require("../utils/winston");

/**
 * Retrieve all users from Google Workspace
 * @returns {Promise<Array<string>>} List of user emails
 */
async function getAllUsers() {
  try {
    const auth = await getAdminAuthClient();
    const admin = google.admin({ version: "directory_v1", auth });
    
    const res = await admin.users.list({
      customer: "my_customer",
      maxResults: 100,
      orderBy: "email",
    });
    
    return res.data.users.map((user) => user.primaryEmail);
  } catch (error) {
    logger.error(`Error fetching users: ${error.message}`);
    throw error;
  }
}

module.exports = { getAllUsers };