export interface Shader {
	id: string;
	name: string;
	file: () => Promise<{ default: string }>;
	filePath: string; // Path for HMR watching
	description: string;
}

export const shaderList: Shader[] = [
	{
		id: 'gradient',
		name: 'Gradient',
		file: () => import('../shaders/gradient.frag?raw'),
		filePath: '/src/shaders/gradient.frag',
		description: 'Simple color gradient'
	},
	{
		id: 'animated-circle',
		name: 'Animated Circle',
		file: () => import('../shaders/animated-circle.frag?raw'),
		filePath: '/src/shaders/animated-circle.frag',
		description: 'Animated circle using u_time'
	},
	{
		id: 'noise-pattern',
		name: 'Noise Pattern',
		file: () => import('../shaders/noise-pattern.frag?raw'),
		filePath: '/src/shaders/noise-pattern.frag',
		description: 'Noise-based pattern'
	},
	{
		id: 'wave-effect',
		name: 'Wave Effect',
		file: () => import('../shaders/wave-effect.frag?raw'),
		filePath: '/src/shaders/wave-effect.frag',
		description: 'Animated wave effect'
	},
	{
		id: 'gradient-ripple',
		name: 'Gradient Ripple',
		file: () => import('../shaders/gradient-ripple.frag?raw'),
		filePath: '/src/shaders/gradient-ripple.frag',
		description: 'Gradient ripple effect'
	}
];
