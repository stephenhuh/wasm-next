'use client'; // This component interacts with browser APIs (WebUSB)

import React, { useCallback, useState } from 'react';
import { useCamera } from '@/lib/use-camera';

// Infer the hook's return type so `status` is correctly typed as a union
type UseCameraReturn = ReturnType<typeof useCamera>;

export function CameraCapture(): JSX.Element {
	const {
		status,
		error,
		isConnecting,
		isCapturing,
		capturedFile,
		connectCamera,
		captureRawImage,
	}: UseCameraReturn = useCamera();

	const [isUploading, setIsUploading] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const [uploadUrl, setUploadUrl] = useState<string | null>(null);

	const handleDownload = useCallback(() => {
		if (!capturedFile) return;

		const url = URL.createObjectURL(capturedFile);
		const a = document.createElement('a');
		a.href = url;
		a.download = capturedFile.name;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);

		setTimeout(() => URL.revokeObjectURL(url), 100);
	}, [capturedFile]);

	const handleUpload = useCallback(async () => {
		if (!capturedFile) return;

		setIsUploading(true);
		setUploadError(null);
		setUploadUrl(null);

		const formData = new FormData();
		formData.append('rawImage', capturedFile, capturedFile.name);

		try {
			const response = await fetch('/api/upload-raw', {
				method: 'POST',
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || `Upload failed with status: ${response.status}`);
			}

			const result = await response.json();
			console.log('Upload successful:', result);
			setUploadUrl(result.url);
		} catch (err) {
			console.error('Upload error:', err);
			setUploadError(err instanceof Error ? err.message : 'An unknown upload error occurred.');
		} finally {
			setIsUploading(false);
		}
	}, [capturedFile]);

	return (
		<div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
			<h2>DSLR Raw Image Capture</h2>
			<p>Status: <strong>{status}</strong></p>

			{error && <p style={{ color: 'red' }}>Error: {error}</p>}

			<div style={{ marginBottom: '20px' }}>
				<button onClick={connectCamera} disabled={isConnecting || status === 'connected'}>
					{isConnecting ? 'Connecting...' : 'Connect Camera'}
				</button>
				<p style={{ fontSize: '0.8em', color: 'gray' }}>
					Ensure camera is connected via USB and set to PTP/MTP mode. You will be prompted to select the device.
				</p>
			</div>

			{status === 'connected' && (
				<div style={{ marginBottom: '20px' }}>
					<button onClick={captureRawImage} disabled={isCapturing}>
						{isCapturing ? 'Capturing...' : 'Capture Raw Image'}
					</button>
					<p style={{ fontSize: '0.8em', color: 'gray' }}>
						Make sure the camera is manually set to capture RAW (.CR2,.NEF, etc.) format.
					</p>
				</div>
			)}

			{capturedFile && (
				<div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '15px' }}>
					<h3>Captured File:</h3>
					<p>Name: {capturedFile.name}</p>
					<p>Size: {(capturedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
					<p>Type: {capturedFile.type || 'unknown'}</p>
					<button onClick={handleDownload} style={{ marginRight: '10px' }}>
						Download File
					</button>
					<button onClick={handleUpload} disabled={isUploading}>
						{isUploading ? 'Uploading...' : 'Upload to Vercel Blob'}
					</button>
					{uploadError && <p style={{ color: 'red', marginTop: '10px' }}>Upload Error: {uploadError}</p>}
					{uploadUrl && (
						<p style={{ color: 'green', marginTop: '10px' }}>
							Upload successful! URL: <a href={uploadUrl} target="_blank" rel="noopener noreferrer">{uploadUrl}</a>
						</p>
					)}
				</div>
			)}
		</div>
	);
}
