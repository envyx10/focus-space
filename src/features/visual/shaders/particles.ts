import { CAMERA_Z } from '@/features/visual/particles'

export const particleVertex = /* glsl */ `
  attribute vec2 aRef;
  uniform sampler2D tPosition;
  uniform sampler2D tVelocity;
  uniform float uPixelRatio;
  uniform float uIntro;
  varying float vAlpha;
  varying float vHeat;
  varying float vAccent;
  varying float vRim;
  varying float vY;

  void main() {
    vec4 p = texture2D(tPosition, aRef);
    vec3 v = texture2D(tVelocity, aRef).xyz;
    vec4 mv = modelViewMatrix * vec4(p.xyz, 1.0);
    gl_Position = projectionMatrix * mv;
    // height on screen across the sphere, -1 bottom .. 1 top, whatever its scale and spin
    vY = (mv.y - (modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0)).y) / length(modelViewMatrix[0].xyz);
    float seed = p.w;
    gl_PointSize = (0.7 + seed * seed * 0.8) * uPixelRatio * (${CAMERA_Z.toFixed(1)} / -mv.z);
    float depth = clamp((${(CAMERA_Z + 1.4).toFixed(1)} + mv.z) / 2.8, 0.0, 1.0); // 1 = nearest
    // Lights fixed to the camera, so the sphere turns under them: a soft key from the upper
    // left and a warm back light grazing the lower right edge. Unlit side stays near-dark.
    vec3 n = normalize(mat3(modelViewMatrix) * p.xyz);
    float key = smoothstep(-0.15, 1.0, dot(n, normalize(vec3(-0.6, 0.55, 0.6))));
    // only particles already on the shell catch the warm light: no orange specks while gathering
    float onShell = 1.0 - smoothstep(0.04, 0.25, abs(length(p.xyz) - 1.0));
    vRim = pow(max(dot(n, normalize(vec3(0.75, -0.45, -0.5))), 0.0), 2.0) * onShell * uIntro * uIntro;
    vAlpha = 0.05 + depth * depth * 0.22 + key * key * 0.6 + vRim * 0.4;
    // no motion-colour while the field first assembles: it would read as stray orange sparks
    vHeat = smoothstep(0.35, 1.6, length(v)) * uIntro * uIntro;
    vAccent = step(0.965, fract(seed * 91.7));
  }
`

export const particleFragment = /* glsl */ `
  uniform float uIntro;
  uniform vec3 uAccent;
  uniform float uFill;
  uniform float uFillMix;
  varying float vAlpha;
  varying float vHeat;
  varying float vAccent;
  varying float vRim;
  varying float vY;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float disc = 1.0 - smoothstep(0.32, 0.5, d); // crisp dot, just antialiased
    // warm light adding up on the dark page
    vec3 warm = vec3(0.86, 0.85, 0.81);
    // fast-moving particles and a few seeds glow in the accent colour: motion reads as colour
    vec3 col = mix(warm, uAccent, max(max(vHeat * 0.85, vAccent * uIntro), vRim * 0.85));
    // Breathing guide: the accent fills the sphere from the bottom up on the in-breath and drains on the out-breath.
    float fill = uFillMix * smoothstep(uFill + 0.35, uFill - 0.35, vY);
    col = mix(col, uAccent, fill * 0.8);
    float a = min(1.0, disc * vAlpha * (0.5 + vHeat * 0.4 + fill * 0.5) * 0.7 * uIntro);
    gl_FragColor = vec4(col * a, a); // premultiplied
  }
`
