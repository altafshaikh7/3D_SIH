
import React, { useState, useRef, useMemo } from 'react';
import { Box, Cylinder, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { GroundRiser } from './EarthingSystem';



// --- MATERIALS ---
const MAT_PORCELAIN = new THREE.MeshStandardMaterial({ color: "#7c2d12", roughness: 0.2 }); 
const MAT_GALV_STEEL = new THREE.MeshStandardMaterial({ color: "#cbd5e1", roughness: 0.4, metalness: 0.5 }); 
const MAT_ALUMINIUM = new THREE.MeshStandardMaterial({ color: "#e2e8f0", roughness: 0.3, metalness: 0.6 }); 
const MAT_COPPER = new THREE.MeshStandardMaterial({ color: "#b45309", roughness: 0.5, metalness: 0.6 }); 
const MAT_BLUE_PILLAR = new THREE.MeshStandardMaterial({ color: "#0056b3", roughness: 0.6, metalness: 0.1 }); 
const MAT_BOX_GREY = new THREE.MeshStandardMaterial({ color: "#94a3b8", roughness: 0.4 });

// --- SUB-COMPONENTS ---

const InsulatorStack = React.memo(({ height }) => {
    const sheds = 7;
    const shedSpacing = height / sheds;
    
    return (
        <group>
            {/* Reduced segments to 8 for core */}
            <Cylinder args={[0.12, 0.14, height, 8]} position={[0, height/2, 0]} material={MAT_PORCELAIN} />
            
            {Array.from({ length: sheds }).map((_, i) => (
                 <Cylinder 
                    key={i} 
                    args={[0.22, 0.22, 0.04, 8]} 
                    position={[0, (i * shedSpacing) + 0.2, 0]} 
                    material={MAT_PORCELAIN} 
                 />
            ))}

            <Cylinder args={[0.16, 0.16, 0.1, 8]} position={[0, 0.05, 0]} material={MAT_GALV_STEEL} />
            <Cylinder args={[0.16, 0.16, 0.1, 8]} position={[0, height-0.05, 0]} material={MAT_GALV_STEEL} />
        </group>
    )
});

const BlueSupportPillar = React.memo(({ height }) => {
    return (
        <group>
            <Box args={[0.8, 0.05, 0.8]} position={[0, 0.025, 0]} material={MAT_BLUE_PILLAR} />
            {/* Reduced segments to 8 */}
            <Cylinder args={[0.25, 0.25, height, 8]} position={[0, height/2, 0]} material={MAT_BLUE_PILLAR} />
            <Box args={[0.6, 0.05, 0.6]} position={[0, height, 0]} material={MAT_BLUE_PILLAR} />
        </group>
    );
});

const Isolator = React.memo(({ id, position, rotation = [0, 0, 0], isOpen = false, onSelect }) => {
    const [hovered, setHovered] = useState(false);
    
    const leftStackRef = useRef(null);
    const rightStackRef = useRef(null);
    const linkageRef = useRef(null);
    const groupRef = useRef(null);
    
    const openAngle = Math.PI / 2.2; 

    useFrame((state, delta) => {
        const step = Math.min(delta * 3, 1);
        
        if (leftStackRef.current && rightStackRef.current) {
            const targetRotLeft = isOpen ? -openAngle : 0;
            const targetRotRight = isOpen ? openAngle : 0;
            
            leftStackRef.current.rotation.y = THREE.MathUtils.lerp(leftStackRef.current.rotation.y, targetRotLeft, step);
            rightStackRef.current.rotation.y = THREE.MathUtils.lerp(rightStackRef.current.rotation.y, targetRotRight, step);
        }

        if (linkageRef.current) {
             const targetLinkRot = isOpen ? Math.PI / 2 : 0;
             linkageRef.current.rotation.y = THREE.MathUtils.lerp(linkageRef.current.rotation.y, targetLinkRot, step);
        }

        if (groupRef.current) {
            const targetScale = hovered ? 1.02 : 1;
            groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), step);
        }
    });

    const handleClick = (e) => {
        e.stopPropagation();
        if (onSelect) {
            onSelect({
                id: id,
                name: `Disconnect Switch (Double Break)`,
                type: 'isolator'
            });
        }
    };

    return (
        <group 
            ref={groupRef}
            name={id}
            position={position} 
            rotation={new THREE.Euler(...rotation)}
            onClick={handleClick}
            onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
        >
             <GroundRiser position={[0, 0, 0]} height={0.3} offset={[-1.2, 0, 0.3]} />
             <GroundRiser position={[0, 0, 0]} height={0.3} offset={[1.2, 0, 0.3]} />

            {/* Left Pillar */}
            <group position={[-1.2, 0, 0]}>
                <BlueSupportPillar height={1.8} />
                <group position={[-0.35, 0.8, 0]}>
                    <Box args={[0.5, 0.8, 0.3]} material={MAT_BOX_GREY} />
                    <Box args={[0.05, 0.2, 0.02]} position={[-0.26, 0, 0]} material={MAT_GALV_STEEL} />
                </group>
                <group ref={linkageRef} position={[0.35, 0.9, 0]}>
                     <Cylinder args={[0.03, 0.03, 1.8, 6]} position={[0, 0.9, 0]} material={MAT_GALV_STEEL} />
                </group>
            </group>

            {/* Right Pillar */}
            <group position={[1.2, 0, 0]}>
                <BlueSupportPillar height={1.8} />
            </group>

            {/* Base Frame */}
            <group position={[0, 1.9, 0]}>
                <Box args={[3.4, 0.15, 0.1]} position={[0, 0, 0.2]} material={MAT_GALV_STEEL} />
                <Box args={[3.4, 0.15, 0.1]} position={[0, 0, -0.2]} material={MAT_GALV_STEEL} />
                <Box args={[0.1, 0.15, 0.5]} position={[-1.2, 0, 0]} material={MAT_GALV_STEEL} />
                <Box args={[0.1, 0.15, 0.5]} position={[1.2, 0, 0]} material={MAT_GALV_STEEL} />
                <Box args={[0.1, 0.15, 0.5]} position={[0, 0, 0]} material={MAT_GALV_STEEL} />
            </group>

            {/* Left Stack */}
            <group position={[-1.2, 2.0, 0]} ref={leftStackRef}>
                <Cylinder args={[0.2, 0.2, 0.15, 8]} position={[0, 0.075, 0]} material={MAT_GALV_STEEL} />
                <group position={[0, 0.15, 0]}>
                    <InsulatorStack height={2.2} />
                </group>
                <group position={[0, 2.4, 0]}>
                    <Box args={[1.3, 0.08, 0.15]} position={[0.65, 0, 0]} material={MAT_ALUMINIUM} />
                    <group position={[1.3, 0, 0]}>
                        <Box args={[0.15, 0.12, 0.05]} position={[0, 0, 0.05]} material={MAT_COPPER} />
                        <Box args={[0.15, 0.12, 0.05]} position={[0, 0, -0.05]} material={MAT_COPPER} />
                    </group>
                    <Box args={[0.3, 0.05, 0.3]} position={[0, 0.05, 0]} material={MAT_ALUMINIUM} />
                </group>
            </group>

            {/* Right Stack */}
            <group position={[1.2, 2.0, 0]} ref={rightStackRef}>
                <Cylinder args={[0.2, 0.2, 0.15, 8]} position={[0, 0.075, 0]} material={MAT_GALV_STEEL} />
                <group position={[0, 0.15, 0]}>
                    <InsulatorStack height={2.2} />
                </group>
                <group position={[0, 2.4, 0]}>
                    <Box args={[1.3, 0.08, 0.15]} position={[-0.65, 0, 0]} material={MAT_ALUMINIUM} />
                    <group position={[-1.3, 0, 0]}>
                        <Cylinder args={[0.04, 0.04, 0.2, 8]} rotation={[Math.PI/2, 0, 0]} material={MAT_COPPER} />
                    </group>
                     <Box args={[0.3, 0.05, 0.3]} position={[0, 0.05, 0]} material={MAT_ALUMINIUM} />
                </group>
            </group>

            {hovered && (
                <Html position={[0, 5, 0]} center distanceFactor={15}>
                    <div className={`
                        px-2 py-1 rounded font-bold text-xs border shadow-md whitespace-nowrap backdrop-blur-sm
                        ${isOpen 
                            ? 'bg-red-100/90 border-red-300 text-red-700' 
                            : 'bg-green-100/90 border-green-300 text-green-700'}
                    `}>
                        {isOpen ? 'OPEN (Disconnected)' : 'CLOSED (Connected)'}
                    </div>
                </Html>
            )}
        </group>
    );
}, (prev, next) => {
    return prev.id === next.id && 
           prev.isOpen === next.isOpen && 
           prev.position[0] === next.position[0] &&
           prev.position[1] === next.position[1] &&
           prev.position[2] === next.position[2];
});

export default Isolator;
