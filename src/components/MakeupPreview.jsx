import { useMakeupPreview } from '../hooks/useMakeupPreview';
import { PresetSelector } from './PresetSelector';

/**
 * Main makeup preview component with live camera feed
 */
export function MakeupPreview({ templateId, onTemplateChange }) {
    const {
        videoRef,
        canvasRef,
        isInitialized,
        isLoading,
        error,
        template,
        selectedPreset,
        fps,
        isCameraReady,
        changePreset,
        takeScreenshot,
    } = useMakeupPreview(templateId);

    const handleScreenshot = () => {
        const dataUrl = takeScreenshot();
        if (dataUrl) {
            // Create download link
            const link = document.createElement('a');
            link.download = `makeup-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
        }
    };

    if (error) {
        return (
            <div className="makeup-preview-error">
                <div className="error-icon">⚠️</div>
                <h3>Error</h3>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Reload Page</button>
            </div>
        );
    }

    return (
        <div className="makeup-preview-container">
            {/* Loading overlay */}
            {isLoading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <p>Loading makeup preview...</p>
                </div>
            )}

            {/* Video and canvas */}
            <div className="preview-display">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ display: 'none' }}
                />
                <canvas
                    ref={canvasRef}
                    className="preview-canvas"
                />

                {/* FPS counter */}
                {isInitialized && (
                    <div className="fps-counter">
                        {fps} FPS
                    </div>
                )}

                {/* No face detected indicator */}
                {isInitialized && isCameraReady && !isLoading && (
                    <div className="face-indicator">
                        <div className="face-indicator-dot"></div>
                        <span></span>
                    </div>
                )}
            </div>

            {/* Controls */}
            {isInitialized && template && (
                <div className="preview-controls">
                    {/* Preset selector */}
                    <PresetSelector
                        presets={template.presets}
                        selectedPreset={selectedPreset}
                        onPresetChange={changePreset}
                        disabled={!isCameraReady}
                    />

                    {/* Action buttons */}
                    <div className="action-buttons">
                        <button
                            className="screenshot-button"
                            onClick={handleScreenshot}
                            disabled={!isCameraReady}
                            aria-label="Take Screenshot"
                        >
                            Take Photo
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MakeupPreview;
