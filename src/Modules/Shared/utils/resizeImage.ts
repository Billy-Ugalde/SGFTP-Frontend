const MAX_DIMENSION = 1920;
const WEBP_QUALITY = 0.82;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error('No se pudo procesar la imagen. El archivo puede estar dañado.'));
    img.src = src;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

export async function resizeImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) {
    return file;
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const img = await loadImage(objectUrl);

    const { width, height } = img;
    const longestSide = Math.max(width, height);
    const needsResize = longestSide > MAX_DIMENSION;

    const scale = needsResize ? MAX_DIMENSION / longestSide : 1;
    const targetWidth = Math.round(width * scale);
    const targetHeight = Math.round(height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return file;
    }

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    const blob = await canvasToBlob(canvas, 'image/webp', WEBP_QUALITY);
    if (!blob) {
      return file;
    }

    if (!needsResize && blob.size >= file.size) {
      return file;
    }

    const newName = file.name.replace(/\.[^.]+$/, '') + '.webp';
    return new File([blob], newName, {
      type: 'image/webp',
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
