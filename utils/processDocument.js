import fs from "fs";

import Document from "../models/document.js";

export const processDocument = async (documentId, filePath) => {
  try {
    const buffer = fs.readFileSync(filePath);
    const data = await pdf(buffer);

    await Document.findByIdAndUpdate(documentId, {
      extractedText: data.text,
      lastAccessed: "ready",
    });

    console.log("✅ Document processed:", documentId);

  } catch (error) {
    console.error("❌ PDF processing failed:", error);

    await Document.findByIdAndUpdate(documentId, {
      lastAccessed: "failed",
    });
  }
};
