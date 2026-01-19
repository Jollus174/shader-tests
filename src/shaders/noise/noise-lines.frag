#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float randomFloat (in float x) {
  return fract(sin(x) * 43758.5453);
}

float randomVec2 (in vec2 st) {
  return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
}

float linePattern (vec2 st, vec2 v, float barGap) {
  vec2 l = floor(st + v);
  return step(barGap, randomVec2(100.0 + l + 0.0000001) + randomFloat(l.x) * 0.5);
}


void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;

  // Adjust for aspect ratio
  st.x *= u_resolution.x / u_resolution.y;

  vec2 grid = vec2(100., 100.);
  st *= grid;

  vec2 ipos = floor(st);
  vec2 fpos = fract(st);

  float variation = max(grid.x, grid.y);
  vec2 velocity = vec2(u_time * 0.4 * variation);
  velocity *= vec2(-1.0, 0.0) * randomFloat(1.0 + ipos.y);

  // Chromatic aberration offset (horizontal split)
  float aberrationOffset = 0.1; // Amount to shift red/blue channels

  // Default to black
  vec3 color = vec3(0.0);
  float barGap = 0.6;
  color.r = linePattern(st + vec2(aberrationOffset, 0.0), velocity, u_mouse.x / u_resolution.x + abs(sin(u_time * 0.5)));
  // color.r = linePattern(st + vec2(aberrationOffset, 0.0), velocity, u_mouse.x / u_resolution.x);
  color.g = linePattern(st, velocity, u_mouse.y / u_resolution.y);
  color.b = linePattern(st - vec2(aberrationOffset, 0.0), velocity, u_mouse.x / u_resolution.x);
  
  // Add a gap between lines
  color *= step(0.3, fpos.y);
  
  gl_FragColor = vec4(color, 1.0);
}

