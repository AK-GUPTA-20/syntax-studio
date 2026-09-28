import ImageKit from 'imagekit';
import { config } from './env.js';

let imagekit = null;

if (config.imagekit.publicKey && config.imagekit.privateKey && config.imagekit.urlEndpoint) {
  imagekit = new ImageKit({
    publicKey: config.imagekit.publicKey,
    privateKey: config.imagekit.privateKey,
    urlEndpoint: config.imagekit.urlEndpoint,
  });
  console.log('🖼️ [ImageKit] SDK initialized successfully');
} else {
  console.warn('⚠️ [ImageKit] Credentials missing in environment variables');
}

export default imagekit;
