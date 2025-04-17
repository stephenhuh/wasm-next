import CameraControl from '@/components/v3/camera-v3';

export default function V3() {
	return (
		<main style={{ padding: '2rem' }}>
			<h1>Raw Bytes + Vercel + web-gphoto2 Demo</h1>
			<p>
				Connect a compatible DSLR via USB and click Connect Camera.
				Ensure your browser supports WebUSB and necessary permissions are granted.
			</p>
			<hr style={{ margin: '1rem 0' }} />

			<CameraControl />
		</main>
	);
}