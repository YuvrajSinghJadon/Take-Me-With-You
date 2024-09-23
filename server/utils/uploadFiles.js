import cloudinary from "cloudinary";
import fs from "fs";
// Configure Cloudinary (add your cloudinary credentials here)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_KEY_SECRET,
});
 
// Function to upload to Cloudinary
export const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    
    console.log("Uploading image to Cloudinary:", localFilePath);

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",  // This allows any kind of media (image, video, etc.)
    });

    console.log("Cloudinary Upload Successful:", response.url);

    // Delete local file after successful upload
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error.message);
    fs.unlinkSync(localFilePath); // Clean up temp file if upload fails
    throw new Error("Failed to upload image to Cloudinary");
  }
};
