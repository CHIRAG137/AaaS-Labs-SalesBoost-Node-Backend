const mongoose = require("mongoose");

const userConfigSchema = new mongoose.Schema({
  slackChannelId: String,
  slackBotToken: String,
  emailSender: String,
  emailPass: String,
  twilioSid: String,
  twilioAuthToken: String,
  twilioPhoneNumber: String,
});

module.exports = mongoose.model("UserConfig", userConfigSchema);
