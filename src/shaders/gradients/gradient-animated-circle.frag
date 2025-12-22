#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;

  // Center the coordinate system
  st -= 0.5;
  st.x *= u_resolution.x / u_resolution.y;

  // Distance from center
  float dist = length(st);
  
  // float dist = distance(st, vec2(0.5));
  float radius = 0.3 + 0.1 * sin(u_time * 2.0);
  
  // Use step to create a hard edge: inside circle = 1.0, outside = 0.0
  float pct = 1.0 - step(radius, dist);

  vec3 color = vec3(pct);
  gl_FragColor = vec4(color, 1.0);
}

