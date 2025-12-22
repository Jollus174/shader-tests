export interface Shader {
	id: string;
	name: string;
	file: () => Promise<{ default: string }>;
	filePath: string; // Path for HMR watching
	description: string;
}

export const shaderList: {
	label: string;
	shaders: Shader[];
}[] = [
	{
		label: 'Flags',
		shaders: [
			{
				id: 'italy',
				name: 'Italy',
				file: () => import('../shaders/flags/italy.frag?raw'),
				filePath: '/src/shaders/flags/italy.frag',
				description: ''
			},
			{
				id: 'germany',
				name: 'Germany',
				file: () => import('../shaders/flags/germany.frag?raw'),
				filePath: '/src/shaders/flags/germany.frag',
				description: ''
			}
		]
	},
	{
		label: 'Gradients',
		shaders: [
			{
				id: 'gradient',
				name: 'Gradient',
				file: () => import('../shaders/gradients/gradient.frag?raw'),
				filePath: '/src/shaders/gradients/gradient.frag',
				description: 'Follows mouse'
			},
			{
				id: 'gradient-animated-circle',
				name: 'Gradient Animated Circle',
				file: () => import('../shaders/gradients/gradient-animated-circle.frag?raw'),
				filePath: '/src/shaders/gradients/gradient-animated-circle.frag',
				description: 'Animated circle using u_time'
			},
			{
				id: 'gradient-ripple',
				name: 'Gradient Ripple',
				file: () => import('../shaders/gradients/gradient-ripple.frag?raw'),
				filePath: '/src/shaders/gradients/gradient-ripple.frag',
				description: ''
			},
			{
				id: 'color-gamut',
				name: 'Color Gamut',
				file: () => import('../shaders/gradients/color-gamut.frag?raw'),
				filePath: '/src/shaders/gradients/color-gamut.frag',
				description: ''
			},
			{
				id: 'germany-gradient',
				name: 'Germany Gradient',
				file: () => import('../shaders/gradients/germany-gradient.frag?raw'),
				filePath: '/src/shaders/gradients/germany-gradient.frag',
				description: ''
			}
		]
	},
	{
		label: 'Shapes',
		shaders: [
			{
				id: 'mondrian',
				name: 'Mondrian',
				file: () => import('../shaders/shapes/mondrian.frag?raw'),
				filePath: '/src/shaders/shapes/mondrian.frag',
				description: ''
			}
		]
	},
	{
		label: 'Patterns',
		shaders: [
			{
				id: 'noise-pattern',
				name: 'Noise Pattern',
				file: () => import('../shaders/noise-pattern.frag?raw'),
				filePath: '/src/shaders/noise-pattern.frag',
				description: 'Noise-based pattern'
			}
		]
	},
	{
		label: 'Effects',
		shaders: [
			{
				id: 'wave-effect',
				name: 'Wave Effect',
				file: () => import('../shaders/wave-effect.frag?raw'),
				filePath: '/src/shaders/wave-effect.frag',
				description: 'Animated wave effect'
			}
		]
	}
];
