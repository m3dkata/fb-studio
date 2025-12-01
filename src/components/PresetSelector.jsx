export function PresetSelector({ presets, selectedPreset, onPresetChange, disabled = false }) {
    if (!presets || presets.length === 0) {
        return null;
    }

    return (
        <div className="preset-selector">
            <h4>Presets</h4>
            <div className="preset-grid">
                {presets.map((preset) => (
                    <button
                        key={preset.guid}
                        className={`preset-button ${selectedPreset?.guid === preset.guid ? 'active' : ''}`}
                        onClick={() => onPresetChange(preset.guid)}
                        disabled={disabled}
                        title={preset.name}
                    >
                        {preset.thumbnail && (
                            <img src={preset.thumbnail} alt={preset.name} />
                        )}
                        <span className="preset-name">{preset.name}</span>
                        {preset.isPremium && <span className="premium-badge">★</span>}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default PresetSelector;
