const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

class RailwayStorageService {
  constructor() {
    this.baseUrl =
      process.env.RAILWAY_STORAGE_URL || "https://storage.railway.app";
    this.apiKey = process.env.RAILWAY_STORAGE_API_KEY;
  }

  /**
   * Upload a file to Railway Storage
   * @param {string} filePath - Local file path
   * @param {string} fileName - Name to save as in storage
   * @param {string} folder - Folder path in storage (optional)
   * @returns {Promise<string>} - Public URL of uploaded file
   */
  async uploadFile(filePath, fileName, folder = "") {
    try {
      // For now, we'll use local storage and return a local URL
      // In production, you would upload to Railway Storage here
      const storagePath = path.join(
        __dirname,
        "../../uploads",
        folder,
        fileName
      );
      const storageDir = path.dirname(storagePath);

      // Ensure directory exists
      if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true });
      }

      // Copy file to storage location
      fs.copyFileSync(filePath, storagePath);

      // Return public URL (in production, this would be Railway Storage URL)
      const publicUrl = `${
        process.env.BASE_URL || "http://localhost:5000"
      }/uploads/${folder}/${fileName}`;

      return publicUrl;
    } catch (error) {
      console.error("Error uploading file to Railway Storage:", error);
      throw new Error("Failed to upload file");
    }
  }

  /**
   * Process and upload image with optimization
   * @param {string} filePath - Local file path
   * @param {string} fileName - Name to save as
   * @param {Object} options - Processing options
   * @returns {Promise<string>} - Public URL of uploaded file
   */
  async uploadImage(filePath, fileName, options = {}) {
    try {
      const {
        width = 800,
        height = 600,
        quality = 80,
        format = "jpeg",
        folder = "images",
      } = options;

      // Process image with Sharp
      const processedImageBuffer = await sharp(filePath)
        .resize(width, height, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality })
        .toBuffer();

      // Save processed image
      const processedFilePath = path.join(
        __dirname,
        "../../uploads",
        folder,
        fileName
      );
      const processedDir = path.dirname(processedFilePath);

      if (!fs.existsSync(processedDir)) {
        fs.mkdirSync(processedDir, { recursive: true });
      }

      fs.writeFileSync(processedFilePath, processedImageBuffer);

      // Return public URL
      const publicUrl = `${
        process.env.BASE_URL || "http://localhost:5000"
      }/uploads/${folder}/${fileName}`;

      return publicUrl;
    } catch (error) {
      console.error("Error processing and uploading image:", error);
      throw new Error("Failed to process and upload image");
    }
  }

  /**
   * Upload multiple images
   * @param {Array} files - Array of file objects
   * @param {string} folder - Folder path in storage
   * @returns {Promise<Array>} - Array of public URLs
   */
  async uploadMultipleImages(files, folder = "images") {
    try {
      const uploadPromises = files.map(async (file, index) => {
        const fileName = `image-${Date.now()}-${index}.jpg`;
        return await this.uploadImage(file.path, fileName, { folder });
      });

      const urls = await Promise.all(uploadPromises);
      return urls;
    } catch (error) {
      console.error("Error uploading multiple images:", error);
      throw new Error("Failed to upload multiple images");
    }
  }

  /**
   * Delete a file from storage
   * @param {string} fileName - Name of file to delete
   * @param {string} folder - Folder path in storage
   * @returns {Promise<boolean>} - Success status
   */
  async deleteFile(fileName, folder = "") {
    try {
      const filePath = path.join(__dirname, "../../uploads", folder, fileName);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  }

  /**
   * Get file info
   * @param {string} fileName - Name of file
   * @param {string} folder - Folder path in storage
   * @returns {Promise<Object>} - File information
   */
  async getFileInfo(fileName, folder = "") {
    try {
      const filePath = path.join(__dirname, "../../uploads", folder, fileName);

      if (!fs.existsSync(filePath)) {
        return null;
      }

      const stats = fs.statSync(filePath);
      const publicUrl = `${
        process.env.BASE_URL || "http://localhost:5000"
      }/uploads/${folder}/${fileName}`;

      return {
        fileName,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        url: publicUrl,
      };
    } catch (error) {
      console.error("Error getting file info:", error);
      return null;
    }
  }
}

module.exports = new RailwayStorageService();
