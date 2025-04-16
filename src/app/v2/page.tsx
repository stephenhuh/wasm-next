// app/page.tsx
import CameraControl from '@/components/v2/camera-v2'; // Adjust the import path as needed

export default function HomePage() {
	return (
		<main style={{ padding: '2rem' }}>
			<h1>Next.js + Vercel + web-gphoto2 Demo</h1>
			<p>
				Connect a compatible DSLR via USB and click Connect Camera.
				Ensure your browser supports WebUSB and necessary permissions are granted.
			</p>
			<hr style={{ margin: '1rem 0' }} />

			{/* Render the client component that handles camera interaction */}
			<CameraControl />
		</main>
	);
}