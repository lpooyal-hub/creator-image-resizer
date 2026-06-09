export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
export const MAX_PIXEL_COUNT = 40_000_000;

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** unitIndex;

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function validateImageFile(file) {
  if (!file) {
    return 'Please choose an image file.';
  }

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return 'Unsupported file type. Please use PNG, JPEG, or WebP.';
  }

  return '';
}

export function createImageFromUrl(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Image failed to load.'));
    image.src = url;
  });
}

export function getInitialResizeSize(width, height) {
  return {
    width: String(width),
    height: String(height),
  };
}

export function getOutputMimeType(format) {
  return {
    png: 'image/png',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
  }[format];
}

export function getFileExtension(format) {
  return format === 'jpeg' ? 'jpg' : format;
}

export function sanitizeBaseName(fileName) {
  const baseName = fileName.replace(/\.[^/.]+$/, '');
  return baseName.replace(/[^a-z0-9-_]+/gi, '-').replace(/^-+|-+$/g, '') || 'resized-image';
}

export function validateDimensions(width, height) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    return 'Width and height must be positive whole numbers.';
  }

  if (width * height > MAX_PIXEL_COUNT) {
    return 'Output is too large for this MVP. Please stay under 40 megapixels.';
  }

  return '';
}

export function resizeImageToBlob(image, options) {
  const { width, height, format, quality } = options;
  const mimeType = getOutputMimeType(format);

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) {
      reject(new Error('Canvas is not supported in this browser.'));
      return;
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(image, 0, 0, width, height);

    const encoderQuality = format === 'png' ? undefined : quality / 100;
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Could not export the resized image.'));
          return;
        }

        resolve(blob);
      },
      mimeType,
      encoderQuality,
    );
  });
}

