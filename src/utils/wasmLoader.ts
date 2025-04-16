/**
 * Centralized WASM loader utility
 * Provides optimized loading of WASM modules with caching and error handling
 */

// Cache for loaded WASM modules
const wasmCache: Record<string, any> = {};

/**
 * Loads a WASM module with caching
 * @param path Path to the WASM module
 * @param importObject Optional import object for the WASM module
 * @returns Promise resolving to the instantiated WASM module
 */
export async function loadWasmModule(path: string, importObject?: WebAssembly.Imports): Promise<any> {
  // Return cached module if available
  if (wasmCache[path]) {
    return wasmCache[path];
  }

  try {
    // Use streaming compilation if supported
    if (WebAssembly.instantiateStreaming) {
      const response = await fetch(path);
      const result = await WebAssembly.instantiateStreaming(response, importObject);
      wasmCache[path] = result.instance.exports;
      return wasmCache[path];
    } else {
      // Fallback to ArrayBuffer approach
      const response = await fetch(path);
      const bytes = await response.arrayBuffer();
      const result = await WebAssembly.instantiate(bytes, importObject);
      wasmCache[path] = result.instance.exports;
      return wasmCache[path];
    }
  } catch (error) {
    console.error(`Failed to load WASM module from ${path}:`, error);
    throw error;
  }
}

/**
 * Loads a WASM module with wasm-bindgen support
 * @param wasmModulePath Path to the WASM module
 * @param bindgenModule The JS module generated by wasm-bindgen
 * @returns Promise resolving to the initialized WASM module
 */
export async function loadBindgenModule(wasmModulePath: string, bindgenModule: any): Promise<any> {
  try {
    const response = await fetch(wasmModulePath);
    const bytes = await response.arrayBuffer();
    return bindgenModule.initSync(bytes);
  } catch (error) {
    console.error(`Failed to load wasm-bindgen module from ${wasmModulePath}:`, error);
    throw error;
  }
}

/**
 * Measures the performance of a WASM function call
 * @param fn The WASM function to measure
 * @param args Arguments to pass to the function
 * @returns The result of the function call and the time it took in ms
 */
export function measureWasmPerformance<T, R>(fn: (...args: T[]) => R, ...args: T[]): { result: R, timeMs: number } {
  const start = performance.now();
  const result = fn(...args);
  const end = performance.now();
  return {
    result,
    timeMs: end - start
  };
}
