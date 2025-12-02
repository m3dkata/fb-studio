/**
 * Performance configuration constants
 * Centralized performance-related magic numbers for makeup preview and MediaPipe
 */

export const PERFORMANCE_CONFIG = {
    // Frame rates
    TARGET_FPS: 60,                    // Target rendering frame rate
    DETECTION_FPS: 15,                 // Face detection frame rate (lower for performance)

    // Timing
    DETECTION_THROTTLE_MS: 66,         // ~15 FPS for face detection (1000/15)

    // MediaPipe optimization
    MEDIAPIPE_TARGET_FPS: 60,          // MediaPipe optimizer target FPS
};

export const CAMERA_CONFIG = {
    VIDEO_WIDTH: 1280,
    VIDEO_HEIGHT: 720,
    FACING_MODE: 'user',
};
