import { formatBytes } from '../utils/imageUtils.js';

function ImagePreview({ imageUrl, imageInfo }) {
  if (!imageUrl || !imageInfo) {
    return (
      <section className="panel preview-panel empty-preview">
        <span>No image selected</span>
      </section>
    );
  }

  return (
    <section className="panel preview-panel">
      <div className="image-frame">
        <img src={imageUrl} alt="Uploaded preview" />
      </div>
      <dl className="info-grid">
        <div>
          <dt>Width</dt>
          <dd>{imageInfo.width}px</dd>
        </div>
        <div>
          <dt>Height</dt>
          <dd>{imageInfo.height}px</dd>
        </div>
        <div>
          <dt>File size</dt>
          <dd>{formatBytes(imageInfo.size)}</dd>
        </div>
        <div>
          <dt>File type</dt>
          <dd>{imageInfo.type}</dd>
        </div>
      </dl>
    </section>
  );
}

export default ImagePreview;

