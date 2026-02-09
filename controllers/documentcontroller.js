import mongoose from "mongoose";
import fs from "fs";
import path from "path";

import Document from "../models/document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";

import { extractPdfText } from "../utils/extractpdfText.js";
import { chunkText } from "../utils/textChunker.js";

export const uploadDocument = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

   
    if (!file.mimetype.includes("pdf")) {
      return res.status(400).json({ message: "Only PDF files are allowed" });
    }

  
    if (!fs.existsSync(file.path)) {
      return res.status(500).json({ message: "Uploaded file not found on server" });
    }

    const extractedText = await extractPdfText(file.path);
    const chunks = chunkText(extractedText).map((content, index) => ({
      content,
      chunkIndex: index,
    }));

    const document = await Document.create({
      userId: req.user._id,
      title: req.body.title || file.originalname.replace(/\.pdf$/i, ""),
      fileName: file.filename, 
      filePath: `/uploads/documents/${file.filename}`, 
      fileSize: file.size,
      extractedText,
      chunks,
      status: "ready",
    });

    res.status(201).json(document);
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ message: "Upload failed" });
  }
};

export const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ userId: req.user._id })
      .select("-chunks -extractedText")
      .sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    next(error);
  }
};

export const getDocument = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid document ID" });
    }

    const document = await Document.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.json(document);
  } catch (error) {
    next(error);
  }
};

export const updateDocument = async (req, res, next) => {
  try {
    const document = await Document.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { title: req.body.title },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.json(document);
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    await Flashcard.deleteMany({ documentId: document._id });
    await Quiz.deleteMany({ documentId: document._id });

    const absolutePath = path.join(process.cwd(), document.filePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    await document.deleteOne();

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
