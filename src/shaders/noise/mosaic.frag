#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float randomTiles (vec2 st) {
  // Create a "seed" value by taking the dot product with magic numbers
  // These numbers are arbitrary values that help create a good distribution of random values
  float seed = dot(st.xy, vec2(12.9898, 78.233));
  
  // Use sine to create a pseudo-random value
  // Sine oscillates, creating variation based on the seed
  float randomValue = sin(seed);
  
  // Scale up the random value to get more variation
  // Using a slightly smaller multiplier for better mobile precision
  // Split the multiplication to reduce precision loss
  float scaled = randomValue * 43758.5453;
  
  // Add time to animate the pattern
  float animated = scaled + u_time;
  
  // Get the fractional part to keep the value in 0-1 range
  // This ensures we get a value between 0 and 1 for color purposes
  return fract(animated);
}

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;

  // Compensate for aspect ratio to keep circles circular
  st.x *= u_resolution.x / u_resolution.y;
  
  // Calculate mouse position in normalized coordinates (0-1)
  vec2 mousePos = u_mouse / u_resolution;
  mousePos.x *= u_resolution.x / u_resolution.y;
  
  // Calculate original tile position BEFORE displacement (for consistent color sampling)
  vec2 stOriginal = st;
  stOriginal *= 50.0;
  vec2 iposOriginal = floor(stOriginal);
  
  // Calculate which tile the mouse is hovering over (before morphing)
  vec2 mouseTileSpace = mousePos * 50.0;
  vec2 mouseTilePos = floor(mouseTileSpace);
  
  // Calculate direction from mouse to current position
  vec2 dir = st - mousePos;
  float dist = length(dir);
  
  // Create a smooth falloff effect (adjust radius to change size of effect)
  float radius = 0.95; // Size of the area-of-effect
  float falloff = 1.0 - smoothstep(0.0, radius, dist);
  
  // Create displacement
  // Adjust the intensity to control how much morphing occurs
  float morphIntensity = 0.02;
  
  // Safe normalization: avoid division by zero when dist is very small
  vec2 displacement = vec2(0.0);
  if (dist > 0.001) {
    // Smooth the falloff near the center to prevent sudden jumps
    float smoothFalloff = smoothstep(0.0, 0.05, dist) * falloff;
    displacement = (dir / dist) * smoothFalloff * morphIntensity;
  }
  
  // Apply the morphing displacement to the coordinates
  st -= displacement;

  st *= 50.0; // Scale it up
  vec2 ipos = floor(st); // Get the integer position (after displacement)
  vec2 fpos = fract(st); // Get the fractional position

  // Assign a random value based on the displaced integer coord
  // This creates the visual morphing effect
  vec3 color = vec3(.75 - randomTiles(ipos), 0.0, 0.75);
  
  // Check if this tile is being directly hovered by the mouse (use original position)
  bool isHovered = (iposOriginal.x == mouseTilePos.x && iposOriginal.y == mouseTilePos.y);
  
  // Calculate circular distance in tile space from hovered tile (use original position)
  vec2 tileDist = iposOriginal - mouseTilePos;
  float circularDist = length(tileDist);
  
  // Check if this tile is purple (purple tiles have high randomTiles value)
  float randomVal = randomTiles(iposOriginal);
  bool isPurple = randomVal > 0.5;
  
  // Discrete brightness levels based on circular distance rings
  float brightness = 1.0;
  
  if (circularDist < 1.0) {
    brightness = 2.7;
  } else if (circularDist < 1.5) {
    brightness = 2.2;
  } else if (circularDist < 2.5) {
    brightness = 1.6;
  } else if (circularDist < 3.5) {
    brightness = 1.2;
  }
  
  // Apply brightness if within the radius
  if (brightness > 1.0) {
    color *= brightness;
    // Clamp to prevent oversaturation
    color = min(color, vec3(1.0));
  }

  // Uncomment to see the subdivided grid
  // color = vec3(fpos, 0.0);

  gl_FragColor = vec4(color, 1.0);
}

