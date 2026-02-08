import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.error(
    "FATAL ERROR: GEMINI_API_KEY is not set in the environment variables."
  );
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Generate flashcards from text
 * @param {string} text - Document text
 * @param {number} count - Number of flashcards to generate
 * @returns {Promise<Array<{question: string, answer: string, difficulty: string}>>}
 */
export const generateFlashcards = async (text, count = 10) => {
  const prompt = `
Generate exactly ${count} educational flashcards from the following text.

Format each flashcard as:
Q: [Clear, specific question]
A: [Concise, accurate answer]
D: [Difficulty level: easy, medium, or hard]

Separate each flashcard with "---"

Text:
${text.substring(0, 15000)}
`;

  try {
    const result = await model.generateContent(prompt);
const output = result.response.text();


    const generatedText = response.text;

    const flashcards = [];
    const cards = generatedText.split("---").filter(c => c.trim());

    for (const card of cards) {
      const lines = card.trim().split("\n");
      let question = "";
      let answer = "";
      let difficulty = "medium";

      for (const line of lines) {
        if (line.startsWith("Q:")) {
          question = line.substring(2).trim();
        } else if (line.startsWith("A:")) {
          answer = line.substring(2).trim();
        } else if (line.startsWith("D:")) {
          const diff = line.substring(2).trim().toLowerCase();
          if (["easy", "medium", "hard"].includes(diff)) {
            difficulty = diff;
          }
        }
      }

      if (question && answer) {
        flashcards.push({ question, answer, difficulty });
      }
    }

    return flashcards.slice(0, count);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate flashcards");
  }
};

/**
 * Generate quiz questions
 * @param {string} text - Document text
 * @param {number} numQuestions - Number of questions
 * @returns {Promise<Array<{question: string, options: Array, correctAnswer: string, explaination: string, defficulty: string}>>}
 */
export const generateQuiz = async (text, numQuestions = 5) => {
  if (!text || text.trim().length < 30) {
    return { error: "Document does not contain enough text" };
  }

  const prompt = `
Generate exactly ${numQuestions} multiple choice questions.

Format:
Q: Question
01: Option 1
02: Option 2
03: Option 3
04: Option 4
C: Correct option number (01-04)
E: Short explanation
D: easy | medium | hard

Separate questions with ---
Text:
${text.substring(0, 12000)}
`;

  try {
    const result = await model.generateContent(prompt);
    const output = result.response.text();

    if (!output) return { error: "Empty AI response" };

    const questions = output
      .split("---")
      .map(q => q.trim())
      .filter(Boolean)
      .map(block => {
        const question = block.match(/^Q:\s*(.*)/m)?.[1];
        const options = [...block.matchAll(/^0[1-4]:\s*(.*)$/gm)].map(m => m[1]);
        const correct = block.match(/^C:\s*(0[1-4])/m)?.[1];

        if (!question || options.length !== 4 || !correct) return null;

        return {
          question,
          options,
          correctAnswer: options[Number(correct) - 1],
        };
      })
      .filter(Boolean);

    return { questions };
  } catch (err) {
    console.error("QUIZ GENERATOR ERROR:", err);
    return { error: "Quiz generation failed" };
  }
};


/**
 * Generate document summary
 * @param {string} text - Document text
 * @returns {Promise<string>}
 */
export const generateSummary = async (text) => {
  const prompt = `
Provide a concise summary of the following text, highlighting the key concepts and main ideas,and import point.
Keep the summary clear and structured.

Text:
${text.substring(0, 20000)}
`;

  try {
   const result = await model.generateContent(prompt);
const summary  = result.response.text();


    return response.text;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate summary");
  }
};

/**
 * Chat with document context
 * @param {string} question - User question
 * @param {string} context - Document context
 * @returns {Promise<string>}
 */
export const chatWithContext = async (question, context) => {
  const prompt = `
Based on the following context from a document, analyse the context and answer the user's question.
If the answer is not in the context, say so.

Context:
${context}

Question: ${question}

Answer:
`;

  try {
   const result = await model.generateContent(prompt);
const output = result.response.text();


    return response.text;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to process chat request");
  }
};

/**
 * Explain a specific concept
 * @param {string} concept - Concept to explain
 * @param {string} context - Relevant context
 * @returns {Promise<string>}
 */
export const explainConcept = async (concept, context) => {
  const prompt = `
Explain the concept of "${concept}" based on the following context.
Provide a clear, educational explanation that's easy to understand.
Include examples if relevant.

Context:
${context.substring(0, 10000)}
`;

  try {
   const result = await model.generateContent(prompt);
const output = result.response.text();


    return response.text;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to explain concept");
  }
};
