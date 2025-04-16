// components/CameraControl.tsx
'use client'; // Mark this as a Client Component is crucial

import React, { useState, useEffect, useCallback } from 'react';

// Define the type for the Camera class instance - adjust if web-gphoto2 provides its own types
// Assuming a basic structure based on usage
interface GPhotoCamera {
	connect: () => Promise<void>;
	getConfig: () => Promise<any>; // Replace 'any' with a more specific type if available
	getSupportedOps: () => Promise<string[]>; // Example type
	setConfigValue: (key: string, value: string | number) => Promise<void>; // Example type
	capturePreviewAsBlob: () => Promise<Blob>;
	captureImageAsFile: () => Promise<File>;
	// Add other methods as needed based on web-gphoto2 API
}

// Define the type for the Camera static methods / constructor
interface GPhotoCameraConstructor {
	new(): GPhotoCamera;
	showPicker: () => Promise<void>;
}

// Dynamically import web-gphoto2 to ensure it's only loaded client-side
let CameraModule: { Camera: GPhotoCameraConstructor } | null = null;

function CameraControl() {
	const [cameraInstance, setCameraInstance] = useState<GPhotoCamera | null>(null);
	const [isModuleLoading, setIsModuleLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [config, setConfig] = useState<any | null>(null); // Use specific type if known
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [status, setStatus] = useState('Importing Camera module...');

	// Load the Camera module dynamically on component mount
	useEffect(() => {
		import('web-gphoto2')
		.then((module) => {
			// Assign the imported module object containing the Camera class
			CameraModule = module as { Camera: GPhotoCameraConstructor };
			setStatus('Camera module loaded. Ready to connect.');
			setIsModuleLoading(false);
		})
		.catch(err => {
			console.error("Failed to load web-gphoto2:", err);
			setError('Failed to load camera library. Check console.');
			setIsModuleLoading(false);
			setStatus('Error loading module.');
		});

		// Cleanup function for when the component unmounts
		return () => {
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
			// If web-gphoto2 had an explicit disconnect/close method, call it here
			// cameraInstance?.close();
		};
	}, [previewUrl]); // Include previewUrl dependency to ensure cleanup runs if it changes

	const handleConnect = useCallback(async () => {
		if (!CameraModule) {
			setError('Camera module not loaded yet.');
			setStatus('Error: Module not loaded.');
			return;
		}
		if (cameraInstance) {
			setStatus('Already connected or connecting...');
			return; // Avoid multiple connections
		}

		setStatus('Attempting connection...');
		setError(null);
		try {
			const newCamera = new CameraModule.Camera(); // Instantiate using the loaded class
			setStatus('Showing USB picker...');
			await CameraModule.Camera.showPicker(); // Call static method
			setStatus('Connecting to selected camera...');
			await newCamera.connect();
			setCameraInstance(newCamera);
			setStatus('Connected!');

			// Optionally fetch config
			setStatus('Fetching config...');
			const cameraConfig = await newCamera.getConfig();
			setConfig(cameraConfig);
			setStatus('Connected and config loaded.');
			console.log('Camera Config:', cameraConfig);

		} catch (err: any) {
			console.error('Connection failed:', err);
			setError(`Connection failed: ${err?.message ?? String(err)}`);
			setStatus('Connection failed.');
			setCameraInstance(null); // Reset instance on failure
		}
	}, [cameraInstance]); // Dependency ensures we don't reconnect if already connected

	const handleCapturePreview = useCallback(async () => {
		if (!cameraInstance) {
			setError('Not connected to camera.');
			setStatus('Error: Not connected.');
			return;
		}
		setStatus('Capturing preview...');
		setError(null);
		try {
			const blob = await cameraInstance.capturePreviewAsBlob();
			// Clean up previous URL *before* creating a new one
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
			const newUrl = URL.createObjectURL(blob);
			setPreviewUrl(newUrl); // Update state to trigger re-render
			setStatus('Preview captured.');
		} catch (err: any) {
			console.error('Preview capture failed:', err);
			setError(`Preview capture failed: ${err?.message ?? String(err)}`);
			setStatus('Preview failed.');
		}
	}, [cameraInstance, previewUrl]); // Dependencies: need instance, and need to clean up old previewUrl

	const handleDisconnect = useCallback(() => {
		// Simulate disconnect by resetting state
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
		}
		setCameraInstance(null);
		setConfig(null);
		setPreviewUrl(null);
		setError(null);
		setStatus('Disconnected.');
		// Note: Check web-gphoto2 docs for an actual USB disconnect method if available.
	}, [previewUrl]); // Dependency for cleanup

	if (isModuleLoading) {
		return <div>Loading Camera Module...</div>;
	}

	return (
		<div>
			<h2>DSLR Camera Control (web-gphoto2)</h2>
			<p>Status: {status}</p>
			{error && <p style={{ color: 'red' }}>Error: {error}</p>}

			{!cameraInstance ? (
				<button onClick={handleConnect} disabled={!CameraModule || isModuleLoading}>
					Connect Camera
				</button>
			) : (
				<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
					<button onClick={handleCapturePreview}>Capture Preview</button>
					<button onClick={handleDisconnect}>Disconnect</button>
					{previewUrl && (
						<div>
							<h3>Preview:</h3>
							<img
								src={previewUrl}
								alt="Camera Preview"
								style={{ maxWidth: '100%', height: 'auto', border: '1px solid #ccc' }}
							/>
						</div>
					)}
					{/* Optional: Display Config */}
					{/* {config && <pre style={{ maxHeight: '200px', overflow: 'auto', background: '#f0f0f0', padding: '10px' }}>{JSON.stringify(config, null, 2)}</pre>} */}
				</div>
			)}
		</div>
	);
}

export default CameraControl;