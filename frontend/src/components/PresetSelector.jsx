import { IMAGE_PRESET_GROUPS } from '../utils/imagePresets.js';

function PresetSelector({ selectedPresetId, disabled, onPresetSelect }) {
  return (
    <section className="panel control-panel preset-panel">
      <div className="panel-heading">
        <h2>Presets</h2>
      </div>
      <p className="preset-description">
        Choose an exact platform size. Selecting a preset turns off aspect ratio lock so the target dimensions are
        applied directly.
      </p>
      <div className="preset-groups">
        {IMAGE_PRESET_GROUPS.map((group) => (
          <div className="preset-group" key={group.id}>
            <h3>{group.label}</h3>
            <div className="preset-button-grid">
              {group.presets.map((preset) => (
                <button
                  type="button"
                  className={`preset-button ${selectedPresetId === preset.id ? 'is-selected' : ''}`}
                  disabled={disabled}
                  key={preset.id}
                  onClick={() => onPresetSelect(preset)}
                >
                  <span>{preset.label}</span>
                  <small>
                    {preset.width} x {preset.height}
                  </small>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default PresetSelector;

