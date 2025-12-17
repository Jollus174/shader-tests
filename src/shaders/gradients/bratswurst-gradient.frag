#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

// normalise that rgb colour
float nColor(float n) {
    return float(n / 255.0);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    vec3 black = vec3(0.0, 0.0, 0.0);
    vec3 red = vec3(nColor(221.0), 0.0, 0.0);
    vec3 gold = vec3(nColor(255.0), nColor(204.0), 0.0);

    float yOffset = abs(sin(u_time * 1.) / 2. + 1.);

    // should smoothly fade between black, red, gold
    vec3 colorBlackRed = mix(black, red, smoothstep(0.0, 0.5, st.y * yOffset));
    vec3 colorBlackRedGold = mix(colorBlackRed, gold, smoothstep(0.5, 1.0, st.y * yOffset));
    
    gl_FragColor = vec4(colorBlackRedGold, 1.0);
}

