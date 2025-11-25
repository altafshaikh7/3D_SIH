
import React, { useState, useRef, useMemo } from 'react';
import { Cylinder, Torus, Box, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { GroundRiser } from './EarthingSystem';



// --- MATERIALS ---
const MAT_PORCELAIN_BROWN = new THREE.MeshStandardMaterial({ color: "#662a18", roughness: 0.1, metalness: 0.1 }); 
const MAT_ALUMINIUM = new THREE.MeshStandardMaterial({ color: "#e2e8f0", roughness: 0.3, metalness: 0.6 });
const MAT_BASE_STEEL = new THREE.MeshStandardMaterial({ color: "#64748b", roughness: 0.6, metalness: 0.4 });
const MAT_COUNTER_BOX = new THREE.MeshStandardMaterial({ color: "#f1f5f9", roughness: 0.3 });
// Distinct Grey for the Ring
const MAT_GREY_RING = new THREE.MeshStandardMaterial({ color: "#808080", roughness: 0.5, metalness: 0.3 });

// OPTIMIZED: Reduced segments from 8/12 to 6/8
const ArresterStack = ({ height, radius, sheds }) => {
    const shedSpacing = height / sheds;
    return (
        <group>
            <Cylinder args={[radius * 0.8, radius * 0.8, height, 6]} position={[0, height/2, 0]} material={MAT_PORCELAIN_BROWN} />
            {Array.from({ length: sheds }).map((_, i) => (
                 <Cylinder 
                    key={i}
                    args={[radius * 1.8, radius * 1.4, 0.04, 8]} 
                    position={[0, (i * shedSpacing) + (shedSpacing * 0.5), 0]}
                    material={MAT_PORCELAIN_BROWN}
                />
            ))}
        </group>
    );
};

const LightningArrester = React.memo(({ id, position, onSelect }) => {
    const [hovered, setHovered] = useState(false);
    const groupRef = useRef(null);
    
    useFrame((state, delta) => {
        if (groupRef.current) {
            const targetScale = hovered ? 1.05 : 1;
            const step = Math.min(delta * 10, 1);
            groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), step);
        }
    });

    const handleClick = (e) => {
        e.stopPropagation();
        if (onSelect) {
            onSelect({
                id: id,
                name: `Surge Arrester (ZnO)`,
                type: 'lightningArrester'
            });
        }
    };

    return (
        <group 
            ref={groupRef}
            name={id}
            position={position} 
            onClick={handleClick}
            onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
        >
            <GroundRiser position={[0, 0, 0]} height={0.2} offset={[0, 0, 0.2]} />

            {/* Base Plate */}
            <group>
                <Box args={[0.6, 0.1, 0.6]} position={[0, 0.05, 0]} material={MAT_BASE_STEEL} />
                <Cylinder args={[0.05, 0.05, 0.2, 4]} position={[0.2, 0.2, 0.2]} material={MAT_PORCELAIN_BROWN} />
                <Cylinder args={[0.05, 0.05, 0.2, 4]} position={[-0.2, 0.2, 0.2]} material={MAT_PORCELAIN_BROWN} />
                <Cylinder args={[0.05, 0.05, 0.2, 4]} position={[0.2, 0.2, -0.2]} material={MAT_PORCELAIN_BROWN} />
                <Cylinder args={[0.05, 0.05, 0.2, 4]} position={[-0.2, 0.2, -0.2]} material={MAT_PORCELAIN_BROWN} />
                <Box args={[0.25, 0.35, 0.15]} position={[0.35, 0.4, 0]} material={MAT_COUNTER_BOX} />
            </group>

            {/* Bottom Section */}
            <group position={[0, 0.3, 0]}>
                <Cylinder args={[0.16, 0.16, 0.05, 8]} position={[0, 0.025, 0]} material={MAT_ALUMINIUM} />
                <group position={[0, 0.05, 0]}>
                     <ArresterStack height={1.6} radius={0.11} sheds={12} />
                </group>
                <Cylinder args={[0.16, 0.16, 0.08, 8]} position={[0, 1.69, 0]} material={MAT_ALUMINIUM} />
            </group>

            {/* Top Section */}
            <group position={[0, 2.07, 0]}>
                 <group position={[0, 0, 0]}>
                     <ArresterStack height={1.6} radius={0.09} sheds={12} />
                </group>
                <Cylinder args={[0.12, 0.12, 0.05, 8]} position={[0, 1.625, 0]} material={MAT_ALUMINIUM} />
            </group>

            {/* Grading Ring - Drastically Reduced Polygon Count */}
            <group position={[0, 3.4, 0]}>
                <mesh rotation={[Math.PI/2, 0, 0]} position={[0, 0, 0]} material={MAT_GREY_RING}>
                    {/* Reduced tubular segments from 16 to 8, radial from 6 to 5 */}
                    <torusGeometry args={[0.4, 0.025, 5, 8]} />
                </mesh>
                <group rotation={[0, Math.PI/4, 0]}>
                     <Cylinder args={[0.015, 0.015, 0.4, 3]} rotation={[0, 0, Math.PI/3]} position={[0.18, -0.12, 0]} material={MAT_GREY_RING} />
                     <Cylinder args={[0.015, 0.015, 0.4, 3]} rotation={[0, 0, -Math.PI/3]} position={[-0.18, -0.12, 0]} material={MAT_GREY_RING} />
                </group>
            </group>

            <Cylinder args={[0.03, 0.03, 0.4, 4]} position={[0, 3.9, 0]} material={MAT_ALUMINIUM} />

            {hovered && (
                <Html position={[0, 4.5, 0]} center distanceFactor={15}>
                    <div className="bg-white text-black px-2 py-1 text-xs font-bold border border-black shadow-sm whitespace-nowrap pointer-events-none">
                        Surge Arrester
                    </div>
                </Html>
            )}
        </group>
    );
}, (prev, next) => {
    return prev.id === next.id && 
           prev.position[0] === next.position[0] &&
           prev.position[1] === next.position[1] &&
           prev.position[2] === next.position[2];
});

export default LightningArrester;
