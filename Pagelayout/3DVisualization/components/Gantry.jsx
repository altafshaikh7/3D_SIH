
import React, { useMemo, useState } from 'react';
import { Box } from '@react-three/drei';
import * as THREE from 'three';

import { GroundRiser } from './EarthingSystem';



// --- SHARED GLOBAL MATERIALS ---
const MAT_LATTICE = new THREE.MeshStandardMaterial({ color: "#cbd5e1", roughness: 0.4, metalness: 0.3 });
const MAT_BEAM = new THREE.MeshStandardMaterial({ color: "#cbd5e1", roughness: 0.4, metalness: 0.4 });

// --- Optimized Ultra-Low-Poly Gantry ---
// Replaced multiple small boxes for lattice with simpler, thicker posts to reduce draw calls
const LatticeTowerHigh = React.memo(({ height, position }) => {
    return (
        <group position={position}>
            {/* 4 Corner Posts - Main Structure */}
            <Box args={[0.3, height, 0.3]} position={[-0.5, height/2, -0.5]} material={MAT_LATTICE} castShadow={false} />
            <Box args={[0.3, height, 0.3]} position={[0.5, height/2, -0.5]} material={MAT_LATTICE} castShadow={false} />
            <Box args={[0.3, height, 0.3]} position={[-0.5, height/2, 0.5]} material={MAT_LATTICE} castShadow={false} />
            <Box args={[0.3, height, 0.3]} position={[0.5, height/2, 0.5]} material={MAT_LATTICE} castShadow={false} />
            
            {/* Struts - DRASTICALLY REDUCED COUNT */}
            {/* Only rendering 3 levels of cross-struts instead of one every unit */}
            {[0.2, 0.5, 0.8].map((ratio, i) => (
                 <group key={i} position={[0, height * ratio, 0]}>
                    <Box args={[1.4, 0.2, 0.2]} material={MAT_LATTICE} castShadow={false} />
                    <Box args={[0.2, 0.2, 1.4]} material={MAT_LATTICE} castShadow={false} />
                 </group>
            ))}
        </group>
    );
});

const LatticeBeamHigh = React.memo(({ length, position }) => {
    return (
        <group position={position}>
            {/* Top/Bottom Chords */}
            <Box args={[length, 0.25, 0.8]} position={[0, 0.4, 0]} material={MAT_BEAM} castShadow={false} />
            <Box args={[length, 0.25, 0.8]} position={[0, -0.4, 0]} material={MAT_BEAM} castShadow={false} />
            
            {/* Vertical struts - Reduced frequency */}
            {Array.from({ length: Math.floor(length / 10) }).map((_, i) => {
                 const x = -length/2 + 2 + i * 10;
                 return (
                    <group key={i} position={[x, 0, 0]}>
                        <Box args={[0.4, 0.8, 0.8]} material={MAT_BEAM} castShadow={false} />
                    </group>
                 );
            })}
        </group>
    );
});

const Gantry = React.memo(({ id='GANTRY', width = 20, height = 18, levels = 1, position, onSelect }) => {
    const [hovered, setHovered] = useState(false);

    const handleClick = (e) => {
        e.stopPropagation();
        if (onSelect) {
            onSelect({
                id: id,
                name: 'Steel Gantry Structure',
                type: 'unknown'
            });
        }
    };

    return (
        <group 
            position={position} 
            name={id}
            onClick={handleClick}
            onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
        >
             {/* EARTHING CONNECTIONS - Risers on both tower legs */}
             <GroundRiser position={[-width/2, 0, 0]} height={1.5} offset={[0.6, 0, 0.6]} />
             <GroundRiser position={[width/2, 0, 0]} height={1.5} offset={[-0.6, 0, 0.6]} />

             <LatticeTowerHigh height={height} position={[-width/2, 0, 0]} />
             <LatticeTowerHigh height={height} position={[width/2, 0, 0]} />
             {levels === 2 && (
                <LatticeBeamHigh length={width} position={[0, height * 0.6, 0]} />
             )}
             <LatticeBeamHigh length={width} position={[0, height * 0.9, 0]} />
        </group>
    )
}, (prev, next) => {
    const posSame = prev.position[0] === next.position[0] && 
                    prev.position[1] === next.position[1] && 
                    prev.position[2] === next.position[2];
    return posSame && prev.id === next.id;
});

export default Gantry;
