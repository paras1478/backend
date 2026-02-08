import express from "express";
import {
  getQuizzes,
  getQuizById,
  submitQuiz,
  getQuizResults,
  deleteQuiz,
  createQuiz,
} from "../controllers/QuizController.js";
import protect from "../middleware/auth.js";

const router = express.Router();

 router.use(protect);

router.get("/results/:id", getQuizResults);
router.get("/:id/results", getQuizResults);

// quiz actions
router.post("/:id/submit", submitQuiz);
router.get("/quiz/:id", getQuizById);
router.delete("/:id", deleteQuiz);

// document related
router.get("/document/:documentId", getQuizzes);

// create LAST
router.post("/create", createQuiz);


export default router;
