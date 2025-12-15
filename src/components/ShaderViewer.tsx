import { useEffect, useRef, useState } from 'react';
import GlslCanvas from 'glslCanvas';

interface ShaderViewerProps {
	shaderCode: string | null;
}

function ShaderViewer({ shaderCode }: ShaderViewerProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const glslCanvasRef = useRef<GlslCanvas | null>(null);
	const [touchIndicator, setTouchIndicator] = useState<{
		x: number;
		y: number;
		visible: boolean;
		fading: boolean;
	}>({ x: 0, y: 0, visible: false, fading: false });

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

		const updateTouchIndicator = (event: PointerEvent) => {
			const rect = canvas.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;
			setTouchIndicator({ x, y, visible: true, fading: false });
		};

		const handlePointerDown = (event: PointerEvent) => {
			isPointerDown = true;
			canvas.setPointerCapture(event.pointerId);
			setMouseUniform(event);
			updateTouchIndicator(event);
		};

		const handlePointerMove = (event: PointerEvent) => {
			if (!isPointerDown) return;
			setMouseUniform(event);
			updateTouchIndicator(event);
		};

		const handlePointerUp = (event: PointerEvent) => {
			if (isPointerDown) {
				setMouseUniform(event);
				// Start fade out animation
				setTouchIndicator((prev) => ({ ...prev, fading: true }));
				// Hide after animation completes
				setTimeout(() => {
					setTouchIndicator((prev) => ({ ...prev, visible: false, fading: false }));
				}, 200);
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
			{touchIndicator.visible && (
				<div
					className={`touch-indicator ${touchIndicator.fading ? 'fading' : ''}`}
					style={{
						left: `${touchIndicator.x}px`,
						top: `${touchIndicator.y}px`
					}}
				/>
			)}
		</div>
	);
}

ShaderViewer.displayName = 'ShaderViewer';

export default ShaderViewer;
