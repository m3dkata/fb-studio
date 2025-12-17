export const LandmarkIndices = {
    
    LEFT_EYE: [
        33, 7, 163, 144, 145, 153, 154, 155, 133, 
        33, 246, 161, 160, 159, 158, 157, 173, 133, 
    ],

    
    RIGHT_EYE: [
        362, 382, 381, 380, 374, 373, 390, 249, 263, 
        362, 398, 384, 385, 386, 387, 388, 466, 263, 
    ],

    
    LIPS_OUTER: [
        61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291,
        375, 321, 405, 314, 17, 84, 181, 91, 146,
    ],

    
    LIPS_INNER: [
        78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308,
        324, 318, 402, 317, 14, 87, 178, 88, 95,
    ],

    
    LIPS_UPPER: [
        61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 
        308, 415, 310, 311, 312, 13, 82, 81, 80, 191, 78, 
    ],

    
    LIPS_LOWER: [
        61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 
        308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78, 
    ],

    
    LEFT_EYEBROW: [70, 63, 105, 66, 107, 55, 65, 52, 53, 46],

    
    RIGHT_EYEBROW: [300, 293, 334, 296, 336, 285, 295, 282, 283, 276],

    
    LEFT_CHEEK: [116, 123, 147, 213, 192, 214, 212, 202, 204],

    
    RIGHT_CHEEK: [345, 352, 376, 433, 416, 434, 432, 422, 424],

    
    FACE_CONTOUR: [
        10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
        397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
        172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
    ],

    
    FOREHEAD: [10, 338, 297, 332, 284, 251, 389, 356, 70, 63, 105, 66, 107, 336, 296, 334, 293, 300],

    
    NOSE_BRIDGE: [6, 197, 195, 5, 4, 1, 19, 94, 2],

    
    NOSE_TIP: [1, 2, 98, 327],
};

 
export function landmarksToCanvasCoords(landmarks, canvasWidth, canvasHeight) {
    return landmarks.map(lm => ({
        x: lm.x * canvasWidth,
        y: lm.y * canvasHeight,
        z: lm.z,
    }));
}
export function getRegionLandmarks(landmarks, region) {
    const indices = LandmarkIndices[region];
    if (!indices) return [];

    return indices.map(i => landmarks[i]);
}
export function getBoundingBox(points) {
    
    const validPoints = points.filter(p => p && p.x !== undefined && p.y !== undefined);

    if (validPoints.length === 0) {
        return { x: 0, y: 0, width: 0, height: 0 };
    }

    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    validPoints.forEach(p => {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
    });

    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
    };
}
export function createPolygonPath(ctx, points) {
    if (points.length === 0) return;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }

    ctx.closePath();
}
export function warpTextureToRegion(
    ctx,
    image,
    sourceRect,
    targetPoints,
    intensity = 1.0
) {
    if (targetPoints.length < 3) return;

    ctx.save();

    
    createPolygonPath(ctx, targetPoints);
    ctx.clip();

    
    const bbox = getBoundingBox(targetPoints);

    
    
    ctx.globalAlpha = intensity;
    ctx.drawImage(
        image,
        sourceRect.x, sourceRect.y, sourceRect.width, sourceRect.height,
        bbox.x, bbox.y, bbox.width, bbox.height
    );

    ctx.restore();
}
export function mapMaskToFace(mask, landmarks, canvasWidth, canvasHeight) {
    
    

    const leftEyeLandmarks = getRegionLandmarks(landmarks, 'LEFT_EYE');
    const rightEyeLandmarks = getRegionLandmarks(landmarks, 'RIGHT_EYE');

    if (leftEyeLandmarks.length === 0 || rightEyeLandmarks.length === 0) {
        return null;
    }

    const leftEyeBox = getBoundingBox(leftEyeLandmarks);
    const rightEyeBox = getBoundingBox(rightEyeLandmarks);

    
    
    const templateWidth = 918; 
    const templateHeight = 918; 

    const templateLeftEye = mask.eyeLeft || { x: 285, y: 288 };
    const templateRightEye = mask.eyeRight || { x: 633, y: 288 };

    
    const templateEyeDistance = templateRightEye.x - templateLeftEye.x;
    const faceEyeDistance = (rightEyeBox.x + rightEyeBox.width / 2) - (leftEyeBox.x + leftEyeBox.width / 2);

    const scale = faceEyeDistance / templateEyeDistance;

    const templateCenterX = (templateLeftEye.x + templateRightEye.x) / 2;
    const templateCenterY = (templateLeftEye.y + templateRightEye.y) / 2;

    const faceCenterX = (leftEyeBox.x + leftEyeBox.width / 2 + rightEyeBox.x + rightEyeBox.width / 2) / 2;
    const faceCenterY = (leftEyeBox.y + leftEyeBox.height / 2 + rightEyeBox.y + rightEyeBox.height / 2) / 2;

    return {
        scale,
        translateX: faceCenterX - templateCenterX * scale,
        translateY: faceCenterY - templateCenterY * scale,
    };
}
export function transformTemplateCoords(templateCoord, transform) {
}

 
export function getEyeRegion(landmarks, isLeft = true) {
    const region = isLeft ? 'LEFT_EYE' : 'RIGHT_EYE';
    return getRegionLandmarks(landmarks, region);
}

 
export function getLipRegion(landmarks, isOuter = true) {
    const region = isOuter ? 'LIPS_OUTER' : 'LIPS_INNER';
    return getRegionLandmarks(landmarks, region);
}

 
export function getLipSurface(landmarks, isUpper = true) {
    const region = isUpper ? 'LIPS_UPPER' : 'LIPS_LOWER';
    return getRegionLandmarks(landmarks, region);
}

 
export function getCheekRegion(landmarks, isLeft = true) {
    const region = isLeft ? 'LEFT_CHEEK' : 'RIGHT_CHEEK';
    return getRegionLandmarks(landmarks, region);
}

 
export function getEyebrowRegion(landmarks, isLeft = true) {
    const region = isLeft ? 'LEFT_EYEBROW' : 'RIGHT_EYEBROW';
    return getRegionLandmarks(landmarks, region);
}

 
export function getFaceAngle(landmarks) {
    
    const noseTip = landmarks[1];
    const noseBridge = landmarks[6];

    const leftEye = landmarks[33];
    const rightEye = landmarks[263];

    
    const eyeAngle = Math.atan2(
        rightEye.y - leftEye.y,
        rightEye.x - leftEye.x
    );

    
    const noseAngle = Math.atan2(
        noseTip.y - noseBridge.y,
        noseTip.x - noseBridge.x
    );

    return {
        roll: eyeAngle, 
        pitch: noseAngle - Math.PI / 2, 
    };
}

 
export class LandmarkSmoother {
    constructor(smoothingFactor = 0.5) {
        this.smoothingFactor = smoothingFactor;
        this.previousLandmarks = null;
    }

    smooth(landmarks) {
        if (!this.previousLandmarks) {
            this.previousLandmarks = landmarks;
            return landmarks;
        }

        const smoothed = landmarks.map((lm, i) => {
            const prev = this.previousLandmarks[i];
            return {
                x: prev.x + (lm.x - prev.x) * this.smoothingFactor,
                y: prev.y + (lm.y - prev.y) * this.smoothingFactor,
                z: prev.z + (lm.z - prev.z) * this.smoothingFactor,
            };
        });

        this.previousLandmarks = smoothed;
        return smoothed;
    }

    reset() {
        this.previousLandmarks = null;
    }
}
