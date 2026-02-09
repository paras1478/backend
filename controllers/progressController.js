import Document from "../models/document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";



export const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;


    const totalDocuments = await Document.countDocuments({ userId });
    const totalFlashcardSets = await Flashcard.countDocuments({ userId });
    const totalQuizzes = await Quiz.countDocuments({ userId });
    const completedQuizzes = await Quiz.countDocuments({
      userId,
      completedAt: { $ne: null },
    });


    const flashcardSets = await Flashcard.find({ userId });

    let totalFlashcards = 0;
    let reviewFlashcards = 0;
    let starredFlashcards = 0;

    flashcardSets.forEach((set) => {
      totalFlashcards += set.cards.length;
      reviewFlashcards += set.cards.filter(
        (c) => c.reviewCount > 0
      ).length;
      starredFlashcards += set.cards.filter(
        (c) => c.isStarred
      ).length;
    });


    const quizzes = await Quiz.find({
      userId,
      completedAt: { $ne: null },
    });

    const averageScore =
      quizzes.length > 0
        ? Math.round(
            quizzes.reduce((sum, q) => sum + q.score, 0) /
              quizzes.length
          )
        : 0;


        
    const recentDocuments = await Document.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("title fileName status updatedAt");

    const recentQuizzes = await Quiz.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("documentId", "title")
      .select("score totalQuestions completedAt");


    const studyStreak = Math.floor(Math.random() * 7) + 1;


    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalDocuments,
          totalFlashcardSets,
          totalFlashcards,
          reviewFlashcards,
          starredFlashcards,
          totalQuizzes,
          completedQuizzes,
          averageScore,
          studyStreak,
        },
        recentActivity: {
          documents: recentDocuments,
          quizzes: recentQuizzes,
        },
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    next(error);
  }
};
