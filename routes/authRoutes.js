import express from "express";
import { body, validationResult } from "express-validator";

import {
  googleLogin,
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/authcontroller.js";

import protect from "../middleware/auth.js";

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  next();
};

const registerValidation = [
  body("username")
    .trim()
    .notEmpty().withMessage("username is required")
    .isLength({ min: 3 }).withMessage("username must be at least 3 characters"),

  body("email")
    .notEmpty().withMessage("email is required")
    .isEmail().withMessage("please provide a valid email"),

  body("password")
    .notEmpty().withMessage("password is required")
    .isLength({ min: 6 }).withMessage("password must be at least 6 characters"),
];

const loginValidation = [
  body("email")
    .notEmpty().withMessage("email is required")
    .isEmail().withMessage("please provide a valid email"),

  body("password")
    .notEmpty().withMessage("password is required")
    .isLength({ min: 6 }).withMessage("password must be at least 6 characters"),
];

router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);
router.post("/google", googleLogin);

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.post("/change-password", protect, changePassword);

export default router;
