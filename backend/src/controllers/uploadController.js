import imagekit from '../config/imagekit.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const uploadImage = async (req, res, next) => {
  try {
    const { file, fileName, folder = '/syntax-studio' } = req.body;

    if (!file) {
      return ApiResponse.error(res, 'File data (base64 string or URL) is required', null, 400);
    }

    if (!imagekit) {
      return ApiResponse.error(res, 'ImageKit is not configured. Please check your environment variables.', null, 503);
    }

    const cleanFileName = fileName || `upload_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.jpg`;

    const uploadResponse = await imagekit.upload({
      file, // can be base64 string or remote image URL
      fileName: cleanFileName,
      folder,
      useUniqueFileName: true,
    });

    return ApiResponse.success(res, 'Image uploaded to ImageKit successfully', {
      url: uploadResponse.url,
      thumbnailUrl: uploadResponse.thumbnailUrl || uploadResponse.url,
      fileId: uploadResponse.fileId,
      name: uploadResponse.name,
      size: uploadResponse.size,
    }, 201);
  } catch (error) {
    console.error('💥 [ImageKit Upload Error]:', error);
    return ApiResponse.error(res, 'Failed to upload image to ImageKit', error.message, 500);
  }
};
