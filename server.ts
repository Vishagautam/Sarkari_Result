import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { SARKARI_DATA } from "./src/data/sarkariData";

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Lazy-loaded Gemini client getter to prevent crashing on startup if key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY environment variable is not configured in Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. CHAT ENDPOINT with full Sarkari database context
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, profile } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    let client;
    try {
      client = getGeminiClient();
    } catch (err: any) {
      return res.status(403).json({ 
        error: "Gemini API Key missing",
        message: "Please configure your GEMINI_API_KEY environment variable in the Secrets Panel before using the AI Assistant." 
      });
    }

    // Embed current Indian Standard Time / Year & current listings context in the systems instruction
    const currentTime = new Date().toISOString();
    const formattedProfile = profile
      ? `User Eligibility Profile:\n- Qualification: ${profile.qualification}\n- Stream: ${profile.stream}\n- Percentage: ${profile.percentage}%\n- Age: ${profile.age} Years\n- Gender: ${profile.gender}\n- Category: ${profile.category}`
      : "User profile: Not filled yet.";

    const systemInstruction = `
You are "AI Sarkari Mitra", a highly knowledgeable, empathetic, and certified Indian Government Exam Advisor. 
Your objective is to help candidates navigate the complex world of Government Job vacancies, Eligibility Criteria, Admit cards, Syllabus, and Exam Results.

Current standard date/time: ${currentTime}

Here is the master list of all current vacancies and exam notifications currently available on our website:
${JSON.stringify(SARKARI_DATA, null, 2)}

Instructions:
1. Provide accurate eligibility counseling based on the specific qualifications, age limits, and categories in the master list.
2. If the user fits an active job notification perfectly, enthusiastically highlight it.
3. Keep your advice professional, encouraging, and clear. Use standard bulleted formatting.
4. Support both English, Hindi, or bilingual code-switched Hinglish based on the user's input language. If they ask in Hindi, respond in clean Hindi or Hinglish.
5. Emphasize details like Application last date, Fee structure, and Syllabus where relevant.
6. Under no circumstances invent fake government notifications. If asked about a job not in the data, verify if it's a standard past exam or if they should search on official portals.

User Info:
${formattedProfile}
`;

    // Map conversation array to the expected format
    const formattedContents = messages.map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// 2. PROFILE MATCH ENDPOINT
app.post("/api/profile-match", async (req, res) => {
  try {
    const { profile } = req.body;
    if (!profile) {
      return res.status(400).json({ error: "Profile details are required." });
    }

    let client;
    try {
      client = getGeminiClient();
    } catch (err: any) {
      return res.status(403).json({ 
        error: "Gemini API Key missing",
        message: "Please configure your GEMINI_API_KEY environment variable in the Secrets Panel." 
      });
    }

    // We will ask Gemini to review the SARKARI_DATA array and match it to this specific user profile.
    // Return a structured review with direct scores/tags.
    const systemInstruction = `
You are an expert AI Eligibility Analyzer. Match the candidate's profile with our Master Sarkari Job Database.
User Profile:
- Qualification: ${profile.qualification}
- Stream: ${profile.stream}
- Age: ${profile.age} Years
- Gender: ${profile.gender}
- Category: ${profile.category}

Master Sarkari Data:
${JSON.stringify(SARKARI_DATA.filter(d => d.type === 'job'), null, 2)}

Provide a response in structured JSON array. Each element should match a job's ID and have:
1. jobId (string)
2. matchScore (number, 0 to 100)
3. matchStatus ("EXCELLENT" | "GOOD" | "NEEDS WORK/EXAM REQ" | "INELIGIBLE")
4. matchReason (string, clear 1-sentence explanation of why they match or why they are ineligible e.g., "Age exceeds limit" or "Perfect match for educational qualification").

Only return the JSON array, no markdown wrapper codeblocks (i.e. do NOT use \`\`\`json). Just the array.
`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Match the user profile with the available jobs and return the JSON evaluation.",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      }
    });

    const parsedText = response.text ? response.text.trim() : "[]";
    const parsedData = JSON.parse(parsedText);
    res.json(parsedData);
  } catch (error: any) {
    console.error("Match API Error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// Vite Middleware & Static Resource routing
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Configuring Vite middleware in development mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static production assets from /dist...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Sarkari Result Server running successfully on http://0.0.0.0:${PORT}`);
  });
}

initServer().catch((err) => {
  console.error("Failed to start Sarkari Result server:", err);
});
