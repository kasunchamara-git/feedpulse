import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

export const analyzeFeedback = async (title: string, description: string) => {
  const prompt = `Analyse this product feedback. Return ONLY valid JSON with no markdown, no backticks, just raw JSON with these fields:
  category (Bug, Feature Request, Improvement, or Other),
  sentiment (Positive, Neutral, or Negative),
  priority_score (number 1-10),
  summary (short string under 20 words),
  tags (array of 2-4 strings).

  Feedback Title: ${title}
  Feedback Description: ${description}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Gemini Error FULL:", JSON.stringify(error, null, 2));
    console.error("Gemini Error MESSAGE:", error);
    return null;
  }
};