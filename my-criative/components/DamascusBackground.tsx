"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ---------------------------------------------------------------------------
// GLSL Shaders — Modern Damascus Steel Wood-Grain Pattern
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

  // =====================================================================
  // NOISE PRIMITIVES
  // =====================================================================

  vec3 mod289v3(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec2 mod289v2(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec3 permute3(vec3 x) { return mod289v3(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1  = (x0.x > x0.y) ? vec2(1.,0.) : vec2(0.,1.);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289v2(i);
    vec3 p = permute3(permute3(i.y + vec3(0.,i1.y,1.)) + i.x + vec3(0.,i1.x,1.));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.);
    m = m*m; m = m*m;
    vec3 xv = 2.0*fract(p * C.www) - 1.0;
    vec3 h  = abs(xv) - 0.5;
    vec3 ox = floor(xv + 0.5);
    vec3 a0 = xv - ox;
    m *= 1.79284291400159 - 0.85373472095314*(a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x *x0.x   + h.x *x0.y;
    g.yz = a0.yz*x12.xz + h.yz*x12.yw;
    return 130.0 * dot(m, g);
  }

  // =====================================================================
  // DOMAIN WARP — TWO PASSES (Inigo Quilez style)
  // First pass: coarse serpentine flow (low-frequency global undulation)
  // Second pass: tight regional twisting (local fold detail)
  // This is the KEY to realistic wood-grain layering.
  // =====================================================================
  vec2 domainWarp(vec2 p, float t) {
    // Scale: strong lateral compression, extreme Y-stretch
    // Hammering → billet gets very long and thin in Y
    vec2 q = vec2(p.x * 0.9, p.y * 5.5);

    // ---- Pass 1: global serpentine (slow, large scale) ----
    // Low-frequency twist along X — simulates billet being bent/folded
    float w1x = snoise(q * 0.28 + vec2(0.0, t * 0.15));
    float w1y = snoise(q * 0.28 + vec2(4.7, t * 0.13));
    q.x += w1x * 1.20;
    q.y += w1y * 0.30;

    // ---- Pass 2: mid-scale regional kink ----
    // Slightly faster — simulates individual hammer passes
    float w2x = snoise(q * 0.65 + vec2(t * 0.09, 2.3));
    float w2y = snoise(q * 0.65 + vec2(7.1, t * 0.07));
    q.x += w2x * 0.55;
    q.y += w2y * 0.18;

    // ---- Pass 3: fine detail kink ----
    float w3 = snoise(q * 1.5 + vec2(t * 0.06, 5.5));
    q.x += w3 * 0.22;

    return q;
  }

  // =====================================================================
  // WOOD-GRAIN FIELD via SMOOTH fBm
  // We use standard fBm (NOT absolute-noise) here to get a smoothly
  // varying scalar field. The wood-grain comes from reading the
  // CONTOUR LINES of this field (sin(field * N)), not from the field itself.
  // =====================================================================
  float grainField(vec2 p) {
    float v = 0.0;
    float a = 0.55;
    vec2  shift = vec2(100.0);
    mat2  rot = mat2(cos(0.4), sin(0.4), -sin(0.4), cos(0.4));
    for (int i = 0; i < 6; i++) {
      v += a * snoise(p);
      p = rot * p * 2.05 + shift;
      a *= 0.50;
    }
    return v; // range ≈ [-1, 1]
  }

  // =====================================================================
  // CONTOUR LINES — the actual Damascus band pattern
  // Reading many harmonics of sin() from the field creates the
  // tight, closely-spaced parallel bands of wood-grain Damascus.
  // =====================================================================
  float woodGrainBands(float field) {
    // Primary harmonic — coarse band spacing (major wood grain lines)
    float b  = sin(field * 18.0)           * 0.50;
    // Second harmonic — half spacing (finer grain within bands)
    b       += sin(field * 36.0)           * 0.28;
    // Third harmonic — micro grain detail
    b       += sin(field * 72.0)           * 0.14;
    // Fourth harmonic — ultra-fine fiber texture
    b       += sin(field * 144.0)          * 0.08;

    // Normalize to [0, 1]
    b = b * 0.5 + 0.5;
    return clamp(b, 0.0, 1.0);
  }

  // =====================================================================
  // CEMENTITE PARTICLES — Fe3C precipitation in band interstices
  // Uses high-frequency noise thresholded to small bright spots
  // placed preferentially in the dark (etched) valleys.
  // =====================================================================
  float cementiteParticles(vec2 p, float band) {
    // High-frequency grain noise
    float grain = snoise(p * 14.0) * 0.5 + 0.5;
    grain += snoise(p * 28.0) * 0.25 + 0.125;
    grain = clamp(grain, 0.0, 1.0);

    // Threshold to small particles
    float particle = smoothstep(0.75, 0.92, grain);

    // Place particles in the dark valleys (low band regions)
    float valleyMask = 1.0 - smoothstep(0.28, 0.52, band);

    return particle * valleyMask;
  }

  // =====================================================================
  // METALLIC LIGHTING SYSTEM
  // Composed of three layers:
  //   1. Ward Anisotropic BRDF   — elongated glint along the grain (horizontal)
  //   2. Fake Environment Map    — studio ceiling light reflected in the surface
  //   3. Fresnel Rim             — edges glisten more (grazing angle reflectance)
  // =====================================================================

  // Compute surface normal from the grain field gradient
  vec3 surfaceNormal(vec2 uv, float t) {
    float eps = 0.005;
    vec2 wp = domainWarp(uv, t);
    float f0 = grainField(wp);
    float fx = grainField(domainWarp(uv + vec2(eps, 0.0), t));
    float fy = grainField(domainWarp(uv + vec2(0.0, eps), t));
    // Bump scale — higher z = shallower bumps (lower contrast normals), lower z = deeper
    return normalize(vec3((f0-fx)/eps, (f0-fy)/eps, 0.018));
  }

  // Ward Anisotropic Specular
  // T = tangent along grain (horizontal), B = perpendicular (vertical)
  // alphaT = roughness along T (low = sharp streak along grain)
  // alphaB = roughness along B (high = broad across grain)
  float wardAniso(vec3 N, vec3 L, vec3 V, float alphaT, float alphaB) {
    vec3 H = normalize(L + V);
    // Grain tangent: horizontal direction in view space
    // We use a world-fixed horizontal tangent for the band direction
    vec3 T = normalize(vec3(1.0, 0.0, 0.0) - N * dot(N, vec3(1.0, 0.0, 0.0)));
    vec3 B = normalize(cross(N, T));

    float NdotL = max(dot(N, L), 0.001);
    float NdotV = max(dot(N, V), 0.001);
    float NdotH = max(dot(N, H), 0.0);
    float TdotH = dot(T, H);
    float BdotH = dot(B, H);

    float denom = 1.0 - NdotH * NdotH;
    if (denom < 0.0001) denom = 0.0001;

    float exponent = -(TdotH*TdotH/(alphaT*alphaT) + BdotH*BdotH/(alphaB*alphaB)) / denom;
    float ward = (1.0 / (4.0 * 3.14159 * alphaT * alphaB)) * exp(exponent);
    ward /= sqrt(NdotL * NdotV);

    return max(ward * NdotL, 0.0);
  }

  // Fake studio environment map
  // Simulates a rectangular softbox light overhead, floor bounce below
  vec3 fakeEnvMap(vec3 N) {
    // Reflect view ray off surface normal
    vec3 V = vec3(0.0, 0.0, 1.0); // orthographic view
    vec3 R = reflect(-V, N);      // reflected direction

    // Primary overhead strip light (Y+ direction)
    float overhead = exp(-abs(R.y - 0.85) * 6.0);        // bright strip near top
    float sideLeft = exp(-abs(R.x + 0.7) * 9.0) * 0.25; // faint left edge light
    float sideRight= exp(-abs(R.x - 0.7) * 9.0) * 0.20; // faint right edge light
    float floor_   = exp(-abs(R.y + 0.6) * 10.0) * 0.12; // floor bounce

    float brightness = overhead + sideLeft + sideRight + floor_;

    // Steel tint: cool white overhead, warm gray sides
    vec3 envColor = mix(
      vec3(0.70, 0.72, 0.78),  // cool gray ambient
      vec3(0.98, 0.99, 1.00),  // bright white overhead
      clamp(overhead * 2.0, 0.0, 1.0)
    );
    return envColor * brightness;
  }

  // Full metallic lighting: anisotropic BRDF + environment + Fresnel
  vec3 metallicLighting(vec2 uv, float t, float hardness) {
    vec3 N = surfaceNormal(uv / 1.4, t); // undo the zoom for normal sampling
    vec3 V = vec3(0.0, 0.0, 1.0);

    // Rotating key light (main directional)
    float la = u_time * 0.07;
    vec3 L1 = normalize(vec3(cos(la) * 0.55, sin(la) * 0.35 + 0.5, 1.0));
    // Fixed fill light (from upper-left)
    vec3 L2 = normalize(vec3(-0.45, 0.60, 0.80));
    // Rim light (from behind-left)
    vec3 L3 = normalize(vec3(-0.3, -0.5, 0.65));

    // Ward anisotropic params:
    // alphaT = along grain (X) = very low (sharp streak)
    // alphaB = across grain (Y) = higher (broad fall-off)
    // Polished surface = both low; brushed = large alphaT, tiny alphaB
    float alphaT = 0.06 + hardness * 0.04; // brighter bands = slightly sharper
    float alphaB = 0.38;

    float ward1 = wardAniso(N, L1, V, alphaT, alphaB) * 1.8;  // key light
    float ward2 = wardAniso(N, L2, V, alphaT * 1.4, alphaB * 1.2) * 0.5; // fill
    float ward3 = wardAniso(N, L3, V, alphaT * 2.0, alphaB * 0.7) * 0.3; // rim

    vec3 specColor = vec3(0.95, 0.97, 1.00); // steel white specular

    vec3 specTotal = specColor * (ward1 + ward2 + ward3);

    // Fake environment reflection (muted, adds soft metallic haze)
    vec3 envRef = fakeEnvMap(N) * 0.35;

    // Fresnel: more reflective at grazing angles
    float NdotV = max(dot(N, V), 0.0);
    float fresnel = pow(1.0 - NdotV, 3.5);
    // Steel base reflectance F0 ≈ 0.55
    float F = 0.55 + (1.0 - 0.55) * fresnel;

    return (specTotal + envRef) * F;
  }

  // =====================================================================
  // MAIN
  // =====================================================================
  void main() {
    vec2 uv = vUv;

    // Aspect ratio correction
    uv.x *= 16.0 / 9.0;
    uv *= 1.4;

    // Slow drift — the metal being continuously tempered
    float t = u_time * 0.018;
    uv += vec2(t * 0.06, t * 0.04);

    // ---- DOMAIN WARP (forging) ----
    vec2 warped = domainWarp(uv, t);

    // ---- GRAIN FIELD ----
    float field = grainField(warped);

    // ---- WOOD-GRAIN BAND PATTERN ----
    float bands = woodGrainBands(field);

    // ---- CEMENTITE PARTICLES ----
    float particles = cementiteParticles(warped, bands);

    // ---- COMBINED HARDNESS FIELD ----
    // Bright bands = hard cementite-rich / Polished → white
    // Dark valleys = soft pearlite/ferrite → etched → black
    float hardness = clamp(bands * 0.85 + particles * 0.35, 0.0, 1.0);

    // Apply a steeper power curve to sharpen the band edges
    hardness = pow(hardness, 0.55);

    // ---- ETCHING COLOR MAP ----
    // Optimal Damascus contrast: near-black valleys, near-white ridges
    vec3 darkSteel    = vec3(0.02, 0.02, 0.025);  // almost pure black etched depth
    vec3 midSteel     = vec3(0.28, 0.30, 0.33);   // cool metallic gray
    vec3 brightSilver = vec3(0.97, 0.975, 0.98);  // polished silver white

    // Strong S-curve: spend little time in mid-gray → push to extremes
    float lower = smoothstep(0.05, 0.42, hardness);
    float upper = smoothstep(0.46, 0.90, hardness);

    vec3 col = mix(darkSteel, midSteel, lower * lower);
    col = mix(col, brightSilver, upper * upper * upper); // cubic → very sharp bright peak

    // ---- METALLIC LIGHTING (Anisotropic Ward + EnvMap + Fresnel) ----
    vec3 metalLit = metallicLighting(uv, t, hardness);

    // Blend metallic sheen:
    // - On bright polished bands  → full metallic sheen
    // - On dark etched valleys    → mainly diffuse (etched surface scatters light)
    // The pow() concentrates the sheen on the most polished (bright) regions
    float sheenMask = pow(smoothstep(0.25, 0.80, hardness), 1.2);
    col += metalLit * (0.55 + sheenMask * 0.65);

    // ---- EDGE MICRO-GLINT — sharp spark at band boundary ----
    // Extremely narrow specular at the inflection point between dark and light bands
    // This is the most visually "steel-like" element
    float edgeMask = 1.0 - abs(hardness - 0.52) / 0.30;
    edgeMask = clamp(edgeMask, 0.0, 1.0);
    edgeMask = pow(edgeMask, 3.0);
    col += vec3(1.0, 1.0, 1.0) * edgeMask * 0.18;

    // ---- VIGNETTE ----
    vec2 cent = vUv - 0.5;
    float vign = 1.0 - dot(cent, cent) * 1.9;
    vign = pow(clamp(vign, 0.0, 1.0), 1.4);
    col *= mix(0.15, 1.0, vign);

    // ---- TONE MAPPING & GAMMA ----
    // Extended Reinhard — keeps pure whites and pure blacks
    col = col / (col + vec3(0.40));
    col = pow(col, vec3(1.0 / 1.08));

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
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
// Public component — fills its CSS container
// ---------------------------------------------------------------------------
export default function DamascusBackground() {
  return (
    <div style={{ width: "100%", height: "100%", background: "#090909" }}>
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
