import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3001;

  // Use JSON middleware with increased payload limit for larger book chapters
  app.use(express.json({ limit: "10mb" }));

  // Initialize Gemini SDK with telemetry User-Agent as instructed by the gemini-api skill
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Translation API Endpoint using Gemini 3.5 Flash
  app.post("/api/translate", async (req, res) => {
    const { title, content, targetLanguage } = req.body;

    if (!targetLanguage) {
      return res.status(400).json({ error: "Limba țintă lipsește (Target language is required)." });
    }

    try {
      const prompt = `You are a professional literary translator. Translate the following book chapter into ${targetLanguage}.
You must preserve ALL HTML tags, inline style classes, block indentations, and tag attributes exactly as they exist in the input content. Translate ONLY the actual user-readable words.

Original Title: "${title || ""}"
Original Content (with HTML):
${content || ""}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Translate the literary content accurately. Output an object containing both the translated title and the translated HTML content.",
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              translatedTitle: {
                type: Type.STRING,
                description: "The translated title of the chapter.",
              },
              translatedContent: {
                type: Type.STRING,
                description: "The translated HTML content of the chapter, preserving all HTML formatting tags.",
              },
            },
            required: ["translatedTitle", "translatedContent"],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Modelul nu a returnat niciun rezultat.");
      }

      const results = JSON.parse(responseText.trim());
      res.json({
        translatedTitle: results.translatedTitle || title,
        translatedContent: results.translatedContent || content,
      });
    } catch (error: any) {
      console.error("Error during translation:", error);
      res.status(500).json({
        error: error?.message || "Eroare internă în timpul traducerii automate.",
      });
    }
  });

  // Integration with Vite
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // For Express 4+, use app.get("*", ...)
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server starting on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical error starting Express + Vite server:", err);
});
