#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define PI 3.14159265359

vec2 random2( vec2 p ) {
  return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}

void main() {
  vec2 st = gl_FragCoord.xy/u_resolution.xy;
  st.x *= u_resolution.x/u_resolution.y;
  vec3 color = vec3(.0);

  // Scale
  vec2 grid = vec2(10.);
  st *= grid;

  // Tile the space
  vec2 i_st = floor(st);
  vec2 f_st = fract(st);

  vec2 centre = 0.5 * u_resolution;
  float mouseDistFromCentre = length(u_mouse - centre);
  float maxDist = 0.5 * length(u_resolution);
  float normalizedDist = (maxDist > 0.001) ? clamp(mouseDistFromCentre / maxDist, 0.0, 1.0) : 1.0;

  float m_dist = 1.;  // minimum distance
  vec2 closestPointInCell = vec2(0.5);  // position within cell of closest point

  for (int y= -1; y <= 1; y++) {
    for (int x= -1; x <= 1; x++) {
      vec2 neighbour = vec2(float(x), float(y));

      // Random position from current + neighbour place in the grid
      vec2 point = random2(i_st + neighbour);

      // Animating the point
      point = 0.5 + 0.5 * sin(u_time + (PI * 2. * point));

      // Vector between the pixel and point
      vec2 diff = neighbour + point - f_st;

      // Distance to point
      float dist = length(diff);

      // Closer distance — track which point won and its position in its cell
      if (dist < m_dist) {
        m_dist = dist;
        closestPointInCell = point;
      }
    }
  }

  // Draw min distance (distance field))
  color += m_dist;

  // Mouse distance: dots visible near centre, invisible when cursor is far
  float dotVisibility = 1.0 - normalizedDist;  // 1 at centre, 0 when far

  // Bright when point is near centre of its cell, darker when point is near cell edges
  float distFromCellCentre = length(closestPointInCell - vec2(0.5));
  // float maxDistInCell = 0.7071;  // distance from cell centre to corner (sqrt(0.5))
  float maxDistInCell = 0.4;  // distance from cell centre to corner
  float centreFactor = smoothstep(maxDistInCell, 0.5, distFromCellCentre);

  // Draw cell centre (brightness based on point position within cell); fade dots when mouse is far
  color += (1. - step(.015, m_dist)) * centreFactor * dotVisibility;

  // Contrast: pops when cursor is near centre, flatter when far
  float contrastFactor = mix(1.4, 0.5, normalizedDist);
  color = (color - 0.5) * contrastFactor + 0.5;
  color = clamp(color, 0.0, 1.0);

  // Draw grid
  // color.r += step(.98, f_st.x) + step(.98, f_st.y);

  // Show isolines
  // color -= step(.7,abs(sin(27.0*m_dist)))*.5;

  gl_FragColor = vec4(color, 1.0);
}
