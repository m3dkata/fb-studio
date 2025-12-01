import { FaceMesh } from '@mediapipe/face_mesh';
import { SelfieSegmentation } from '@mediapipe/selfie_segmentation';
class MediaPipeService {
    constructor() {
        this.faceMesh = null;
        this.selfieSegmentation = null;
        this.isInitialized = false;
        this.onResultsCallback = null;
        this.onSegmentationCallback = null;
    }
    async initFaceMesh() {
        this.faceMesh = new FaceMesh({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${file}`;
            },
        });

        this.faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.3, // Lowered for performance
            minTrackingConfidence: 0.3, // Lowered for performance
        });

        this.faceMesh.onResults((results) => {
            if (this.onResultsCallback) {
                this.onResultsCallback(results);
            }
        });

        await this.faceMesh.initialize();
    }
    async initSelfieSegmentation() {
        this.selfieSegmentation = new SelfieSegmentation({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1/${file}`;
            },
        });

        this.selfieSegmentation.setOptions({
            modelSelection: 1, // 0 for general, 1 for landscape (better quality)
            selfieMode: true,
        });

        this.selfieSegmentation.onResults((results) => {
            if (this.onSegmentationCallback) {
                this.onSegmentationCallback(results);
            }
        });

        await this.selfieSegmentation.initialize();
    }
    async initialize() {
        if (this.isInitialized) return;

        try {
            // Only initialize FaceMesh for now (segmentation has issues)
            await this.initFaceMesh();

            this.isInitialized = true;
            // console.log('MediaPipe initialized successfully');
        } catch (error) {
            // console.error('Failed to initialize MediaPipe:', error);
            throw error;
        }
    }
    async detectFace(videoElement) {
        if (!this.faceMesh) {
            throw new Error('FaceMesh not initialized');
        }

        await this.faceMesh.send({ image: videoElement });
    }
    async segment(videoElement) {
        if (!this.selfieSegmentation) {
            throw new Error('SelfieSegmentation not initialized');
        }

        await this.selfieSegmentation.send({ image: videoElement });
    }
    onFaceResults(callback) {
        this.onResultsCallback = callback;
    }
    onSegmentation(callback) {
        this.onSegmentationCallback = callback;
    }
    dispose() {
        if (this.faceMesh) {
            this.faceMesh.close();
            this.faceMesh = null;
        }

        if (this.selfieSegmentation) {
            this.selfieSegmentation.close();
            this.selfieSegmentation = null;
        }

        this.isInitialized = false;
        this.onResultsCallback = null;
        this.onSegmentationCallback = null;
    }
}

// Singleton instance
let mediaPipeInstance = null;
export function getMediaPipeService() {
    if (!mediaPipeInstance) {
        mediaPipeInstance = new MediaPipeService();
    }
    return mediaPipeInstance;
}
export function extractHairMask(segmentationMask, canvasWidth, canvasHeight) {
    // Create canvas for hair mask
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');

    // Draw segmentation mask
    ctx.drawImage(segmentationMask, 0, 0, canvasWidth, canvasHeight);

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    const data = imageData.data;

    // Create hair mask (assuming hair is in upper portion of segmentation)
    // This is a simplified approach - you might need more sophisticated hair detection
    for (let i = 0; i < data.length; i += 4) {
        const y = Math.floor(i / 4 / canvasWidth);
        const segmentValue = data[i]; // R channel contains segmentation

        // Keep only upper portion (rough hair region)
        if (segmentValue > 128 && y < canvasHeight * 0.4) {
            // Keep as is (person mask)
            data[i + 3] = 255; // Full opacity
        } else {
            // Make transparent
            data[i + 3] = 0;
        }
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
}
export class MediaPipeOptimizer {
    constructor(targetFPS = 30) {
        this.targetFPS = targetFPS;
        this.frameInterval = 1000 / targetFPS;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.fps = 0;
        this.fpsUpdateInterval = 1000;
        this.lastFpsUpdate = 0;
    }
    shouldProcessFrame(timestamp) {
        const elapsed = timestamp - this.lastFrameTime;

        if (elapsed >= this.frameInterval) {
            this.lastFrameTime = timestamp;
            this.frameCount++;

            // Update FPS counter
            const fpsDelta = timestamp - this.lastFpsUpdate;
            if (fpsDelta >= this.fpsUpdateInterval) {
                this.fps = Math.round((this.frameCount * 1000) / fpsDelta);
                this.frameCount = 0;
                this.lastFpsUpdate = timestamp;
            }

            return true;
        }

        return false;
    }
    getFPS() {
        return this.fps;
    }
    reset() {
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.fps = 0;
        this.lastFpsUpdate = 0;
    }
}

export default getMediaPipeService;
