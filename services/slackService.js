const axios = require('axios');

exports.sendSlackMessage = async (botToken, channel, text) => {
  await axios.post('https://slack.com/api/chat.postMessage', {
    channel,
    text
  }, {
    headers: { Authorization: `Bearer ${botToken}` }
  });
};