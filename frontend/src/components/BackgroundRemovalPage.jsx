import { useEffect, useState } from 'react';
import ImageUploader from './ImageUploader.jsx';
import {
  canvasToPngBlob,
  removeBackground,
  validateCutoutSize,
} from '../utils/backgroundRemoval.js';
import {
  ACCEPTED_IMAGE_TYPES,
  createImageFromUrl,
  formatBytes,
  sanitizeBaseName,
  validateImageFile,
} from '../utils/imageUtils.js';

const STAGE_LABELS = {
  'loading-model': 'Loading the AI model (first run only, about 5 MB)...',
  running: 'Finding the subject...',
  compositing: 'Cutting out the background...',
};

function BackgroundRemovalPage() {
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [result, setResult] = useState(null);
  const [stage, setStage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      if (sourceUrl) {
        URL.revokeObjectURL(sourceUrl);
      }
    };
  }, [sourceUrl]);

  useEffect(() => {
    return () => {
      if (result?.url) {
        URL.revokeObjectURL(result.url);
      }
    };
  }, [result]);

  const clearResult = () => {
    setResult((current) => {
      if (current?.url) {
        URL.revokeObjectURL(current.url);
      }

      return null;
    });
  };

  const handleFileSelect = async (file) => {
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    const nextUrl = URL.createObjectURL(file);

    let image;
    try {
      image = await createImageFromUrl(nextUrl);
    } catch {
      URL.revokeObjectURL(nextUrl);
      setError('Image load failed. Please try another file.');
      return;
    }

    const sizeError = validateCutoutSize(image);
    if (sizeError) {
      URL.revokeObjectURL(nextUrl);
      setError(sizeError);
      return;
    }

    if (sourceUrl) {
      URL.revokeObjectURL(sourceUrl);
    }

    setSourceUrl(nextUrl);
    setSourceName(file.name);
    setError('');
    clearResult();

    try {
      const canvas = await removeBackground(image, { onStage: setStage });
      const blob = await canvasToPngBlob(canvas);
      setResult({
        url: URL.createObjectURL(blob),
        blob,
        width: canvas.width,
        height: canvas.height,
        byteSize: blob.size,
        fileName: `${sanitizeBaseName(file.name)}-no-background.png`,
      });
    } catch (removalError) {
      setError(
        removalError?.message?.includes('Could not export')
          ? removalError.message
          : 'Background removal failed. The AI model could not be loaded — please refresh and try again.',
      );
    } finally {
      setStage('');
    }
  };

  const downloadCutout = () => {
    if (!result) return;

    const link = document.createElement('a');
    link.href = result.url;
    link.download = result.fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const isProcessing = Boolean(stage);

  return (
    <>
      <ImageUploader acceptedTypes={ACCEPTED_IMAGE_TYPES} onFileSelect={handleFileSelect} />

      <p className="privacy-notice">
        The AI model runs inside your browser. Your image is never uploaded to our server.
      </p>

      {error ? <p className="error-message">{error}</p> : null}
      {isProcessing ? <p className="notice">{STAGE_LABELS[stage] ?? 'Working...'}</p> : null}

      <div className="workspace-grid">
        <section className="panel">
          <div className="panel-heading">
            <h2>Original</h2>
          </div>
          <div className="export-preview-frame">
            {sourceUrl ? (
              <img src={sourceUrl} alt={sourceName || 'Original'} />
            ) : (
              <div className="export-preview-empty">
                <p>No image yet</p>
                <span>Drop an image above to remove its background.</span>
              </div>
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h2>Background removed</h2>
          </div>
          <div className="export-preview-frame">
            {result ? (
              <img src={result.url} alt="Background removed" />
            ) : (
              <div className="export-preview-empty">
                <p>{isProcessing ? 'Processing...' : 'No cutout yet'}</p>
                <span>
                  {isProcessing
                    ? 'This takes a few seconds on the first run.'
                    : 'The result appears here with a transparent background.'}
                </span>
              </div>
            )}
          </div>

          {result ? (
            <dl className="preview-summary">
              <div>
                <dt>Size</dt>
                <dd>
                  {result.width} x {result.height}
                </dd>
              </div>
              <div>
                <dt>Format</dt>
                <dd>PNG (transparent)</dd>
              </div>
              <div>
                <dt>File size</dt>
                <dd>{formatBytes(result.byteSize)}</dd>
              </div>
              <div>
                <dt>Filename</dt>
                <dd>{result.fileName}</dd>
              </div>
            </dl>
          ) : null}

          <button
            type="button"
            className="primary-button wide-button"
            disabled={!result || isProcessing}
            onClick={downloadCutout}
          >
            Download PNG
          </button>
        </section>
      </div>
    </>
  );
}

export default BackgroundRemovalPage;
