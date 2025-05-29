const express = require('express');
const router = express.Router();
const { handleSlackEvent } = require('../controllers/slackController');

router.post('/events', handleSlackEvent);

module.exports = router;
