// https://www.shadertoy.com/view/4tSBD3

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define PI 3.14159265359

// morphable radial ramp - interpolates between circular and square distance
float gr_y_morph(vec2 xy, float cycles, float speed, float morph_factor) {
    // Circular distance (Euclidean)
    float circular_dist = length(xy);
    // Square distance (Chebyshev)
    float square_dist = max(abs(xy.x), abs(xy.y));
    // Morph between the two distance metrics
    float dist = mix(circular_dist, square_dist, morph_factor);
    return smoothstep(0.0, 1.0, fract(dist * cycles / (PI * 2.0) - u_time * speed));
}

void main() {
    vec2 uv = (2.0 * gl_FragCoord.xy - u_resolution.xy) / u_resolution.y;
    vec2 mouse_uv = (2.0 * u_mouse.xy - u_resolution.xy) / u_resolution.y;
    
    // Calculate morph factor from mouse y-position: 1.0 at center (square), 0.0 at edges (circular)
    bool mouseActive = length(u_mouse) > 0.001;
    float normalized_mouse_y = mouse_uv.y;
    float distance_from_center = abs(normalized_mouse_y);
    float morph_factor = mouseActive ? smoothstep(0.05, 0.95, distance_from_center) : 0.0;
    
    // Apply gradient with morphed distance metric (always centered at origin)
    float c = gr_y_morph(uv, 25.0, 0.25, morph_factor);

    gl_FragColor = vec4(vec3(c), 1.0);
}