#ifdef GL_ES
precision highp float;
#endif

#define PI 3.14159265359

uniform vec2 u_resolution;
uniform float u_time;

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  
  // Adjust for aspect ratio
  st.x *= u_resolution.x / u_resolution.y;

  vec2 grid = vec2(28.);
  st *= grid;

  vec2 ipos = floor(st);
  vec2 fpos = fract(st);

  // Rotation animation: 8-second cycle
  // 0-1s: rotate 0° to 90°, 1-2s: hold at 90°, 2-3s: rotate 90° to 180°, 3-4s: hold at 180°,
  // 4-5s: rotate 180° to 270°, 5-6s: hold at 270°, 6-7s: rotate 270° to 360°, 7-8s: hold at 0°
  float cycle = mod(u_time, 8.0);
  float baseAngle = 0.0;
  float rotationProgress = 0.0;
  
  if (cycle < 1.0) {
    // First rotation: 0° to 90°
    rotationProgress = smoothstep(0.0, 1.0, cycle);
    baseAngle = 0.0;
  } else if (cycle < 2.0) {
    // Hold at 90°
    baseAngle = PI / 2.0; // π/2 radians = 90 degrees
    rotationProgress = 0.0;
  } else if (cycle < 3.0) {
    // Second rotation: 90° to 180°
    rotationProgress = smoothstep(0.0, 1.0, cycle - 2.0);
    baseAngle = PI / 2.0; // Start from 90°
  } else if (cycle < 4.0) {
    // Hold at 180°
    baseAngle = PI; // π radians = 180 degrees
    rotationProgress = 0.0;
  } else if (cycle < 5.0) {
    // Third rotation: 180° to 270°
    rotationProgress = smoothstep(0.0, 1.0, cycle - 4.0);
    baseAngle = PI; // Start from 180°
  } else if (cycle < 6.0) {
    // Hold at 270°
    baseAngle = 3.0 * PI / 2.0; // 3π/2 radians = 270 degrees
    rotationProgress = 0.0;
  } else if (cycle < 7.0) {
    // Fourth rotation: 270° to 360° (0°)
    rotationProgress = smoothstep(0.0, 1.0, cycle - 6.0);
    baseAngle = 3.0 * PI / 2.0; // Start from 270°
  } else {
    // Hold at 0° (360°)
    baseAngle = 0.0;
    rotationProgress = 0.0;
  }
  
  float angle = baseAngle + rotationProgress * (PI / 2.0); // Add 90° rotation
  
  // Rotate fpos around center (0.5, 0.5)s
  vec2 center = vec2(0.5);
  vec2 rotatedPos = fpos - center;
  float cosAngle = cos(angle);
  float sinAngle = sin(angle);
  mat2 rotation = mat2(cosAngle, sinAngle, -sinAngle, cosAngle);
  rotatedPos = rotation * rotatedPos;
  fpos = rotatedPos + center;

  // Get grid coordinates
  float col = mod(ipos.x, 4.0);
  float row = mod(ipos.y, 4.0);
  
  // Calculate direction: each column has different pattern
  // Column 0: [0,3,2,1], Column 1: [1,2,3,0], Column 2: [2,1,0,3], Column 3: [3,0,1,2]
  float dir0 = mod(4.0 - row, 4.0);
  float dir1 = mod(1.0 + row, 4.0);
  float dir2 = mod(2.0 - row + 4.0, 4.0);
  float dir3 = mod(3.0 - row * 3.0 + 4.0, 4.0);
  
  float direction = 
    step(col, 0.5) * dir0 + 
    step(0.5, col) * step(col, 1.5) * dir1 +
    step(1.5, col) * step(col, 2.5) * dir2 +
    step(2.5, col) * dir3;
  
  // Create triangles using step functions
  // 0=bottom-right, 1=top-right, 2=top-left, 3=bottom-left
  float tri0 = step(1.0, fpos.x + fpos.y);
  float tri1 = step(fpos.y, fpos.x);
  float tri2 = step(fpos.x + fpos.y, 1.0);
  float tri3 = step(fpos.x, fpos.y);
  
  float triangle = 
    step(direction, 0.5) * tri0 +
    step(0.5, direction) * step(direction, 1.5) * tri1 +
    step(1.5, direction) * step(direction, 2.5) * tri2 +
    step(2.5, direction) * tri3;
  
  vec3 color = vec3(triangle);

  // Uncomment to see the subdivided grid
  // color = vec3(fpos, 0.0);

  gl_FragColor = vec4(color, 1.0);
}

