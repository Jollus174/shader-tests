import { useEffect, useRef, useState } from 'react';
import GlslCanvas from 'glslCanvas';

interface ShaderViewerProps {
	shaderCode: string | null;
	squareAspectRatio?: boolean;
}

function ShaderViewer({ shaderCode, squareAspectRatio = false }: ShaderViewerProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const glslCanvasRef = useRef<GlslCanvas>(null);
	const shaderCodeRef = useRef<string>(null);
	const squareAspectRatioRef = useRef(false);

	const [touchIndicator, setTouchIndicator] = useState<{
		x: number;
		y: number;
		visible: boolean;
		fading: boolean;
	}>({ x: 0, y: 0, visible: false, fading: false });

	// Keep refs in sync with props
	useEffect(() => {
		shaderCodeRef.current = shaderCode;
		squareAspectRatioRef.current = squareAspectRatio;
	}, [shaderCode, squareAspectRatio]);

	// Reusable function to load shader with proper dimension checking
	const loadShaderWithDimensions = (code: string | null) => {
		if (!glslCanvasRef.current || !code || !canvasRef.current || !containerRef.current) {
			return;
		}

		const containerWidth = containerRef.current.offsetWidth;
		const containerHeight = containerRef.current.offsetHeight;

		if (containerWidth > 0 && containerHeight > 0) {
			let width: number;
			let height: number;

			if (squareAspectRatioRef.current) {
				// Ensure 1:1 aspect ratio by using the minimum dimension
				const size = Math.min(containerWidth, containerHeight);
				width = size;
				height = size;
			} else {
				// Use full container dimensions
				width = containerWidth;
				height = containerHeight;
			}

			canvasRef.current.width = width;
			canvasRef.current.height = height;
			// Set CSS dimensions to match for proper display
			canvasRef.current.style.width = `${width}px`;
			canvasRef.current.style.height = `${height}px`;
			// Use requestAnimationFrame to ensure WebGL context is ready
			requestAnimationFrame(() => {
				if (glslCanvasRef.current && code) {
					glslCanvasRef.current.load(code);
				}
			});
		} else {
			// If dimensions aren't ready yet, wait a frame and try again
			requestAnimationFrame(() => {
				if (glslCanvasRef.current && code && canvasRef.current && containerRef.current) {
					const w = containerRef.current.offsetWidth;
					const h = containerRef.current.offsetHeight;
					if (w > 0 && h > 0) {
						let width: number;
						let height: number;

						if (squareAspectRatioRef.current) {
							// Ensure 1:1 aspect ratio by using the minimum dimension
							const size = Math.min(w, h);
							width = size;
							height = size;
						} else {
							// Use full container dimensions
							width = w;
							height = h;
						}

						canvasRef.current.width = width;
						canvasRef.current.height = height;
						// Set CSS dimensions to match for proper display
						canvasRef.current.style.width = `${width}px`;
						canvasRef.current.style.height = `${height}px`;
						glslCanvasRef.current.load(code);
					}
				}
			});
		}
	};

	// Load shader code whenever it changes
	useEffect(() => {
		if (shaderCode) {
			loadShaderWithDimensions(shaderCode);
		}
	}, [shaderCode]); // Run whenever shaderCode changes

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

				canvasRef.current.width = width;
				canvasRef.current.height = height;
				canvasRef.current.style.width = `${width}px`;
				canvasRef.current.style.height = `${height}px`;
			}
		}
	}, [squareAspectRatio]);

	// Initialize canvas and GlslCanvas once
	useEffect(() => {
		if (!containerRef.current || !canvasRef.current) return;

		const canvas = canvasRef.current;

		// Handle window resize
		const handleResize = () => {
			if (canvasRef.current && containerRef.current) {
				const containerWidth = containerRef.current.offsetWidth;
				const containerHeight = containerRef.current.offsetHeight;
				if (containerWidth > 0 && containerHeight > 0) {
					let width: number;
					let height: number;

					if (squareAspectRatioRef.current) {
						// Ensure 1:1 aspect ratio by using the minimum dimension
						const size = Math.min(containerWidth, containerHeight);
						width = size;
						height = size;
					} else {
						// Use full container dimensions
						width = containerWidth;
						height = containerHeight;
					}

					canvasRef.current.width = width;
					canvasRef.current.height = height;
					// Set CSS dimensions to match for proper display
					canvasRef.current.style.width = `${width}px`;
					canvasRef.current.style.height = `${height}px`;
				}
			}
		};

		// Ensure canvas is sized before creating GlslCanvas
		handleResize();

		// Use requestAnimationFrame to ensure dimensions are set before initializing GlslCanvas
		// This is important when switching shaders, as the component remounts
		requestAnimationFrame(() => {
			if (!canvasRef.current || !containerRef.current) return;

			// Double-check dimensions are set
			handleResize();

			// Initialize GlslCanvas after ensuring canvas is ready
			const sandbox = new GlslCanvas(canvas);
			glslCanvasRef.current = sandbox;

			// If shader code is already available, load it now
			// We use shaderCodeRef to get the current value (not stale closure value)
			if (shaderCodeRef.current) {
				requestAnimationFrame(() => {
					loadShaderWithDimensions(shaderCodeRef.current);
				});
			}
		});

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
			// Position indicator relative to container, not canvas
			// This ensures correct positioning when canvas is centered (square aspect ratio)
			if (!containerRef.current || !canvasRef.current) return;
			const containerRect = containerRef.current.getBoundingClientRect();
			const canvasRect = canvasRef.current.getBoundingClientRect();

			// Calculate position relative to container
			const x = event.clientX - containerRect.left;
			const y = event.clientY - containerRect.top;

			// Only show indicator if touch is within canvas bounds
			const isWithinCanvas =
				event.clientX >= canvasRect.left &&
				event.clientX <= canvasRect.right &&
				event.clientY >= canvasRect.top &&
				event.clientY <= canvasRect.bottom;

			if (isWithinCanvas) {
				setTouchIndicator({ x, y, visible: true, fading: false });
			}
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

		// Initial resize (will be called again in requestAnimationFrame, but this ensures early sizing)
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

	return (
		<div ref={containerRef} className={`shader-viewer ${squareAspectRatio ? 'square-aspect' : ''}`}>
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
