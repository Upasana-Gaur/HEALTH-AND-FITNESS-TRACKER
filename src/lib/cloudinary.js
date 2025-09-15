import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'dtzd1sio1', 
        api_key: '713665212499554', 
        api_secret: 'OSBPxV4M6tLf9gthoJWmpijXU4Q'
});

export const uploadProfilePhoto = async (file) => {
  try {
    // Convert file to base64
    const base64Data = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        base64Data,
        {
          folder: 'profile_photos',
          allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
          transformation: [
            { width: 400, height: 400, crop: 'fill' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });

    return result.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};