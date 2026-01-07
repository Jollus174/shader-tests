#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

#define COLOR_LARGE vec3(1.0, 0.25, 0.0)
#define COLOR_SMALL vec3(.0, .15, 0.5)
#define PI 3.14159265359

float circle(in vec2 _st, in float _radius){
    vec2 l = _st-vec2(0.5);
    float blur = _radius * 0.01;
    return 1. - smoothstep(_radius - blur, _radius + blur, dot(l,l) * 4.0);
}

float circleBorder(in vec2 _st, in float _outerRadius, in float _innerRadius){
    float outer = circle(_st, _outerRadius);
    float inner = circle(_st, _innerRadius);
    return outer - inner;
}

void main() {
	vec2 st = gl_FragCoord.xy / u_resolution;
  vec3 color = vec3(0.0);

  // Compensate for aspect ratio to keep circles circular
  st.x *= u_resolution.x / u_resolution.y;

  float speed = 0.01;
  vec2 circleSmall = vec2(st.x + u_time * -speed, st.y + u_time * speed);
  circleSmall *= 16.0; // More tiling for smaller circles
  circleSmall.y += step(1., mod(circleSmall.x, 2.0)) * 0.5; // Will stagger the circles
  circleSmall = fract(circleSmall);
  
  float circleSmallBorder = circleBorder(circleSmall, 0.35, 0.25);
  color = mix(vec3(0.0, 0.0, 0.2), COLOR_SMALL, circleSmallBorder);

  vec2 circleLarge = st;
  circleLarge *= 6.0;
  circleLarge.y += step(1., mod(circleLarge.x, 2.0)) * 0.5; // Will stagger the circles
  
  // Get grid position for random per-circle pulsation
  vec2 gridPos = floor(circleLarge);
  circleLarge = fract(circleLarge); // Wrap around 1.0

  // Create unique phase offset for each circle using grid position
  float randomPhase = fract(sin(dot(gridPos, vec2(12.9898, 78.233))) * 43758.5453) * PI * 2.0; // 0 to 2*PI
  
  // Smooth pulsation with random phase and slightly different speeds per circle
  float pulsationSpeed = 1.5 + fract(sin(dot(gridPos, vec2(7.123, 3.456))) * 12345.6789) * 0.5; // 1.5 to 2.0
  float pulse = sin(u_time * pulsationSpeed + randomPhase) * 0.5 + 0.5; // 0 to 1
  
  // Apply pulsation to radii (pulsate between 0.3-0.5 for outer, 0.05-0.15 for inner)
  float outerRadius = mix(0.3, 0.5, pulse);
  float innerRadius = mix(0.05, 0.15, pulse);
  
  float largeCircleBorder = circleBorder(circleLarge, outerRadius, innerRadius);
  float largeCircleCenter = circle(circleLarge, innerRadius);
  
  // Draw border first, then black center on top
  color = mix(color, COLOR_LARGE, largeCircleBorder);
  color = mix(color, vec3(0.0), largeCircleCenter);

	gl_FragColor = vec4(color,1.0);
}
