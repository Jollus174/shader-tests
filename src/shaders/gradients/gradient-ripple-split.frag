#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  vec3 color = vec3(0.0);
  float d = 0.0;

  // Remap the space to -1. to 1.
  st = st * 2.0 - 1.0;
  // Aspect ratio correction (after centering)
  st.x *= u_resolution.x / u_resolution.y;

  // Distance field
  d = length(min(abs(st) - 1.0, 0.0));

  // Visualise distance field with outward animation
  float speed = -0.5;
  float pattern = fract(d * 10.0 - u_time * speed);
  color = vec3(pattern, pattern, pattern);
  gl_FragColor = vec4(color, 1.0);
}