import { useEffect, useRef } from 'react';
import GlslCanvas from 'glslCanvas';

interface ShaderViewerProps {
	shaderCode: string | null;
}

function ShaderViewer({ shaderCode }: ShaderViewerProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const glslCanvasRef = useRef<GlslCanvas | null>(null);

	// Initialize canvas and GlslCanvas once
	useEffect(() => {
		if (!containerRef.current || !canvasRef.current) return;

		// Initialize GlslCanvas
		const canvas = canvasRef.current;
		const sandbox = new GlslCanvas(canvas);
		glslCanvasRef.current = sandbox;

		// Handle window resize
		const handleResize = () => {
			if (canvasRef.current && containerRef.current) {
				const width = containerRef.current.offsetWidth;
				const height = containerRef.current.offsetHeight;
				canvasRef.current.width = width;
				canvasRef.current.height = height;
			}
		};

		// Use ResizeObserver for better resize handling
		const resizeObserver = new ResizeObserver(handleResize);
		if (containerRef.current) {
			resizeObserver.observe(containerRef.current);
		}

		// Handle mouse/touch interactions for u_mouse
		let isPointerDown = false;
		const setMouseUniform = (event: PointerEvent) => {
			if (!glslCanvasRef.current) return;
			const rect = canvas.getBoundingClientRect();
			const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
			const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
			glslCanvasRef.current.setUniform('u_mouse', x, y);
		};

		const handlePointerDown = (event: PointerEvent) => {
			isPointerDown = true;
			canvas.setPointerCapture(event.pointerId);
			setMouseUniform(event);
			console.log('pointer down');
		};

		const handlePointerMove = (event: PointerEvent) => {
			if (!isPointerDown) return;
			setMouseUniform(event);
		};

		const handlePointerUp = (event: PointerEvent) => {
			if (isPointerDown) {
				setMouseUniform(event);
			}
			isPointerDown = false;
			canvas.releasePointerCapture(event.pointerId);
		};

		canvas.addEventListener('pointerdown', handlePointerDown);
		canvas.addEventListener('pointermove', handlePointerMove);
		canvas.addEventListener('pointerup', handlePointerUp);
		canvas.addEventListener('pointerleave', handlePointerUp);
		canvas.addEventListener('pointercancel', handlePointerUp);

		// Initial resize
		handleResize();

		return () => {
			resizeObserver.disconnect();
			canvas.removeEventListener('pointerdown', handlePointerDown);
			canvas.removeEventListener('pointermove', handlePointerMove);
			canvas.removeEventListener('pointerup', handlePointerUp);
			canvas.removeEventListener('pointerleave', handlePointerUp);
			canvas.removeEventListener('pointercancel', handlePointerUp);
		};
	}, []); // Only run once on mount

	// Load shader code whenever it changes
	useEffect(() => {
		if (glslCanvasRef.current && shaderCode) {
			glslCanvasRef.current.load(shaderCode);
		}
	}, [shaderCode]); // Run whenever shaderCode changes

	return (
		<div ref={containerRef} className="shader-viewer">
			<canvas ref={canvasRef} />
		</div>
	);
}

ShaderViewer.displayName = 'ShaderViewer';

export default ShaderViewer;
