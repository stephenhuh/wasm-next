'use client'

// This is a direct implementation of the Camera class that loads the WASM files
// from our public directory instead of trying to import them from node_modules

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

// Global variables to store loaded modules
let cameraModule: any = null;
let cameraModulePromise: Promise<any> | null = null;

// Function to load the camera module
async function loadCameraModule() {
  if (cameraModule) {
    return cameraModule;
  }

  if (cameraModulePromise) {
    return cameraModulePromise;
  }

  cameraModulePromise = new Promise(async (resolve, reject) => {
    try {
      // Load the camera.js script
      const script = document.createElement('script');
      script.src = '/wasm-modules/camera.js';
      script.type = 'module';

      script.onload = () => {
        // @ts-ignore - Access the global Camera object
        cameraModule = window.Camera;
        resolve(cameraModule);
      };

      script.onerror = (error) => {
        reject(new Error(`Failed to load camera module: ${error}`));
      };

      document.head.appendChild(script);
    } catch (error) {
      reject(error);
    }
  });

  return cameraModulePromise;
}

// Camera class implementation
export class Camera {
  private instance: any = null;

  static async showPicker(): Promise<void> {
    try {
      const cameraModule = await loadCameraModule();
      await cameraModule.showPicker();
    } catch (error) {
      console.error('Error showing camera picker:', error);
      throw error;
    }
  }

  async connect(): Promise<void> {
    try {
      const cameraModule = await loadCameraModule();
      this.instance = new cameraModule();
      await this.instance.connect();
    } catch (error) {
      console.error('Error connecting to camera:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.instance) return;

    try {
      await this.instance.disconnect();
      this.instance = null;
    } catch (error) {
      console.error('Error disconnecting camera:', error);
      throw error;
    }
  }

  async getConfig(): Promise<Config> {
    if (!this.instance) {
      throw new Error('Camera not connected');
    }

    try {
      return await this.instance.getConfig();
    } catch (error) {
      console.error('Error getting camera config:', error);
      throw error;
    }
  }

  async getSupportedOps(): Promise<SupportedOps> {
    if (!this.instance) {
      throw new Error('Camera not connected');
    }

    try {
      return await this.instance.getSupportedOps();
    } catch (error) {
      console.error('Error getting supported operations:', error);
      throw error;
    }
  }

  async setConfigValue(name: string, value: string | number | boolean): Promise<void> {
    if (!this.instance) {
      throw new Error('Camera not connected');
    }

    try {
      await this.instance.setConfigValue(name, value);
    } catch (error) {
      console.error(`Error setting config value ${name}:`, error);
      throw error;
    }
  }

  async capturePreviewAsBlob(): Promise<Blob> {
    if (!this.instance) {
      throw new Error('Camera not connected');
    }

    try {
      return await this.instance.capturePreviewAsBlob();
    } catch (error) {
      console.error('Error capturing preview:', error);
      throw error;
    }
  }

  async captureImageAsFile(): Promise<File> {
    if (!this.instance) {
      throw new Error('Camera not connected');
    }

    try {
      return await this.instance.captureImageAsFile();
    } catch (error) {
      console.error('Error capturing image:', error);
      throw error;
    }
  }

  async consumeEvents(): Promise<boolean> {
    if (!this.instance) {
      throw new Error('Camera not connected');
    }

    try {
      return await this.instance.consumeEvents();
    } catch (error) {
      console.error('Error consuming events:', error);
      throw error;
    }
  }
}
