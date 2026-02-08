import Quiz from "../models/Quiz.js";

export const createQuiz = async (req, res) => {
  try {
    const { documentId, questions } = req.body;

    if (!documentId || !questions || !questions.length) {
      return res.status(400).json({
        success: false,
        message: "documentId and questions are required",
      });
    }

    const quiz = await Quiz.create({
      documentId,
      questions,
      userId: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    console.error("Create Quiz Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get all quizzes for a document
 * @route   GET /api/quizzes/:documentId
 * @access  Private
 */
export const getQuizzes = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { documentId } = req.params;

    const quizzes = await Quiz.find({
      documentId,
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: quizzes.length,
      data: quizzes,
    });
  } catch (error) {
    console.error("Get Quizzes Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * @desc    Get single quiz by ID
 * @route   GET /api/quizzes/quiz/:id
 * @access  Private
 */

export const getQuizById = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: user missing",
      });
    }

    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    res.json({ success: true, data: quiz });
  } catch (error) {
    console.error("getQuizById error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



/**
 * @desc    Submit quiz answers
 * @route   POST /api/quizzes/:id/submit
 * @access  Private
 */
export const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;

    // ✅ answers must be an ARRAY
    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Answers must be an array",
      });
    }

    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!quiz || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Quiz not found or has no questions",
      });
    }

    let correctCount = 0;

    // ✅ INDEX-BASED MATCH (frontend compatible)
    const results = quiz.questions.map((q, index) => {
      const selectedAnswer = answers[index] ?? null;
      const isCorrect = selectedAnswer === q.correctAnswer;

      if (isCorrect) correctCount++;

      return {
        question: q.question,
        selectedAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
      };
    });

    const total = results.length;
    const score =
      total > 0 ? Math.round((correctCount / total) * 100) : 0;

    // ✅ SAVE EVERYTHING
    quiz.score = score;
    quiz.results = results;
    quiz.isSubmitted = true;

    await quiz.save();

    res.json({
      success: true,
      quiz: {
        score: quiz.score,
      },
      results,
    });
  } catch (error) {
    console.error("Submit Quiz Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};








/**
 * @desc    Get quiz results
 * @route   GET /api/quizzes/:id/results
 * @access  Private
 */
export const getQuizResults = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    res.json({
      success: true,
      quiz: {
        _id: quiz._id,
        score: quiz.score,
      },
      results: quiz.results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


 


/**
 * @desc    Delete a quiz
 * @route   DELETE /api/quizzes/:id
 * @access  Private
 */
export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    res.json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    console.error("Delete Quiz Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
