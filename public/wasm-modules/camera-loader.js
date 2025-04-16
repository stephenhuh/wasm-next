// This script loads the camera module and makes it available globally
(async function() {
  try {
    // First, load the libapi.mjs module
    const libapiScript = document.createElement('script');
    libapiScript.src = '/wasm-modules/libapi.mjs';
    libapiScript.type = 'module';
    
    await new Promise((resolve, reject) => {
      libapiScript.onload = resolve;
      libapiScript.onerror = reject;
      document.head.appendChild(libapiScript);
    });
    
    // Then load the camera.js module
    const cameraScript = document.createElement('script');
    cameraScript.src = '/wasm-modules/camera.js';
    cameraScript.type = 'module';
    
    await new Promise((resolve, reject) => {
      cameraScript.onload = resolve;
      cameraScript.onerror = reject;
      document.head.appendChild(cameraScript);
    });
    
    console.log('Camera module loaded successfully');
  } catch (error) {
    console.error('Failed to load camera module:', error);
  }
})();
