import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import errorhandler from "./middleware/errorhandler.js";

import authRoutes from "./routes/authRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import flashcardRoutes from "./routes/flashcardRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();


connectDB();


app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));


app.use(
  "/uploads/documents",
  express.static(path.join(__dirname, "uploads/documents"), {
    setHeaders: (res) => {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);


app.get("/ping", (req, res) => {
  res.status(200).json({ message: "Server is alive" });
});


app.use("/auth", authRoutes);
app.use("/documents", documentRoutes);
app.use("/flashcards", flashcardRoutes);
app.use("/ai", aiRoutes);
app.use("/quizzes", quizRoutes);
app.use("/progress", progressRoutes);



app.use(errorhandler);


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
