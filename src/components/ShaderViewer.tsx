import { useEffect, useRef } from 'react';
import { WebGLShaderViewer } from '../utils/webglShader';

interface ShaderViewerProps {
	shaderCode: string | null;
	squareAspectRatio?: boolean;
}

function ShaderViewer({ shaderCode, squareAspectRatio = false }: ShaderViewerProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const shaderViewerRef = useRef<WebGLShaderViewer | null>(null);
	const shaderCodeRef = useRef<string>(null);
	const squareAspectRatioRef = useRef(false);

	// Load shader code whenever it changes
	useEffect(() => {
		if (shaderCode && shaderViewerRef.current) {
			// load() now returns a boolean indicating success
			// Errors are handled internally and logged
			shaderViewerRef.current.load(shaderCode);
		}
	}, [shaderCode]);

	// Trigger resize when squareAspectRatio changes
	useEffect(() => {
		if (canvasRef.current && containerRef.current) {
			const containerWidth = containerRef.current.offsetWidth;
			const containerHeight = containerRef.current.offsetHeight;
			if (containerWidth > 0 && containerHeight > 0) {
				let width: number;
				let height: number;

				if (squareAspectRatioRef.current) {
					const size = Math.min(containerWidth, containerHeight);
					width = size;
					height = size;
				} else {
					width = containerWidth;
					height = containerHeight;
				}

				canvasRef.current.style.width = `${width}px`;
				canvasRef.current.style.height = `${height}px`;
			}
		}
	}, [squareAspectRatio]);

	// Keep refs in sync with props
	useEffect(() => {
		shaderCodeRef.current = shaderCode;
		squareAspectRatioRef.current = squareAspectRatio;
	}, [shaderCode, squareAspectRatio]);

	// Initialize WebGL shader viewer
	useEffect(() => {
		if (!containerRef.current || !canvasRef.current) return;

		const canvas = canvasRef.current;
		const container = containerRef.current;

		// Handle resize
		const handleResize = () => {
			if (!canvas || !container) return;

			const containerWidth = container.offsetWidth;
			const containerHeight = container.offsetHeight;

			if (containerWidth > 0 && containerHeight > 0) {
				let width: number;
				let height: number;

				if (squareAspectRatioRef.current) {
					const size = Math.min(containerWidth, containerHeight);
					width = size;
					height = size;
				} else {
					width = containerWidth;
					height = containerHeight;
				}

				canvas.style.width = `${width}px`;
				canvas.style.height = `${height}px`;
			}
		};

		// Initial resize
		handleResize();

		// Create shader viewer
		try {
			const viewer = new WebGLShaderViewer(canvas);
			shaderViewerRef.current = viewer;

			// Start render loop immediately (even without shader, it will show black)
			viewer.start();

			// Load initial shader if available
			// Errors are handled internally by the load method
			if (shaderCodeRef.current) {
				viewer.load(shaderCodeRef.current);
			}
		} catch (error) {
			console.error('Failed to initialize WebGL shader viewer:', error);
		}

		// Set up resize observer
		const resizeObserver = new ResizeObserver(handleResize);
		resizeObserver.observe(container);

		// Handle pointer events for mouse uniform
		let isPointerDown = false;
		let activePointerId: number | null = null;

		const updateMousePosition = (event: PointerEvent) => {
			if (!shaderViewerRef.current || !canvas) return;

			const rect = canvas.getBoundingClientRect();
			const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
			const y = ((event.clientY - rect.top) / rect.height) * canvas.height;

			shaderViewerRef.current.setMouse(x, y);
		};

		const handlePointerDown = (event: PointerEvent) => {
			// Only process events on the canvas or its container
			const target = event.target as HTMLElement;
			if (target !== canvas && !container.contains(target)) {
				return;
			}

			event.preventDefault();
			isPointerDown = true;
			activePointerId = event.pointerId;

			// Capture pointer for touch devices to prevent scrolling
			if (event.pointerType === 'touch') {
				try {
					canvas.setPointerCapture(event.pointerId);
				} catch (e) {
					// Ignore capture errors
				}
			}

			updateMousePosition(event);
		};

		const handlePointerMove = (event: PointerEvent) => {
			// Only process events on the canvas or its container
			const target = event.target as HTMLElement;
			if (target !== canvas && !container.contains(target)) {
				return;
			}

			// For mouse, always update when moving over canvas (even if not clicking)
			// For touch, only update if pointer is captured or tracked
			const isMouse = event.pointerType === 'mouse';
			const hasCapture = canvas.hasPointerCapture(event.pointerId);
			const isTrackedPointer = isPointerDown && (activePointerId === null || event.pointerId === activePointerId);

			if (isMouse || hasCapture || isTrackedPointer) {
				if (!isMouse) {
					event.preventDefault();
				}
				updateMousePosition(event);
			}
		};

		const handlePointerUp = (event: PointerEvent) => {
			// Handle if pointer is captured or if this is our tracked pointer
			const hasCapture = canvas.hasPointerCapture(event.pointerId);
			const isTrackedPointer = activePointerId !== null && event.pointerId === activePointerId;

			if (hasCapture || isTrackedPointer) {
				updateMousePosition(event);
				isPointerDown = false;
				activePointerId = null;

				if (hasCapture) {
					try {
						canvas.releasePointerCapture(event.pointerId);
					} catch (e) {
						// Ignore release errors
					}
				}
			}
		};

		// Add event listeners
		canvas.addEventListener('pointerdown', handlePointerDown, { passive: false });
		canvas.addEventListener('pointermove', handlePointerMove);
		canvas.addEventListener('pointerup', handlePointerUp);
		canvas.addEventListener('pointerleave', handlePointerUp);
		canvas.addEventListener('pointercancel', handlePointerUp);

		return () => {
			resizeObserver.disconnect();
			canvas.removeEventListener('pointerdown', handlePointerDown);
			canvas.removeEventListener('pointermove', handlePointerMove);
			canvas.removeEventListener('pointerup', handlePointerUp);
			canvas.removeEventListener('pointerleave', handlePointerUp);
			canvas.removeEventListener('pointercancel', handlePointerUp);

			if (shaderViewerRef.current) {
				shaderViewerRef.current.destroy();
				shaderViewerRef.current = null;
			}
		};
	}, []); // Only run once on mount

	return (
		<div ref={containerRef} className={`shader-viewer ${squareAspectRatio ? 'square-aspect' : ''}`}>
			<canvas ref={canvasRef} />
		</div>
	);
}

ShaderViewer.displayName = 'ShaderViewer';

export default ShaderViewer;
