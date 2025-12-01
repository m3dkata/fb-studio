import { useState, useEffect, useRef, useCallback } from 'react';
import { getMediaPipeService, MediaPipeOptimizer } from '../services/mediaPipeService';
import { MakeupRenderer } from '../services/makeupRenderer';
import { loadTemplate } from '../utils/xmlConverter';
import { useCamera } from './useCamera';
export function useMakeupPreview(templateId = null) {
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [template, setTemplate] = useState(null);
    const [selectedPreset, setSelectedPreset] = useState(null);
    const [fps, setFps] = useState(0);

    // Use camera hook
    const { videoRef, isCameraReady, error: cameraError, initCamera } = useCamera();

    const canvasRef = useRef(null);
    const mediaPipeRef = useRef(null);
    const rendererRef = useRef(null);
    const optimizerRef = useRef(null);
    const animationFrameRef = useRef(null);
    const currentLandmarksRef = useRef(null);

    // Propagate camera error
    useEffect(() => {
        if (cameraError) {
            setError(cameraError);
        }
    }, [cameraError]);
    const initMediaPipe = useCallback(async () => {
        try {
            setIsLoading(true);

            // Initialize MediaPipe
            const mediaPipe = getMediaPipeService();
            await mediaPipe.initialize();
            mediaPipeRef.current = mediaPipe;

            // Setup face detection callback
            mediaPipe.onFaceResults((results) => {
                if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
                    currentLandmarksRef.current = results.multiFaceLandmarks[0];
                } else {
                    currentLandmarksRef.current = null;
                }
            });

            // Initialize renderer
            if (canvasRef.current) {
                rendererRef.current = new MakeupRenderer(canvasRef.current);
            }

            // Initialize optimizer
            optimizerRef.current = new MediaPipeOptimizer(60); // Increased to 60 FPS

            setIsInitialized(true);
            setIsLoading(false);
        } catch (err) {
            console.error('Failed to initialize MediaPipe:', err);
            setError('Failed to initialize face tracking. Please refresh the page.');
            setIsLoading(false);
            throw err;
        }
    }, []);
    const loadMakeupTemplate = useCallback(async (templateId) => {
        try {
            setIsLoading(true);
            const loadedTemplate = await loadTemplate(templateId);
            setTemplate(loadedTemplate);

            // Auto-select first preset
            if (loadedTemplate.presets && loadedTemplate.presets.length > 0) {
                setSelectedPreset(loadedTemplate.presets[0]);
            }

            setIsLoading(false);
        } catch (err) {
            console.error('Failed to load template:', err);
            setError(`Failed to load template: ${err.message}`);
            setIsLoading(false);
        }
    }, []);
    const renderLoop = useCallback((timestamp) => {
        if (!videoRef.current || !canvasRef.current || !mediaPipeRef.current || !rendererRef.current) {
            animationFrameRef.current = requestAnimationFrame(renderLoop);
            return;
        }

        // Check if we should process this frame (Rendering target: 60 FPS)
        if (optimizerRef.current && !optimizerRef.current.shouldProcessFrame(timestamp)) {
            animationFrameRef.current = requestAnimationFrame(renderLoop);
            return;
        }

        // Safety check for video dimensions
        if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
            animationFrameRef.current = requestAnimationFrame(renderLoop);
            return;
        }

        // Update FPS
        if (optimizerRef.current) {
            setFps(optimizerRef.current.getFPS());
        }

        // Process frame with MediaPipe (Throttled to ~30 FPS for performance)
        // We use a simple frame skip: process every other frame if running at 60fps
        const shouldDetect = !window.lastDetectionTime || (timestamp - window.lastDetectionTime) >= 32;

        if (shouldDetect) {
            window.lastDetectionTime = timestamp;
            mediaPipeRef.current.detectFace(videoRef.current).catch(err => {
                console.warn('Face detection error:', err);
            });
        }

        // Render makeup
        if (currentLandmarksRef.current && template && selectedPreset) {
            rendererRef.current.render(
                videoRef.current,
                currentLandmarksRef.current,
                template,
                selectedPreset
            ).catch(err => {
                console.warn('Render error:', err);
            });
        } else {
            // Just draw video frame if no face detected
            const ctx = canvasRef.current.getContext('2d');
            ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        }

        animationFrameRef.current = requestAnimationFrame(renderLoop);
    }, [template, selectedPreset]);
    const startRendering = useCallback(() => {
        if (!animationFrameRef.current) {
            animationFrameRef.current = requestAnimationFrame(renderLoop);
        }
    }, [renderLoop]);
    const stopRendering = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
    }, []);
    const changeTemplate = useCallback(async (newTemplateId) => {
        stopRendering();
        await loadMakeupTemplate(newTemplateId);
        startRendering();
    }, [loadMakeupTemplate, startRendering, stopRendering]);
    const changePreset = useCallback((presetGuid) => {
        if (!template || !template.presets) return;

        const preset = template.presets.find(p => p.guid === presetGuid);
        if (preset) {
            setSelectedPreset(preset);
        }
    }, [template]);
    const takeScreenshot = useCallback(() => {
        if (!canvasRef.current) return null;

        return canvasRef.current.toDataURL('image/png');
    }, []);
    const resizeCanvas = useCallback(() => {
        if (!videoRef.current || !canvasRef.current || !rendererRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (video.videoWidth === 0 || video.videoHeight === 0) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        rendererRef.current.resize(canvas.width, canvas.height);
    }, []);
    useEffect(() => {
        let mounted = true;

        const init = async () => {
            try {
                await initCamera();
                await initMediaPipe();

                if (mounted && templateId) {
                    await loadMakeupTemplate(templateId);
                }
            } catch (err) {
                console.error('Initialization error:', err);
            }
        };

        init();

        // Handle window resize/orientation change
        window.addEventListener('resize', resizeCanvas);

        return () => {
            mounted = false;
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [initCamera, initMediaPipe, loadMakeupTemplate, templateId, resizeCanvas]);
    useEffect(() => {
        if (isInitialized && isCameraReady) {
            resizeCanvas();
            startRendering();
        }

        return () => {
            stopRendering();
        };
    }, [isInitialized, isCameraReady, resizeCanvas, startRendering, stopRendering]);
    useEffect(() => {
        if (isInitialized && templateId) {
            loadMakeupTemplate(templateId);
        }
    }, [templateId, isInitialized, loadMakeupTemplate]);
    useEffect(() => {
        return () => {
            // Stop rendering
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }

            // Cleanup renderer
            if (rendererRef.current) {
                rendererRef.current.dispose();
            }

            // Cleanup MediaPipe
            if (mediaPipeRef.current) {
                mediaPipeRef.current.dispose();
            }
        };
    }, []);

    return {
        videoRef,
        canvasRef,
        isInitialized,
        isLoading,
        error,
        template,
        selectedPreset,
        fps,
        isCameraReady,
        changeTemplate,
        changePreset,
        takeScreenshot,
    };
}

export default useMakeupPreview;
