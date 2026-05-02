import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";
import fs from "fs/promises";

export const compressImage = async (filePath: string) => {
  try {
    const imageBuffer = await fs.readFile(filePath);
    await sharp(imageBuffer).jpeg({ quality: 30 }).toFile(filePath);
  } catch (error) {
    console.error("compressImage err:", error);
    throw error;
  }
};

export const uploadImage = async (imagePath: string) => {
  if (!imagePath) {
    throw new Error("Image path is required");
  }

  const options: any = {
    use_filename: true,
    unique_filename: true,
    overwrite: false,
    folder: "lumochat",
    resource_type: "auto", // handles image, video, and audio
  };

  try {
    const result = await cloudinary.uploader.upload(imagePath, options);
    return result.secure_url;
  } catch (error) {
    console.error("uploadImage err:", error);
    throw error;
  } finally {
    fs.unlink(imagePath);
  }
};
