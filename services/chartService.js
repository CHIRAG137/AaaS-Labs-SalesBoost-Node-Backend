const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const OpenAI = require("openai");
const path = require('path');
const fs = require('fs');

const width = 800;
const height = 600;
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.generateChart = async (data, dataType) => {
  const prompt = `
You are a data visualization expert. Based on the sample dataset provided below (dataType: "${dataType}"), choose the most relevant and insightful chart to represent the key patterns.

Respond ONLY with a valid JSON object in this format:

{
  "type": "<chart_type>",
  "data": {
    "labels": [...],
    "datasets": [{
      "label": "<dataset_label>",
      "data": [...],
      "backgroundColor": "<color>"
    }]
  },
  "options": {
    "plugins": {
      "title": {
        "display": true,
        "text": "<chart_title>"
      }
    }
  }
}

Sample data:
${JSON.stringify(data.slice(0, 10), null, 2)}
`;

  try {
    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
      });
    
      const raw =  response.choices[0].message.content;

    // Safe parse JSON response
    const chartConfig = JSON.parse(raw);

    const imageBuffer = await chartJSNodeCanvas.renderToBuffer(chartConfig);
    const filePath = path.join('uploads', `${dataType}-chart.png`);
    fs.writeFileSync(filePath, imageBuffer);
    return `/${filePath}`;
  } catch (error) {
    console.error('Chart generation error:', error.response?.data || error.message);
    return null;
  }
};
