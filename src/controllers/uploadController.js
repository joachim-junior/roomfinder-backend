const { prisma, handleDatabaseError } = require("../utils/database");
const railwayStorage = require("../utils/railwayStorage");
const fs = require("fs");
const path = require("path");

/**
 * Upload single image (for avatar, property main image)
 */
const uploadSingleImage = async (req, res) => {
  try {
    // Update base URL based on request for dynamic URL generation
    const protocol = (
      req.headers["x-forwarded-proto"] ||
      req.protocol ||
      "http"
    )
      .toString()
      .split(",")[0];
    const host = (req.headers["x-forwarded-host"] || req.get("host"))
      .toString()
      .split(",")[0];
    const baseUrl = `${protocol}://${host}`;
    railwayStorage.updateBaseUrl(baseUrl);

    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
        message: "Please upload an image file",
      });
    }

    const { type = "general" } = req.body; // avatar, property, general
    const fileName = `${type}-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}.jpg`;

    // Upload and process image
    const imageUrl = await railwayStorage.uploadImage(req.file.path, fileName, {
      folder: type,
      width: type === "avatar" ? 300 : 800,
      height: type === "avatar" ? 300 : 600,
      quality: 85,
    });

    // Clean up temporary file
    fs.unlinkSync(req.file.path);

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        fileName,
        url: imageUrl,
        type,
        size: req.file.size,
      },
    });
  } catch (error) {
    console.error("Upload single image error:", error);

    // Clean up temporary file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      error: "Upload failed",
      message: "Failed to upload image",
    });
  }
};

/**
 * Upload multiple images (for property galleries)
 */
const uploadMultipleImages = async (req, res) => {
  try {
    // Update base URL based on request for dynamic URL generation
    const protocol = (
      req.headers["x-forwarded-proto"] ||
      req.protocol ||
      "http"
    )
      .toString()
      .split(",")[0];
    const host = (req.headers["x-forwarded-host"] || req.get("host"))
      .toString()
      .split(",")[0];
    const baseUrl = `${protocol}://${host}`;
    railwayStorage.updateBaseUrl(baseUrl);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: "No files uploaded",
        message: "Please upload at least one image file",
      });
    }

    const { propertyId } = req.body;
    const folder = propertyId ? `properties/${propertyId}` : "general";

    // Upload multiple images
    const imageUrls = await railwayStorage.uploadMultipleImages(
      req.files,
      folder
    );

    // Clean up temporary files
    req.files.forEach((file) => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });

    res.status(201).json({
      success: true,
      message: `${imageUrls.length} images uploaded successfully`,
      data: {
        urls: imageUrls,
        count: imageUrls.length,
        propertyId: propertyId || null,
      },
    });
  } catch (error) {
    console.error("Upload multiple images error:", error);

    // Clean up temporary files
    if (req.files) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    res.status(500).json({
      error: "Upload failed",
      message: "Failed to upload images",
    });
  }
};

/**
 * Update property images
 */
const updatePropertyImages = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { images } = req.body; // Array of image URLs to keep
    const newImages = req.files || [];

    // Verify property exists and user owns it
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        hostId: req.user.id,
      },
    });

    if (!property) {
      return res.status(404).json({
        error: "Property not found",
        message:
          "Property not found or you do not have permission to update it",
      });
    }

    let updatedImages = [];

    // Keep existing images that are in the images array
    if (images && Array.isArray(images)) {
      updatedImages = images.filter(
        (img) => property.images && property.images.includes(img)
      );
    }

    // Add new uploaded images
    if (newImages.length > 0) {
      const folder = `properties/${propertyId}`;
      const newImageUrls = await railwayStorage.uploadMultipleImages(
        newImages,
        folder
      );
      updatedImages = [...updatedImages, ...newImageUrls];

      // Clean up temporary files
      newImages.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    // Update property with new images
    const updatedProperty = await prisma.property.update({
      where: { id: propertyId },
      data: { images: updatedImages },
      select: {
        id: true,
        title: true,
        images: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      message: "Property images updated successfully",
      data: updatedProperty,
    });
  } catch (error) {
    console.error("Update property images error:", error);

    // Clean up temporary files
    if (req.files) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Delete an image
 */
const deleteImage = async (req, res) => {
  try {
    const { fileName, folder = "images" } = req.params;

    const deleted = await railwayStorage.deleteFile(fileName, folder);

    if (!deleted) {
      return res.status(404).json({
        error: "File not found",
        message: "Image file not found",
      });
    }

    res.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Delete image error:", error);
    res.status(500).json({
      error: "Delete failed",
      message: "Failed to delete image",
    });
  }
};

/**
 * Get image info
 */
const getImageInfo = async (req, res) => {
  try {
    const { fileName, folder = "images" } = req.params;

    const fileInfo = await railwayStorage.getFileInfo(fileName, folder);

    if (!fileInfo) {
      return res.status(404).json({
        error: "File not found",
        message: "Image file not found",
      });
    }

    res.json({
      success: true,
      data: fileInfo,
    });
  } catch (error) {
    console.error("Get image info error:", error);
    res.status(500).json({
      error: "Failed to get image info",
      message: "Failed to retrieve image information",
    });
  }
};

module.exports = {
  uploadSingleImage,
  uploadMultipleImages,
  updatePropertyImages,
  deleteImage,
  getImageInfo,
};
