import React, { useState } from 'react';
import { Upload, Check, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { uploadImageApi } from '../api/client';

export default function ImageUploader({ onUploadComplete, currentImageUrl, folder = '/syntax-studio', token, label = "Upload Image (ImageKit)" }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Data = reader.result;
          const uploadRes = await uploadImageApi(base64Data, file.name, folder, token);
          if (uploadRes && uploadRes.url) {
            onUploadComplete(uploadRes.url);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
          } else {
            throw new Error('Upload succeeded but no CDN URL returned');
          }
        } catch (uploadErr) {
          console.error('Upload API failure:', uploadErr);
          setError(uploadErr.message || 'ImageKit upload failed');
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err.message || 'Error reading local file');
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-cyan font-mono text-xs">{label}</label>

      <div className="flex items-center gap-3">
        {currentImageUrl ? (
          <div className="w-12 h-12 rounded-lg border border-border overflow-hidden bg-surface shrink-0 relative">
            <img src={currentImageUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-lg border border-border bg-surface2 flex items-center justify-center text-muted shrink-0">
            <ImageIcon size={20} />
          </div>
        )}

        <div className="flex-1">
          <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface hover:border-amber/60 text-xs font-mono text-text cursor-pointer transition-colors">
            <Upload size={13} className="text-amber" />
            <span>{uploading ? 'uploading_to_imagekit()...' : 'Choose Image File'}</span>
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <span className="block text-[10px] font-mono text-muted mt-1">
            Processed via ImageKit CDN (max 5MB)
          </span>
        </div>
      </div>

      {success && (
        <p className="text-xs font-mono text-green flex items-center gap-1">
          <Check size={13} /> Uploaded & saved successfully!
        </p>
      )}

      {error && (
        <p className="text-xs font-mono text-red flex items-center gap-1">
          <AlertCircle size={13} /> {error}
        </p>
      )}
    </div>
  );
}
