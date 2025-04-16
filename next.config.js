/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack(config, { isServer, dev, webpack }) {
        // Use the client static directory in the server bundle and prod mode
        // Fixes `Error occurred prerendering page "/"`
        config.output.webassemblyModuleFilename =
            isServer && !dev
                ? '../static/pkg/[modulehash].wasm'
                : 'static/pkg/[modulehash].wasm'

        // Enhanced WebAssembly support for web-gphoto2
        config.experiments = {
            ...config.experiments,
            asyncWebAssembly: true,
            syncWebAssembly: true,
            topLevelAwait: true
        }

        // Add WASM as a known asset
        if (!config.resolve.extensions) {
            config.resolve.extensions = [];
        }
        config.resolve.extensions.push('.wasm');

        // Optimize WASM loading
        config.module.rules.push({
            test: /\.wasm$/,
            type: 'webassembly/async',
        });

        // https://nextjs.org/docs/app/building-your-application/optimizing/memory-usage#disable-webpack-cache
        // This just stops building altogether:
        // if (config.cache && !dev) {
        //     config.cache = Object.freeze({
        //         type: 'memory',
        //     })
        // }

        // Debugging (vercel/next.js/issues/27650)
        config.infrastructureLogging = { debug: /PackFileCache/ }

        return config
    },

    // Add headers required for SharedArrayBuffer (needed by web-gphoto2)
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'same-origin',
                    },
                    {
                        key: 'Cross-Origin-Embedder-Policy',
                        value: 'require-corp',
                    },
                ],
            },
        ];
    },
}

module.exports = nextConfig
