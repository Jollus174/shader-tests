#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float nColor(float n) {
    return float(n / 255.0);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    vec3 color = vec3(0.0);

    vec3 outerGrey = vec3(nColor(191.0), nColor(191.0), nColor(191.0));
    vec3 canvasGrey = vec3(nColor(181.0), nColor(175.0), nColor(162.0));
    vec3 red = vec3(nColor(126.0), nColor(25.0), nColor(28.0));
    vec3 yellow = vec3(nColor(188.0), nColor(145.0), nColor(37.0));
    vec3 blue = vec3(0.0, nColor(70.0), nColor(116.0));
    vec3 black = vec3(nColor(0.14), nColor(0.16), nColor(0.2));

    float canvasLeftRange = 0.1;
    float canvasRightRange = 0.9;

    // Vertical borders: left and right edges
    float leftBorder = step(st.x, canvasLeftRange);  // Left border (x < 0.1)
    float rightBorder = step(canvasRightRange, st.x);  // Right border (x > 0.9)
    float verticalBorders = max(leftBorder, rightBorder);

    float lineWidth = 0.01;

    // Returns 1.0 when within lineWidth distance, 0.0 otherwise
    float hLine1 = 1.0 - step(lineWidth, abs(st.y - 0.14)); 
    float hLine2 = 1.0 - step(lineWidth * 1.25, abs(st.y - 0.57)); 
    float hLine3 = 1.0 - step(lineWidth * 1.25, abs(st.y - 0.8)); 
    
    // Constrain horizontal lines to specific x-ranges (cut-off effect)
    float hLine1Range = step(0.26, st.x) * step(st.x, canvasRightRange);
    float hLine2Range = step(canvasLeftRange, st.x) * step(st.x, canvasRightRange);
    float hLine3Range = step(canvasLeftRange, st.x) * step(st.x, canvasRightRange);
    
    // Apply range constraints to lines
    hLine1 = hLine1 * hLine1Range;
    hLine2 = hLine2 * hLine2Range;
    hLine3 = hLine3 * hLine3Range;
    
    float horizontalLines = max(hLine1, max(hLine2, hLine3));

    float vLine1 = 1.0 - step(lineWidth, abs(st.x - 0.16));
    float vLine2 = 1.0 - step(lineWidth, abs(st.x - 0.27));
    float vLine3 = 1.0 - step(lineWidth, abs(st.x - 0.72));
    float vLine4 = 1.0 - step(lineWidth * 0.8, abs(st.x - 0.86));
    
    float vLine1Range = step(0.56, st.y);
    vLine1 = vLine1 * vLine1Range;

    float verticalLines = max(vLine1, max(vLine2, max(vLine3, vLine4)));

    // Define a square regions at an intersection
    float sqRedTop = step(st.y, 1.);
    float sqRedRight = step(st.x, 0.26);
    float sqRedBottom = step(.57, st.y);
    float sqRedLeft = step(canvasLeftRange, st.x);
    float sqRedRegion = sqRedTop * sqRedRight * sqRedBottom * sqRedLeft;

    float sqYellowTop = step(st.y, 1.);
    float sqYellowRight = step(st.x, canvasRightRange);
    float sqYellowBottom = step(.57, st.y);
    float sqYellowLeft = step(0.86, st.x);
    float sqYellowRegion = sqYellowTop * sqYellowRight * sqYellowBottom * sqYellowLeft;

    float sqBlueTop = step(st.y, 0.14);
    float sqBlueRight = step(st.x, canvasRightRange);
    float sqBlueBottom = step(.0, st.y);
    float sqBlueLeft = step(0.72, st.x);
    float sqBlueRegion = sqBlueTop * sqBlueRight * sqBlueBottom * sqBlueLeft;

    // Start with center color
    color = canvasGrey;
    
    // Apply colours to each of the defined areas
    color = mix(color, outerGrey, verticalBorders);
    // Apply square color before lines so lines appear on top
    color = mix(color, red, sqRedRegion);
    color = mix(color, yellow, sqYellowRegion);
    color = mix(color, blue, sqBlueRegion);
    color = mix(color, black, horizontalLines);
    color = mix(color, black, verticalLines);
    
    gl_FragColor = vec4(color, 1.0);
}

