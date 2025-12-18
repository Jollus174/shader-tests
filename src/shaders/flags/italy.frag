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

    vec3 green = vec3(nColor(0.0), nColor(147.0), nColor(69.0));
    vec3 white = vec3(nColor(244.0), nColor(249.0), nColor(255.0));
    vec3 red = vec3(nColor(205.0), nColor(33.0), nColor(42.0));

    vec3 color = green;
    if (st.x < 0.33) {
        color = green;
    } else if (st.x < 0.66) {
        color = white;
    } else {
        color = red;
    }
    gl_FragColor = vec4(color, 1.0);

    // should smoothly fade between green, white, red
    // fade green -> white, then white -> red
    // vec3 colorGreenWhite = mix(green, white, smoothstep(0.0, 0.5, st.x));
    // vec3 colorGreenWhiteRed = mix(colorGreenWhite, red, smoothstep(0.5, 1.0, st.x));
    
    // gl_FragColor = vec4(colorGreenWhiteRed, 1.0);
}

