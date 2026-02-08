import express from "express";
import protect from "../middleware/auth.js";
import {
  generateFlashcardsAI,
  generateQuizAI,
  generateSummary,
  explainConcept,
  chatWithContext,
  getChatHistory,
} from "../controllers/aicontroller.js";

const router = express.Router();

router.use(protect);

router.post("/generate-flashcards", generateFlashcardsAI);
router.post("/generate-quiz", generateQuizAI);
router.post("/generate-summary", generateSummary);
router.post("/explain-concept", explainConcept);

router.post("/chat", chatWithContext);
router.get("/chat-history/:documentId", getChatHistory);

export default router;
