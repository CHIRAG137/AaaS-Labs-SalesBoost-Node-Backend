const { google } = require("googleapis");
const { getEnvVariables } = require("../config/googleEnvConfig");
const { logger } = require("./winston");

/**
 * Get a Google Auth client for admin operations
 * @returns {Promise<Object>} Google Auth JWT client
 */
async function getAdminAuthClient() {
  try {
    const { SERVICE_ACCOUNT_FILE, ADMIN_EMAIL } = getEnvVariables();
    
    return new google.auth.JWT(
      SERVICE_ACCOUNT_FILE.client_email,
      null,
      SERVICE_ACCOUNT_FILE.private_key,
      ["https://www.googleapis.com/auth/admin.directory.user.readonly"],
      ADMIN_EMAIL
    );
  } catch (error) {
    logger.error(`Error creating admin auth client: ${error.message}`);
    throw error;
  }
}

/**
 * Create a Google Auth client for user-specific operations
 * @param {string} userEmail - Email to impersonate
 * @param {Array<string>} scopes - Google API scopes
 * @returns {Promise<Object>} Google Auth JWT client
 */
async function createUserAuthClient(userEmail, scopes) {
  try {
    const { SERVICE_ACCOUNT_FILE } = getEnvVariables();
    
    return new google.auth.JWT(
      SERVICE_ACCOUNT_FILE.client_email,
      null,
      SERVICE_ACCOUNT_FILE.private_key,
      scopes,
      userEmail
    );
  } catch (error) {
    logger.error(`Error creating user auth client for ${userEmail}: ${error.message}`);
    throw error;
  }
}

module.exports = { getAdminAuthClient, createUserAuthClient };