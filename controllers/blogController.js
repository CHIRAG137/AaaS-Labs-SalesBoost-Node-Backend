const axios = require("axios");
const { OpenAI } = require("openai");
const {
  OPENAI_API_KEY,
  ASSISTANT_ID_CONTENT,
  ASSISTANT_ID_PROMPT,
  IMAGINE_API_KEY,
} = require("../config/dotenv");
const FormData = require("form-data");

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Helper function to wait for assistant run completion
const waitForRunCompletion = async (threadId, runId, maxAttempts = 30) => {
  let attempts = 0;

  while (attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);

    if (runStatus.status === "completed") {
      return runStatus;
    } else if (["failed", "cancelled", "expired"].includes(runStatus.status)) {
      throw new Error(
        `Assistant run ${runStatus.status}: ${
          runStatus.last_error?.message || "Unknown error"
        }`
      );
    }

    attempts++;
  }

  throw new Error("Assistant response timed out");
};

// Helper function to extract and clean content
const extractTextContent = (messages) => {
  const lastMessage = messages.data.find((msg) => msg.role === "assistant");

  if (
    !lastMessage ||
    !lastMessage.content ||
    lastMessage.content.length === 0
  ) {
    return null;
  }

  let contentText = lastMessage.content
    .filter((item) => item.type === "text")
    .map((item) => item.text.value)
    .join(" ")
    .trim();

  // Remove code block formatting
  contentText = contentText.replace(/```json\s*|\s*```/g, "").trim();

  return contentText;
};

// Helper function to safely parse JSON
const safeJsonParse = (text) => {
  if (!text) {
    throw new Error("No content to parse");
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("JSON Parse Error:", error.message);
    console.error(
      "Content that failed to parse:",
      text.substring(0, 200) + "..."
    );

    // Try to fix common JSON issues
    let fixedText = text;

    // Remove any leading/trailing non-JSON characters
    const jsonStart = fixedText.indexOf("{");
    const jsonEnd = fixedText.lastIndexOf("}");

    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      fixedText = fixedText.substring(jsonStart, jsonEnd + 1);

      try {
        return JSON.parse(fixedText);
      } catch (secondError) {
        console.error("Second parse attempt failed:", secondError.message);
      }
    }

    // If all parsing fails, return the text as is
    throw new Error(`Failed to parse JSON: ${error.message}`);
  }
};

const generateTitles = async (req, res) => {
  try {
    const { keywords } = req.body;
    console.log("keywords: ", keywords);

    if (!keywords || keywords.length === 0) {
      return res.status(400).json({
        error: "Keywords input is required and must be a non-empty array",
      });
    }

    const thread = await openai.beta.threads.create();

    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: `Generate detailed, SEO-optimized titles based on these keywords: ${
        Array.isArray(keywords) ? keywords.join(", ") : keywords
      }. Please return the response as valid JSON format.`,
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_ID_CONTENT,
    });

    // Wait for completion with better error handling
    await waitForRunCompletion(thread.id, run.id);

    const messages = await openai.beta.threads.messages.list(thread.id);
    const contentText = extractTextContent(messages);

    if (!contentText) {
      return res.status(404).json({
        status: "error",
        message: "No text content found in assistant response",
      });
    }

    console.log("Raw content from assistant:", contentText);

    try {
      const parsedContent = safeJsonParse(contentText);
      res.json({
        status: "success",
        generated_content: parsedContent,
      });
    } catch (parseError) {
      // If JSON parsing fails, return as plain text
      console.warn("JSON parsing failed, returning as plain text");
      res.json({
        status: "success",
        generated_content: { text: contentText },
        note: "Content returned as plain text due to JSON parsing issues",
      });
    }
  } catch (error) {
    console.error("Error generating titles:", error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      details: error.message,
    });
  }
};

const generateMetadata = async (req, res) => {
  try {
    const { title } = req.body;
    console.log("title: ", title);

    if (!title) {
      return res.status(400).json({ error: "Title input is required" });
    }

    const thread = await openai.beta.threads.create();

    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: `Generate detailed, SEO-optimized metadata based on this title: "${title}". Please return the response as valid JSON format.`,
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_ID_CONTENT,
    });

    await waitForRunCompletion(thread.id, run.id);

    const messages = await openai.beta.threads.messages.list(thread.id);
    const contentText = extractTextContent(messages);

    if (!contentText) {
      return res.status(404).json({
        status: "error",
        message: "No text content found in assistant response",
      });
    }

    console.log("Raw metadata content:", contentText);

    try {
      const parsedContent = safeJsonParse(contentText);
      res.json({
        status: "success",
        generated_content: parsedContent,
      });
    } catch (parseError) {
      console.warn("JSON parsing failed, returning as plain text");
      res.json({
        status: "success",
        generated_content: { text: contentText },
        note: "Content returned as plain text due to JSON parsing issues",
      });
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      details: error.message,
    });
  }
};

const generateContent = async (req, res) => {
  try {
    const { title, keywords, Instructions } = req.body;

    console.log("title: ", title);
    console.log("Keywords: ", keywords);
    console.log("Instructions: ", Instructions);

    if (!title || !keywords) {
      return res.status(400).json({
        error: "Title and keywords input are required",
      });
    }

    const thread = await openai.beta.threads.create();

    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: `Generate detailed, SEO-optimized content based on:
                Title: ${title}
                Keywords: ${
                  Array.isArray(keywords) ? keywords.join(", ") : keywords
                }
                Additional Instructions: ${Instructions || "None"}
                
                Please return the response as valid JSON format if structured data is expected, otherwise provide well-formatted text.`,
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_ID_CONTENT,
    });

    await waitForRunCompletion(thread.id, run.id);

    const messages = await openai.beta.threads.messages.list(thread.id);
    const contentText = extractTextContent(messages);

    if (!contentText) {
      return res.status(404).json({
        status: "error",
        message: "No content found in assistant response",
      });
    }

    console.log("Generated Content:", contentText.substring(0, 200) + "...");

    // Try parsing as JSON first, if it fails return as plain text
    try {
      const jsonContent = safeJsonParse(contentText);
      res.json({ status: "success", generated_content: jsonContent });
    } catch (parseError) {
      // If parsing fails, return plain text
      res.json({
        status: "success",
        generated_content: { content: contentText },
        note: "Content returned as plain text",
      });
    }
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      details: error.message,
    });
  }
};

const generatePrompt = async (article) => {
  try {
    if (!article) {
      return "Article is required";
    }

    const thread = await openai.beta.threads.create();

    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: article,
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_ID_PROMPT,
    });

    await waitForRunCompletion(thread.id, run.id);

    const messages = await openai.beta.threads.messages.list(thread.id);
    const contentText = extractTextContent(messages);

    return contentText || "No text content found";
  } catch (error) {
    console.error("Error generating prompt:", error);
    return `Error: ${error.message}`;
  }
};

const generateImage = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text input is required" });
    }

    // Get the prompt from OpenAI Assistant
    const prompt = await generatePrompt(text);

    console.log("Generated prompt: ", prompt);

    if (!prompt || prompt.includes("Error")) {
      return res.status(500).json({
        error: "Failed to generate prompt",
        details: prompt,
      });
    }

    // Prepare multipart form data
    const formdata = new FormData();
    formdata.append("prompt", prompt);
    formdata.append("style", "flux-dev-fast");
    formdata.append("aspect_ratio", "1:1");

    // Make the API request using axios
    const response = await axios.post(
      "https://api.vyro.ai/v2/image/generations",
      formdata,
      {
        headers: {
          Authorization: `Bearer ${IMAGINE_API_KEY}`,
          ...formdata.getHeaders(),
        },
        responseType: "arraybuffer",
      }
    );

    // Set proper headers for image response
    res.setHeader("Content-Type", "image/png");
    res.setHeader(
      "Content-Disposition",
      'inline; filename="generated-image.png"'
    );

    // Send image as binary data
    res.send(Buffer.from(response.data, "binary"));
  } catch (error) {
    console.error("Error generating image:", error);
    res.status(500).json({
      error: "Failed to generate image",
      details: error.message,
    });
  }
};

module.exports = {
  generateTitles,
  generateMetadata,
  generateContent,
  generateImage,
};
