'use client'

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import styles from '@/styles/styles.module.css';

// Define the Camera type for TypeScript
interface CameraType {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getConfig(): Promise<any>;
  getSupportedOps(): Promise<any>;
  setConfigValue(name: string, value: string | number | boolean): Promise<void>;
  capturePreviewAsBlob(): Promise<Blob>;
  captureImageAsFile(): Promise<File>;
  consumeEvents(): Promise<boolean>;
}

// Define the static methods on the Camera constructor
interface CameraConstructor {
  new(): CameraType;
  showPicker(): Promise<void>;
}

// Declare the global Camera object
declare global {
  interface Window {
    Camera: CameraConstructor;
  }
}

export default function CameraControl() {
  const [camera, setCamera] = useState<CameraType | null>(null);
  const [connected, setConnected] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [config, setConfig] = useState<any>(null);
  const [supportedOps, setSupportedOps] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const previewRef = useRef<HTMLImageElement>(null);
  const previewIntervalRef = useRef<number | null>(null);

  // Check browser compatibility
  useEffect(() => {
    if (typeof navigator !== 'undefined' && !navigator.usb) {
      setIsSupported(false);
      setError('Your browser does not support WebUSB, which is required for camera control. Please use Chrome or Edge on desktop.');
    }
  }, []);

  // Connect to camera
  const connectCamera = async () => {
    try {
      setError(null);

      // Make sure the Camera object is available
      if (!window.Camera) {
        throw new Error('Camera module not loaded');
      }

      // Show the browser's USB device picker
      const deviceSelected = await window.Camera.showPicker();

      // If user cancelled, just return without error
      if (deviceSelected === false) {
        setError('Device selection cancelled. Please try again when youre ready.');
        return;
      }

      // Create a new camera instance
      const cam = new window.Camera();

      // Connect to the camera
      await cam.connect();
      setCamera(cam);
      setConnected(true);

      // Get camera capabilities
      const ops = await cam.getSupportedOps();
      setSupportedOps(ops);

      // Get initial configuration
      const config = await cam.getConfig();
      setConfig(config);

      // Start preview if supported
      if (ops.capturePreview) {
        startPreview(cam);
      }
    } catch (error) {
      console.error('Failed to connect to camera:', error);

      // Handle different types of errors
      if (error instanceof Error) {
        // For NotFoundError (device not selected), show a friendly message
        if (error.name === 'NotFoundError' && error.message.includes('No device selected')) {
          setError('Device selection cancelled. Please try again when youre ready.');
        }
        // For SecurityError (permission denied), show a specific message
        else if (error.name === 'SecurityError') {
          setError('Permission to access the camera was denied. Please check your browser settings.');
        }
        // For other errors, show the error message
        else {
          setError(`Failed to connect to camera: ${error.message}`);
        }
      } else {
        // For non-Error objects
        setError(`Failed to connect to camera: ${String(error)}`);
      }
    }
  };

  // Start preview stream
  const startPreview = (cam: Camera) => {
    if (previewIntervalRef.current) {
      clearInterval(previewIntervalRef.current);
    }

    previewIntervalRef.current = window.setInterval(async () => {
      try {
        const blob = await cam.capturePreviewAsBlob();

        // Revoke previous URL to prevent memory leaks
        if (preview) {
          URL.revokeObjectURL(preview);
        }

        const url = URL.createObjectURL(blob);
        setPreview(url);
      } catch (error) {
        console.error('Preview error:', error);
        // Don't set error state here to avoid disrupting the UI during temporary errors
      }
    }, 500); // Update every 500ms
  };

  // Capture full-resolution image
  const captureImage = async () => {
    if (!camera) return;

    try {
      setError(null);
      const file = await camera.captureImageAsFile();
      const url = URL.createObjectURL(file);

      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name || 'camera-image.jpg';
      a.click();

      // Clean up the URL
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Capture error:', error);
      setError(`Failed to capture image: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Update camera setting
  const updateSetting = async (name: string, value: string | number | boolean) => {
    if (!camera) return;

    try {
      setError(null);
      await camera.setConfigValue(name, value);

      // Refresh configuration after update
      const newConfig = await camera.getConfig();
      setConfig(newConfig);
    } catch (error) {
      console.error(`Failed to update ${name}:`, error);
      setError(`Failed to update ${name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Render camera settings UI
  const renderSettings = () => {
    if (!config || !config.children) return null;

    // Filter out some sections that are not typically needed
    const relevantSections = ['imgsettings', 'capturesettings'];

    return (
      <div className="settings">
        <h3>Camera Settings</h3>
        {Object.entries(config.children).map(([sectionKey, section]: [string, any]) => {
          if (!relevantSections.includes(sectionKey) && !isDebug) return null;

          return (
            <div key={sectionKey} className="settings-section">
              <h4>{section.label || sectionKey}</h4>
              {section.children && Object.entries(section.children).map(([settingKey, setting]: [string, any]) => {
                if (setting.readonly) return null;

                // Handle different types of settings
                if (setting.type === 'radio' && setting.choices) {
                  return (
                    <div key={settingKey} className="setting">
                      <label>{setting.label || settingKey}:</label>
                      <select
                        value={setting.value}
                        onChange={(e) => updateSetting(settingKey, e.target.value)}
                      >
                        {Object.entries(setting.choices).map(([choiceKey, choiceLabel]: [string, any]) => (
                          <option key={choiceKey} value={choiceKey}>
                            {choiceLabel}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                return null; // Skip other types for now
              })}
            </div>
          );
        })}
      </div>
    );
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (previewIntervalRef.current) {
        clearInterval(previewIntervalRef.current);
      }

      if (preview) {
        URL.revokeObjectURL(preview);
      }

      if (camera) {
        camera.disconnect().catch(console.error);
      }
    };
  }, [camera, preview]);

  // If WebUSB is not supported
  if (!isSupported) {
    // Import and use the fallback component
    const CameraFallback = dynamic(() => import('./CameraFallback'), {
      ssr: false
    });
    return <CameraFallback />;
  }

  return (
    <div className="camera-control">
      {error && (
        <div className="error-banner">
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
          </div>
          <button onClick={() => setError(null)} className="dismiss-button">×</button>
        </div>
      )}

      {!connected ? (
        <div className="connect-container">
          <button onClick={connectCamera} className="connect-button">
            Connect Camera
          </button>
          <p>
            This will open your browser's USB device picker. Select your camera to connect.
          </p>
        </div>
      ) : (
        <div className="camera-interface">
          <div className="preview-container">
            {preview ? (
              <img
                ref={previewRef}
                src={preview}
                alt="Camera preview"
                className="camera-preview"
              />
            ) : (
              <div className="preview-placeholder">
                {supportedOps?.capturePreview
                  ? 'Loading preview...'
                  : 'Preview not supported by this camera'}
              </div>
            )}
          </div>

          <div className="controls-container">
            {supportedOps?.captureImage && (
              <button
                onClick={captureImage}
                className="capture-button"
                disabled={!connected}
              >
                Capture Photo
              </button>
            )}

            {renderSettings()}
          </div>
        </div>
      )}
    </div>
  );
}

// For debugging purposes
const isDebug = false;
