const dotenv = require("dotenv");
const { logger } = require("../utils/winston");

// Configure environment variables
dotenv.config({ path: "../../.env" });

/**
 * Get environment variables with validation
 * @returns {Object} Object containing validated environment variables
 */
function getEnvVariables() {
  try {
    const SERVICE_ACCOUNT_FILE = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    const ADMIN_EMAIL = process.env.GSUITE_ADMIN;
    
    if (!SERVICE_ACCOUNT_FILE) {
      throw new Error("GOOGLE_CREDENTIALS environment variable is missing or invalid");
    }
    
    if (!ADMIN_EMAIL) {
      throw new Error("GSUITE_ADMIN environment variable is missing");
    }
    
    return {
      SERVICE_ACCOUNT_FILE,
      ADMIN_EMAIL
    };
  } catch (error) {
    logger.error(`Environment configuration error: ${error.message}`);
    throw error;
  }
}

module.exports = { getEnvVariables };