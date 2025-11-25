
import React, { useState, useRef, useMemo } from 'react';
import { Cylinder, Box, Html, Torus, Extrude } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { GroundRiser, GIStrip } from './EarthingSystem';



// --- SHARED GLOBAL MATERIALS ---
const MAT_PORCELAIN_GREY = new THREE.MeshStandardMaterial({ color: "#d4d4d4", roughness: 0.1, metalness: 0.0 });
const MAT_PORCELAIN_BROWN = new THREE.MeshStandardMaterial({ color: "#662a18", roughness: 0.1, metalness: 0.1 }); 
const MAT_GALV_STEEL = new THREE.MeshStandardMaterial({ color: "#94a3b8", roughness: 0.5, metalness: 0.6 });
const MAT_ALUMINIUM = new THREE.MeshStandardMaterial({ color: "#e2e8f0", roughness: 0.3, metalness: 0.7 });
const MAT_ALUMINIUM_COIL = new THREE.MeshStandardMaterial({ color: "#cbd5e1", roughness: 0.4, metalness: 0.5, side: THREE.DoubleSide });
const MAT_COPPER = new THREE.MeshStandardMaterial({ color: "#b45309", roughness: 0.4, metalness: 0.8 });
const MAT_BASE = new THREE.MeshStandardMaterial({ color: "#57534e", roughness: 0.9 });
const MAT_TUNING_BOX = new THREE.MeshStandardMaterial({ color: "#475569", roughness: 0.3, metalness: 0.4 });
const MAT_BLACK_LABEL = new THREE.MeshBasicMaterial({ color: "#000000" });

// Low Poly Column - Reduced to 6 segments
const InsulatorColumn = ({ height, radius, material }) => (
    <group>
        <Cylinder args={[radius, radius * 1.15, height, 6]} position={[0, height/2, 0]} material={material} />
    </group>
);

// Optimized Stack - Reduced segments from 12 to 6/8
const CVTStack = ({ height, radius, sheds }) => {
    const shedSpacing = height / sheds;
    return (
        <group>
            <Cylinder args={[radius * 0.75, radius * 0.85, height, 6]} position={[0, height/2, 0]} material={MAT_PORCELAIN_BROWN} />
            {Array.from({ length: sheds }).map((_, i) => (
                 <Cylinder 
                    key={i}
                    args={[radius * 1.7, radius * 1.4, 0.03, 8]} // Reduced from 12 to 8
                    position={[0, (i * shedSpacing) + (shedSpacing * 0.5), 0]}
                    material={MAT_PORCELAIN_BROWN}
                />
            ))}
        </group>
    );
};

// --- WAVE TRAP SPECIFIC COMPONENTS ---

const SpiderPlate = React.memo(({ radius }) => {
    return (
        <group>
            {/* Central Hub */}
            <Cylinder args={[radius * 0.3, radius * 0.3, 0.05, 6]} material={MAT_ALUMINIUM} />
            {/* Arms (4 arms) - merged into cross */}
            <Box args={[radius * 1.8, 0.04, 0.08]} material={MAT_ALUMINIUM} />
            <Box args={[0.08, 0.04, radius * 1.8]} material={MAT_ALUMINIUM} />
            {/* Outer Ring - Reduced segments */}
            <mesh rotation={[Math.PI/2, 0, 0]} material={MAT_ALUMINIUM}>
                <torusGeometry args={[radius, 0.03, 4, 8]} />
            </mesh>
        </group>
    );
});

const TuningUnit = ({ position }) => (
    <group position={position}>
        {/* Main Box */}
        <Box args={[0.4, 0.5, 0.3]} material={MAT_TUNING_BOX}>
            <meshStandardMaterial color="#334155" />
        </Box>
        {/* Door/Panel */}
        <Box args={[0.35, 0.45, 0.02]} position={[0, 0, 0.15]} material={MAT_GALV_STEEL} />
        {/* Connection Wire to coil */}
        <Cylinder args={[0.01, 0.01, 0.4, 4]} position={[0, 0.3, 0]} material={MAT_COPPER} />
    </group>
);

const WaveTrapCoil = () => {
    const radius = 0.6;
    const height = 1.4;
    const numRibs = 8; // Reduced from 12 to 8 for performance

    return (
        <group>
            {/* Top Spider */}
            <group position={[0, height/2, 0]}>
                <SpiderPlate radius={radius} />
                 <Box args={[0.2, 0.2, 0.05]} position={[0, 0.1, 0]} material={MAT_COPPER} />
            </group>

            {/* Bottom Spider */}
            <group position={[0, -height/2, 0]}>
                <SpiderPlate radius={radius} />
                <Box args={[0.2, 0.2, 0.05]} position={[0, -0.1, 0]} material={MAT_COPPER} />
            </group>

            {/* Main Coil Body (Cylinder with Rib texture simulation) */}
            <Cylinder args={[radius * 0.95, radius * 0.95, height, 8, 1, true]} material={MAT_ALUMINIUM_COIL} />
            
            {/* Detailed Ribs/Windings - Optimized Geometry */}
            {Array.from({ length: numRibs }).map((_, i) => {
                const y = -height/2 + (i * (height/numRibs)) + (height/numRibs)/2;
                return (
                    <mesh key={i} position={[0, y, 0]} rotation={[Math.PI/2, 0, 0]} material={MAT_ALUMINIUM_COIL}>
                        {/* Reduced segments drastically: tubular 4, radial 6 */}
                        <torusGeometry args={[radius * 0.96, 0.03, 4, 6]} />
                    </mesh>
                )
            })}

            {/* Tuning Unit (LMU) suspended at bottom */}
            <TuningUnit position={[0.3, -height/2 - 0.3, 0]} />
            
            {/* Corona Rings (Top and Bottom) - Optimized */}
            <mesh position={[0, height/2 - 0.1, 0]} rotation={[Math.PI/2, 0, 0]} material={MAT_ALUMINIUM}>
                <torusGeometry args={[radius * 1.1, 0.04, 4, 12]} />
            </mesh>
             <mesh position={[0, -height/2 + 0.1, 0]} rotation={[Math.PI/2, 0, 0]} material={MAT_ALUMINIUM}>
                <torusGeometry args={[radius * 1.1, 0.04, 4, 12]} />
            </mesh>
            
            {/* Internal Tie Rods */}
            {[0.4, -0.4].map((x, i) => (
                <Cylinder key={i} args={[0.02, 0.02, height, 4]} position={[x, 0, 0]} material={MAT_GALV_STEEL} />
            ))}
        </group>
    );
};

const InstrumentTransformer = React.memo(({ id, type, position, rotation=[0,0,0], onSelect }) => {
    const [hovered, setHovered] = useState(false);
    const groupRef = useRef(null);

    useFrame((state, delta) => {
        if (groupRef.current) {
            const targetScale = hovered ? 1.05 : 1;
            const step = Math.min(delta * 10, 1);
            // Only lerp if significantly different to save cpu
            if (Math.abs(groupRef.current.scale.x - targetScale) > 0.001) {
                 groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), step);
            }
        }
    });

    const handleClick = (e) => {
        e.stopPropagation();
        if (onSelect) {
            let name = '';
            if (type === 'CT') name = 'Current Transformer (400kV)';
            if (type === 'CVT') name = 'Capacitive Voltage Transformer';
            if (type === 'WaveTrap') name = 'Line Trap / Wave Trap';
            
            onSelect({
                id: id,
                name: name,
                type: type === 'WaveTrap' ? 'waveTrap' : 'instrumentTransformer'
            });
        }
    };

    const renderBody = () => {
        if (type === 'CT') {
            return (
                <group position={[0, 0.4, 0]}>
                     <Box args={[0.8, 1.2, 0.8]} position={[0, 0.6, 0]} material={MAT_GALV_STEEL} />
                     <group position={[0, 1.25, 0]}>
                         <InsulatorColumn height={3.0} radius={0.18} material={MAT_PORCELAIN_GREY} />
                     </group>
                     <group position={[0, 4.5, 0]}>
                         <Box args={[1.0, 0.8, 0.6]} material={MAT_ALUMINIUM} />
                         <Cylinder args={[0.4, 0.4, 0.6, 6]} rotation={[0, 0, Math.PI/2]} material={MAT_ALUMINIUM} />
                         <Cylinder args={[0.05, 0.05, 1.4, 6]} rotation={[0, 0, Math.PI/2]} position={[0, 0.3, 0]} material={MAT_COPPER} />
                     </group>
                </group>
            )
        } else if (type === 'CVT') {
            return (
                <group position={[0, 0.4, 0]}>
                     <Box args={[1.0, 0.9, 1.0]} position={[0, 0.45, 0]} material={MAT_GALV_STEEL}>
                         <Box args={[0.2, 0.3, 0.02]} position={[0.51, 0.1, 0]} material={MAT_ALUMINIUM} />
                         <Box args={[0.3, 0.4, 0.2]} position={[0, 0, 0.6]} material={MAT_GALV_STEEL} />
                     </Box>

                     <group position={[0, 0.9, 0]}>
                         <Cylinder args={[0.22, 0.22, 0.1, 8]} position={[0, 0.05, 0]} material={MAT_ALUMINIUM} />
                         <group position={[0, 0.1, 0]}>
                             <CVTStack height={1.8} radius={0.13} sheds={18} />
                         </group>
                     </group>

                     <group position={[0, 2.8, 0]}>
                         <Cylinder args={[0.18, 0.18, 0.15, 8]} position={[0, 0.075, 0]} material={MAT_ALUMINIUM} />
                     </group>

                     <group position={[0, 2.95, 0]}>
                         <CVTStack height={1.6} radius={0.11} sheds={14} />
                     </group>

                     <group position={[0, 4.55, 0]}>
                         <Cylinder args={[0.18, 0.18, 0.25, 8]} position={[0, 0.125, 0]} material={MAT_ALUMINIUM} />
                         <Cylinder args={[0.2, 0.2, 0.05, 8]} position={[0, 0.025, 0]} material={MAT_ALUMINIUM} />
                         <Cylinder args={[0.03, 0.03, 0.6, 4]} position={[0, 0.55, 0]} material={MAT_ALUMINIUM} />
                         <Cylinder args={[0.02, 0.02, 0.4, 4]} rotation={[0, 0, Math.PI/2]} position={[0.15, 0.15, 0]} material={MAT_ALUMINIUM} />
                     </group>
                </group>
            )
        } else if (type === 'WaveTrap') {
            // Detailed Suspension Wave Trap
            return (
                <group>
                    {/* Suspension Insulator String (Top) */}
                    <group position={[0, 1.8, 0]}>
                        <Cylinder args={[0.03, 0.03, 0.4, 4]} position={[0, 0.2, 0]} material={MAT_GALV_STEEL} />
                        <Box args={[0.1, 0.2, 0.1]} position={[0, 0.5, 0]} material={MAT_GALV_STEEL} />
                        
                        <Cylinder args={[0.02, 0.02, 1.5, 4]} position={[0, -0.75, 0]} material={MAT_GALV_STEEL} />
                        {Array.from({length: 8}).map((_, i) => (
                             <Cylinder key={i} args={[0.15, 0.15, 0.05, 6]} position={[0, -i*0.15, 0]} material={MAT_PORCELAIN_BROWN} />
                        ))}
                    </group>

                    {/* The Wave Trap Unit */}
                    <group position={[0, 0, 0]}>
                        <WaveTrapCoil />
                    </group>

                    {/* Earthing Strip going UP the hardware */}
                    <group position={[0.4, 1.5, 0]} rotation={[0, 0, 0]}>
                         <Box args={[0.02, 2, 0.05]} material={MAT_GALV_STEEL} />
                         <Html position={[0, 0.5, 0]} distanceFactor={5} transform>
                            <div className="bg-yellow-400 w-1 h-1 rounded-full"></div>
                         </Html>
                    </group>
                </group>
            )
        }
    }

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
            {/* Render Base Foundation ONLY for ground-mounted equipment */}
            {type !== 'WaveTrap' && (
                <>
                    <GroundRiser position={[0, 0, 0]} height={0.4} offset={[0.4, 0, 0.4]} />
                    <Box args={[1.2, 0.4, 1.2]} position={[0, 0.2, 0]} material={MAT_BASE} />
                </>
            )}
            
            {renderBody()}
            
            {hovered && (
                <Html position={[0, type === 'WaveTrap' ? 0 : 5, 0]} center distanceFactor={12}>
                    <div className="bg-white text-black px-2 py-1 text-xs rounded border border-black whitespace-nowrap pointer-events-none shadow-sm font-bold">
                        {type}
                    </div>
                </Html>
            )}
        </group>
    );
}, (prev, next) => {
    // Custom comparison to prevent re-render on inline array props
    const posSame = prev.position?.[0] === next.position?.[0] && 
                    prev.position?.[1] === next.position?.[1] && 
                    prev.position?.[2] === next.position?.[2];
    const rotSame = prev.rotation?.[0] === next.rotation?.[0] && 
                    prev.rotation?.[1] === next.rotation?.[1] && 
                    prev.rotation?.[2] === next.rotation?.[2];
    
    return posSame && rotSame && prev.id === next.id && prev.type === next.type;
});

export default InstrumentTransformer;
