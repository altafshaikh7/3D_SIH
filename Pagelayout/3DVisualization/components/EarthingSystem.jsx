
import React, { useMemo, useState } from 'react';
import { Box, Cylinder, Text } from '@react-three/drei';
import * as THREE from 'three';


// --- MATERIALS ---
export const MAT_GI_STRIP = new THREE.MeshStandardMaterial({ 
    color: "#cbd5e1", 
    roughness: 0.6, 
    metalness: 0.7,
    flatShading: false
});

const MAT_PIT_CONCRETE = new THREE.MeshStandardMaterial({ color: "#78716c", roughness: 0.9 });
const MAT_PIT_COVER = new THREE.MeshStandardMaterial({ color: "#166534", roughness: 0.8 }); 
const MAT_PIT_TEXT = new THREE.MeshBasicMaterial({ color: "#ffffff" });

// --- INTERFACE ---


// --- COMPONENTS ---

export const GIStrip = React.memo(({ start, end, onSelect, id }) => {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    const length = startVec.distanceTo(endVec);
    
    const position = startVec.clone().lerp(endVec, 0.5);
    const direction = endVec.clone().sub(startVec).normalize();
    
    const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), direction);

    const generatedId = id || `GI-STRIP-${position.x.toFixed(0)}-${position.z.toFixed(0)}`;

    const handleClick = (e) => {
        e.stopPropagation();
        if (onSelect) {
            onSelect({
                id: generatedId,
                name: 'Earthing System (GI Strip)',
                type: 'earthing',
                data: {
                    material: 'Galvanized Iron',
                    dim: '75x10mm'
                }
            });
        }
    };

    return (
        <group 
            name={generatedId}
            position={position} 
            quaternion={quaternion}
            onClick={handleClick}
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'auto'}
        >
            {/* The Strip: Length x Thickness x Width */}
            {/* OPTIMIZED: Single box mesh used instead of repetitive clamp geometry to reduce draw calls */}
            <Box args={[length, 0.02, 0.15]} material={MAT_GI_STRIP} castShadow={false} receiveShadow />
        </group>
    );
}, (prev, next) => {
    return prev.start[0] === next.start[0] && prev.start[1] === next.start[1] && prev.start[2] === next.start[2] &&
           prev.end[0] === next.end[0] && prev.end[1] === next.end[1] && prev.end[2] === next.end[2] &&
           prev.id === next.id;
});

export const GroundRiser = React.memo(({ position, height, offset=[0,0,0], onSelect }) => {
    const [x, y, z] = position;
    const [ox, oy, oz] = offset;
    const id = `RISER-${x.toFixed(1)}-${z.toFixed(1)}`;

    const handleClick = (e) => {
        e.stopPropagation();
        if (onSelect) {
            onSelect({
                id: id,
                name: 'Equipment Earthing Riser',
                type: 'earthing'
            });
        }
    };
    
    return (
        <group 
            name={id}
            position={[x + ox, 0, z + oz]}
            onClick={handleClick}
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'auto'}
        >
            {/* Vertical Riser - Simplified low-poly geometry */}
            <Box args={[0.02, height + y + oy, 0.1]} position={[0, (height + y + oy)/2, 0]} material={MAT_GI_STRIP} />
            {/* Bolt - Low segment count (6) */}
            <Cylinder args={[0.03, 0.03, 0.05, 6]} rotation={[0, 0, Math.PI/2]} position={[0, height + y + oy - 0.1, 0]} material={MAT_GI_STRIP} />
        </group>
    );
}, (prev, next) => {
     return prev.position[0] === next.position[0] && prev.position[1] === next.position[1] && prev.position[2] === next.position[2] &&
            prev.height === next.height &&
            prev.offset[0] === next.offset[0] && prev.offset[1] === next.offset[1] && prev.offset[2] === next.offset[2];
});

export const EarthPit = React.memo(({ position, onSelect, id }) => {
    const generatedId = id || `EARTH-PIT-${position[0].toFixed(0)}-${position[2].toFixed(0)}`;

    const handleClick = (e) => {
        e.stopPropagation();
        if (onSelect) {
            onSelect({
                id: generatedId,
                name: 'Maintenance Earth Pit',
                type: 'earthing'
            });
        }
    };

    return (
        <group 
            name={generatedId}
            position={position}
            onClick={handleClick}
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'auto'}
        >
            <Box args={[0.8, 0.1, 0.8]} position={[0, 0.05, 0]} material={MAT_PIT_CONCRETE} />
            <Box args={[0.6, 0.05, 0.6]} position={[0, 0.1, 0]} material={MAT_PIT_COVER}>
                <meshStandardMaterial color="#15803d" roughness={0.5} metalness={0.2} />
            </Box>
            <Text 
                position={[0, 0.13, 0]} 
                rotation={[-Math.PI/2, 0, 0]} 
                fontSize={0.08} 
                color="white"
                anchorX="center" 
                anchorY="middle"
                material={MAT_PIT_TEXT}
            >
                EARTH PIT
            </Text>
            {/* Connection stub */}
            <Box args={[1.2, 0.02, 0.1]} position={[0, 0.02, 0]} rotation={[0, Math.PI/4, 0]} material={MAT_GI_STRIP} />
        </group>
    );
}, (prev, next) => {
    return prev.position[0] === next.position[0] && prev.position[1] === next.position[1] && prev.position[2] === next.position[2] && prev.id === next.id;
});
