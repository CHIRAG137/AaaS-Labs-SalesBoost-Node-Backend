const express = require('express');
const multer = require('multer');
const { generateNewsletter } = require('../controllers/newsletterController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/generate', upload.single('excel'), generateNewsletter);

module.exports = router;
