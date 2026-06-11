import { formatBytes } from '../utils/imageUtils.js';

function ExportPreview({ preview, isPreviewing, disabled, onGeneratePreview }) {
  return (
    <section className="panel export-preview-panel">
      <div className="panel-heading">
        <h2>Export Preview</h2>
      </div>
      <div className="export-preview-frame">
        {preview?.url ? (
          <img src={preview.url} alt="Export preview" />
        ) : (
          <div className="export-preview-empty">
            <p>No preview yet</p>
            <span>Generate a preview to inspect the current output before downloading.</span>
          </div>
        )}
      </div>
      {preview ? (
        <dl className="preview-summary">
          <div>
            <dt>Size</dt>
            <dd>
              {preview.width} x {preview.height}
            </dd>
          </div>
          <div>
            <dt>Format</dt>
            <dd>{preview.format.toUpperCase()}</dd>
          </div>
          <div>
            <dt>Mode</dt>
            <dd>{preview.resizeMode}</dd>
          </div>
          <div>
            <dt>File size</dt>
            <dd>{formatBytes(preview.byteSize)}</dd>
          </div>
          <div>
            <dt>Background</dt>
            <dd>{preview.backgroundColor}</dd>
          </div>
        </dl>
      ) : null}
      <button
        type="button"
        className="secondary-button wide-button"
        disabled={disabled || isPreviewing}
        onClick={onGeneratePreview}
      >
        {isPreviewing ? 'Generating preview...' : 'Generate preview'}
      </button>
    </section>
  );
}

export default ExportPreview;
