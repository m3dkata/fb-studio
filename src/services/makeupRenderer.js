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

        
        this.glCanvas = document.createElement('canvas');
        this.gl = this.glCanvas.getContext('webgl', { premultipliedAlpha: false });

        
        this.textureCache = new Map();

        
        this.programs = {};

        
        this.landmarkSmoother = new LandmarkSmoother(0.7);

        
        this.startTime = Date.now();

        this.initializeShaders();
    }
    initializeShaders() {
        const gl = this.gl;

        
        this.programs.multiply = createProgram(gl, VERTEX_SHADER, getBlendShader(BlendMode.MULTIPLY));
        this.programs.screen = createProgram(gl, VERTEX_SHADER, getBlendShader(BlendMode.SCREEN));
        this.programs.overlay = createProgram(gl, VERTEX_SHADER, getBlendShader(BlendMode.OVERLAY));
        this.programs.softLight = createProgram(gl, VERTEX_SHADER, getBlendShader(BlendMode.SOFT_LIGHT));
        this.programs.colorTint = createProgram(gl, VERTEX_SHADER, COLOR_TINT_SHADER);
        this.programs.shimmer = createProgram(gl, VERTEX_SHADER, SHIMMER_SHADER);
        this.programs.composite = createProgram(gl, VERTEX_SHADER, ALPHA_COMPOSITE_SHADER);

        
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

        
        const smoothedLandmarks = this.landmarkSmoother.smooth(faceLandmarks);

        
        const landmarks = landmarksToCanvasCoords(
            smoothedLandmarks,
            this.canvas.width,
            this.canvas.height
        );

        
        this.clear();

        
        this.ctx.drawImage(videoFrame, 0, 0, this.canvas.width, this.canvas.height);

        
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
                
                break;
        }
    }
    async renderEyeShadow(effect, landmarks, template) {
        const pattern = this.findPattern(template.eyeShadow?.patterns, effect.patternGuid);
        if (!pattern || !pattern.masks) return;

        const intensity = (effect.globalIntensity || 50) / 100;

        
        for (const isLeft of [true, false]) {
            const eyeLandmarks = getEyeRegion(landmarks, isLeft);
            if (eyeLandmarks.length === 0) continue;

            
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
                    !isLeft 
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

        
        for (const isLeft of [true, false]) {
            const eyeLandmarks = getEyeRegion(landmarks, isLeft);
            if (eyeLandmarks.length === 0) continue;

            
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
        const lipLandmarks = getLipRegion(landmarks, true); 
        if (lipLandmarks.length === 0) return;

        const intensity = (effect.colorIntensities?.[0] || 55) / 100;
        const color = effect.levelColors?.[0] || effect.colors?.[0];

        if (!color) return;

        
        const tempCanvas = this.getTempCanvas();
        const tempCtx = tempCanvas.getContext('2d');

        
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

        const { r, g, b, a } = color;
        tempCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;

        
        createPolygonPath(tempCtx, lipLandmarks);
        tempCtx.fill();

        
        
        
        const upperInner = landmarks[13];
        const lowerInner = landmarks[14];

        
        const faceBbox = getBoundingBox(landmarks);
        const faceHeight = faceBbox.height;

        if (upperInner && lowerInner && faceHeight > 0) {
            
            const dy = Math.abs(upperInner.y - lowerInner.y);
            const openRatio = dy / faceHeight;

            
            
            if (openRatio > 0.03) {
                const innerLipLandmarks = getLipRegion(landmarks, false); 
                if (innerLipLandmarks.length > 0) {
                    tempCtx.globalCompositeOperation = 'destination-out';
                    
                    createPolygonPath(tempCtx, innerLipLandmarks);
                    tempCtx.fill();

                    
                    tempCtx.globalCompositeOperation = 'source-over';
                }
            }
        }

        
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'soft-light';
        this.ctx.globalAlpha = intensity * a;
        this.ctx.drawImage(tempCanvas, 0, 0);
        this.ctx.restore();

        
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

            
            const faceLandmarks = landmarks; 

            await this.renderMaskWithColor(
                mask,
                faceLandmarks,
                color,
                (colorIntensity / 100) * globalIntensity
            );
        }
    }
    
    getTempCanvas() {
        if (!this.sharedTempCanvas) {
            this.sharedTempCanvas = document.createElement('canvas');
            this.sharedTempCanvas.width = this.canvas.width;
            this.sharedTempCanvas.height = this.canvas.height;
        }
        
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
            
            const image = await this.loadImage(mask.src);

            
            if (!image || !image.complete || image.width === 0 || image.height === 0) {
                
                return;
            }

            
            const bbox = getBoundingBox(regionLandmarks);
            if (bbox.width === 0 || bbox.height === 0) return;

            
            
            const padding = bbox.width * 0.7; 
            const maskX = bbox.x - padding;
            const maskY = bbox.y - padding + bbox.height * 0.2;
            const maskWidth = bbox.width + padding * 2;
            const maskHeight = bbox.height + padding * 2;

            
            const tempCanvas = this.getTempCanvas();
            const tempCtx = tempCanvas.getContext('2d');

            
            
            tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

            
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

            
            tempCtx.globalCompositeOperation = 'source-over';

            
            tempCtx.globalCompositeOperation = 'source-atop';
            tempCtx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
            tempCtx.fillRect(
                maskX,
                maskY,
                maskWidth,
                maskHeight
            );

            
            this.ctx.save();
            this.ctx.globalAlpha = intensity;
            this.ctx.drawImage(tempCanvas, 0, 0);
            this.ctx.restore();

            
            tempCtx.globalCompositeOperation = 'source-over';

            
            if (isShimmer && shimmerIntensity > 0) {
                this.addShimmerEffect(bbox, shimmerIntensity);
            }
        } catch (error) {
            console.warn('Failed to render mask:', mask.src, error);
        }
    }
    addGlossEffect(lipLandmarks) {
        const bbox = getBoundingBox(lipLandmarks);

        
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
            
            Object.values(this.programs).forEach(program => {
                if (program) this.gl.deleteProgram(program);
            });
        }
    }
}

export default MakeupRenderer;
