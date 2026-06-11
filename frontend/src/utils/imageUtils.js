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

export function getDownloadFileName(fileName, width, height, format, customBaseName = '') {
  const baseName = sanitizeBaseName(customBaseName || fileName);
  return `${baseName}-${width}x${height}.${getFileExtension(format)}`;
}

export function getEffectiveBackgroundColor(format, backgroundColor) {
  if (backgroundColor === 'transparent' && format === 'png') {
    return 'transparent';
  }

  if (backgroundColor === 'transparent') {
    return '#ffffff';
  }

  return backgroundColor;
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

function getDrawRect(image, width, height, resizeMode) {
  if (resizeMode === 'stretch') {
    return {
      sourceX: 0,
      sourceY: 0,
      sourceWidth: image.naturalWidth,
      sourceHeight: image.naturalHeight,
      targetX: 0,
      targetY: 0,
      targetWidth: width,
      targetHeight: height,
    };
  }

  const sourceRatio = image.naturalWidth / image.naturalHeight;
  const targetRatio = width / height;

  if (resizeMode === 'fill') {
    if (sourceRatio > targetRatio) {
      const sourceWidth = image.naturalHeight * targetRatio;
      return {
        sourceX: (image.naturalWidth - sourceWidth) / 2,
        sourceY: 0,
        sourceWidth,
        sourceHeight: image.naturalHeight,
        targetX: 0,
        targetY: 0,
        targetWidth: width,
        targetHeight: height,
      };
    }

    const sourceHeight = image.naturalWidth / targetRatio;
    return {
      sourceX: 0,
      sourceY: (image.naturalHeight - sourceHeight) / 2,
      sourceWidth: image.naturalWidth,
      sourceHeight,
      targetX: 0,
      targetY: 0,
      targetWidth: width,
      targetHeight: height,
    };
  }

  if (sourceRatio > targetRatio) {
    const targetHeight = width / sourceRatio;
    return {
      sourceX: 0,
      sourceY: 0,
      sourceWidth: image.naturalWidth,
      sourceHeight: image.naturalHeight,
      targetX: 0,
      targetY: (height - targetHeight) / 2,
      targetWidth: width,
      targetHeight,
    };
  }

  const targetWidth = height * sourceRatio;
  return {
    sourceX: 0,
    sourceY: 0,
    sourceWidth: image.naturalWidth,
    sourceHeight: image.naturalHeight,
    targetX: (width - targetWidth) / 2,
    targetY: 0,
    targetWidth,
    targetHeight: height,
  };
}

export function resizeImageToBlob(image, options) {
  const { width, height, format, quality, resizeMode = 'fit', backgroundColor = 'transparent' } = options;
  const mimeType = getOutputMimeType(format);
  const effectiveBackgroundColor = getEffectiveBackgroundColor(format, backgroundColor);

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

    if (resizeMode === 'fit' && effectiveBackgroundColor !== 'transparent') {
      context.fillStyle = effectiveBackgroundColor;
      context.fillRect(0, 0, width, height);
    }

    const drawRect = getDrawRect(image, width, height, resizeMode);
    context.drawImage(
      image,
      drawRect.sourceX,
      drawRect.sourceY,
      drawRect.sourceWidth,
      drawRect.sourceHeight,
      drawRect.targetX,
      drawRect.targetY,
      drawRect.targetWidth,
      drawRect.targetHeight,
    );

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
