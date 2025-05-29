const express = require('express');
const router = express.Router();
const { setupUserConfig } = require('../controllers/userConfigController');

router.post('/setup', setupUserConfig);

module.exports = router;
