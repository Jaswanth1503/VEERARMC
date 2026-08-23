"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, Sparkles, PerspectiveCamera } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function BatchingPlant() {
  const mixerRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.rotation.x += delta * 0.5;
    }
  });

  return (
    <group position={[4, -2, -5]} scale={1.5}>
      {/* Silos */}
      <mesh position={[-2, 3, -2]}>
        <cylinderGeometry args={[1, 1, 6, 32]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.2} metalness={0.1} />
      </mesh>
      <mesh position={[0.5, 3, -2]}>
        <cylinderGeometry args={[1, 1, 6, 32]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.2} metalness={0.1} />
      </mesh>
      
      {/* Base Structure */}
      <mesh position={[-0.75, 1, 0]}>
        <boxGeometry args={[4, 2, 3]} />
        <meshStandardMaterial color="#4682B4" roughness={0.7} />
      </mesh>
      
      {/* Conveyor */}
      <mesh position={[2.5, 0.5, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[4, 0.2, 0.8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Mixer Truck representation */}
      <group position={[-1, -1, 3]} rotation={[0, 0.5, 0]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1.5, 1, 3]} />
          <meshStandardMaterial color="#FF5A00" />
        </mesh>
        <mesh ref={mixerRef} position={[0, 1.2, -0.5]} rotation={[0.2, 0, 0]}>
          <cylinderGeometry args={[0.6, 0.8, 1.8, 32]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.5} />
        </mesh>
        {/* Wheels */}
        <mesh position={[-0.8, 0, 1]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[0.8, 0, 1]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[-0.8, 0, -1]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[0.8, 0, -1]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      </group>
    </group>
  );
}

function SceneCamera() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      // Slow subtle camera movement based on mouse
      const targetX = (state.pointer.x * Math.PI) / 10;
      const targetY = (state.pointer.y * Math.PI) / 10;
      
      groupRef.current.rotation.y += 0.02 * (targetX - groupRef.current.rotation.y);
      groupRef.current.rotation.x += 0.02 * (-targetY - groupRef.current.rotation.x);
    }
  });

  return (
    <group ref={groupRef}>
      <PerspectiveCamera makeDefault position={[0, 2, 10]} fov={45} />
    </group>
  );
}

export default function HeroScene() {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
      <SceneCamera />
      
      <color attach="background" args={['transparent']} />
      
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1.5} 
        castShadow 
        color="#fff1e0" // morning sun color
      />
      <directionalLight position={[-10, 5, -5]} intensity={0.5} color="#87CEEB" />

      <BatchingPlant />
      
      <Sparkles 
        count={200} 
        scale={15} 
        size={2} 
        speed={0.2} 
        opacity={0.1} 
        color="#888" 
        position={[5, 2, -2]} 
      />
      
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2}
      />
      <Environment preset="city" />
    </Canvas>
  );
}
