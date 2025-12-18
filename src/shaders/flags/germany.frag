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

    st.y = 1.0 - st.y;

    vec3 color = black;
    if (st.y < 0.33) {
        color = black;
    } else if (st.y < 0.66) {
        color = red;
    } else {
        color = gold;
    }
    gl_FragColor = vec4(color, 1.0);
}

