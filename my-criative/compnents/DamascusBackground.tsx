"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ---------------------------------------------------------------------------
// GLSL Shaders
// ---------------------------------------------------------------------------

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float u_time;
  varying vec2 vUv;

  // ----------------------------------------------------------------
  // Simplex Noise 2D — inlined (Stefan Gustavson / ashima arts)
  // ----------------------------------------------------------------
  vec3 mod289(vec3 x){ return x - floor(x*(1./289.))*289.; }
  vec2 mod289(vec2 x){ return x - floor(x*(1./289.))*289.; }
  vec3 permute(vec3 x){ return mod289(((x*34.)+1.)*x); }

  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187,
                        0.366025403784439,
                       -0.577350269189626,
                        0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.,0.) : vec2(0.,1.);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0., i1.y, 1.))
                              + i.x + vec3(0., i1.x, 1.));
    vec3 m = max(0.5 - vec3(dot(x0,x0),
                             dot(x12.xy,x12.xy),
                             dot(x12.zw,x12.zw)), 0.);
    m = m*m; m = m*m;
    vec3 x = 2.*fract(p * C.www) - 1.;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314*(a0*a0+h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130. * dot(m, g);
  }

  // ----------------------------------------------------------------
  // Fractional Brownian Motion — 6 octaves
  // ----------------------------------------------------------------
  float fbm(vec2 p){
    float v = 0.;
    float a = 0.5;
    vec2  shift = vec2(100.);
    mat2  rot   = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for(int i=0; i<6; i++){
      v += a * snoise(p);
      p  = rot * p * 2.1 + shift;
      a *= 0.5;
    }
    return v;
  }

  // ----------------------------------------------------------------
  // Domain-warped FBM for extra organic feel
  // ----------------------------------------------------------------
  float warpedFbm(vec2 p){
    vec2 q = vec2(fbm(p + vec2(0.0, 0.0)),
                  fbm(p + vec2(5.2, 1.3)));
    return fbm(p + 1.2 * q + u_time * 0.04);
  }

  // ----------------------------------------------------------------
  // Colour palette — brighter & more saturated than before
  // ----------------------------------------------------------------
  vec3 palette(float t){
    vec3 c0 = vec3(0.04,  0.04,  0.07 ); // deep near-black (slight blue tint)
    vec3 c1 = vec3(0.10,  0.18,  0.38 ); // vivid deep navy
    vec3 c2 = vec3(0.22,  0.38,  0.62 ); // saturated steel-blue
    vec3 c3 = vec3(0.52,  0.64,  0.76 ); // bright blue-silver
    vec3 c4 = vec3(0.88,  0.93,  0.98 ); // near-white cold silver

    if(t < 0.25) return mix(c0, c1, t/0.25);
    if(t < 0.50) return mix(c1, c2, (t-0.25)/0.25);
    if(t < 0.75) return mix(c2, c3, (t-0.50)/0.25);
    return mix(c3, c4, (t-0.75)/0.25);
  }

  void main(){
    vec2 uv = vUv;

    // Aspect-ratio correction
    uv.x *= (1920./1080.);

    // --- Primary noise field ---
    float t     = u_time * 0.07;
    vec2  p     = uv * 2.5;
    float field = warpedFbm(p + t * vec2(0.3, 0.2));

    // --- Contour / stripe generation ---
    float stripes = 0.;
    stripes += sin(field * 28.0                 ) * 0.50;
    stripes += sin(field * 14.0 + u_time * 0.12 ) * 0.25;
    stripes += sin(field *  7.5 - u_time * 0.07 ) * 0.15;
    stripes += sin(field *  3.8 + u_time * 0.05 ) * 0.10;
    stripes  = stripes * 0.5 + 0.5;

    // --- Metallic highlight (brighter threshold) ---
    float highlight = pow(smoothstep(0.62, 1.0, stripes), 2.2);

    // --- Base colour ---
    float palT = smoothstep(-1.0, 1.0, field) * 0.60 + stripes * 0.40;
    vec3  col  = palette(palT);

    // Silver highlight overlay
    vec3 silver = vec3(0.90, 0.95, 1.00);
    col = mix(col, silver, highlight * 0.85);

    // Blue glint — more vivid
    float glint = smoothstep(0.30, 0.58, stripes)
                * (1.0 - smoothstep(0.58, 0.82, stripes));
    col = mix(col, vec3(0.30, 0.55, 0.90), glint * 0.30);

    // Vignette — softened (less darkening than before)
    vec2  cent = vUv - 0.5;
    float vign = 1.0 - dot(cent, cent) * 1.4;
    vign = clamp(vign, 0.0, 1.0);
    col *= mix(0.40, 1.0, vign);

    // Gamma-lift: nudge overall brightness up slightly
    col = pow(col, vec3(0.88));

    gl_FragColor = vec4(col, 1.0);
  }
`;

// ---------------------------------------------------------------------------
// ShaderMesh
// ---------------------------------------------------------------------------
function DamascusMesh() {
    const matRef = useRef<THREE.ShaderMaterial>(null);

    const uniforms = useMemo(
        () => ({ u_time: { value: 0.0 } }),
        []
    );

    useFrame(({ clock }) => {
        if (matRef.current) {
            matRef.current.uniforms.u_time.value = clock.getElapsedTime();
        }
    });

    return (
        <mesh>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                ref={matRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
            />
        </mesh>
    );
}

// ---------------------------------------------------------------------------
// Public component — fills its CSS container (no longer fixed-fullscreen)
// ---------------------------------------------------------------------------
export default function DamascusBackground() {
    return (
        <div style={{ width: "100%", height: "100%", background: "#000" }}>
            <Canvas
                camera={{ position: [0, 0, 1], fov: 75, near: 0.1, far: 10 }}
                gl={{ antialias: false }}
                style={{ width: "100%", height: "100%" }}
                onCreated={({ camera }) => {
                    (camera as THREE.PerspectiveCamera).aspect = 1;
                    (camera as THREE.PerspectiveCamera).fov = 90;
                    camera.updateProjectionMatrix();
                }}
            >
                <DamascusMesh />
            </Canvas>
        </div>
    );
}
