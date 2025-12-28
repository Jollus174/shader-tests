// https://www.shadertoy.com/view/4tSBD3

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define PI 3.14159265359
#define TPI 6.28318530718
#define minF(a) min(fract(a), fract(1. - a))
#define sat(a) clamp(a, 0., 1.)

// horizontal ramp
float gr_x(vec2 xy, float cycles, float speed)
{
    return smoothstep(0.0, 1.0, fract(xy.x * cycles - u_time * speed));
}

// vertical ramp
float gr_y(vec2 xy, float cycles, float speed)
{
    return smoothstep(0.0, 1.0, fract(xy.y * cycles - u_time * speed));
}

// circular ramp
float gr_x_rad(vec2 xy, float cycles, float speed)
{
    return smoothstep(0.0, 1.0, fract(atan(xy.y, xy.x) * cycles / TPI - u_time * speed));
}

// radial ramp
float gr_y_rad(vec2 xy, float cycles, float speed)
{
    return smoothstep(0.0, 1.0, fract(length(xy) * cycles / TPI - u_time * speed));
}

void main() {
    vec2 uv = (2.0 * gl_FragCoord.xy - u_resolution.xy) / u_resolution.y;
    vec2 mouse_uv = (2.0 * u_mouse.xy - u_resolution.xy) / u_resolution.y;
    // Use mouse offset only if mouse is active (not at origin)
    vec2 centered_uv = length(u_mouse) > 0.001 ? uv - mouse_uv : uv;
    float c;

    c = gr_x(uv, 5.0, 0.25);
    c = gr_y_rad(centered_uv, 25.0, 0.25);

    gl_FragColor = vec4(vec3(c), 1.0);
}