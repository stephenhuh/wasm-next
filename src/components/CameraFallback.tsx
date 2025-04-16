'use client'

import Link from 'next/link';
import styles from '@/styles/styles.module.css';

export default function CameraFallback() {
  return (
    <div className="camera-fallback">
      <div className="fallback-content">
        <h2>Camera Control Not Available</h2>
        
        <div className="browser-support">
          <h3>Browser Support</h3>
          <p>
            The camera control feature requires WebUSB, which is only available in certain browsers:
          </p>
          <ul>
            <li>✅ Google Chrome (desktop)</li>
            <li>✅ Microsoft Edge (desktop)</li>
            <li>❌ Safari</li>
            <li>❌ Firefox</li>
            <li>❌ Mobile browsers</li>
          </ul>
        </div>
        
        <div className="requirements">
          <h3>Requirements</h3>
          <p>To use the camera control feature:</p>
          <ol>
            <li>Use Chrome or Edge on desktop</li>
            <li>Connect a compatible DSLR camera via USB</li>
            <li>Allow the browser to access the camera when prompted</li>
          </ol>
        </div>
        
        <div className="actions">
          <Link href="/" className="back-button">
            ← Back to Home
          </Link>
        </div>
      </div>
      
      <style jsx>{`
        .camera-fallback {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          font-family: "Lucida Sans Unicode", "Lucida Grande", sans-serif;
        }
        
        .fallback-content {
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 2rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        h2 {
          color: #e53e3e;
          margin-top: 0;
          margin-bottom: 1.5rem;
          text-align: center;
        }
        
        h3 {
          color: #333;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        
        .browser-support, .requirements {
          margin-bottom: 2rem;
        }
        
        ul, ol {
          margin-left: 1.5rem;
          line-height: 1.6;
        }
        
        li {
          margin-bottom: 0.5rem;
        }
        
        .actions {
          margin-top: 2rem;
          text-align: center;
        }
        
        .back-button {
          display: inline-block;
          padding: 0.8rem 1.5rem;
          background-color: #0070f3;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          transition: background-color 0.2s;
        }
        
        .back-button:hover {
          background-color: #0051a8;
        }
      `}</style>
    </div>
  );
}
