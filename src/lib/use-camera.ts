import { useState, useRef, useCallback } from 'react';
import { Camera } from 'web-gphoto2'; // Assuming Camera is the main export

// Define valid status literals
export type CameraStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

// Hook return type for clarity
export interface UseCameraReturn {
	status: CameraStatus;
	error: string | null;
	isConnecting: boolean;
	isCapturing: boolean;
	capturedFile: File | null;
	connectCamera: () => Promise<void>;
	captureRawImage: () => Promise<void>;
	disconnectCamera: () => Promise<void>;
}

export function useCamera(): UseCameraReturn {
	const camera = useRef<Camera | null>(null);
	const [status, setStatus] = useState<CameraStatus>('disconnected');
	const [error, setError] = useState<string | null>(null);
	const [isConnecting, setIsConnecting] = useState<boolean>(false);
	const [isCapturing, setIsCapturing] = useState<boolean>(false);
	const [capturedFile, setCapturedFile] = useState<File | null>(null);

	// Initialize camera instance only once
	if (camera.current === null) {
		camera.current = new Camera();
	}

	const connectCamera = useCallback(async (): Promise<void> => {
		if (!camera.current) return;

		setIsConnecting(true);
		setStatus('connecting');
		setError(null);
		setCapturedFile(null);

		try {
			await Camera.showPicker();
			await camera.current.connect();
			setStatus('connected');
		} catch (err) {
			setStatus('error');
			setError(err instanceof Error ? err.message : 'Unknown connection error');
		} finally {
			setIsConnecting(false);
		}
	}, []);

	const captureRawImage = useCallback(async (): Promise<void> => {
		if (!camera.current || status !== 'connected') {
			setError('Camera is not connected.');
			return;
		}

		setIsCapturing(true);
		setError(null);
		setCapturedFile(null);

		try {
			const file = await camera.current.captureImageAsFile();
			setCapturedFile(file);
		} catch (err) {
			setStatus('error');
			setError(err instanceof Error ? err.message : 'Unknown capture error');
		} finally {
			setIsCapturing(false);
		}
	}, [status]);

	const disconnectCamera = useCallback(async (): Promise<void> => {
		if (!camera.current || status !== 'connected') return;
		// If the library supports disconnect, call it here
		setStatus('disconnected');
		setCapturedFile(null);
	}, [status]);

	return {
		status,
		error,
		isConnecting,
		isCapturing,
		capturedFile,
		connectCamera,
		captureRawImage,
		disconnectCamera,
	};
}
