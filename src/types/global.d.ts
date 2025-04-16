// Global type declarations to make TypeScript happy

// Declare the global Camera object
interface Window {
  Camera: any;
}

// Declare WebUSB on navigator
interface Navigator {
  usb: any;
}
