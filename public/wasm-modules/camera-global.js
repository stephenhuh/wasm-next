// This script creates a global Camera object that can be used from anywhere
(function() {
  // Define the Camera class
  class Camera {
    constructor() {
      this.instance = null;
    }

    static async showPicker() {
      try {
        // Check if WebUSB is supported
        if (!navigator.usb) {
          throw new Error('WebUSB is not supported in this browser');
        }

        // Show the browser's USB device picker
        await navigator.usb.requestDevice({
          filters: [
            {
              classCode: 6, // PTP
              subclassCode: 1 // MTP
            }
          ]
        });
        return true; // Device was selected
      } catch (error) {
        // Check if this is a cancellation error
        if (error.name === 'NotFoundError' && error.message.includes('No device selected')) {
          console.log('User cancelled device selection');
          return false; // User cancelled, not a real error
        }

        // For other errors, log and rethrow
        console.error('Error showing camera picker:', error);
        throw error;
      }
    }

    async connect() {
      try {
        console.log('Connecting to camera...');
        // For now, just simulate a successful connection
        this.instance = {
          connected: true,
          supportedOps: {
            capturePreview: true,
            captureImage: true
          }
        };

        return true;
      } catch (error) {
        console.error('Error connecting to camera:', error);
        throw error;
      }
    }

    async disconnect() {
      this.instance = null;
    }

    async getConfig() {
      if (!this.instance) {
        throw new Error('Camera not connected');
      }

      // Return a mock config
      return {
        name: 'camera',
        info: 'Camera configuration',
        label: 'Camera',
        readonly: false,
        type: 'window',
        children: {
          imgsettings: {
            name: 'imgsettings',
            info: 'Image settings',
            label: 'Image Settings',
            readonly: false,
            type: 'window',
            children: {
              iso: {
                name: 'iso',
                info: 'ISO speed',
                label: 'ISO',
                readonly: false,
                type: 'radio',
                value: '100',
                choices: {
                  '100': 'ISO 100',
                  '200': 'ISO 200',
                  '400': 'ISO 400',
                  '800': 'ISO 800'
                }
              }
            }
          }
        }
      };
    }

    async getSupportedOps() {
      if (!this.instance) {
        throw new Error('Camera not connected');
      }

      return this.instance.supportedOps;
    }

    async setConfigValue(name, value) {
      if (!this.instance) {
        throw new Error('Camera not connected');
      }

      console.log(`Setting ${name} to ${value}`);
      return true;
    }

    async capturePreviewAsBlob() {
      if (!this.instance) {
        throw new Error('Camera not connected');
      }

      // Create a simple canvas with text
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#333';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Camera Preview Simulation', canvas.width / 2, canvas.height / 2);
      ctx.fillText(new Date().toLocaleTimeString(), canvas.width / 2, canvas.height / 2 + 40);

      // Convert canvas to blob
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg');
      });
    }

    async captureImageAsFile() {
      if (!this.instance) {
        throw new Error('Camera not connected');
      }

      // Create a simple canvas with text
      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#333';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Camera Capture Simulation', canvas.width / 2, canvas.height / 2);
      ctx.fillText(new Date().toLocaleString(), canvas.width / 2, canvas.height / 2 + 80);

      // Convert canvas to blob
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          // Create a File object from the blob
          const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
          resolve(file);
        }, 'image/jpeg');
      });
    }

    async consumeEvents() {
      return false;
    }
  }

  // Make Camera available globally
  window.Camera = Camera;

  // Log that the Camera object is available
  console.log('Camera object is now available globally');

  // Dispatch an event to notify that the Camera is ready
  window.dispatchEvent(new CustomEvent('camera-ready'));
})();
