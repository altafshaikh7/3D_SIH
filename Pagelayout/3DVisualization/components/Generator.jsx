
import React, { useState, useRef, useMemo } from 'react';
import { Box, Cylinder, Html, Sphere } from '@react-three/drei';
import * as THREE from 'three';

import AlarmMarker from './AlarmMarker';



const Generator = React.memo(({ position, rotation = [0, 0, 0], onSelect, realtimeData, onAcknowledge }) => {
    const [hovered, setHovered] = useState(false);

    // Materials
    const matHousing = useMemo(() => new THREE.MeshStandardMaterial({ color: "#0f766e", roughness: 0.5, metalness: 0.4 }), []); 
    const matDarkMetal = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1e293b", roughness: 0.7, metalness: 0.5 }), []);
    const matSteel = useMemo(() => new THREE.MeshStandardMaterial({ color: "#94a3b8", roughness: 0.3, metalness: 0.8 }), []);
    const matShaft = useMemo(() => new THREE.MeshStandardMaterial({ color: "#e2e8f0", roughness: 0.2, metalness: 0.9 }), []);
    const matConcrete = useMemo(() => new THREE.MeshStandardMaterial({ color: "#78716c", roughness: 0.9 }), []);
    const matWarning = useMemo(() => new THREE.MeshStandardMaterial({ color: "#facc15" }), []);
    const matPipe = useMemo(() => new THREE.MeshStandardMaterial({ color: "#cbd5e1", metalness: 0.6 }), []);

    const id = 'GEN-01';

    const handleClick = (e) => {
        e.stopPropagation();
        if (onSelect) {
            onSelect({
                id: id,
                name: 'Turbo-Generator Unit 1',
                type: 'generator'
            });
        }
    };

    const mw = realtimeData?.values?.mw || '485';
    const voltage = realtimeData?.values?.voltage || '15.2';
    const alarm = realtimeData?.alarm;

    return (
        <group
            name={id}
            position={position}
            rotation={new THREE.Euler(...rotation)}
            onClick={handleClick}
            onPointerOver={() => {
                setHovered(true);
                document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
                setHovered(false);
                document.body.style.cursor = 'auto';
            }}
        >
            {/* === BASE FOUNDATION === */}
            <Box args={[16, 3, 8]} position={[0, 1.5, 0]} material={matConcrete} />
            <Box args={[16.2, 0.2, 8.2]} position={[0, 3.1, 0]} material={matDarkMetal} />

            {/* === MAIN STATOR BODY === */}
            <group position={[0, 6, 0]}>
                 <Cylinder args={[2.8, 2.8, 9]} rotation={[0, 0, Math.PI/2]} material={matHousing} />
                 {[-3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5].map((x, i) => (
                     <Cylinder key={i} args={[2.95, 2.95, 0.3]} position={[x, 0, 0]} rotation={[0, 0, Math.PI/2]} material={matDarkMetal} />
                 ))}
                 <Box args={[8, 1, 6]} position={[0, -2.5, 0]} material={matHousing} />
            </group>

            {/* === END SHIELDS & BEARINGS === */}
            <group position={[-4.5, 6, 0]}>
                <Cylinder args={[2.8, 2.8, 1]} rotation={[0, 0, Math.PI/2]} material={matHousing} />
                <Sphere args={[2.8, 32, 16, 0, Math.PI*2, 0, Math.PI/2]} rotation={[0, 0, Math.PI/2]} position={[-0.5, 0, 0]} material={matHousing} />
                <Box args={[2, 3, 4]} position={[-1.5, -1.5, 0]} material={matHousing} />
            </group>

            <group position={[4.5, 6, 0]}>
                <Cylinder args={[2.8, 2.8, 1]} rotation={[0, 0, Math.PI/2]} material={matHousing} />
                <Sphere args={[2.8, 32, 16, 0, Math.PI*2, 0, Math.PI/2]} rotation={[0, 0, -Math.PI/2]} position={[0.5, 0, 0]} material={matHousing} />
                <Box args={[2, 3, 4]} position={[1.5, -1.5, 0]} material={matHousing} />
            </group>

            {/* === EXCITER UNIT (REAR) === */}
            <group position={[8, 5, 0]}>
                 <Cylinder args={[1.2, 1.5, 2]} rotation={[0, 0, Math.PI/2]} position={[-1.5, 1, 0]} material={matWarning} />
                 <Box args={[3, 3.5, 3]} position={[1, 1, 0]} material={matSteel} />
                 <Cylinder args={[1.6, 1.6, 3.2]} rotation={[0, 0, Math.PI/2]} position={[1, 1.5, 0]} material={matSteel} />
                 <Box args={[2.5, 1.5, 0.2]} position={[1, 1.5, 1.6]} material={matDarkMetal} />
                 <Box args={[2.5, 1.5, 0.2]} position={[1, 1.5, -1.6]} material={matDarkMetal} />
            </group>

            {/* === TURBINE SHAFT COUPLING (FRONT) === */}
            <group position={[-7, 6, 0]}>
                 <Cylinder args={[0.8, 0.8, 3]} rotation={[0, 0, Math.PI/2]} material={matShaft} />
                 <Cylinder args={[1.4, 1.4, 0.3]} rotation={[0, 0, Math.PI/2]} position={[-1.4, 0, 0]} material={matSteel} />
            </group>

            {/* === TOP HEAT EXCHANGER / COOLER === */}
            <group position={[0, 9.5, 0]}>
                <Box args={[7, 1.5, 4.5]} material={matSteel} />
                <Cylinder args={[0.4, 0.4, 2]} position={[-2.5, -1.5, 1.5]} material={matPipe} />
                <Cylinder args={[0.4, 0.4, 2]} position={[2.5, -1.5, -1.5]} material={matPipe} />
                <Box args={[1, 0.2, 3]} position={[-2, 0.8, 0]} material={matDarkMetal} />
                <Box args={[1, 0.2, 3]} position={[2, 0.8, 0]} material={matDarkMetal} />
            </group>

            {/* === TERMINAL BOX (OUTPUT) === */}
            <group position={[0, 7, 2.5]} rotation={[0.3, 0, 0]}>
                 <Box args={[3, 2, 2]} material={matHousing} />
                 <Box args={[2.8, 1.8, 0.2]} position={[0, 0, 1]} material={matWarning} />
                 <Cylinder args={[0.2, 0.2, 0.8]} position={[-1, 0.5, 1]} rotation={[Math.PI/2, 0, 0]} material={matDarkMetal} />
                 <Cylinder args={[0.2, 0.2, 0.8]} position={[0, 0.5, 1]} rotation={[Math.PI/2, 0, 0]} material={matDarkMetal} />
                 <Cylinder args={[0.2, 0.2, 0.8]} position={[1, 0.5, 1]} rotation={[Math.PI/2, 0, 0]} material={matDarkMetal} />
            </group>

             {/* Info Label - Only visible when hovered to reduce lag */}
            {hovered && (
                <Html position={[0, 11, 0]} center distanceFactor={40}>
                    <div className="bg-white text-black px-3 py-2 rounded border border-black shadow-lg backdrop-blur-md text-sm font-bold whitespace-nowrap flex flex-col items-center pointer-events-none">
                        <span className="flex items-center gap-2">
                            TURBO-GENERATOR 1
                        </span>
                        <span className="text-xs text-black font-mono mt-1">{voltage}kV • {mw}MW</span>
                    </div>
                </Html>
            )}

            {/* Alarm Marker */}
            {alarm && !alarm.acknowledged && (
                <AlarmMarker 
                    position={[0, 12, 0]} 
                    message={alarm.message} 
                    severity={alarm.severity}
                    onAcknowledge={() => onAcknowledge && onAcknowledge(id)}
                />
            )}
        </group>
    );
});

export default Generator;
    