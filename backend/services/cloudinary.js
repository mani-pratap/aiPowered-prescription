import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = (buffer, folder = 'prescriptions') => {
  return new Promise((resolve, reject) => {
    // If credentials are not set, return a mock URL for development
    if (!process.env.CLOUDINARY_API_KEY) {
      console.warn("Cloudinary credentials missing, returning mock image URL.");
      return resolve({ secure_url: 'https://via.placeholder.com/800x1200?text=Mock+Prescription+Image' });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};
