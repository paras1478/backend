import express from "express";
import multer from "multer";

import {
  uploadDocument,
  getDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
} from "../controllers/documentcontroller.js";

import protect from "../middleware/auth.js";

const router = express.Router();
const upload = multer({ dest: "uploads/documents" });

// Upload
router.post("/upload", protect, upload.single("file"), uploadDocument);

// Get all documents
router.get("/", protect, getDocuments);

// Get single document
router.get("/:id", protect, getDocument);

// Update document
router.put("/:id", protect, updateDocument);

// Delete document
router.delete("/:id", protect, deleteDocument);

// REMOVED download route that forced attachment
// router.get("/download/:id", ...)

export default router;
