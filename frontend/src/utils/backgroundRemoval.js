import * as ort from 'onnxruntime-web';

// U^2-Net (small variant). Apache-2.0, so it is safe to ship in a commercial page.
// The file is not in git — see README for the one-off download step.
const MODEL_URL = '/models/u2netp.onnx';
const MODEL_INPUT_SIZE = 320;

// Keep this in sync with the onnxruntime-web version in package.json: the WASM
// binaries are fetched from the CDN and must match the JS runtime that loads them.
const ORT_VERSION = '1.20.1';

// The mask is composited at full resolution, which needs a few RGBA buffers of
// the source size. Well below the resizer's 40MP ceiling so a large upload
// cannot blow up the tab.
export const MAX_CUTOUT_PIXELS = 12_000_000;

// U^2-Net expects ImageNet normalization on top of [0,1] scaling.
const MEAN = [0.485, 0.456, 0.406];
const STD = [0.229, 0.224, 0.225];

let sessionPromise = null;

function configureRuntime() {
  ort.env.wasm.wasmPaths = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ORT_VERSION}/dist/`;
  // Multi-threading needs SharedArrayBuffer, which needs COOP/COEP headers that
  // static hosting does not send. Single-threaded WASM works everywhere.
  ort.env.wasm.numThreads = 1;
}

function getSession() {
  if (!sessionPromise) {
    configureRuntime();
    sessionPromise = ort.InferenceSession.create(MODEL_URL, {
      executionProviders: ['wasm'],
      graphOptimizationLevel: 'all',
    }).catch((error) => {
      // Don't cache the failure, so a reload-free retry can still succeed.
      sessionPromise = null;
      throw error;
    });
  }

  return sessionPromise;
}

function preprocess(image) {
  const canvas = document.createElement('canvas');
  canvas.width = MODEL_INPUT_SIZE;
  canvas.height = MODEL_INPUT_SIZE;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(image, 0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);

  const { data } = context.getImageData(0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);
  const pixelCount = MODEL_INPUT_SIZE * MODEL_INPUT_SIZE;
  const tensor = new Float32Array(pixelCount * 3);

  for (let i = 0; i < pixelCount; i += 1) {
    // Interleaved RGBA source -> planar CHW tensor.
    tensor[i] = (data[i * 4] / 255 - MEAN[0]) / STD[0];
    tensor[pixelCount + i] = (data[i * 4 + 1] / 255 - MEAN[1]) / STD[1];
    tensor[pixelCount * 2 + i] = (data[i * 4 + 2] / 255 - MEAN[2]) / STD[2];
  }

  return new ort.Tensor('float32', tensor, [1, 3, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE]);
}

function normalizeMask(values) {
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < values.length; i += 1) {
    if (values[i] < min) min = values[i];
    if (values[i] > max) max = values[i];
  }

  const range = max - min || 1;
  const mask = new Float32Array(values.length);
  for (let i = 0; i < values.length; i += 1) {
    mask[i] = (values[i] - min) / range;
  }

  return mask;
}

function buildCutout(image, mask) {
  const width = image.naturalWidth;
  const height = image.naturalHeight;

  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = MODEL_INPUT_SIZE;
  maskCanvas.height = MODEL_INPUT_SIZE;
  const maskContext = maskCanvas.getContext('2d', { willReadFrequently: true });
  const maskFrame = maskContext.createImageData(MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);
  for (let i = 0; i < mask.length; i += 1) {
    const value = Math.round(mask[i] * 255);
    maskFrame.data[i * 4] = value;
    maskFrame.data[i * 4 + 1] = value;
    maskFrame.data[i * 4 + 2] = value;
    maskFrame.data[i * 4 + 3] = 255;
  }
  maskContext.putImageData(maskFrame, 0, 0);

  // Scaling the 320x320 mask up through the canvas gives bilinear-smoothed edges for free.
  const scaledCanvas = document.createElement('canvas');
  scaledCanvas.width = width;
  scaledCanvas.height = height;
  const scaledContext = scaledCanvas.getContext('2d', { willReadFrequently: true });
  scaledContext.drawImage(maskCanvas, 0, 0, width, height);
  const scaledMask = scaledContext.getImageData(0, 0, width, height).data;

  const output = document.createElement('canvas');
  output.width = width;
  output.height = height;
  const outputContext = output.getContext('2d', { willReadFrequently: true });
  outputContext.drawImage(image, 0, 0);

  const frame = outputContext.getImageData(0, 0, width, height);
  for (let i = 0; i < width * height; i += 1) {
    frame.data[i * 4 + 3] = scaledMask[i * 4];
  }
  outputContext.putImageData(frame, 0, 0);

  return output;
}

export function validateCutoutSize(image) {
  if (image.naturalWidth * image.naturalHeight > MAX_CUTOUT_PIXELS) {
    return 'This image is too large for background removal. Please use an image under 12 megapixels.';
  }

  return '';
}

/**
 * Cuts the subject out of `image` and returns a canvas with a transparent
 * background. Everything (model download included) runs in the browser; the
 * image is never uploaded.
 */
export async function removeBackground(image, { onStage } = {}) {
  onStage?.('loading-model');
  const session = await getSession();

  onStage?.('running');
  const feeds = { [session.inputNames[0]]: preprocess(image) };
  const results = await session.run(feeds);

  // U^2-Net exports several side outputs; the first one is the fused prediction.
  const prediction = results[session.outputNames[0]];

  onStage?.('compositing');
  return buildCutout(image, normalizeMask(prediction.data));
}

export function canvasToPngBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error('Could not export the cutout image.'));
    }, 'image/png');
  });
}
