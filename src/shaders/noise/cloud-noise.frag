#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define PI 3.14159265359

float random (in vec2 st) {
  return fract(sin(dot(st.xy,
                      vec2(12.9898,78.233)))*
      43758.5453123);
}

float noise (in vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);

  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));

  vec2 u = f * f * (3. - 2. * f);
  return mix(a, b, u.x) +
         (c - a)* u.y * (1. - u.x) +
         (d - b) * u.x * u.y;
}

#define OCTAVES 6
float fbm (in vec2 st) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 0.0;
  for (int i = 0; i < OCTAVES; i++) {
    value += amplitude * noise(st);
    st *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  float resBoost = 5.;
  vec2 st = gl_FragCoord.xy / u_resolution.xy * resBoost;
  st.x *= u_resolution.x / u_resolution.y;

  vec3 color = vec3(0.0);

  // Normalized mouse (0–1); smooth fallback when mouse at zero
  vec2 mouseNorm = u_mouse / u_resolution;
  float mouseActive = smoothstep(0.0, 0.01, length(u_mouse));
  // Mouse drives cloud evolution (offset in noise space); scaled and only when mouse active
  vec2 mouseEvolution = mouseNorm * 1.2 * mouseActive;

  // Using another cloud (animated over time) to displace the position of an existing cloud (animated over time)
  vec2 q = vec2(0.);
  q.x = fbm(st + mouseEvolution.y);
  q.y = fbm(st + vec2(1.) + mouseEvolution.x);

  vec2 r = vec2(0.);
  r.x = fbm(st + 1.0 * q + mouseEvolution.x);
  r.y = fbm(st + 1.0 * q + vec2(8.3 ,2.8) + 0.126 * u_time + mouseEvolution.y);

  float f = fbm(st + r);

  // Default palette (used when mouse not active)
  vec3 skyDefault = vec3(0.101961, 0.619608, 0.666667);
  vec3 highlightDefault = vec3(0.666667, 0.666667, 0.1);
  vec3 darkDefault = vec3(0., 0., 0.164706);
  vec3 brightDefault = vec3(0.666667, 1., 1.);

  // Mouse-driven palette: wider range — x shifts sky hue, y shifts highlight
  vec3 skyMouse = mix(vec3(0.05, 0.4, 0.5), vec3(0.85, 0.2, 0.45), mouseNorm.x);
  vec3 highlightMouse = mix(vec3(0.5, 0.4, 0.05), vec3(0.2, 0.9, 1.), mouseNorm.y);
  vec3 darkMouse = mix(vec3(0.02, 0.02, 0.2), vec3(0.25, 0.05, 0.35), mouseNorm.x);
  vec3 brightMouse = mix(vec3(0.4, 0.85, 1.), vec3(1., 0.95, 0.9), mouseNorm.y);

  vec3 sky = mix(skyDefault, skyMouse, mouseActive);
  vec3 highlight = mix(highlightDefault, highlightMouse, mouseActive);
  vec3 dark = mix(darkDefault, darkMouse, mouseActive);
  vec3 bright = mix(brightDefault, brightMouse, mouseActive);

  color = mix(sky, highlight, clamp(pow(f, 2.) * 4., 0., 1.));
  color = mix(color, dark, clamp(length(q), 0., 1.));
  color = mix(color, bright, clamp(length(r.x), 0., 3.35));

  gl_FragColor = vec4((pow(f, 3.) + .6 * pow(f, 2.) + f * .5) * color, 1.);
}