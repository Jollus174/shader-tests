#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    float r = st.x * (u_mouse.x / u_resolution.x);
    float g = st.y * (u_mouse.y / u_resolution.y);
    float b = 0.5;
    
    vec3 color = vec3(r, g, b);
    
    gl_FragColor = vec4(color, 1.0);
}

