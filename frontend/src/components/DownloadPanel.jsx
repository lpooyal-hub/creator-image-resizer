function DownloadPanel({
  format,
  quality,
  resizeMode,
  outputInfo,
  isExporting,
  disabled,
  onFormatChange,
  onQualityChange,
  onResizeModeChange,
  onDownload,
}) {
  const qualityDisabled = disabled || format === 'png';

  return (
    <section className="panel control-panel">
      <div className="panel-heading">
        <h2>Export</h2>
      </div>
      <label>
        <span>Format</span>
        <select value={format} disabled={disabled} onChange={(event) => onFormatChange(event.target.value)}>
          <option value="png">PNG</option>
          <option value="jpeg">JPEG</option>
          <option value="webp">WebP</option>
        </select>
      </label>
      <label className={qualityDisabled ? 'disabled-field' : ''}>
        <span>Quality {format === 'png' ? '(not used for PNG)' : `${quality}%`}</span>
        <input
          type="range"
          min="1"
          max="100"
          value={quality}
          disabled={qualityDisabled}
          onChange={(event) => onQualityChange(Number(event.target.value))}
        />
      </label>
      <fieldset className="mode-fieldset" disabled={disabled}>
        <legend>Resize mode</legend>
        <div className="mode-options">
          <label className="mode-option">
            <input
              type="radio"
              name="resize-mode"
              value="fit"
              checked={resizeMode === 'fit'}
              onChange={(event) => onResizeModeChange(event.target.value)}
            />
            <span>
              Fit
              <small>Keep full image, add empty space if needed.</small>
            </span>
          </label>
          <label className="mode-option">
            <input
              type="radio"
              name="resize-mode"
              value="fill"
              checked={resizeMode === 'fill'}
              onChange={(event) => onResizeModeChange(event.target.value)}
            />
            <span>
              Fill
              <small>Fill the target size and crop edges.</small>
            </span>
          </label>
          <label className="mode-option">
            <input
              type="radio"
              name="resize-mode"
              value="stretch"
              checked={resizeMode === 'stretch'}
              onChange={(event) => onResizeModeChange(event.target.value)}
            />
            <span>
              Stretch
              <small>Force exact size and allow distortion.</small>
            </span>
          </label>
        </div>
      </fieldset>
      {outputInfo ? <p className="output-note">Last export: {outputInfo}</p> : null}
      <button type="button" className="primary-button wide-button" disabled={disabled || isExporting} onClick={onDownload}>
        {isExporting ? 'Preparing...' : 'Download resized image'}
      </button>
    </section>
  );
}

export default DownloadPanel;
