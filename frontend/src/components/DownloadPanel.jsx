function DownloadPanel({
  format,
  quality,
  resizeMode,
  backgroundColor,
  outputInfo,
  isExporting,
  disabled,
  onFormatChange,
  onQualityChange,
  onResizeModeChange,
  onBackgroundColorChange,
  onDownload,
}) {
  const qualityDisabled = disabled || format === 'png';
  const backgroundDisabled = disabled || resizeMode !== 'fit';

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
      <fieldset className="mode-fieldset" disabled={backgroundDisabled}>
        <legend>Fit background</legend>
        <div className="background-options">
          <button
            type="button"
            className={`swatch-button swatch-transparent ${backgroundColor === 'transparent' ? 'is-selected' : ''}`}
            disabled={backgroundDisabled}
            onClick={() => onBackgroundColorChange('transparent')}
            aria-label="Transparent background"
          />
          <button
            type="button"
            className={`swatch-button ${backgroundColor === '#ffffff' ? 'is-selected' : ''}`}
            disabled={backgroundDisabled}
            onClick={() => onBackgroundColorChange('#ffffff')}
            style={{ '--swatch-color': '#ffffff' }}
            aria-label="White background"
          />
          <button
            type="button"
            className={`swatch-button ${backgroundColor === '#111827' ? 'is-selected' : ''}`}
            disabled={backgroundDisabled}
            onClick={() => onBackgroundColorChange('#111827')}
            style={{ '--swatch-color': '#111827' }}
            aria-label="Dark background"
          />
          <label className="custom-color-label">
            <span>Custom</span>
            <input
              type="color"
              value={backgroundColor === 'transparent' ? '#ffffff' : backgroundColor}
              disabled={backgroundDisabled}
              onChange={(event) => onBackgroundColorChange(event.target.value)}
            />
          </label>
        </div>
        <p className="field-note">
          Used only when Fit creates empty space. Transparent is available for PNG exports.
        </p>
      </fieldset>
      {outputInfo ? <p className="output-note">Last export: {outputInfo}</p> : null}
      <button type="button" className="primary-button wide-button" disabled={disabled || isExporting} onClick={onDownload}>
        {isExporting ? 'Preparing...' : 'Download resized image'}
      </button>
    </section>
  );
}

export default DownloadPanel;
