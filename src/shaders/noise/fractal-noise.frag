#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define PI 3.14159265359

// Hash function for 3D -> pseudo-random value in [0, 1] (z used for time evolution)
float hash(vec3 p) {
  return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
}

// Smooth 3D value noise: time as third dimension so clouds evolve in place
float valueNoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);

  vec3 u = f * f * (3.0 - 2.0 * f);

  float a = hash(i);
  float b = hash(i + vec3(1.0, 0.0, 0.0));
  float c = hash(i + vec3(0.0, 1.0, 0.0));
  float d = hash(i + vec3(1.0, 1.0, 0.0));
  float e = hash(i + vec3(0.0, 0.0, 1.0));
  float f_ = hash(i + vec3(1.0, 0.0, 1.0));
  float g = hash(i + vec3(0.0, 1.0, 1.0));
  float h = hash(i + vec3(1.0, 1.0, 1.0));

  return mix(
    mix(mix(a, b, u.x), mix(c, d, u.x), u.y),
    mix(mix(e, f_, u.x), mix(g, h, u.x), u.y),
    u.z
  );
}

// Fractal Brownian Motion: sum multiple octaves for cloud-like detail
float fbm(vec3 p) {
  float value = 0.0;
  float amplitude = 10.;
  float frequency = 3.0;
  float maxAmplitude = 5.0;

  for (int i = 0; i < 6; i++) {
    value += amplitude * valueNoise(p * frequency);
    maxAmplitude += amplitude;
    amplitude *= 0.5;
    frequency *= 2.0;
  }

  return value / maxAmplitude;
}

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  st.x *= u_resolution.x / u_resolution.y;

  // Fixed position in space; time as 3rd dimension so clouds evolve in place
  vec3 p = vec3(st * 3.0, u_time * 0.15);

  float n = fbm(p);

  n = smoothstep(0.35, 0.65, n);
  n = pow(n, 0.9);

  // Black and white
  vec3 color = vec3(n);

  gl_FragColor = vec4(color, 1.0);
}
