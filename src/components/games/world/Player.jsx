import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

export function Player({ gameState, onInteract }) {
  const group = useRef();
  // Using a placeholder professional humanoid model (standard GLB)
  // In a real production env, this path would point to our specific S3 asset
  const { scene, animations } = useGLTF('https://vazxxyzbcoksbooxsfg//models/humanoid.glb');
  const { actions } = useAnimations(animations, group);

  const velocity = useRef(new THREE.Vector3());
  const [input, setInput] = useState({
    forward: false, backward: false, left: false, right: false,
  });

  useEffect(() => {
    // Initialize animations
    if (actions.idle) actions.idle.play();

    const handleKeyDown = (e) => {
      if (e.code === 'KeyW') setInput(prev => ({ ...prev, forward: true }));
      if (e.code === 'KeyS') setInput(prev => ({ ...prev, backward: true }));
      if (e.code === 'KeyA') setInput(prev => ({ ...prev, left: true }));
      if (e.code === 'KeyD') setInput(prev => ({ ...prev, right: true }));
      if (e.code === 'KeyE') onInteract('generic');
    };

    const handleKeyUp = (e) => {
      if (e.code === 'KeyW') setInput(prev => ({ ...prev, forward: false }));
      if (e.code === 'KeyS') setInput(prev => ({ ...prev, backward: false }));
      if (e.code === 'KeyA') setInput(prev => ({ ...prev, left: false }));
      if (e.code === 'KeyD') setInput(prev => ({ ...prev, right: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [actions, onInteract]);

  useFrame((state, delta) => {
    if (gameState !== 'in_progress' && gameState !== 'ready') return;

    const moveSpeed = 5 * delta;
    const direction = new THREE.Vector3();

    if (input.forward) direction.z -= 1;
    if (input.backward) direction.z += 1;
    if (input.left) direction.x -= 1;
    if (input.right) direction.x += 1;

    const isMoving = direction.length() > 0;
    direction.normalize().multiplyScalar(moveSpeed);

    // Animation State Transition
    if (isMoving) {
      if (actions.walk && !actions.walk.isRunning()) {
        actions.idle.fadeOut(0.2);
        actions.walk.reset().fadeIn(0.2).play();
      }
    } else {
      if (actions.idle && !actions.idle.isRunning()) {
        actions.walk.fadeOut(0.2);
        actions.idle.reset().fadeIn(0.2).play();
      }
    }

    // Movement and Rotation
    if (isMoving) {
      const targetRotation = Math.atan2(direction.x, direction.z);
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRotation, 0.1);
    }

    group.current.position.add(direction);

    // Professional Camera Follow
    const camOffset = new THREE.Vector3(0, 5, 10);
    const targetCamPos = group.current.position.clone().add(camOffset);
    state.camera.position.lerp(targetCamPos, 0.1);
    state.camera.lookAt(group.current.position);
  });

  return (
    <group ref={group} dispose={null}>
      <primitive object={scene} scale={1} position={[0, 0, 0]} castShadow />
    </group>
  );
}
