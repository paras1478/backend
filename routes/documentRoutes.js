import express from "express";
import upload from "../middleware/upload.js";

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

router.post("/upload", protect, upload.single("file"), uploadDocument);

router.get("/", protect, getDocuments);

router.get("/:id", protect, getDocument);

router.put("/:id", protect, updateDocument);

router.delete("/:id", protect, deleteDocument);


export default router;
