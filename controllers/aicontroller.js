import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";

import Document from "../models/document.js";
import ChatHistory from "../models/ChatHistory.js";
import Quiz from "../models/Quiz.js";
import Flashcard from "../models/Flashcard.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});


export const generateFlashcardsFromText = async (text, count = 10) => {
  try {
    const prompt = `
You are an expert teacher.

Generate ${count} flashcards from the text below.

Rules:
- Question–answer based
- Clear and concise
- No repetition
- Return ONLY valid JSON
- No markdown, no explanation

JSON format:
[
  { "question": "string", "answer": "string" }
]

TEXT:
"""
${text}
"""
`;

    const result = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    // ✅ CORRECT Gemini response path
    const aiText =
      result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      console.error("FLASHCARD AI: Empty response");
      return [];
    }

    const match = aiText.match(/\[[\s\S]*\]/);
    if (!match) {
      console.error("FLASHCARD AI: JSON not found");
      return [];
    }

    return JSON.parse(match[0]);
  } catch (err) {
    console.error("FLASHCARD AI ERROR:", err.message);
    return [];
  }
};



export const generateFlashcardsAI = async (req, res) => {
  try {
    let { documentId, count = 10 } = req.body;

    if (!documentId) {
      return res.status(400).json({ message: "documentId is required" });
    }

    count = Number(count);
    if (isNaN(count) || count <= 0) count = 10;

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
    });

    if (!document || !document.extractedText?.trim()) {
      return res.status(404).json({ message: "Document not found" });
    }

    const text = document.extractedText.slice(0, 8000);

    const flashcards = await generateFlashcardsFromText(text, count);

    // ❌ AI failed → DO NOT TOUCH DB
    if (!Array.isArray(flashcards) || flashcards.length === 0) {
      return res.status(400).json({
        success: false,
        message: "AI could not generate flashcards",
      });
    }

    // ✅ Append cards instead of overwrite
    const flashcardSet = await Flashcard.findOneAndUpdate(
      {
        userId: req.user._id,
        documentId,
      },
      {
        $push: {
          cards: { $each: flashcards },
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    return res.status(201).json({
      success: true,
      data: flashcardSet,
    });
  } catch (err) {
    console.error("FLASHCARD AI ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to generate flashcards",
    });
  }
};


export const generateQuizAI = async (req, res) => {
  try {
    const { documentId, numQuestions = 5 } = req.body;

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
    });

    if (!document || !document.extractedText?.trim()) {
      return res.status(404).json({ message: "Document not found" });
    }

    const prompt = `
You are an expert teacher.

Generate ${numQuestions} UNIQUE multiple-choice questions
based ONLY on the document below.

Rules:
- Questions must test understanding, not copy sentences
- Each question must be different
- 4 meaningful options
- Only ONE correct answer
- Do NOT use template phrases
- Do NOT repeat questions
- Return ONLY valid JSON

JSON format:
[
  {
    "question": "string",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "one option exactly"
  }
]

DOCUMENT:
"""
${document.extractedText}
"""
`;

    const result = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const aiText =
      result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      return res.status(400).json({
        success: false,
        message: "AI failed to generate quiz",
      });
    }

    const match = aiText.match(/\[[\s\S]*\]/);
    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Invalid AI quiz format",
      });
    }

    const questions = JSON.parse(match[0]);

    const quiz = await Quiz.create({
      userId: req.user._id,
      documentId,
      questions,
    });

    return res.status(201).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    console.error("QUIZ AI ERROR:", error.message);
    return res.status(500).json({ message: "Quiz AI failed" });
  }
};



export const generateSummary = async (req, res) => {
  try {
    const { documentId } = req.body;

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
    });

    if (!document || !document.extractedText) {
      return res.status(404).json({ message: "Document not found" });
    }

    const result = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: document.extractedText.slice(0, 8000),
    });

    return res.json({ summary: result.text });
  } catch (error) {
    console.error("SUMMARY ERROR:", error);
    return res.status(500).json({ message: "Failed to generate summary" });
  }
};

export const explainConcept = async (req, res) => {
  try {
    const { documentId, concept } = req.body;

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
    });

    if (!document || !document.extractedText) {
      return res.status(404).json({ message: "Document not found" });
    }

    const result = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: `Explain "${concept}" simply.\n\n${document.extractedText.slice(
        0,
        8000
      )}`,
    });

    return res.json({ explanation: result.text });
  } catch (error) {
    console.error("EXPLAIN ERROR:", error);
    return res.status(500).json({ message: "Failed to explain concept" });
  }
};

export const chatWithContext = async (req, res) => {
  try {
    const { documentId, question } = req.body;

    if (!question?.trim()) {
      return res.status(400).json({ message: "Question required" });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
    });

    if (!document || !document.extractedText?.trim()) {
      return res.status(404).json({ message: "Document not found" });
    }

    const prompt = `
You are an AI tutor.

Answer the user's question using ONLY the document content.
Be clear, friendly, and educational.
If the answer is not in the document, say so clearly.

DOCUMENT:
"""
${document.extractedText.slice(0, 6000)}
"""

USER QUESTION:
"${question}"
`;

    const result = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    return res.json({
      answer: result.response.text(),
    });
  } catch (err) {
    console.error("CHAT ERROR:", err);
    return res.status(500).json({ message: "AI failed" });
  }
};


export const getChatHistory = async (req, res) => {
  try {
    const { documentId } = req.params;

    const history = await ChatHistory.find({
      userId: req.user._id,
      documentId,
    }).sort({ createdAt: 1 });

    return res.json(history);
  } catch (err) {
    return res.status(500).json({ message: "History failed" });
  }
};
