const UserConfig = require("../models/UserConfig");
const { extractInvoiceData } = require("../services/aiService");
const { fillDocWithUserConfig } = require("../services/googleDocService");
const { sendCustomEmail } = require("../services/nodemailerService");
const { sendCustomSMS } = require("../services/twilioSmsService");
const { sendSlackMessage } = require("../services/slackService");

exports.handleSlackEvent = async (req, res) => {
  const event = req.body;
  if (!event || event.type !== "message" || event.bot_id) {
    return res.sendStatus(200);
  }

  const { channel, text } = event;
  const config = await UserConfig.findOne({ slackChannelId: channel });

  if (!config) {
    return res.status(400).send("Channel not registered.");
  }

  try {
    const data = await extractInvoiceData(text);
    const requiredFields = [
      "name",
      "email",
      "phone",
      "address",
      "cost",
      "item",
    ];
    const missing = requiredFields.filter((field) => !data[field]);
    if (missing.length > 0) {
      await sendSlackMessage(
        config.slackBotToken,
        channel,
        `Missing fields: ${missing.join(", ")}`
      );
      return res.status(200).send("Failed to Send Invoice");
    }

    const pdf = await fillDocWithUserConfig(
      data,
      process.env.GOOGLE_DOC_TEMPLATE_ID
    );
    await sendCustomEmail(data.email, pdf, config);
    await sendCustomSMS(data.phone, config);
    await sendSlackMessage(
      config.slackBotToken,
      channel,
      `Invoice sent to ${data.email}`
    );

      return res.status(200).send("Sent Invoice");
  } catch (err) {
    console.error("Error handling Slack event:", err);
    res.status(500).send("Internal Server Error");
  }
};
