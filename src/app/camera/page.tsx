'use client'

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import Link from 'next/link';

// Use dynamic import with SSR disabled for the camera component
// This is necessary because WebUSB is only available in the browser
// Define the error component with a display name
const CameraErrorComponent = ({ error }: { error: Error }) => (
  <div className="error-message">
    <h2>Error Loading Camera Module</h2>
    <p>There was a problem loading the camera module. This might be due to browser compatibility issues.</p>
    <p>Technical details: {error.message}</p>
  </div>
);
CameraErrorComponent.displayName = 'CameraErrorComponent';

// Define the loading component with a display name
const LoadingComponent = () => <div className="loading">Loading camera module...</div>;
LoadingComponent.displayName = 'LoadingComponent';

// Use dynamic import with proper display names
const CameraControl = dynamic(() =>
  import('@/components/CameraControl')
    .catch(err => {
      console.error('Error loading CameraControl component:', err);
      return () => <CameraErrorComponent error={err} />;
    }),
  {
    ssr: false,
    loading: () => <LoadingComponent />
  }
);

export default function CameraPage() {
  // We'll use Next.js Script component to load our camera module

  return (
    <div className="container">
      {/* Load the camera module */}
      <Script src="/wasm-modules/camera-global.js" strategy="beforeInteractive" />
      <header>
        <h1>DSLR Camera Control</h1>
        <p>Control your DSLR camera directly from the browser using WebUSB</p>
        <Link href="/" className="back-link">
          ← Back to Home
        </Link>
      </header>

      <main>
        <CameraControl />
      </main>

      <footer>
        <p>
          Powered by <a href="https://github.com/GoogleChromeLabs/web-gphoto2" target="_blank" rel="noopener noreferrer">web-gphoto2</a> and WebAssembly
        </p>
      </footer>

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        header {
          margin-bottom: 2rem;
          text-align: center;
        }

        h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }

        .back-link {
          display: inline-block;
          margin-top: 1rem;
          color: #0070f3;
          text-decoration: none;
        }

        .back-link:hover {
          text-decoration: underline;
        }

        main {
          margin-bottom: 2rem;
        }

        footer {
          text-align: center;
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid #eaeaea;
          color: #666;
        }

        footer a {
          color: #0070f3;
          text-decoration: none;
        }

        footer a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
