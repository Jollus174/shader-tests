#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define NUM_LAYERS 30

// Layer color definitions
const vec3 COLOR_WHITE = vec3(1.0);
const vec3 COLOR_CYAN = vec3(0.0, 1.0, 1.0);
const vec3 COLOR_BLUE = vec3(0.0, 0.5, 1.0);
const vec3 COLOR_PURPLE = vec3(0.8, 0.0, 1.0);
const vec3 COLOR_RED = vec3(1.0, 0.0, 0.5);

// Check if point p is on the correct side of a line segment
float sideOfLine(vec2 p, vec2 a, vec2 b) {
    return sign((b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x));
}

// Check if point p is inside a pentagon defined by 5 vertices
float pointInPentagon(vec2 p, vec2 v0, vec2 v1, vec2 v2, vec2 v3, vec2 v4) {
    float s0 = sideOfLine(p, v0, v1);
    float s1 = sideOfLine(p, v1, v2);
    float s2 = sideOfLine(p, v2, v3);
    float s3 = sideOfLine(p, v3, v4);
    float s4 = sideOfLine(p, v4, v0);
    
    // Point is inside if all signs are the same (all positive or all negative)
    return (s0 > 0.0 && s1 > 0.0 && s2 > 0.0 && s3 > 0.0 && s4 > 0.0) ||
           (s0 < 0.0 && s1 < 0.0 && s2 < 0.0 && s3 < 0.0 && s4 < 0.0) ? 1.0 : 0.0;
}

// Generate wobble offset for a layer based on time and layer index
vec2 getWobbleOffset(float layer, float time) {
    // Use shared frequency to keep all layers synchronized
    float baseFreqX = 0.8;
    float baseFreqY = 0.8;
    
    // Phase offsets create the ripple effect - inner layers lead, outer layers follow
    // This keeps them synchronized while creating inside-to-out ripple
    float ripplePhase = -layer * 0.3; // Negated: inner layers lead, outer layers follow
    
    // Additional phase offsets to make each layer unique (perpendicular to ripple)
    float uniquePhaseX = layer * 0.1; // Smaller offset to avoid canceling ripple
    float uniquePhaseY = layer * 0.1;
    
    // Wobble amplitude (smaller for inner layers, larger for outer)
    float amplitude = 0.01 + layer * 0.003;
    
    // Generate wobble using shared time and frequency
    // Add ripplePhase (which is negative) so outer layers lag behind inner layers (inside-to-out ripple)
    // Add uniquePhase for each layer's unique pattern
    float wobbleX = sin(time * baseFreqX + uniquePhaseX + ripplePhase) * amplitude;
    float wobbleY = cos(time * baseFreqY + uniquePhaseY + ripplePhase) * amplitude;
    
    return vec2(wobbleX, wobbleY);
}

// Generate mouse-following offset for a layer
// Inner layers (smaller layer index) move more toward mouse
vec2 getMouseFollowOffset(float layer, vec2 mousePos) {
    // Calculate direction from center to mouse
    vec2 direction = mousePos;
    
    // Inner layers move more - use inverse relationship
    // Normalize layer to 0-1 range (0 = innermost, 1 = outermost)
    float normalizedLayer = layer / (float(NUM_LAYERS) - 1.0);
    
    // Inner layers (smaller normalizedLayer) get more movement
    // Maximum movement for innermost, decreasing for outer layers
    float movementAmount = (1.0 - normalizedLayer) * 0.15;
    
    return direction * movementAmount;
}

float pentagonShape(vec2 st, float scale) {
    float size = 0.03 * scale;
    
    // Create a pentagon pointing upward
    // Top vertex
    vec2 v0 = vec2(0.0, size);
    // Top right
    vec2 v1 = vec2(size * 0.951, size * 0.309);
    // Bottom right
    vec2 v2 = vec2(size * 0.588, -size * 0.809);
    // Bottom left
    vec2 v3 = vec2(-size * 0.588, -size * 0.809);
    // Top left
    vec2 v4 = vec2(-size * 0.951, size * 0.309);
    
    return pointInPentagon(st, v0, v1, v2, v3, v4);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    
    // Center the coordinate system
    st = st - 0.5;
    
    // Adjust for aspect ratio
    st.x *= u_resolution.x / u_resolution.y;
    
    // Get mouse position in normalized coordinates
    vec2 mouse = u_mouse / u_resolution;
    mouse = mouse - 0.5;
    mouse.x *= u_resolution.x / u_resolution.y;
    
    // Initialize color
    vec3 color = COLOR_RED;
    
    // Render multiple layers of pentagons with increasing sizes and different colors
    // Render from largest to smallest so smaller pentagons appear on top
    for (int i = NUM_LAYERS - 1; i >= 0; i--) {
        float layer = float(i);
        float scale = 1.0 + layer * 2.5; // Each layer is 2.5x larger for increased spread
        
        // Get wobble offset for this layer (with delay for outer layers)
        vec2 wobbleOffset = getWobbleOffset(layer, u_time);
        
        // Get mouse-following offset (inner layers move more)
        vec2 mouseOffset = getMouseFollowOffset(layer, mouse);
        
        // Combine wobble and mouse-following offsets
        vec2 totalOffset = wobbleOffset + mouseOffset;
        
        // Apply offsets to coordinates (subtract to move toward mouse)
        vec2 stWobbled = st - totalOffset;
        
        // Calculate rotation angle - clockwise rotation with delay for outer layers
        // Inner layers lead, outer layers follow (inside-to-out ripple)
        float rotationSpeed = 0.05; // Rotation speed in radians per second
        float rotationPhase = -layer * 0.1; // Delay phase for outer layers
        float angle = u_time * rotationSpeed + rotationPhase;
        
        // Create rotation matrix (clockwise rotation)
        float cosAngle = cos(angle) * 1.1;
        float sinAngle = sin(angle) * 1.1;
        mat2 rotation = mat2(cosAngle, sinAngle, -sinAngle, cosAngle);
        
        // Apply rotation to coordinates
        vec2 stRotated = rotation * stWobbled;
        
        // Calculate pentagon for this layer
        float pentagon = pentagonShape(stRotated, scale);
        
        // Different color for each layer
        // Create a smooth gradient across all layers
        float normalizedLayer = layer / (float(NUM_LAYERS) - 1.0);
        vec3 layerColor;
        
        // Gradient from white -> cyan -> blue -> purple -> red
        if (normalizedLayer < 0.25) {
            // White to cyan
            layerColor = mix(COLOR_WHITE, COLOR_CYAN, normalizedLayer / 0.25);
        } else if (normalizedLayer < 0.5) {
            // Cyan to blue
            layerColor = mix(COLOR_CYAN, COLOR_BLUE, (normalizedLayer - 0.25) / 0.25);
        } else if (normalizedLayer < 0.75) {
            // Blue to purple
            layerColor = mix(COLOR_BLUE, COLOR_PURPLE, (normalizedLayer - 0.5) / 0.25);
        } else {
            // Purple to red
            layerColor = mix(COLOR_PURPLE, COLOR_RED, (normalizedLayer - 0.75) / 0.25);
        }
        
        // Add this layer's color (with alpha blending effect)
        color = mix(color, layerColor, pentagon);
    }
    
    gl_FragColor = vec4(color, 1.0);
}

