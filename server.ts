import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  let aiClient: GoogleGenAI | null = null;

  function getAIClient(): GoogleGenAI {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is not defined");
      }
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return aiClient;
  }

  // API endpoints
  app.post("/api/generate-quiz", async (req, res) => {
    try {
      const { topic, subTopic, difficulty = "mixed" } = req.body;
      if (!topic || typeof topic !== "string" || topic.trim() === "") {
        return res.status(400).json({ error: "Topic is required and must be a string." });
      }

      const ai = getAIClient();

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          subTopic: { type: Type.STRING },
          difficulty: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                questionNumber: { type: Type.INTEGER },
                questionText: { type: Type.STRING },
                options: {
                  type: Type.OBJECT,
                  properties: {
                    A: { type: Type.STRING },
                    B: { type: Type.STRING },
                    C: { type: Type.STRING },
                    D: { type: Type.STRING }
                  },
                  required: ["A", "B", "C", "D"]
                },
                correctOption: { 
                  type: Type.STRING, 
                  description: "The correct option key, either 'A', 'B', 'C', or 'D'" 
                },
                explanation: { type: Type.STRING, description: "Detailed explanation of why this option is correct and why others are incorrect" }
              },
              required: ["questionNumber", "questionText", "options", "correctOption", "explanation"]
            }
          }
        },
        required: ["topic", "difficulty", "questions"]
      };

      let topicQuery = topic;
      if (subTopic && typeof subTopic === "string" && subTopic.trim() !== "") {
        topicQuery = `${topic} (specifically focusing on ${subTopic})`;
      }

      const promptText = `Generate a high-quality educational quiz on the topic: "${topicQuery}".
Difficulty requested: ${difficulty}.

Follow these rules strictly:
1. Generate exactly 10 multiple-choice questions.
2. Each question must have 4 options labeled A, B, C, and D.
3. Only one option should be correct.
4. Cover different aspects of the topic thoroughly, including core concepts, history, applications, or common misconceptions.
5. If difficulty is "mixed", vary the questions from easy to medium. If a specific difficulty (Easy, Medium, Hard) is specified, target that level.
6. Provide an informative and concise explanation for the correct answer, helping the student learn the underlying concept.
7. Return the response as JSON matching the schema precisely. Make sure options are rich, clear, and distinct. Do not leave fields empty.`;

      const geminiRes = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          temperature: 0.7,
        }
      });

      const text = geminiRes.text;
      if (!text) {
        throw new Error("No response received from Gemini.");
      }

      const parsedQuiz = JSON.parse(text);
      // Ensure subTopic is preserved in the response
      if (subTopic) {
        parsedQuiz.subTopic = subTopic;
      }
      res.json(parsedQuiz);
    } catch (error: any) {
      console.error("Error generating quiz:", error);
      res.status(500).json({ error: error.message || "Failed to generate quiz." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
