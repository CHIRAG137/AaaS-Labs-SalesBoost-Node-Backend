const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.generateNewsletterContent = async ({
  dataType,
  tone,
  audience,
  goals,
  customNotes,
  previewData,
}) => {
  const prompt = `
You are an expert AI Business Analyst and Insight Strategist.

Given the preview of structured data below, your task is to go **beyond summarization** and produce **data-driven business insights** for a newsletter.

🎯 GOAL:
Generate sharp, analytical insights that highlight trends, outliers, correlations, and opportunities for improvement. Suggest actionable steps or business decisions, and present them in the form of a crisp, engaging newsletter (under 300 words).

Do NOT describe the data literally. Focus on:
- Emerging trends
- Notable shifts or anomalies
- Comparisons across entities
- Metrics that signal concern or opportunity
- Hidden correlations
- Strategic recommendations

---

📌 CONTEXT:
- Data Type: ${dataType}
- Tone: ${tone}
- Audience: ${audience}
- Goal: ${goals}
- Notes: ${customNotes}

---

📊 DATA PREVIEW:
${previewData}

---

✍️ FORMAT:
- Start with a compelling subject line or opening sentence.
- Highlight 2–4 business insights using bullet points or mini-sections.
- Include actionable recommendations based on the insights.
- Avoid surface-level or descriptive statements.
- Avoid copying raw field values unless critical to the insight.

🧠 Think like a data scientist advising a business leader.
📈 Write like you're summarizing a quarterly business review.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices[0].message.content;
};

exports.extractInvoiceData = async (text) => {
  const prompt = `Extract these fields from the input: name, email, phone, address, item, cost. Return them as JSON. If any is missing, set its value to null.\nInput: """${text}"""`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
  });

  return JSON.parse(response.choices[0].message.content);
};
