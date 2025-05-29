const twilio = require('twilio');

exports.sendCustomSMS = async (to, config) => {
  const client = twilio(config.twilioSid, config.twilioAuthToken);

  await client.messages.create({
    body: 'Your invoice has been emailed to you.',
    from: config.twilioPhoneNumber,
    to
  });
};