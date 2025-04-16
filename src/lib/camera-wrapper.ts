'use client'

// This is a wrapper around web-gphoto2 to make it work with Next.js
// It handles the dynamic import of the library

import { useEffect, useState } from 'react';

// Define types based on the web-gphoto2 API
export interface Config {
  name: string;
  info: string;
  label: string;
  readonly: boolean;
  type: string;
  children?: Record<string, Config>;
  choices?: Record<string, string>;
  value?: string | number | boolean;
}

export interface SupportedOps {
  capturePreview?: boolean;
  captureImage?: boolean;
  [key: string]: boolean | undefined;
}

export interface CameraInterface {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getConfig(): Promise<Config>;
  getSupportedOps(): Promise<SupportedOps>;
  setConfigValue(name: string, value: string | number | boolean): Promise<void>;
  capturePreviewAsBlob(): Promise<Blob>;
  captureImageAsFile(): Promise<File>;
  consumeEvents(): Promise<boolean>;
}

// Custom hook to load the camera module
export function useCameraModule() {
  const [camera, setCamera] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadCameraModule() {
      try {
        setIsLoading(true);
        // Dynamically import the web-gphoto2 module
        const cameraModule = await import('web-gphoto2/build/camera.js');
        setCamera(cameraModule);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load camera module:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      }
    }

    loadCameraModule();
  }, []);

  return { camera, isLoading, error };
}

// Function to show the camera picker
export async function showCameraPicker(): Promise<void> {
  try {
    const cameraModule = await import('web-gphoto2/build/camera.js');
    await cameraModule.Camera.showPicker();
  } catch (error) {
    console.error('Error showing camera picker:', error);
    throw error;
  }
}

// Create a camera instance
export async function createCamera(): Promise<CameraInterface | null> {
  try {
    const cameraModule = await import('web-gphoto2/build/camera.js');
    return new cameraModule.Camera();
  } catch (error) {
    console.error('Error creating camera instance:', error);
    return null;
  }
}
