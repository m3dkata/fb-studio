import {
    createProgram,
    VERTEX_SHADER,
    getBlendShader,
    COLOR_TINT_SHADER,
    SHIMMER_SHADER,
    ALPHA_COMPOSITE_SHADER,
    setupQuad,
    loadTexture,
    BlendMode,
} from '../utils/makeupShaders.js';
import {
    landmarksToCanvasCoords,
    getEyeRegion,
    getLipRegion,
    getLipSurface,
    getCheekRegion,
    getEyebrowRegion,
    getBoundingBox,
    createPolygonPath,
    mapMaskToFace,
    transformTemplateCoords,
    LandmarkSmoother,
} from '../utils/faceWarping.js';
export class MakeupRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { willReadFrequently: true });

        // Create WebGL canvas for advanced effects
        this.glCanvas = document.createElement('canvas');
        this.gl = this.glCanvas.getContext('webgl', { premultipliedAlpha: false });

        // Texture cache
        this.textureCache = new Map();

        // Shader programs
        this.programs = {};

        // Landmark smoother
        this.landmarkSmoother = new LandmarkSmoother(0.7);

        // Animation time
        this.startTime = Date.now();

        this.initializeShaders();
    }
    initializeShaders() {
        const gl = this.gl;

        // Create programs for different blend modes
        this.programs.multiply = createProgram(gl, VERTEX_SHADER, getBlendShader(BlendMode.MULTIPLY));
        this.programs.screen = createProgram(gl, VERTEX_SHADER, getBlendShader(BlendMode.SCREEN));
        this.programs.overlay = createProgram(gl, VERTEX_SHADER, getBlendShader(BlendMode.OVERLAY));
        this.programs.softLight = createProgram(gl, VERTEX_SHADER, getBlendShader(BlendMode.SOFT_LIGHT));
        this.programs.colorTint = createProgram(gl, VERTEX_SHADER, COLOR_TINT_SHADER);
        this.programs.shimmer = createProgram(gl, VERTEX_SHADER, SHIMMER_SHADER);
        this.programs.composite = createProgram(gl, VERTEX_SHADER, ALPHA_COMPOSITE_SHADER);

        // Setup quad buffers
        this.quad = setupQuad(gl);
    }
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.glCanvas.width = width;
        this.glCanvas.height = height;

        if (this.gl) {
            this.gl.viewport(0, 0, width, height);
        }
    }
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    async render(videoFrame, faceLandmarks, template, preset) {
        if (!faceLandmarks || faceLandmarks.length === 0) {
            return;
        }

        // Smooth landmarks
        const smoothedLandmarks = this.landmarkSmoother.smooth(faceLandmarks);

        // Convert to canvas coordinates
        const landmarks = landmarksToCanvasCoords(
            smoothedLandmarks,
            this.canvas.width,
            this.canvas.height
        );

        // Clear canvas
        this.clear();

        // Draw video frame as base
        this.ctx.drawImage(videoFrame, 0, 0, this.canvas.width, this.canvas.height);

        // Apply makeup effects in order
        if (preset && preset.effects) {
            for (const effect of preset.effects) {
                await this.renderEffect(effect, landmarks, template);
            }
        }
    }
    async renderEffect(effect, landmarks, template) {
        switch (effect.type) {
            case 'eye_shadow':
                await this.renderEyeShadow(effect, landmarks, template);
                break;
            case 'eye_line':
                await this.renderEyeLine(effect, landmarks, template);
                break;
            case 'eye_lash':
                await this.renderEyeLash(effect, landmarks, template);
                break;
            case 'lipstick':
                await this.renderLipstick(effect, landmarks, template);
                break;
            case 'eye_brow':
                await this.renderEyebrow(effect, landmarks, template);
                break;
            case 'blush':
                await this.renderBlush(effect, landmarks, template);
                break;
            case 'face_contour_pattern':
                await this.renderFaceContour(effect, landmarks, template);
                break;
            case 'hair_dye':
                // Hair dye requires segmentation mask - skip for now
                break;
        }
    }
    async renderEyeShadow(effect, landmarks, template) {
        const pattern = this.findPattern(template.eyeShadow?.patterns, effect.patternGuid);
        if (!pattern || !pattern.masks) return;

        const intensity = (effect.globalIntensity || 50) / 100;

        // Render for both eyes
        for (const isLeft of [true, false]) {
            const eyeLandmarks = getEyeRegion(landmarks, isLeft);
            if (eyeLandmarks.length === 0) continue;

            // Apply each mask layer
            for (let i = 0; i < pattern.masks.length; i++) {
                const mask = pattern.masks[i];
                const color = effect.colors?.[i];
                const colorIntensity = effect.colorIntensities?.[i] || 50;
                const isShimmer = effect.colorIsShimmers?.[i] || false;
                const shimmerIntensity = effect.shimmerIntensities?.[i] || 0;

                if (!mask.src || !color) continue;

                await this.renderMaskWithColor(
                    mask,
                    eyeLandmarks,
                    color,
                    (colorIntensity / 100) * intensity,
                    isShimmer,
                    shimmerIntensity / 100,
                    !isLeft // Flip for right eye
                );
            }
        }
    }
    async renderEyeLine(effect, landmarks, template) {
        const pattern = this.findPattern(template.eyeLine?.patterns, effect.patternGuid);
        if (!pattern || !pattern.masks) return;

        const intensity = (effect.colorIntensities?.[0] || 60) / 100;
        const color = effect.colors?.[0];

        if (!color) return;

        // Render for both eyes
        for (const isLeft of [true, false]) {
            const eyeLandmarks = getEyeRegion(landmarks, isLeft);
            if (eyeLandmarks.length === 0) continue;

            // Find upper and lower eyeliner masks
            const upperMask = pattern.masks.find(m => m.position === 'upper');
            const lowerMask = pattern.masks.find(m => m.position === 'lower');

            if (upperMask?.src) {
                await this.renderMaskWithColor(upperMask, eyeLandmarks, color, intensity, false, 0, !isLeft);
            }
            if (lowerMask?.src) {
                await this.renderMaskWithColor(lowerMask, eyeLandmarks, color, intensity, false, 0, !isLeft);
            }
        }
    }
    async renderEyeLash(effect, landmarks, template) {
        const pattern = this.findPattern(template.eyeLash?.patterns, effect.patternGuid);
        if (!pattern || !pattern.masks) return;

        const intensity = (effect.colorIntensities?.[0] || 60) / 100;
        const color = effect.colors?.[0] || { r: 0, g: 0, b: 0, a: 1 };

        // Render for both eyes
        for (const isLeft of [true, false]) {
            const eyeLandmarks = getEyeRegion(landmarks, isLeft);
            if (eyeLandmarks.length === 0) continue;

            const upperMask = pattern.masks.find(m => m.position === 'upper');
            if (upperMask?.src) {
                await this.renderMaskWithColor(upperMask, eyeLandmarks, color, intensity, false, 0, !isLeft);
            }
        }
    }
    async renderLipstick(effect, landmarks, template) {
        const lipLandmarks = getLipRegion(landmarks, true); // Outer contour
        if (lipLandmarks.length === 0) return;

        const intensity = (effect.colorIntensities?.[0] || 55) / 100;
        const color = effect.levelColors?.[0] || effect.colors?.[0];

        if (!color) return;

        // Use shared temp canvas
        const tempCanvas = this.getTempCanvas();
        const tempCtx = tempCanvas.getContext('2d');

        // Clear temp canvas
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

        const { r, g, b, a } = color;
        tempCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;

        // Draw full outer lip region
        createPolygonPath(tempCtx, lipLandmarks);
        tempCtx.fill();

        // Check mouth openness
        // Landmark 13: Upper lip inner center
        // Landmark 14: Lower lip inner center
        const upperInner = landmarks[13];
        const lowerInner = landmarks[14];

        // Calculate face bounding box for relative threshold
        const faceBbox = getBoundingBox(landmarks);
        const faceHeight = faceBbox.height;

        if (upperInner && lowerInner && faceHeight > 0) {
            // Calculate vertical distance
            const dy = Math.abs(upperInner.y - lowerInner.y);
            const openRatio = dy / faceHeight;

            // Only cut out if mouth is open enough (> 3% of face height)
            // This prevents gaps when closed but ensures cutout when open
            if (openRatio > 0.03) {
                const innerLipLandmarks = getLipRegion(landmarks, false); // Inner contour
                if (innerLipLandmarks.length > 0) {
                    tempCtx.globalCompositeOperation = 'destination-out';
                    // Use exact inner landmarks, do not scale
                    createPolygonPath(tempCtx, innerLipLandmarks);
                    tempCtx.fill();

                    // Reset composite operation
                    tempCtx.globalCompositeOperation = 'source-over';
                }
            }
        }

        // Composite the lipstick layer onto main canvas
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'soft-light';
        this.ctx.globalAlpha = intensity * a;
        this.ctx.drawImage(tempCanvas, 0, 0);
        this.ctx.restore();

        // Add gloss effect if specified
        const pattern = this.findPattern(template.lipstick?.patterns, effect.patternGuid);
        if (pattern?.lipstickProfile === 'GLOSS') {
            this.addGlossEffect(lipLandmarks);
        }
    }
    async renderEyebrow(effect, landmarks, template) {
        const pattern = this.findPattern(template.eyeBrow?.patterns, effect.patternGuid);
        if (!pattern || !pattern.masks || pattern.masks.length === 0) return;

        const intensity = (effect.colorIntensities?.[0] || 16) / 100;
        const color = effect.colors?.[0];

        if (!color) return;

        // Render for both eyebrows
        for (const isLeft of [true, false]) {
            const browLandmarks = getEyebrowRegion(landmarks, isLeft);
            if (browLandmarks.length === 0) continue;

            const mask = pattern.masks[0];
            if (mask.shapeSrc3d) {
                await this.renderMaskWithColor(mask, browLandmarks, color, intensity, false, 0, !isLeft);
            }
        }
    }
    async renderBlush(effect, landmarks, template) {
        const pattern = this.findPattern(template.blush?.patterns, effect.patternGuid);
        if (!pattern || !pattern.masks) return;

        const intensity = (effect.colorIntensities?.[0] || 30) / 100;
        const color = effect.colors?.[0];

        if (!color) return;

        // Render for both cheeks
        for (const isLeft of [true, false]) {
            const cheekLandmarks = getCheekRegion(landmarks, isLeft);
            if (cheekLandmarks.length === 0) continue;

            const mask = pattern.masks.find(m =>
                m.position === (isLeft ? 'left' : 'right')
            );

            if (mask?.src) {
                await this.renderMaskWithColor(mask, cheekLandmarks, color, intensity);
            }
        }
    }
    async renderFaceContour(effect, landmarks, template) {
        // TODO: Face contour needs proper region mapping
        // Temporarily disabled to avoid rendering artifacts
        return;

        if (!effect.patterns) return;

        const globalIntensity = (effect.globalIntensity || 50) / 100;

        for (const effectPattern of effect.patterns) {
            const pattern = this.findPattern(template.faceContour?.patterns, effectPattern.patternGuid);
            if (!pattern || !pattern.masks) continue;

            const mask = pattern.masks[effectPattern.patternMaskIndex];
            if (!mask?.src) continue;

            const palette = effectPattern.palettes?.[0];
            const colorIndex = palette?.palette_color_index || 0;
            const color = effect.colors?.[colorIndex];
            const colorIntensity = effect.colorIntensities?.[colorIndex] || 50;

            if (!color) continue;

            // Use face contour landmarks
            const faceLandmarks = landmarks; // Use all landmarks for face contour

            await this.renderMaskWithColor(
                mask,
                faceLandmarks,
                color,
                (colorIntensity / 100) * globalIntensity
            );
        }
    }
    // Helper to reuse temp canvas
    getTempCanvas() {
        if (!this.sharedTempCanvas) {
            this.sharedTempCanvas = document.createElement('canvas');
            this.sharedTempCanvas.width = this.canvas.width;
            this.sharedTempCanvas.height = this.canvas.height;
        }
        // Ensure size matches
        if (this.sharedTempCanvas.width !== this.canvas.width ||
            this.sharedTempCanvas.height !== this.canvas.height) {
            this.sharedTempCanvas.width = this.canvas.width;
            this.sharedTempCanvas.height = this.canvas.height;
        }
        return this.sharedTempCanvas;
    }

    async renderMaskWithColor(mask, regionLandmarks, color, intensity, isShimmer = false, shimmerIntensity = 0, shouldFlip = false) {
        if (!mask.src) return;

        try {
            // Load mask texture
            const image = await this.loadImage(mask.src);

            // Validate image loaded correctly
            if (!image || !image.complete || image.width === 0 || image.height === 0) {
                // console.warn('Invalid mask image:', mask.src);
                return;
            }

            // Get region bounding box
            const bbox = getBoundingBox(regionLandmarks);
            if (bbox.width === 0 || bbox.height === 0) return;

            // Calculate mask dimensions to fit the region
            // Add padding to make makeup extend beyond just the eye landmarks
            const padding = bbox.width * 0.7; // 75% padding
            const maskX = bbox.x - padding;
            const maskY = bbox.y - padding + bbox.height * 0.2;
            const maskWidth = bbox.width + padding * 2;
            const maskHeight = bbox.height + padding * 2;

            // Use shared temp canvas
            const tempCanvas = this.getTempCanvas();
            const tempCtx = tempCanvas.getContext('2d');

            // Clear only the area we need
            // Adding some buffer to clear rect to be safe
            tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

            // Draw mask centered on the region
            if (shouldFlip) {
                tempCtx.save();
                tempCtx.translate(maskX + maskWidth / 2, maskY + maskHeight / 2);
                tempCtx.scale(-1, 1);
                tempCtx.translate(-(maskX + maskWidth / 2), -(maskY + maskHeight / 2));
            }

            tempCtx.drawImage(
                image,
                maskX,
                maskY,
                maskWidth,
                maskHeight
            );

            if (shouldFlip) {
                tempCtx.restore();
            }

            // Reset composite operation
            tempCtx.globalCompositeOperation = 'source-over';

            // Apply color tint using source-atop
            tempCtx.globalCompositeOperation = 'source-atop';
            tempCtx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
            tempCtx.fillRect(
                maskX,
                maskY,
                maskWidth,
                maskHeight
            );

            // Composite onto main canvas with proper alpha
            this.ctx.save();
            this.ctx.globalAlpha = intensity;
            this.ctx.drawImage(tempCanvas, 0, 0);
            this.ctx.restore();

            // Reset composite operation for next use
            tempCtx.globalCompositeOperation = 'source-over';

            // Add shimmer if needed
            if (isShimmer && shimmerIntensity > 0) {
                this.addShimmerEffect(bbox, shimmerIntensity);
            }
        } catch (error) {
            console.warn('Failed to render mask:', mask.src, error);
        }
    }
    addGlossEffect(lipLandmarks) {
        const bbox = getBoundingBox(lipLandmarks);

        // Create gradient for gloss
        const gradient = this.ctx.createLinearGradient(
            bbox.x,
            bbox.y,
            bbox.x,
            bbox.y + bbox.height
        );

        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(bbox.x, bbox.y, bbox.width, bbox.height * 0.5);
    }
    addShimmerEffect(bbox, intensity) {
        const time = (Date.now() - this.startTime) / 1000;

        // Create sparkle particles
        // Reduced particle count multiplier from 20 to 10
        const particleCount = Math.floor(intensity * 5);

        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';

        for (let i = 0; i < particleCount; i++) {
            const x = bbox.x + Math.random() * bbox.width;
            const y = bbox.y + Math.random() * bbox.height;
            const size = Math.random() * 1.5 + 0.5;
            const alpha = Math.sin(time * 3 + i) * 0.5 + 0.5;

            this.ctx.globalAlpha = alpha * intensity;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.restore();
    }
    findPattern(patterns, guid) {
        if (!patterns || !guid) return null;
        return patterns.find(p => p.guid === guid);
    }
    async loadImage(src) {
        if (this.textureCache.has(src)) {
            return this.textureCache.get(src);
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';

            img.onload = () => {
                this.textureCache.set(src, img);
                resolve(img);
            };

            img.onerror = reject;
            img.src = src;
        });
    }
    clearCache() {
        this.textureCache.clear();
    }
    dispose() {
        this.clearCache();
        this.landmarkSmoother.reset();

        if (this.gl) {
            // Clean up WebGL resources
            Object.values(this.programs).forEach(program => {
                if (program) this.gl.deleteProgram(program);
            });
        }
    }
}

export default MakeupRenderer;
