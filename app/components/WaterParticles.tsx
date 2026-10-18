"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Particles() {
  const meshRef = useRef<THREE.Points>(null);
  const count = 120;

  const particleData = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const off = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
      spd[i] = 0.2 + Math.random() * 0.5;
      off[i] = Math.random() * Math.PI * 2;
    }
    return { positions: pos, speeds: spd, offsets: off };
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(particleData.positions.slice(), 3)
    );
    return geo;
  }, [particleData]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const posAttr = meshRef.current.geometry.getAttribute(
      "position"
    ) as THREE.BufferAttribute;
    const t = clock.getElapsedTime();
    const { positions, speeds, offsets } = particleData;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      posAttr.array[idx] =
        positions[idx] + Math.sin(t * speeds[i] + offsets[i]) * 0.3;
      posAttr.array[idx + 1] =
        positions[idx + 1] +
        Math.cos(t * speeds[i] * 0.7 + offsets[i]) * 0.4;
      posAttr.array[idx + 2] =
        positions[idx + 2] +
        Math.sin(t * speeds[i] * 0.5 + offsets[i] * 2) * 0.2;
    }
    posAttr.needsUpdate = true;
  });

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.06,
        color: new THREE.Color("#f5b24c"),
        transparent: true,
        opacity: 0.5,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  return <points ref={meshRef} geometry={geometry} material={material} />;
}

function FloatingLight() {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (!lightRef.current) return;
    const t = clock.getElapsedTime();
    lightRef.current.position.x = Math.sin(t * 0.3) * 3;
    lightRef.current.position.y = Math.cos(t * 0.2) * 2;
  });

  return (
    <pointLight ref={lightRef} color="#d4bfeb" intensity={0.8} distance={8} />
  );
}

export default function WaterParticles() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.1} />
        <FloatingLight />
        <Particles />
      </Canvas>
    </div>
  );
}
