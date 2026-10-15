import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SPAWN, groundHeightAt, nearestPortal, resolveMove, shortestAngleDelta } from './worldLayout';

/* =========================================================================
   3D HERO (THIRD PERSON EXPLORER)
   - WASD / strelkalar, Shift — sprint; mobil joystik va sprint tugmasi (ref orqali)
   - Harakat worldLayout.js bo'yicha cheklanadi (suvga chiqib ketmaydi)
   - Yaqin portal o'zgarganda onNearPortalChange (har kadrda setState qilinmaydi)
   ========================================================================= */

const KEY_MAP = {
  KeyW: 'forward', ArrowUp: 'forward',
  KeyS: 'backward', ArrowDown: 'backward',
  KeyA: 'left', ArrowLeft: 'left',
  KeyD: 'right', ArrowRight: 'right',
  ShiftLeft: 'sprint', ShiftRight: 'sprint',
};

const isTypingTarget = (el) => {
  const tag = el?.tagName?.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || el?.isContentEditable;
};

const CAM_OFFSET = new THREE.Vector3(0, 3.4, 5.8);

export function PlayerHero3D({ joystickRef, sprintRef, positionRef, onNearPortalChange, frozen = false }) {
  const group = useRef();
  const keys = useRef({ forward: false, backward: false, left: false, right: false, sprint: false });
  const nearKey = useRef(null);
  const walkCycle = useRef(0);
  const breathCycle = useRef(0);
  const leftLeg = useRef();
  const rightLeg = useRef();
  const leftArm = useRef();
  const rightArm = useRef();
  const torsoRef = useRef();
  const tmp = useMemo(() => ({ dir: new THREE.Vector3(), cam: new THREE.Vector3() }), []);

  useEffect(() => {
    const down = (e) => {
      if (isTypingTarget(document.activeElement)) return;
      const k = KEY_MAP[e.code];
      if (!k) return;
      keys.current[k] = true;
      if (k !== 'sprint') e.preventDefault(); // strelkalar sahifani aylantirmasin
    };
    const up = (e) => {
      const k = KEY_MAP[e.code];
      if (k) keys.current[k] = false;
    };
    // Oyna fokusni yo'qotsa keyup kelmaydi — personaj "yopishib" yurib ketmasin.
    const reset = () => {
      for (const k of Object.keys(keys.current)) keys.current[k] = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', reset);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', reset);
    };
  }, []);

  useFrame((state, rawDelta) => {
    const g = group.current;
    if (!g) return;
    // Tab qaytganda katta delta personajni "teleport" qilmasin.
    const delta = Math.min(rawDelta, 0.05);
    const k = keys.current;
    const isSprint = k.sprint || !!sprintRef?.current;
    const dir = tmp.dir.set(0, 0, 0);

    if (!frozen) {
      if (k.forward) dir.z -= 1;
      if (k.backward) dir.z += 1;
      if (k.left) dir.x -= 1;
      if (k.right) dir.x += 1;
      const joy = joystickRef?.current;
      if (joy && (Math.abs(joy.x) > 0.05 || Math.abs(joy.y) > 0.05)) {
        dir.x += joy.x;
        dir.z += joy.y;
      }
    }

    const isMoving = dir.lengthSq() > 0.0025;

    if (isMoving) {
      // Joystikni yarim egish sekin yurishni bildiradi; klaviatura bilan to'liq tezlik.
      const magnitude = Math.min(1, dir.length());
      dir.normalize().multiplyScalar((isSprint ? 9.5 : 5.8) * delta * magnitude);
      const targetAngle = Math.atan2(dir.x, dir.z);
      g.rotation.y += shortestAngleDelta(g.rotation.y, targetAngle) * 0.18;
      const next = resolveMove(g.position.x, g.position.z, dir.x, dir.z);
      g.position.x = next.x;
      g.position.z = next.z;

      walkCycle.current += delta * (isSprint ? 14 : 9.5);
      const swing = Math.sin(walkCycle.current) * (isSprint ? 0.75 : 0.45);
      if (leftLeg.current) leftLeg.current.rotation.x = swing;
      if (rightLeg.current) rightLeg.current.rotation.x = -swing;
      if (leftArm.current) leftArm.current.rotation.x = -swing * 0.75;
      if (rightArm.current) rightArm.current.rotation.x = swing * 0.75;
    } else {
      breathCycle.current += delta * 2;
      if (torsoRef.current) torsoRef.current.position.y = 1.2 + Math.sin(breathCycle.current) * 0.03;
      for (const limb of [leftLeg, rightLeg, leftArm, rightArm]) {
        if (limb.current) limb.current.rotation.x = THREE.MathUtils.lerp(limb.current.rotation.x, 0, 0.12);
      }
    }

    const ground = groundHeightAt(g.position.x, g.position.z);
    if (ground != null) g.position.y = THREE.MathUtils.lerp(g.position.y, ground, 0.2);

    // Kamera personaj orqasidan yumshoq ergashadi.
    tmp.cam.copy(g.position).add(CAM_OFFSET);
    state.camera.position.lerp(tmp.cam, 0.12);
    state.camera.lookAt(g.position.x, g.position.y + 1.6, g.position.z - 3);

    if (positionRef) positionRef.current = { x: g.position.x, z: g.position.z, rot: g.rotation.y };

    const near = nearestPortal(g.position.x, g.position.z);
    const key = near ? near.key : null;
    if (key !== nearKey.current) {
      nearKey.current = key;
      onNearPortalChange?.(key);
    }
  });

  return (
    <group ref={group} position={[SPAWN.x, 0.95, SPAWN.z]} rotation={[0, Math.PI, 0]}>
      {/* BOSH VA SOCH */}
      <group position={[0, 1.88, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.26, 16, 16]} />
          <meshStandardMaterial color="#fed7aa" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.08, -0.05]} castShadow>
          <sphereGeometry args={[0.28, 16, 16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>
      </group>

      {/* TANA VA JILET */}
      <group ref={torsoRef} position={[0, 1.2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.55, 0.76, 0.35]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.02]} castShadow>
          <boxGeometry args={[0.58, 0.72, 0.36]} />
          <meshStandardMaterial color="#1e3a8a" roughness={0.6} />
        </mesh>
        {/* RYUKZAK VA "V" EMBLEMASI */}
        <group position={[0, 0.04, -0.27]}>
          <mesh castShadow>
            <boxGeometry args={[0.44, 0.56, 0.24]} />
            <meshStandardMaterial color="#0f172a" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.02, -0.13]}>
            <coneGeometry args={[0.1, 0.16, 3]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.9} />
          </mesh>
        </group>
      </group>

      {/* QO'LLAR */}
      {[[leftArm, -0.38], [rightArm, 0.38]].map(([ref, x]) => (
        <group key={x} ref={ref} position={[x, 1.45, 0]}>
          <mesh position={[0, -0.28, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.08, 0.58, 8]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[0, -0.58, 0]} castShadow>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#020617" roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* OYOQLAR VA ETIKLAR */}
      {[[leftLeg, -0.18], [rightLeg, 0.18]].map(([ref, x]) => (
        <group key={x} ref={ref} position={[x, 0.8, 0]}>
          <mesh position={[0, -0.38, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.1, 0.75, 8]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.78, 0.06]} castShadow>
            <boxGeometry args={[0.16, 0.16, 0.28]} />
            <meshStandardMaterial color="#020617" roughness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
