const { analyzeExcelFile } = require('../services/excelService');
const { generateNewsletterContent } = require('../services/aiService');
const { generateChart } = require('../services/chartService');

exports.generateNewsletter = async (req, res) => {
  try {
    const file = req.file;
    const {
      dataType = 'general',
      tone = 'professional',
      audience = 'internal team',
      goals = '',
      customNotes = '',
    } = req.body;

    const parsedData = await analyzeExcelFile(file.path);
    const previewData = JSON.stringify(parsedData.slice(0, 5), null, 2);

    const newsletterContent = await generateNewsletterContent({
      dataType,
      tone,
      audience,
      goals,
      customNotes,
      previewData
    });

    const chartFilePath = await generateChart(parsedData, dataType);

    res.json({
      newsletter: newsletterContent,
      chart: chartFilePath
    });

  } catch (error) {
    console.error('Newsletter Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate newsletter' });
  }
};
