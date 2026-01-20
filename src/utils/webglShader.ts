// Simple WebGL shader viewer utility
// Provides full control over shader rendering without external dependencies

export class WebGLShaderViewer {
	private gl: WebGLRenderingContext;
	private program: WebGLProgram | null = null;
	private uniforms: Map<string, WebGLUniformLocation | null> = new Map();
	private startTime: number;
	private animationFrameId: number | null = null;
	private mouseX: number = 0;
	private mouseY: number = 0;

	constructor(private canvas: HTMLCanvasElement) {
		const gl = canvas.getContext('webgl');
		if (!gl) {
			throw new Error('WebGL not supported');
		}
		this.gl = gl;
		this.startTime = Date.now();

		// Set up viewport
		this.updateViewport();
	}

	private updateViewport() {
		const { gl, canvas } = this;
		const dpr = window.devicePixelRatio || 1;
		const displayWidth = canvas.clientWidth;
		const displayHeight = canvas.clientHeight;

		if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
			canvas.width = displayWidth * dpr;
			canvas.height = displayHeight * dpr;
			gl.viewport(0, 0, canvas.width, canvas.height);
		}
	}

	private compileShader(source: string, type: number): WebGLShader {
		const { gl } = this;
		const shader = gl.createShader(type);
		if (!shader) {
			throw new Error('Failed to create shader');
		}

		gl.shaderSource(shader, source);
		gl.compileShader(shader);

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			const info = gl.getShaderInfoLog(shader);
			gl.deleteShader(shader);
			throw new Error(`Shader compilation error: ${info}`);
		}

		return shader;
	}

	private createProgram(vertexSource: string, fragmentSource: string): WebGLProgram {
		const { gl } = this;
		const vertexShader = this.compileShader(vertexSource, gl.VERTEX_SHADER);
		const fragmentShader = this.compileShader(fragmentSource, gl.FRAGMENT_SHADER);

		const program = gl.createProgram();
		if (!program) {
			throw new Error('Failed to create program');
		}

		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			const info = gl.getProgramInfoLog(program);
			gl.deleteProgram(program);
			gl.deleteShader(vertexShader);
			gl.deleteShader(fragmentShader);
			throw new Error(`Program linking error: ${info}`);
		}

		gl.deleteShader(vertexShader);
		gl.deleteShader(fragmentShader);

		return program;
	}

	load(fragmentSource: string, vertexSource?: string): { success: boolean; error?: string } {
		const { gl } = this;

		// Default vertex shader (full-screen quad)
		const defaultVertex = `
			attribute vec2 a_position;
			void main() {
				gl_Position = vec4(a_position, 0.0, 1.0);
			}
		`;

		const vertSource = vertexSource || defaultVertex;

		try {
			// Try to create new program
			const newProgram = this.createProgram(vertSource, fragmentSource);

			// If successful, clean up old program
			if (this.program) {
				gl.deleteProgram(this.program);
				this.program = null;
			}

			this.uniforms.clear();

			// Use the new program
			this.program = newProgram;
			gl.useProgram(this.program);

			// Set up geometry (full-screen quad)
			const positionBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
			const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

			const positionLocation = gl.getAttribLocation(this.program, 'a_position');
			gl.enableVertexAttribArray(positionLocation);
			gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

			// Cache uniform locations
			const uniformNames = ['u_time', 'u_resolution', 'u_mouse'];
			for (const name of uniformNames) {
				const location = gl.getUniformLocation(this.program, name);
				if (location !== null) {
					this.uniforms.set(name, location);
				}
			}

			return { success: true };
		} catch (error) {
			// If compilation/linking fails, keep the old program running
			// Don't delete the existing program, just log the error
			const errorMessage = error instanceof Error ? error.message : String(error);
			console.error('Shader compilation error:', errorMessage);
			return { success: false, error: errorMessage };
		}
	}

	private render() {
		const { gl, canvas } = this;
		
		// Always continue the render loop, even if program is invalid
		// This ensures we can recover when valid code is loaded
		this.animationFrameId = requestAnimationFrame(() => this.render());

		// Only render if we have a valid program
		if (!this.program) {
			// Clear to black if no valid program
			this.updateViewport();
			gl.clearColor(0, 0, 0, 1);
			gl.clear(gl.COLOR_BUFFER_BIT);
			return;
		}

		this.updateViewport();
		gl.useProgram(this.program);

		// Update uniforms
		const time = (Date.now() - this.startTime) / 1000;
		const resolutionLocation = this.uniforms.get('u_resolution');
		const timeLocation = this.uniforms.get('u_time');
		const mouseLocation = this.uniforms.get('u_mouse');

		if (resolutionLocation) {
			gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
		}
		if (timeLocation) {
			gl.uniform1f(timeLocation, time);
		}
		if (mouseLocation) {
			// Convert mouse coordinates to shader space (pixels)
			gl.uniform2f(mouseLocation, this.mouseX, canvas.height - this.mouseY);
		}

		// Draw
		gl.drawArrays(gl.TRIANGLES, 0, 6);
	}

	start() {
		if (this.animationFrameId === null) {
			this.render();
		}
	}

	stop() {
		if (this.animationFrameId !== null) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}
	}

	setMouse(x: number, y: number) {
		this.mouseX = x;
		this.mouseY = y;
	}

	setUniform(name: string, ...values: number[]) {
		const { gl } = this;
		if (!this.program) return;

		// Get or cache uniform location
		let location = this.uniforms.get(name);
		if (!location) {
			const newLocation = gl.getUniformLocation(this.program, name);
			if (newLocation !== null) {
				this.uniforms.set(name, newLocation);
				location = newLocation;
			} else {
				return; // Uniform doesn't exist in shader
			}
		}

		if (!location) return;

		gl.useProgram(this.program);

		// Set uniform based on number of values
		if (values.length === 1) {
			gl.uniform1f(location, values[0]);
		} else if (values.length === 2) {
			gl.uniform2f(location, values[0], values[1]);
		} else if (values.length === 3) {
			gl.uniform3f(location, values[0], values[1], values[2]);
		} else if (values.length === 4) {
			gl.uniform4f(location, values[0], values[1], values[2], values[3]);
		}
	}

	destroy() {
		this.stop();
		if (this.program) {
			this.gl.deleteProgram(this.program);
			this.program = null;
		}
		this.uniforms.clear();
	}
}
