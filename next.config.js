// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    reactStrictMode: true, // Recommended, but can be adjusted

    // 1. Set COOP and COEP headers required by SharedArrayBuffer (used by web-gphoto2)
    async headers() {
        return [
            {
                // Apply these headers to all routes
                source: '/(.*)',
                headers: [
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'same-origin', // Required for SharedArrayBuffer
                    },
                    {
                        key: 'Cross-Origin-Embedder-Policy',
                        value: 'require-corp', // Required for SharedArrayBuffer
                    },
                ],
            },
        ];
    },

    // 2. Configure Webpack for WASM support
    webpack: (config, { isServer }) => {
        // Enable asynchronous WebAssembly modules
        config.experiments = {
            ...config.experiments,
            asyncWebAssembly: true,
            layers: true, // Often used with asyncWebAssembly
        };

        // --- Optional Troubleshooting Step ---
        // If you encounter 404 errors for the .wasm file after deploying to Vercel,
        // uncomment and potentially adjust the paths below. This explicitly tells
        // Webpack where to place the WASM file in the build output.
        /*
        if (!isServer) {
          // For client-side bundles, place WASM in static/wasm
          config.output.webassemblyModuleFilename = 'static/wasm/[modulehash].wasm';
        } else {
          // For server-side bundles, adjust path relative to the server output
          // This might be needed if WASM is somehow used during SSR/SSG, though unlikely for web-gphoto2
          config.output.webassemblyModuleFilename = '../static/wasm/[modulehash].wasm';
        }
        */
        // --- End Optional Step ---

        // Important: return the modified config
        return config;
    },
};

module.exports = nextConfig;