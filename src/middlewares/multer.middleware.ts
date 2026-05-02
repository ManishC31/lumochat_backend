import multer from "multer";
import type { FileFilterCallback } from "multer";
import path from "path";
import { type Request } from "express";

const ALLOWED_MIME_PREFIXES = ["image/", "audio/", "video/"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + extension;
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowed = ALLOWED_MIME_PREFIXES.some((prefix) => file.mimetype.startsWith(prefix));
  if (allowed) {
    cb(null, true);
  } else {
    cb(new Error("Only image, audio, and video files are allowed."));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});
