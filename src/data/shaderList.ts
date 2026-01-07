import { ComplexityLevel } from '../components/Sidebar';

export interface Shader {
	id: string;
	name: string;
	file: () => Promise<{ default: string }>;
	filePath: string; // Path for HMR watching
	description: string;
	squareAspectRatio?: boolean;
}

export const shaderList: {
	label: ComplexityLevel;
	shaderList: {
		label: string;
		shaders: Shader[];
	}[];
}[] = [
	{
		label: 'Basic',
		shaderList: [
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
						description: '',
						squareAspectRatio: true
					},
					{
						id: 'animated-circle',
						name: 'Animated Circle',
						file: () => import('../shaders/shapes/animated-circle.frag?raw'),
						filePath: '/src/shaders/shapes/animated-circle.frag',
						description: 'Pulsing circle using u_time'
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
		]
	},
	{
		label: 'Intermediate',
		shaderList: [
			{
				label: 'Gradients',
				shaders: [
					{
						id: 'gradient-ripple',
						name: 'Gradient Ripple',
						file: () => import('../shaders/gradients/gradient-ripple.frag?raw'),
						filePath: '/src/shaders/gradients/gradient-ripple.frag',
						description: 'Morphs from circle to square depending on mouse position'
					},
					{
						id: 'gradient-ripple-split',
						name: 'Gradient Ripple Split',
						file: () => import('../shaders/gradients/gradient-ripple-split.frag?raw'),
						filePath: '/src/shaders/gradients/gradient-ripple-split.frag',
						description: ''
					}
				]
			},
			{
				label: 'Shapes',
				shaders: [
					{
						id: 'pentagon-twirl',
						name: 'Pentagon Twirl',
						file: () => import('../shaders/shapes/pentagon-twirl.frag?raw'),
						filePath: '/src/shaders/shapes/pentagon-twirl.frag',
						description: 'Follows the mouse slightly'
					}
				]
			},
			{
				label: 'Patterns',
				shaders: [
					{
						id: 'circles-pattern',
						name: 'Circles Pattern',
						file: () => import('../shaders/patterns/circles-pattern.frag?raw'),
						filePath: '/src/shaders/patterns/circles-pattern.frag',
						description: ''
					}
				]
			},
			{
				label: 'Noise',
				shaders: [
					{
						id: 'mosaic',
						name: 'Mosaic',
						file: () => import('../shaders/noise/mosaic.frag?raw'),
						filePath: '/src/shaders/noise/mosaic.frag',
						description: 'Morphs depending on mouse position',
						squareAspectRatio: true
					}
				]
			}
		]
	}
];
