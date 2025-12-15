#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    
    // Create wave pattern
    float wave = sin(st.x * 10.0 + u_time * 2.0) * 0.5 + 0.5;
    
    // Add vertical gradient
    float gradient = st.y;
    
    // Combine wave and gradient
    float pattern = wave * gradient;
    
    vec3 color = vec3(pattern);
    
    gl_FragColor = vec4(color, 1.0);
}

