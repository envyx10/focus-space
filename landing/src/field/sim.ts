import { noiseGlsl } from '@/features/visual/shaders/noise'

/**
 * The app's velocity pass (a spring towards the sphere + a curl-noise current), plus two things for the page:
 * the visitor's hand pushes particles aside and they swirl back, and a few particles peel off as a trail of dust.
 */
export const velocityShader = /* glsl */ `
  uniform float uTime;
  uniform float uDelta;
  uniform float uFlow;
  uniform float uStir;
  uniform vec3 uPointer;
  uniform float uPush;
  uniform float uTrail;
  uniform vec3 uTrailDir;
  uniform sampler2D tTarget;
  ${noiseGlsl}

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 posSeed = texture2D(texturePosition, uv);
    vec3 pos = posSeed.xyz;
    vec3 vel = texture2D(textureVelocity, uv).xyz;
    vec3 target = texture2D(tTarget, uv).xyz;
    float seed = posSeed.w;
    float trail = step(fract(seed * 53.1), 0.07) * uTrail;

    vec3 spring = (target - pos) * mix(5.5, 1.2, uStir) * (1.0 - trail);
    vec3 flow = curl(pos * 0.85 + vec3(0.0, uTime * 0.06, uTime * 0.025)) * (uFlow + uStir * 1.6);

    // the hand: a radial push with a twist, strongest under the pointer and gone by ~0.6 units
    vec3 away = pos - uPointer;
    float fall = exp(-dot(away, away) * 6.0) * uPush;
    vec3 dir = normalize(away + vec3(0.0001));
    vec3 hand = (dir * 9.0 + cross(dir, vec3(0.0, 0.0, 1.0)) * 4.0) * fall * (0.6 + seed * 0.8);

    // the trail: a slow wind off the side of the sphere, with the current still curling it
    vec3 wind = uTrailDir * (0.55 + seed * 0.6) * trail + flow * trail * 0.6;

    vel += (spring + flow * (1.0 - trail) + hand + wind) * uDelta;
    vel *= pow(0.04, uDelta);
    if (trail > 0.5 && dot(pos - target, uTrailDir) > 2.4) vel = vec3(0.0);
    gl_FragColor = vec4(vel, 1.0);
  }
`

/** The app's position pass, plus: dust that has drifted far enough comes back to its spot on the sphere. */
export const positionShader = /* glsl */ `
  uniform float uDelta;
  uniform float uTrail;
  uniform vec3 uTrailDir;
  uniform sampler2D tTarget;
  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 p = texture2D(texturePosition, uv);
    vec3 v = texture2D(textureVelocity, uv).xyz;
    vec3 target = texture2D(tTarget, uv).xyz;
    vec3 np = p.xyz + v * uDelta;
    float trail = step(fract(p.w * 53.1), 0.07) * uTrail;
    if (trail > 0.5 && dot(np - target, uTrailDir) > 2.4) np = target;
    gl_FragColor = vec4(np, p.w);
  }
`
