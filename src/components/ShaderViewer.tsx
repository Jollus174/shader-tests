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
		const sandbox = new GlslCanvas(canvasRef.current);
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

		// Initial resize
		handleResize();

		return () => {
			resizeObserver.disconnect();
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

export default ShaderViewer;
