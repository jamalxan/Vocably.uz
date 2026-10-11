import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei'; // Note: Need to wrap app in KeyboardControls
import * as THREE from 'three';

export function Player({ gameState, onInteract }) {
  const meshRef = useRef();
  const velocity = useRef(new THREE.Vector3());
  const position = useRef(new THREE.Vector3(0, 1, 0));

  // Simple Input State
  const [input, setInput] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  // Input Listener
  useEffect(() => {
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
  }, [onInteract]);

  useFrame((state, delta) => {
    if (gameState !== 'in_progress' && gameState !== 'ready') return;

    const moveSpeed = 5 * delta;
    const rotationSpeed = 2 * delta;

    // Movement Vector
    const direction = new THREE.Vector3();
    if (input.forward) direction.z -= 1;
    if (input.backward) direction.z += 1;
    if (input.left) direction.x -= 1;
    if (input.right) direction.x += 1;

    direction.normalize().multiplyScalar(moveSpeed);

    // Simple rotation to face movement direction
    if (direction.length() > 0) {
      const targetRotation = Math.atan2(direction.x, direction.z);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        targetRotation,
        0.1
      );
    }

    // Apply movement
    meshRef.current.position.add(direction);

    // Camera follow (Simple lerp)
    const camOffset = new THREE.Vector3(0, 5, 10);
    const targetCamPos = meshRef.current.position.clone().add(camOffset);
    state.camera.position.lerp(targetCamPos, 0.1);
    state.camera.lookAt(meshRef.current.position);
  });

  return (
    <mesh ref={meshRef} position={[0, 1, 0]} castShadow>
      <capsuleGeometry args={[0.5, 1, 4, 8]} />
      <meshStandardMaterial color="#00f0b5" emissive="#00f0b5" emissiveIntensity={0.5} />
    </mesh>
  );
}
