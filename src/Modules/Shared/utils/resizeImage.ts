const MAX_DIMENSION = 1920;
const WEBP_QUALITY = 0.82;

export function isHeicFile(file: File): boolean {
  if (/image\/(heic|heif)/i.test(file.type)) return true;
  return /\.(heic|heif)$/i.test(file.name);
}

async function convertHeicToJpeg(file: File): Promise<File> {
  const heic2any = (await import('heic2any')).default as (options: {
    blob: Blob;
    toType?: string;
    quality?: number;
  }) => Promise<Blob | Blob[]>;

  let blob: Blob;
  try {
    const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 });
    blob = Array.isArray(result) ? result[0] : result;
  } catch {
    throw new Error(
      'No se pudo procesar la imagen del iPhone (HEIC). Intenta con otra foto.',
    );
  }

  const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
  return new File([blob], newName, { type: 'image/jpeg', lastModified: Date.now() });
}

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
  let workFile = file;
  if (isHeicFile(file)) {
    workFile = await convertHeicToJpeg(file);
  } else if (!file.type.startsWith('image/')) {
    return file;
  }

  const objectUrl = URL.createObjectURL(workFile);

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
      return workFile;
    }

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    const blob = await canvasToBlob(canvas, 'image/webp', WEBP_QUALITY);
    if (!blob) {
      return workFile;
    }

    if (!needsResize && blob.size >= workFile.size) {
      return workFile;
    }

    const newName = workFile.name.replace(/\.[^.]+$/, '') + '.webp';
    return new File([blob], newName, {
      type: 'image/webp',
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
