import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questions: [
      {
        question: String,
        options: [String],
        correctAnswer: String,
      },
    ],
    score: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Quiz =
  mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);

export default Quiz;
