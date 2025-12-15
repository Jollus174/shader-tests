# Shader Demo Gallery

A React + TypeScript application for showcasing and experimenting with GLSL fragment shaders. Features hot module replacement (HMR) for instant shader updates during development.

## Features

- 🎨 **Interactive Shader Gallery** - Browse and switch between different shader demos
- 🔥 **Hot Module Replacement** - Shader files update instantly when saved (no manual refresh needed)
- 📱 **Responsive Design** - Mobile-friendly sidebar navigation
- 🎯 **Type-Safe** - Built with TypeScript for better developer experience
- ⚡ **Fast Development** - Powered by Vite for lightning-fast HMR

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **glslCanvas** - WebGL shader rendering
- **Custom Vite Plugin** - HMR support for `.frag` files

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: Node.js 20+)
- npm or yarn

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

Open your browser to the URL shown in the terminal (typically `http://localhost:5173`).

### Building for Production

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Adding New Shaders

1. Create a new `.frag` file in `src/shaders/`
2. Write your GLSL fragment shader code
3. Add the shader to `src/data/shaderList.ts`:

```typescript
{
  id: 'my-shader',
  name: 'My Shader',
  file: () => import('../shaders/my-shader.frag?raw'),
  filePath: '/src/shaders/my-shader.frag',
  description: 'Description of your shader'
}
```

### Shader Uniforms

Your shaders have access to these uniforms (automatically provided by glslCanvas):

- `u_time` - Time in seconds since the shader started
- `u_resolution` - Canvas resolution (width, height)
- `u_mouse` - Mouse position in pixels

Example shader:

```glsl
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec3 color = vec3(st.x, st.y, 0.5);
    gl_FragColor = vec4(color, 1.0);
}
```

## Project Structure

```
src/
├── components/          # React components
│   ├── ShaderViewer.tsx # Renders shaders using glslCanvas
│   ├── Sidebar.tsx      # Navigation sidebar
│   └── ToggleButton.tsx # Sidebar toggle button
├── data/
│   └── shaderList.ts    # Shader configuration
├── hooks/
│   └── useShader.ts     # Custom hook for shader loading & HMR
├── shaders/             # GLSL fragment shader files (.frag)
├── types/               # TypeScript type definitions
└── App.tsx              # Main application component
```

## Hot Module Replacement

The project includes a custom Vite plugin that enables HMR for `.frag` files. When you save a shader file:

1. The Vite plugin detects the change
2. Sends a custom WebSocket event to the client
3. The shader is automatically reloaded and displayed

No manual refresh required! 🎉

## License

MIT
