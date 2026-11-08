import { noiseGlsl } from './noise'

// Velocity: a spring towards the particle's spot on the shape + a curl-noise current. The
// current is what draws the silky streams; beats turn it up.
export const velocityShader = /* glsl */ `
  uniform float uTime;
  uniform float uDelta;
  uniform float uFlow;
  uniform float uStir;
  uniform sampler2D tTarget;
  ${noiseGlsl}

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 posSeed = texture2D(texturePosition, uv);
    vec3 pos = posSeed.xyz;
    vec3 vel = texture2D(textureVelocity, uv).xyz;
    vec3 target = texture2D(tTarget, uv).xyz;

    vec3 spring = (target - pos) * mix(5.5, 1.2, uStir);
    vec3 flow = curl(pos * 0.85 + vec3(0.0, uTime * 0.06, uTime * 0.025)) * (uFlow + uStir * 1.6);
    vel += (spring + flow) * uDelta;
    vel *= pow(0.04, uDelta); // strong damping: smooth, never jittery
    gl_FragColor = vec4(vel, 1.0);
  }
`

export const positionShader = /* glsl */ `
  uniform float uDelta;
  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 p = texture2D(texturePosition, uv);
    vec3 v = texture2D(textureVelocity, uv).xyz;
    gl_FragColor = vec4(p.xyz + v * uDelta, p.w);
  }
`
