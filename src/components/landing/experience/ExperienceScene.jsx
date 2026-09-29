'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { experience, PRESETS, collectDarkRanges, updateActiveChapter } from './store';
import {
  backdropVertex,
  backdropFragment,
  orbVertex,
  orbFragment,
  haloVertex,
  haloFragment,
  particlesVertex,
  particlesFragment,
} from './shaders';

const { damp, smoothstep } = THREE.MathUtils;

const SKILLS = ['Reading', 'Listening', 'Speaking', 'Writing'];
const WORDS = ['resilient', 'articulate', 'insightful', 'sustainable'];
const RING_RADII = [1.3, 1.5, 1.72];
const RING_TILTS = [
  [Math.PI / 2, 0, 0],
  [Math.PI / 2 + 0.35, 0.2, 0],
  [Math.PI / 2 - 0.3, -0.25, 0],
];

function v3(hex) {
  const c = hex.replace('#', '');
  return new THREE.Vector3(
    parseInt(c.slice(0, 2), 16) / 255,
    parseInt(c.slice(2, 4), 16) / 255,
    parseInt(c.slice(4, 6), 16) / 255,
  );
}

export function paletteFromColors(colors) {
  const primary = v3(colors.primary);
  return {
    uBg: v3(colors.bg),
    uSurface: v3(colors.surface2),
    uAccent: v3(colors.accent),
    uAccentSoft: v3(colors.accentSoft),
    uPrimary: primary,
    uPrimarySoft: v3(colors.primarySoft),
    // A deeper shade *derived* from the brand primary, not a new color.
    uPrimaryDeep: primary.clone().multiplyScalar(0.42),
    uGold: v3(colors.warning),
  };
}

function withPalette(base, palette) {
  const u = { ...base };
  for (const [k, v] of Object.entries(palette)) u[k] = { value: v.clone() };
  return u;
}

function applyPalette(uniforms, palette) {
  for (const [k, v] of Object.entries(palette)) {
    if (uniforms[k]) uniforms[k].value.copy(v);
  }
}

function Backdrop({ palette, lite, reducedMotion }) {
  const uniforms = useMemo(
    () =>
      withPalette(
        {
          uTime: { value: 7 },
          uScroll: { value: 0 },
          uVelocity: { value: 0 },
          uDarkRanges: { value: [new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2()] },
          uDarkCount: { value: 0 },
          uRes: { value: new THREE.Vector2(1, 1) },
          uMouse: { value: new THREE.Vector2() },
        },
        palette,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => applyPalette(uniforms, palette), [uniforms, palette]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    if (!reducedMotion) uniforms.uTime.value += dt;
    uniforms.uScroll.value = damp(uniforms.uScroll.value, experience.scroll, 3, dt);
    // Measured every frame (not only on scroll events) so the active chapter
    // and dark bands stay correct through Lenis easing and GSAP pin
    // release — a scroll-event-only check can run before a pin repositions
    // its element on the same tick and then never re-run.
    updateActiveChapter();
    const { n, coverage } = collectDarkRanges(uniforms.uDarkRanges.value, state.size.height);
    uniforms.uDarkCount.value = n;
    // Single writer of experience.dark (particles/halo intensity).
    experience.dark = damp(experience.dark, coverage, reducedMotion ? 30 : 4, dt);
    experience.velocity = damp(experience.velocity, 0, 3, dt);
    uniforms.uVelocity.value = damp(uniforms.uVelocity.value, Math.min(Math.abs(experience.velocity) / 2500, 1), 4, dt);
    uniforms.uRes.value.set(state.size.width, state.size.height);
    uniforms.uMouse.value.x = damp(uniforms.uMouse.value.x, experience.pointer.x, 2, dt);
    uniforms.uMouse.value.y = damp(uniforms.uMouse.value.y, experience.pointer.y, 2, dt);
  });

  return (
    <mesh frustumCulled={false} renderOrder={-10}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={backdropVertex}
        fragmentShader={backdropFragment}
        uniforms={uniforms}
        defines={{ OCTAVES: lite ? 3 : 5 }}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

function Particles({ palette, lite, reducedMotion }) {
  const count = lite ? 140 : 360;
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const scale = new Float32Array(count);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() * 2 - 1) * 9;
      pos[i * 3 + 1] = (Math.random() * 2 - 1) * 6;
      pos[i * 3 + 2] = -Math.random() * 8 + 1.5;
      scale[i] = 0.4 + Math.random() * 1.2;
      seed[i] = Math.random();
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aScale', new THREE.BufferAttribute(scale, 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    return g;
  }, [count]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uSize: { value: 60 },
      uPixelRatio: { value: 1 },
      uDark: { value: 0 },
      uColorA: { value: palette.uAccent.clone() },
      uColorB: { value: palette.uGold.clone() },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    uniforms.uColorA.value.copy(palette.uAccent);
    uniforms.uColorB.value.copy(palette.uGold);
  }, [uniforms, palette]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    if (!reducedMotion) uniforms.uTime.value += dt;
    uniforms.uScroll.value = damp(uniforms.uScroll.value, experience.scroll, 3, dt);
    uniforms.uDark.value = experience.dark;
    uniforms.uPixelRatio.value = state.viewport.dpr;
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        vertexShader={particlesVertex}
        fragmentShader={particlesFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}

function nodePosition(i, R) {
  const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
  return new THREE.Vector3(Math.cos(a) * R, Math.sin(a * 2) * 0.14, Math.sin(a) * R);
}

function setOpacity(el, cache, key, value) {
  if (!el) return;
  const rounded = Math.round(value * 100) / 100;
  if (cache[key] === rounded) return;
  cache[key] = rounded;
  el.style.opacity = String(rounded);
}

// The Learning Core. Lives in one fixed full-screen canvas and *travels*
// between chapter presets (store.js) as the page scrolls: position, size,
// ring expansion, label/token visibility and spin all damp toward the
// active chapter's targets, so every section change reads as one continuous
// camera move instead of separate per-section 3D widgets.
function Core({ palette, colors, lite, reducedMotion }) {
  const rootRef = useRef(null);
  const spinRef = useRef(null);
  const ringRefs = useRef([]);
  const beadRefs = useRef([]);
  const nodeRefs = useRef([]);
  const gemRefs = useRef([]);
  const nodeMatRefs = useRef([]);
  const labelRefs = useRef([]);
  const tokenRefs = useRef([]);
  const tokenElRefs = useRef([]);
  const travelerRef = useRef(null);
  const travelerElRef = useRef(null);
  const anim = useRef({ init: false, rings: 1, labels: 1, tokens: 1, spin: 1, story: 0, cache: {}, active: -2 });
  const tmp = useMemo(() => new THREE.Vector3(), []);

  const nodeR = lite ? 1.6 : 1.75;
  const tokenR = lite ? 1.35 : 1.9;
  const nodes = useMemo(() => SKILLS.map((_, i) => nodePosition(i, nodeR)), [nodeR]);
  const waypoints = useMemo(() => [new THREE.Vector3(), ...nodes, new THREE.Vector3()], [nodes]);

  const orbUniforms = useMemo(
    () => withPalette({ uTime: { value: 0 }, uAmp: { value: 0.05 } }, palette),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const haloUniforms = useMemo(
    () => ({ uColor: { value: palette.uAccent.clone() }, uIntensity: { value: 0.4 } }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    applyPalette(orbUniforms, palette);
    haloUniforms.uColor.value.copy(palette.uAccent);
  }, [orbUniforms, haloUniforms, palette]);

  useFrame((three, delta) => {
    const dt = Math.min(delta, 0.05);
    const root = rootRef.current;
    const spin = spinRef.current;
    if (!root || !spin) return;

    const a = anim.current;
    const P = PRESETS[experience.preset] || PRESETS.hero;
    const target = experience.isMobile ? P.m : P.d;
    const halfW = three.viewport.width / 2;
    const halfH = three.viewport.height / 2;
    const minHalf = Math.min(halfW, halfH);
    const L = reducedMotion ? 60 : 2.2;
    const par = reducedMotion || experience.isMobile ? 0 : 1;
    let vy = target.vy;
    if (P.anchorY !== undefined && experience.activeEl) {
      const r = experience.activeEl.getBoundingClientRect();
      vy = 1 - (2 * (r.top + r.height * P.anchorY)) / three.size.height;
    }
    const tx = target.vx * halfW + experience.pointer.x * 0.12 * par;
    const ty = vy * halfH + experience.pointer.y * 0.08 * par;
    const ts = target.s * minHalf;

    if (!a.init) {
      // Start in place but at zero size — the core "grows" in on load.
      root.position.set(tx, ty, 0);
      root.scale.setScalar(0.001);
      a.init = true;
    }
    root.position.x = damp(root.position.x, tx, L, dt);
    root.position.y = damp(root.position.y, ty, L, dt);
    root.scale.setScalar(damp(root.scale.x, ts, reducedMotion ? 60 : 1.8, dt));

    a.rings = damp(a.rings, P.rings, L, dt);
    a.labels = damp(a.labels, P.labels, L * 1.4, dt);
    a.tokens = damp(a.tokens, P.tokens, L * 1.4, dt);
    a.spin = damp(a.spin, P.spin, 2, dt);
    const isStory = experience.preset === 'story';
    a.story = damp(a.story, isStory ? 1 : 0, 4, dt);

    const vel = Math.min(Math.abs(experience.velocity) / 2500, 1);
    const t = three.clock.elapsedTime;
    if (!reducedMotion) {
      spin.rotation.y += dt * (0.14 * a.spin + vel * 0.6);
      orbUniforms.uTime.value += dt;
    }
    spin.rotation.x = damp(spin.rotation.x, 0.36 - experience.pointer.y * 0.12 * par, 2, dt);
    spin.rotation.z = damp(spin.rotation.z, -0.14 + experience.pointer.x * 0.08 * par, 2, dt);
    orbUniforms.uAmp.value = damp(orbUniforms.uAmp.value, 0.05 + vel * 0.14, 3, dt);
    haloUniforms.uIntensity.value = 0.32 + experience.dark * 0.38 + vel * 0.2;

    ringRefs.current.forEach((ring, i) => {
      if (!ring) return;
      ring.scale.setScalar(a.rings * (1 + i * 0.16));
      if (!reducedMotion) ring.rotation.z += dt * (0.12 + i * 0.07) * (i % 2 ? -1 : 1);
    });
    beadRefs.current.forEach((bead, j) => {
      if (!bead) return;
      const R = RING_RADII[Math.floor(j / 2)];
      const ang = (reducedMotion ? 0 : t) * (0.45 + j * 0.11) + j * 1.7;
      bead.position.set(Math.cos(ang) * R, Math.sin(ang) * R, 0);
    });

    // Story chapter: the traveling "resilient" token hops Reading ->
    // Listening -> Speaking -> Writing -> back into the core (memory), driven
    // by the pinned ProductStory section's scroll progress.
    const prog = experience.story.progress;
    const seg = Math.min(prog * 5, 4.999);
    const segIndex = Math.floor(seg);
    const active = isStory ? Math.min(4, Math.floor(prog * 5)) : -1;

    nodes.forEach((_, i) => {
      const node = nodeRefs.current[i];
      const gem = gemRefs.current[i];
      const mat = nodeMatRefs.current[i];
      const label = labelRefs.current[i];
      if (!node) return;
      const on = active === i;
      node.scale.setScalar(damp(node.scale.x, on ? 1.8 : 1, 5, dt));
      if (gem && !reducedMotion) gem.rotation.y += dt * 0.8;
      if (mat) mat.emissiveIntensity = damp(mat.emissiveIntensity, on ? 1.4 : 0.4, 5, dt);

      node.getWorldPosition(tmp);
      const depth = tmp.z;
      const fade = smoothstep(depth, -0.6 * root.scale.x, 0.3 * root.scale.x);
      setOpacity(label, a.cache, `l${i}`, a.labels * (0.2 + 0.8 * fade));
      if (label && a.active !== active) label.dataset.active = String(on);
    });
    a.active = active;

    tokenRefs.current.forEach((tok, i) => {
      if (!tok) return;
      const ang = i * (Math.PI / 2) + (reducedMotion ? 0 : t) * 0.12 + 0.4;
      tok.position.set(
        Math.cos(ang) * tokenR,
        (i % 2 === 0 ? 1 : -1) * 0.95 + Math.sin(ang + i) * 0.2,
        Math.sin(ang) * tokenR * 0.7,
      );
      const fade = smoothstep(tok.position.z, -tokenR * 0.7, tokenR * 0.3);
      setOpacity(tokenElRefs.current[i], a.cache, `t${i}`, a.tokens * (1 - a.story) * (0.25 + 0.75 * fade));
    });

    const trav = travelerRef.current;
    if (trav) {
      const f = seg - segIndex;
      const e = f * f * (3 - 2 * f);
      trav.position.lerpVectors(waypoints[segIndex], waypoints[segIndex + 1], e);
      trav.scale.setScalar(Math.max(a.story, 0.001));
      setOpacity(travelerElRef.current, a.cache, 'trav', a.story);
    }
  });

  const seg = lite ? 64 : 128;

  return (
    <group ref={rootRef}>
      <mesh position={[0, 0, -0.6]} renderOrder={-1}>
        <planeGeometry args={[5, 5]} />
        <shaderMaterial
          vertexShader={haloVertex}
          fragmentShader={haloFragment}
          uniforms={haloUniforms}
          transparent
          depthWrite={false}
        />
      </mesh>

      <group ref={spinRef}>
        <mesh>
          <sphereGeometry args={[1, seg, seg]} />
          <shaderMaterial vertexShader={orbVertex} fragmentShader={orbFragment} uniforms={orbUniforms} />
        </mesh>

        {RING_RADII.map((R, i) => (
          <mesh
            key={R}
            ref={(el) => {
              ringRefs.current[i] = el;
            }}
            rotation={RING_TILTS[i]}
          >
            <torusGeometry args={[R, i === 0 ? 0.012 : 0.007, 12, lite ? 96 : 180]} />
            <meshBasicMaterial
              color={i === 1 ? colors.primarySoft : colors.accent}
              transparent
              opacity={i === 0 ? 0.75 : 0.45}
            />
            {[0, 1].map((b) => (
              <mesh
                key={b}
                ref={(el) => {
                  beadRefs.current[i * 2 + b] = el;
                }}
              >
                <sphereGeometry args={[0.035, 12, 12]} />
                <meshBasicMaterial color={b ? colors.warning : colors.accent} />
              </mesh>
            ))}
          </mesh>
        ))}

        {nodes.map((p, i) => (
          <group
            key={SKILLS[i]}
            position={p}
            ref={(el) => {
              nodeRefs.current[i] = el;
            }}
          >
            <mesh
              ref={(el) => {
                gemRefs.current[i] = el;
              }}
            >
              <octahedronGeometry args={[0.16, 0]} />
              <meshStandardMaterial
                ref={(el) => {
                  nodeMatRefs.current[i] = el;
                }}
                color={colors.accentSoft}
                emissive={colors.accent}
                emissiveIntensity={0.4}
                roughness={0.25}
                metalness={0.2}
                flatShading
              />
            </mesh>
            <Html center zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
              <div
                ref={(el) => {
                  labelRefs.current[i] = el;
                }}
                className="landing-core-label"
              >
                {SKILLS[i]}
              </div>
            </Html>
          </group>
        ))}

        <group ref={travelerRef}>
          <mesh>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshBasicMaterial color={colors.warning} />
          </mesh>
          <Html center zIndexRange={[40, 0]} style={{ pointerEvents: 'none' }}>
            <div ref={travelerElRef} className="landing-core-token landing-core-token--traveler" style={{ opacity: 0 }}>
              resilient
            </div>
          </Html>
        </group>
      </group>

      {WORDS.map((w, i) => (
        <group
          key={w}
          ref={(el) => {
            tokenRefs.current[i] = el;
          }}
        >
          <Html center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
            <div
              ref={(el) => {
                tokenElRefs.current[i] = el;
              }}
              className="landing-core-token"
            >
              {w}
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}

export default function ExperienceScene({ colors, lite, reducedMotion }) {
  const palette = useMemo(() => paletteFromColors(colors), [colors]);

  return (
    <>
      <Backdrop palette={palette} lite={lite} reducedMotion={reducedMotion} />
      <Particles palette={palette} lite={lite} reducedMotion={reducedMotion} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 4, 5]} intensity={1.6} />
      <Core palette={palette} colors={colors} lite={lite} reducedMotion={reducedMotion} />
    </>
  );
}
