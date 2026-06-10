import { useEffect, useMemo, useState } from 'react';
import DownloadPanel from './DownloadPanel.jsx';
import ImagePreview from './ImagePreview.jsx';
import ImageUploader from './ImageUploader.jsx';
import PresetSelector from './PresetSelector.jsx';
import ResizeControls from './ResizeControls.jsx';
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_PIXEL_COUNT,
  createImageFromUrl,
  formatBytes,
  getFileExtension,
  getInitialResizeSize,
  resizeImageToBlob,
  sanitizeBaseName,
  validateDimensions,
  validateImageFile,
} from '../utils/imageUtils.js';

function ImageResizerPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [loadedImage, setLoadedImage] = useState(null);
  const [imageInfo, setImageInfo] = useState(null);
  const [resizeSize, setResizeSize] = useState({ width: '', height: '' });
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [format, setFormat] = useState('webp');
  const [quality, setQuality] = useState(86);
  const [resizeMode, setResizeMode] = useState('fit');
  const [selectedPresetId, setSelectedPresetId] = useState('');
  const [error, setError] = useState('');
  const [outputInfo, setOutputInfo] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const aspectRatio = useMemo(() => {
    if (!imageInfo?.width || !imageInfo?.height) {
      return 1;
    }

    return imageInfo.width / imageInfo.height;
  }, [imageInfo]);

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const resetOutput = () => setOutputInfo('');

  const clearPresetSelection = () => setSelectedPresetId('');

  const handleFileSelect = async (file) => {
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    const nextUrl = URL.createObjectURL(file);

    try {
      const image = await createImageFromUrl(nextUrl);
      if (image.naturalWidth * image.naturalHeight > MAX_PIXEL_COUNT) {
        URL.revokeObjectURL(nextUrl);
        setError('This image is too large for the MVP. Please use an image under 40 megapixels.');
        return;
      }

      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }

      setSelectedFile(file);
      setImageUrl(nextUrl);
      setLoadedImage(image);
      setImageInfo({
        width: image.naturalWidth,
        height: image.naturalHeight,
        size: file.size,
        type: file.type,
      });
      setResizeSize(getInitialResizeSize(image.naturalWidth, image.naturalHeight));
      clearPresetSelection();
      setError('');
      resetOutput();
    } catch {
      URL.revokeObjectURL(nextUrl);
      setError('Image load failed. Please try another file.');
    }
  };

  const updateWidth = (value) => {
    resetOutput();
    clearPresetSelection();
    if (!maintainAspectRatio || !value) {
      setResizeSize((current) => ({ ...current, width: value }));
      return;
    }

    const width = Number(value);
    setResizeSize({
      width: value,
      height: Number.isFinite(width) && width > 0 ? String(Math.max(1, Math.round(width / aspectRatio))) : '',
    });
  };

  const updateHeight = (value) => {
    resetOutput();
    clearPresetSelection();
    if (!maintainAspectRatio || !value) {
      setResizeSize((current) => ({ ...current, height: value }));
      return;
    }

    const height = Number(value);
    setResizeSize({
      width: Number.isFinite(height) && height > 0 ? String(Math.max(1, Math.round(height * aspectRatio))) : '',
      height: value,
    });
  };

  const applyPreset = (preset) => {
    resetOutput();
    setError('');
    setMaintainAspectRatio(false);
    setSelectedPresetId(preset.id);
    setResizeSize({
      width: String(preset.width),
      height: String(preset.height),
    });
  };

  const downloadImage = async () => {
    if (!loadedImage || !selectedFile) {
      setError('Please upload an image first.');
      return;
    }

    const width = Number(resizeSize.width);
    const height = Number(resizeSize.height);
    const dimensionError = validateDimensions(width, height);
    if (dimensionError) {
      setError(dimensionError);
      return;
    }

    setIsExporting(true);
    setError('');

    try {
      const blob = await resizeImageToBlob(loadedImage, { width, height, format, quality, resizeMode });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${sanitizeBaseName(selectedFile.name)}-${width}x${height}.${getFileExtension(format)}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
      setOutputInfo(`${width} x ${height}, ${format.toUpperCase()}, ${resizeMode}, ${formatBytes(blob.size)}`);
    } catch (downloadError) {
      setError(downloadError.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <ImageUploader acceptedTypes={ACCEPTED_IMAGE_TYPES} onFileSelect={handleFileSelect} />

      <p className="privacy-notice">
        Your image is processed locally in your browser and is not uploaded to our server.
      </p>

      {error ? <p className="error-message">{error}</p> : null}

      <div className="workspace-grid">
        <ImagePreview imageUrl={imageUrl} imageInfo={imageInfo} />
        <div className="controls-stack">
          <PresetSelector
            selectedPresetId={selectedPresetId}
            disabled={!imageInfo}
            onPresetSelect={applyPreset}
          />
          <ResizeControls
            width={resizeSize.width}
            height={resizeSize.height}
            maintainAspectRatio={maintainAspectRatio}
            disabled={!imageInfo}
            onWidthChange={updateWidth}
            onHeightChange={updateHeight}
            onMaintainAspectRatioChange={setMaintainAspectRatio}
          />
          <DownloadPanel
            format={format}
            quality={quality}
            resizeMode={resizeMode}
            outputInfo={outputInfo}
            isExporting={isExporting}
            disabled={!imageInfo}
            onFormatChange={(value) => {
              resetOutput();
              setFormat(value);
            }}
            onQualityChange={(value) => {
              resetOutput();
              setQuality(value);
            }}
            onResizeModeChange={(value) => {
              resetOutput();
              setResizeMode(value);
            }}
            onDownload={downloadImage}
          />
        </div>
      </div>
    </>
  );
}

export default ImageResizerPage;
