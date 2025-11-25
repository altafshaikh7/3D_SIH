import React, { useLayoutEffect, useRef } from "react";
import { Plane } from "@react-three/drei";
import * as THREE from "three";

const SubstationGround = () => {
  const width = 800;
  const depth = 220;
  const xOffset = 200;

  const segmentWidth = 5;

  const numX = Math.floor(width / segmentWidth);
  const numZ = Math.floor(depth / segmentWidth);
  const totalInstances = numX * 2 + numZ * 2;

  const postRef = useRef(null);
  const panelRef = useRef(null);
  const railRef = useRef(null);

  useLayoutEffect(() => {
    if (!postRef.current || !panelRef.current || !railRef.current) return;

    const tempObject = new THREE.Object3D();
    let index = 0;

    const placeSegment = (x, z, rotY) => {
      tempObject.position.set(x, 0, z);
      tempObject.rotation.set(0, rotY, 0);
      tempObject.updateMatrix();

      postRef.current.setMatrixAt(index, tempObject.matrix);
      panelRef.current.setMatrixAt(index, tempObject.matrix);
      railRef.current.setMatrixAt(index, tempObject.matrix);
      index += 1;
    };

    for (let i = 0; i < numX; i += 1) {
      const x = -width / 2 + i * segmentWidth + segmentWidth / 2;
      placeSegment(x, depth / 2, 0);
    }
    for (let i = 0; i < numX; i += 1) {
      const x = -width / 2 + i * segmentWidth + segmentWidth / 2;
      placeSegment(x, -depth / 2, 0);
    }
    for (let i = 0; i < numZ; i += 1) {
      const z = -depth / 2 + i * segmentWidth + segmentWidth / 2;
      placeSegment(-width / 2, z, Math.PI / 2);
    }
    for (let i = 0; i < numZ; i += 1) {
      const z = -depth / 2 + i * segmentWidth + segmentWidth / 2;
      placeSegment(width / 2, z, Math.PI / 2);
    }

    postRef.current.instanceMatrix.needsUpdate = true;
    panelRef.current.instanceMatrix.needsUpdate = true;
    railRef.current.instanceMatrix.needsUpdate = true;
  }, [numX, numZ, totalInstances, width, depth, segmentWidth]);

  return (
    <group position={[xOffset, 0, 0]}>
      <Plane
        args={[5000, 5000]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-xOffset, -0.1, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#14532d" roughness={1} />
      </Plane>

      <Plane
        args={[width + 10, depth + 10]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#57534e" roughness={1} metalness={0} />
      </Plane>

      <group>
        <instancedMesh
          ref={postRef}
          args={[undefined, undefined, totalInstances]}
          castShadow={false}
        >
          <cylinderGeometry args={[0.08, 0.08, 2.5]} />
          <meshStandardMaterial
            color="#64748b"
            metalness={0.5}
            roughness={0.5}
          />
        </instancedMesh>

        <instancedMesh ref={panelRef} args={[undefined, undefined, totalInstances]}>
          <planeGeometry args={[segmentWidth, 2.5]} />
          <meshStandardMaterial
            color="#94a3b8"
            transparent
            opacity={0.25}
            side={THREE.DoubleSide}
            wireframe={false}
          />
        </instancedMesh>

        <instancedMesh ref={railRef} args={[undefined, undefined, totalInstances]}>
          <boxGeometry args={[segmentWidth, 0.05, 0.05]} />
          <meshStandardMaterial color="#cbd5e1" />
        </instancedMesh>
      </group>
    </group>
  );
};

export default SubstationGround;
