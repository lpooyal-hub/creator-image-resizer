import { useEffect, useMemo, useState } from 'react';
import DownloadPanel from './DownloadPanel.jsx';
import ExportPreview from './ExportPreview.jsx';
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
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [exportPreview, setExportPreview] = useState(null);

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

  useEffect(() => {
    return () => {
      if (exportPreview?.url) {
        URL.revokeObjectURL(exportPreview.url);
      }
    };
  }, [exportPreview]);

  const resetOutput = () => setOutputInfo('');

  const resetPreview = () => {
    setExportPreview((currentPreview) => {
      if (currentPreview?.url) {
        URL.revokeObjectURL(currentPreview.url);
      }

      return null;
    });
  };

  const resetExportState = () => {
    resetOutput();
    resetPreview();
  };

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
      resetExportState();
    } catch {
      URL.revokeObjectURL(nextUrl);
      setError('Image load failed. Please try another file.');
    }
  };

  const updateWidth = (value) => {
    resetExportState();
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
    resetExportState();
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
    resetExportState();
    setError('');
    setMaintainAspectRatio(false);
    setSelectedPresetId(preset.id);
    setResizeSize({
      width: String(preset.width),
      height: String(preset.height),
    });
  };

  const getValidatedExportOptions = () => {
    if (!loadedImage || !selectedFile) {
      return { errorMessage: 'Please upload an image first.' };
    }

    const width = Number(resizeSize.width);
    const height = Number(resizeSize.height);
    const dimensionError = validateDimensions(width, height);
    if (dimensionError) {
      return { errorMessage: dimensionError };
    }

    return {
      options: {
        width,
        height,
        format,
        quality,
        resizeMode,
      },
    };
  };

  const generateExportPreview = async () => {
    const { errorMessage, options } = getValidatedExportOptions();
    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    setIsPreviewing(true);
    setError('');

    try {
      const blob = await resizeImageToBlob(loadedImage, options);
      const previewUrl = URL.createObjectURL(blob);
      setExportPreview((currentPreview) => {
        if (currentPreview?.url) {
          URL.revokeObjectURL(currentPreview.url);
        }

        return {
          url: previewUrl,
          byteSize: blob.size,
          width: options.width,
          height: options.height,
          format: options.format,
          resizeMode: options.resizeMode,
        };
      });
    } catch (previewError) {
      setError(previewError.message);
    } finally {
      setIsPreviewing(false);
    }
  };

  const downloadImage = async () => {
    const { errorMessage, options } = getValidatedExportOptions();
    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    setIsExporting(true);
    setError('');

    try {
      const blob = await resizeImageToBlob(loadedImage, options);
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${sanitizeBaseName(selectedFile.name)}-${options.width}x${options.height}.${getFileExtension(format)}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
      setOutputInfo(
        `${options.width} x ${options.height}, ${format.toUpperCase()}, ${resizeMode}, ${formatBytes(blob.size)}`,
      );
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
              resetExportState();
              setFormat(value);
            }}
            onQualityChange={(value) => {
              resetExportState();
              setQuality(value);
            }}
            onResizeModeChange={(value) => {
              resetExportState();
              setResizeMode(value);
            }}
            onDownload={downloadImage}
          />
          <ExportPreview
            preview={exportPreview}
            isPreviewing={isPreviewing}
            disabled={!imageInfo}
            onGeneratePreview={generateExportPreview}
          />
        </div>
      </div>
    </>
  );
}

export default ImageResizerPage;
