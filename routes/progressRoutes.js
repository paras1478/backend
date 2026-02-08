import express from "express";
import { getDashboard } from "../controllers/progressController.js";
import protect from "../middleware/auth.js";

const router = express.Router();

// protect all progress routes
router.use(protect);

// GET /api/progress/dashboard
router.get("/dashboard", getDashboard);

export default router;
