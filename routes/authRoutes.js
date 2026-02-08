import express from "express";
import { body } from "express-validator";


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

// Register validation
const registerValidation = [
  body("username")
    .trim()
    .isLength({ min: 3 })
    .withMessage("username must be at least 3 characters"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("please provide a valid email"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters"),
];

// Login validation
const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("please provide a valid email"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters"),
];

// Public routes
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/google", googleLogin);


// Protected routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.post("/change-password", protect, changePassword);

export default router;
