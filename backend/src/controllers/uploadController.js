import imagekit from '../config/imagekit.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { validateUploadFile, sanitizeFolderPath } from '../utils/fileSecurity.js';
import { validateUrlForSsrf } from '../utils/ssrfProtection.js';
import { logAuditEvent, AuditEventType } from '../services/auditLogger.js';

export const uploadImage = async (req, res, next) => {
  try {
    const { file, fileName, folder = '/syntax-studio' } = req.body;

    if (!file) {
      return ApiResponse.error(res, 'File data (base64 string or verified URL) is required', null, 400);
    }

    if (!imagekit) {
      return ApiResponse.error(res, 'ImageKit service is not configured.', null, 503);
    }

    const cleanFolder = sanitizeFolderPath(folder);

    // 1. Check if file is a remote URL (SSRF Defense)
    let uploadPayload = file;
    let safeFileName = '';

    if (typeof file === 'string' && /^https?:\/\//i.test(file)) {
      const ssrfCheck = validateUrlForSsrf(file);
      if (!ssrfCheck.isSafe) {
        await logAuditEvent({
          eventType: AuditEventType.SSRF_ATTEMPT_BLOCKED,
          actor: req.adminUser?.email || 'admin',
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          status: 'BLOCKED',
          details: { url: file, reason: ssrfCheck.reason }
        });
        return ApiResponse.error(res, `Image URL blocked: ${ssrfCheck.reason}`, null, 400);
      }
      safeFileName = `upload_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.jpg`;
    } else {
      // 2. Base64 Upload: Validate Magic Bytes & Content Type
      const validation = validateUploadFile(file, fileName);
      if (!validation.isValid) {
        return ApiResponse.error(res, validation.error, null, 400);
      }
      safeFileName = validation.cleanFileName;
    }

    const uploadResponse = await imagekit.upload({
      file: uploadPayload,
      fileName: safeFileName,
      folder: cleanFolder,
      useUniqueFileName: true,
    });

    await logAuditEvent({
      eventType: AuditEventType.FILE_UPLOADED,
      actor: req.adminUser?.email || 'admin',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: { fileId: uploadResponse.fileId, name: uploadResponse.name, size: uploadResponse.size }
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
