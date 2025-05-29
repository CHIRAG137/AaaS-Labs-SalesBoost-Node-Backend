const {
  generateImage,
  generateTitles,
  generateMetadata,
  generateContent,
} = require("../controllers/blogController.js");
const express = require("express")

const router = express.Router();

router.post("/generate-titles", generateTitles);
router.post("/generate-metadata", generateMetadata);
router.post("/generate-content", generateContent);
router.post("/generate-image", generateImage);

module.exports = router;
