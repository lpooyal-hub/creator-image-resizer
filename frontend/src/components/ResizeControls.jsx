function ResizeControls({
  width,
  height,
  maintainAspectRatio,
  onWidthChange,
  onHeightChange,
  onMaintainAspectRatioChange,
  disabled,
}) {
  return (
    <section className="panel control-panel">
      <div className="panel-heading">
        <h2>Resize</h2>
      </div>
      <div className="field-grid">
        <label>
          <span>Width</span>
          <input
            type="number"
            min="1"
            inputMode="numeric"
            value={width}
            disabled={disabled}
            onChange={(event) => onWidthChange(event.target.value)}
          />
        </label>
        <label>
          <span>Height</span>
          <input
            type="number"
            min="1"
            inputMode="numeric"
            value={height}
            disabled={disabled}
            onChange={(event) => onHeightChange(event.target.value)}
          />
        </label>
      </div>
      <label className="toggle-row">
        <input
          type="checkbox"
          checked={maintainAspectRatio}
          disabled={disabled}
          onChange={(event) => onMaintainAspectRatioChange(event.target.checked)}
        />
        <span>Maintain aspect ratio</span>
      </label>
    </section>
  );
}

export default ResizeControls;

