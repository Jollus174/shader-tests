declare module 'glslCanvas' {
	export default class GlslCanvas {
		constructor(canvas: HTMLCanvasElement);
		load(frag: string, vert?: string): void;
		setUniform(name: string, ...values: number[] | string[]): void;
		setMouse(x: number, y: number): void;
	}
}
