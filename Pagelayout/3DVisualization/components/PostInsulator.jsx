
import React, { useMemo } from 'react';
import { Cylinder, Box, Torus } from '@react-three/drei';
import * as THREE from 'three';

const PostInsulator = React.memo(({ position }) => {
  const metalMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#94a3b8", roughness: 0.5, metalness: 0.6 }), []);
  const insulatorMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#7c2d12", roughness: 0.2 }), []);
  const baseMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#a8a29e" }), []);

  return (
    <group position={position}>
      {/* Concrete Base */}
      <Box args={[0.5, 0.2, 0.5]} position={[0, 0.1, 0]} material={baseMat} />

      {/* Steel Stand */}
      <Cylinder args={[0.08, 0.08, 2.5]} position={[0, 1.45, 0]} material={metalMat} />
      <Box args={[0.4, 0.1, 0.4]} position={[0, 2.7, 0]} material={metalMat} />

      {/* Insulator Column */}
      <Cylinder args={[0.1, 0.12, 2]} position={[0, 3.7, 0]} material={insulatorMat} />
      
      {/* Sheds - Low Poly (4 radial segments for performance) */}
       {Array.from({ length: 6 }).map((_, i) => (
          <Torus key={i} args={[0.22, 0.04, 3, 4]} position={[0, 2.9 + i * 0.25, 0]} rotation={[Math.PI/2, 0, 0]} material={insulatorMat} />
       ))}

       {/* Top Clamp */}
       <Box args={[0.15, 0.2, 0.15]} position={[0, 4.8, 0]} material={metalMat} />
    </group>
  )
});

export default PostInsulator;
