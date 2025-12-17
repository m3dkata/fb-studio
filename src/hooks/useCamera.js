import { useState, useRef, useCallback, useEffect } from 'react';
import { CAMERA_CONFIG } from '../constants/performance';

 
export function useCamera() {
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [error, setError] = useState(null);

    const videoRef = useRef(null);
    const streamRef = useRef(null);

     
    const initCamera = useCallback(async () => {
        try {
            
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: CAMERA_CONFIG.VIDEO_WIDTH },
                    height: { ideal: CAMERA_CONFIG.VIDEO_HEIGHT },
                    facingMode: CAMERA_CONFIG.FACING_MODE,
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

     
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

     
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
