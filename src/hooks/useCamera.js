import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook for camera management
 */
export function useCamera() {
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [error, setError] = useState(null);

    const videoRef = useRef(null);
    const streamRef = useRef(null);

    /**
     * Initialize camera stream
     */
    const initCamera = useCallback(async () => {
        try {
            // Stop any existing stream first
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user',
                },
                audio: false,
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;

                await new Promise((resolve) => {
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current.play();
                        setIsCameraReady(true);
                        resolve();
                    };
                });
            }
        } catch (err) {
            console.error('Failed to access camera:', err);
            setError('Failed to access camera. Please grant camera permissions.');
            throw err;
        }
    }, []);

    /**
     * Cleanup camera on unmount
     */
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    /**
     * Stop camera stream manually
     */
    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsCameraReady(false);
    }, []);

    return {
        videoRef,
        isCameraReady,
        error,
        initCamera,
        stopCamera,
    };
}

export default useCamera;
