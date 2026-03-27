// Serviço de upload de imagens para Cloudinary
// Configure seu cloud name e upload preset nas variáveis de ambiente

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';

export interface UploadResult {
  url: string;
  publicId: string;
  success: boolean;
  error?: string;
}

export async function uploadImage(file: File): Promise<UploadResult> {
  // Se não tiver Cloudinary configurado, usa base64 como fallback
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    console.warn('Cloudinary não configurado, usando base64 como fallback');
    return uploadAsBase64(file);
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      url: data.secure_url,
      publicId: data.public_id,
      success: true,
    };
  } catch (error) {
    console.error('Erro no upload Cloudinary:', error);
    // Fallback para base64 em caso de erro
    return uploadAsBase64(file);
  }
}

function uploadAsBase64(file: File): Promise<UploadResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onloadend = () => {
      resolve({
        url: reader.result as string,
        publicId: '',
        success: true,
      });
    };
    
    reader.onerror = () => {
      resolve({
        url: '',
        publicId: '',
        success: false,
        error: 'Falha ao converter imagem',
      });
    };
    
    reader.readAsDataURL(file);
  });
}

// Compressão de imagem antes do upload
export function compressImage(file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Could not compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Could not load image'));
      };
    };
    
    reader.onerror = () => {
      reject(new Error('Could not read file'));
    };
  });
}
