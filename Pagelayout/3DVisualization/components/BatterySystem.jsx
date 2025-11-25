
import React, { useState, useMemo, useRef } from 'react';
import { Box, Cylinder, Text, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';




// --- MATERIALS ---
const matRack = new THREE.MeshStandardMaterial({ color: "#1e293b", roughness: 0.4, metalness: 0.6 }); // Dark Steel
const matCellCase = new THREE.MeshPhysicalMaterial({ 
    color: "#e2e8f0", 
    roughness: 0.1, 
    metalness: 0.1, 
    transmission: 0.6, // Translucent plastic
    thickness: 0.5,
    transparent: true, 
    opacity: 0.8 
});
const matElectrolyte = new THREE.MeshStandardMaterial({ color: "#94a3b8", transparent: true, opacity: 0.3 });
const matLead = new THREE.MeshStandardMaterial({ color: "#64748b", roughness: 0.7, metalness: 0.5 });
const matTerminalPos = new THREE.MeshStandardMaterial({ color: "#ef4444" });
const matTerminalNeg = new THREE.MeshStandardMaterial({ color: "#3b82f6" });
const matChargerBody = new THREE.MeshStandardMaterial({ color: "#cbd5e1", roughness: 0.3, metalness: 0.2 });
const matScreen = new THREE.MeshStandardMaterial({ color: "#0f172a", emissive: "#0284c7", emissiveIntensity: 0.4 });

// --- SUB-COMPONENTS ---

const BatteryCell = React.memo(({ position }) => {
    return (
        <group position={position}>
            {/* Jar / Case */}
            <Box args={[0.18, 0.45, 0.25]} material={matCellCase} />
            {/* Electrolyte Level */}
            <Box args={[0.16, 0.30, 0.23]} position={[0, -0.05, 0]} material={matElectrolyte} />
            
            {/* Internal Plates (simplified) */}
            <Box args={[0.01, 0.35, 0.2]} position={[-0.04, 0, 0]} material={matLead} />
            <Box args={[0.01, 0.35, 0.2]} position={[0.04, 0, 0]} material={matLead} />

            {/* Terminals */}
            <Cylinder args={[0.02, 0.02, 0.1]} position={[-0.05, 0.25, 0]} material={matTerminalPos} />
            <Cylinder args={[0.02, 0.02, 0.1]} position={[0.05, 0.25, 0]} material={matTerminalNeg} />
        </group>
    );
});

const BatteryRack = React.memo(({ position }) => {
    const rows = 2;
    const cellsPerRow = 12;
    const rackWidth = cellsPerRow * 0.22;

    return (
        <group position={position}>
            {/* Steel Frame Structure */}
            {/* Legs */}
            <Box args={[0.05, 1.6, 0.05]} position={[-rackWidth/2, 0.8, 0.2]} material={matRack} />
            <Box args={[0.05, 1.6, 0.05]} position={[rackWidth/2, 0.8, 0.2]} material={matRack} />
            <Box args={[0.05, 1.6, 0.05]} position={[-rackWidth/2, 0.8, -0.2]} material={matRack} />
            <Box args={[0.05, 1.6, 0.05]} position={[rackWidth/2, 0.8, -0.2]} material={matRack} />
            
            {/* Shelves */}
            <Box args={[rackWidth + 0.1, 0.05, 0.5]} position={[0, 0.6, 0]} material={matRack} />
            <Box args={[rackWidth + 0.1, 0.05, 0.5]} position={[0, 1.2, 0]} material={matRack} />

            {/* Cells Row 1 (Bottom) */}
            {Array.from({ length: cellsPerRow }).map((_, i) => {
                const x = -rackWidth/2 + 0.11 + (i * 0.22);
                const y = 0.85;
                return (
                    <React.Fragment key={`r1-${i}`}>
                        <BatteryCell position={[x, y, 0]} />
                        {/* Inter-cell Connector Link */}
                        {i < cellsPerRow - 1 && (
                            <Box 
                                args={[0.1, 0.01, 0.04]} 
                                position={[x + 0.11, y + 0.25, 0]} 
                                material={matLead} 
                            />
                        )}
                    </React.Fragment>
                );
            })}
            
             {/* Cells Row 2 (Top) */}
             {Array.from({ length: cellsPerRow }).map((_, i) => {
                const x = -rackWidth/2 + 0.11 + (i * 0.22);
                const y = 1.45;
                return (
                    <React.Fragment key={`r2-${i}`}>
                        <BatteryCell position={[x, y, 0]} />
                        {/* Inter-cell Connector Link */}
                        {i < cellsPerRow - 1 && (
                             <Box 
                                args={[0.1, 0.01, 0.04]} 
                                position={[x + 0.11, y + 0.25, 0]} 
                                material={matLead} 
                            />
                        )}
                    </React.Fragment>
                );
            })}
            
            {/* Inter-tier cabling (Connecting bottom row end to top row start) */}
            <group position={[rackWidth/2, 1.15, 0]}>
                 <Cylinder args={[0.015, 0.015, 0.6]} material={new THREE.MeshStandardMaterial({color: "#000000"})} />
            </group>
        </group>
    );
});

const ChargerPanel = React.memo(({ position, rotation=[0,0,0], label }) => {
    return (
        <group position={position} rotation={new THREE.Euler(...rotation)}>
            {/* Cabinet Body */}
            <Box args={[0.8, 1.8, 0.6]} position={[0, 0.9, 0]} material={matChargerBody} />
            
            {/* Ventilation Grills */}
            {Array.from({length: 5}).map((_, i) => (
                <Box key={i} args={[0.6, 0.02, 0.05]} position={[0, 0.3 + i*0.05, 0.3]} material={matRack} />
            ))}

            {/* Digital Display Panel */}
            <Box args={[0.6, 0.4, 0.05]} position={[0, 1.4, 0.3]} material={matScreen} />
            
            {/* Indicator LEDs */}
            <group position={[-0.2, 1.1, 0.31]}>
                <mesh material={new THREE.MeshBasicMaterial({ color: "#22c55e" })}>
                    <circleGeometry args={[0.02, 16]} />
                </mesh>
                <Text position={[0.15, 0, 0]} fontSize={0.05} color="black">FLOAT</Text>
            </group>
            <group position={[0.2, 1.1, 0.31]}>
                <mesh material={new THREE.MeshBasicMaterial({ color: "#94a3b8" })}>
                    <circleGeometry args={[0.02, 16]} />
                </mesh>
                <Text position={[0.15, 0, 0]} fontSize={0.05} color="black">BOOST</Text>
            </group>

            <Text position={[0, 1.7, 0.31]} fontSize={0.08} color="black" anchorX="center">{label}</Text>
        </group>
    );
});

const BatterySystem = React.memo(({ position, rotation=[0,0,0], onSelect }) => {
    const [hovered, setHovered] = useState(false);
    const id = 'BAT-110V-DC';

    const handleClick = (e) => {
        e.stopPropagation();
        if (onSelect) {
            onSelect({
                id: id,
                name: '110V DC Station Battery System',
                type: 'unknown', 
                data: {
                    voltage: '112.5 V',
                    current: '12.4 A',
                    status: 'FLOAT CHARGE',
                    autonomy: '8 Hours'
                }
            });
        }
    };

    return (
        <group 
            name={id}
            position={position} 
            rotation={new THREE.Euler(...rotation)}
            onClick={handleClick}
            onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
        >
            {/* SINGLE Battery Rack (The "One Unit") */}
            <BatteryRack position={[0, 0, 0]} />
            
            {/* Redundant Charger System positioned next to the single rack */}
            <group position={[2.5, 0, 0]}>
                <ChargerPanel position={[0, 0, 0.5]} rotation={[0, -Math.PI/2, 0]} label="CHARGER A" />
                <ChargerPanel position={[0.85, 0, 0.5]} rotation={[0, -Math.PI/2, 0]} label="CHARGER B" />
            </group>

            {hovered && (
                <Html position={[0, 2.5, 0]} center distanceFactor={10}>
                    <div className="bg-white border border-black px-2 py-1 rounded text-xs font-bold whitespace-nowrap shadow-md">
                        110V DC BATTERY BANK
                    </div>
                </Html>
            )}
        </group>
    );
});

export default BatterySystem;
