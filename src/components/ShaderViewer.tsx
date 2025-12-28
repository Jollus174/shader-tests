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
		let activePointerId: number | null = null;

		const setMouseUniform = (event: PointerEvent) => {
			if (!glslCanvasRef.current) return;
			const rect = canvas.getBoundingClientRect();
			const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
			// Flip y to match gl_FragCoord coordinate system (bottom-left origin)
			const y = canvas.height - ((event.clientY - rect.top) / rect.height) * canvas.height;
			glslCanvasRef.current.setUniform('u_mouse', x, y);
		};

		const updateTouchIndicator = (event: PointerEvent) => {
			const rect = canvas.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;
			setTouchIndicator({ x, y, visible: true, fading: false });
		};

		const handlePointerDown = (event: PointerEvent) => {
			// Prevent default to stop scrolling/zooming on touch devices
			event.preventDefault();
			isPointerDown = true;
			activePointerId = event.pointerId;
			canvas.setPointerCapture(event.pointerId);
			setMouseUniform(event);
			updateTouchIndicator(event);
		};

		const handlePointerMove = (event: PointerEvent) => {
			// Update uniform if this is the active pointer or if pointer is down
			if (isPointerDown && (activePointerId === null || event.pointerId === activePointerId)) {
				event.preventDefault();
				setMouseUniform(event);
				updateTouchIndicator(event);
			}
		};

		const handlePointerUp = (event: PointerEvent) => {
			// Only handle if this is the active pointer
			if (activePointerId !== null && event.pointerId !== activePointerId) {
				return;
			}

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
			activePointerId = null;
			if (canvas.hasPointerCapture(event.pointerId)) {
				canvas.releasePointerCapture(event.pointerId);
			}
		};

		// Use { passive: false } to allow preventDefault() on touch events
		canvas.addEventListener('pointerdown', handlePointerDown, { passive: false });
		canvas.addEventListener('pointermove', handlePointerMove, { passive: false });
		canvas.addEventListener('pointerup', handlePointerUp);
		canvas.addEventListener('pointerleave', handlePointerUp);
		canvas.addEventListener('pointercancel', handlePointerUp);

		// Initial resize
		handleResize();

		return () => {
			resizeObserver.disconnect();
			canvas.removeEventListener('pointerdown', handlePointerDown, { passive: false } as EventListenerOptions);
			canvas.removeEventListener('pointermove', handlePointerMove, { passive: false } as EventListenerOptions);
			canvas.removeEventListener('pointerup', handlePointerUp);
			canvas.removeEventListener('pointerleave', handlePointerUp);
			canvas.removeEventListener('pointercancel', handlePointerUp);

			// Clean up GlslCanvas reference
			// Note: We don't explicitly lose the WebGL context here because it makes
			// the canvas unusable. Instead, we rely on React's key prop to recreate
			// the component (and thus the canvas) when needed, which naturally cleans up old contexts.
			glslCanvasRef.current = null;
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
