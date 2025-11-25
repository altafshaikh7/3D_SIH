import React, { useState, useRef, useMemo } from 'react';
import { Cylinder, Box, Html, Sphere, Torus } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import AlarmMarker from './AlarmMarker';
import { GroundRiser, GIStrip } from './EarthingSystem';

// ---------------------- ARC FLASH ----------------------
const ArcFlash = ({ active }) => {
    const ref = useRef(null);
    const lightRef = useRef(null);

    useFrame((state) => {
        if (active && ref.current && lightRef.current) {
            const t = state.clock.elapsedTime * 20;
            const scale = 1 + Math.sin(t) * 0.5;
            ref.current.scale.set(scale, scale, scale);

            // FIXED: No TypeScript "as", safe JS check
            const material = ref.current.material;
            if (material && material instanceof THREE.Material) {
                material.opacity = 0.5 + Math.random() * 0.5;
            }

            lightRef.current.intensity = 5 + Math.random() * 5;
        }
    });

    if (!active) return null;

    return (
        <group position={[0, 5, 0]}>
            <Sphere ref={ref} args={[1.5, 16, 16]}>
                <meshBasicMaterial color="#60a5fa" transparent opacity={0.6} />
            </Sphere>
            <pointLight ref={lightRef} color="#3b82f6" distance={10} decay={2} />
        </group>
    );
};

// ---------------------- PRESSURE GAUGE ----------------------
const PressureGauge = ({ position, pressure }) => {
    const normalized = Math.max(0, Math.min(1, (pressure - 0.3) / 0.6));
    const angle = Math.PI * 0.8 - (normalized * Math.PI * 1.6);

    return (
        <group position={position}>
            <Cylinder args={[0.15, 0.15, 0.05, 32]} rotation={[Math.PI/2, 0, 0]}>
                <meshStandardMaterial color="#cbd5e1" metalness={0.5} roughness={0.3} />
            </Cylinder>

            <Cylinder args={[0.13, 0.13, 0.06, 32]} rotation={[Math.PI/2, 0, 0]}>
                <meshBasicMaterial color="#ffffff" />
            </Cylinder>

            <group rotation={[0, 0, -0.5]}>
                <Torus args={[0.1, 0.015, 2, 24, 2]} rotation={[Math.PI/2, 0, 0]} position={[0, 0, 0.035]}>
                    <meshBasicMaterial color="#22c55e" />
                </Torus>
            </group>

            <group rotation={[0, 0, 2]}>
                <Torus args={[0.1, 0.015, 2, 12, 0.8]} rotation={[Math.PI/2, 0, 0]} position={[0, 0, 0.035]}>
                    <meshBasicMaterial color="#ef4444" />
                </Torus>
            </group>

            <group rotation={[0, 0, angle]} position={[0, 0, 0.045]}>
                <Box args={[0.01, 0.11, 0.005]} position={[0, 0.03, 0]}>
                    <meshBasicMaterial color="black" />
                </Box>
                <Cylinder args={[0.02, 0.02, 0.01]} rotation={[Math.PI/2, 0, 0]}>
                    <meshBasicMaterial color="#334155" />
                </Cylinder>
            </group>

            <Cylinder args={[0.15, 0.15, 0.08, 32]} rotation={[Math.PI/2, 0, 0]}>
                <meshPhysicalMaterial
                    color="#e0f2fe"
                    transmission={0.9}
                    opacity={0.3}
                    roughness={0}
                    transparent
                />
            </Cylinder>

            <Html position={[0, -0.2, 0]} transform scale={0.4}>
                <div className="text-[10px] font-bold text-slate-600 bg-white/80 px-1 rounded border border-slate-300">
                    SF6
                </div>
            </Html>
        </group>
    );
};

// ---------------------- MAIN BREAKER ----------------------
const Breaker = React.memo(
    ({ id, position = [0, 0, 0], onSelect, realtimeData = {}, onAcknowledge }) => {
        const [hovered, setHovered] = useState(false);

        // MATERIALS
        const matPorcelain = useMemo(
            () => new THREE.MeshStandardMaterial({ color: "#cbd5e1", roughness: 0.2 }),
            []
        );
        const matMetal = useMemo(
            () => new THREE.MeshStandardMaterial({ color: "#64748b", roughness: 0.4, metalness: 0.5 }),
            []
        );
        const matBase = useMemo(
            () => new THREE.MeshStandardMaterial({ color: "#475569" }),
            []
        );

        // SAFE JS DATA EXTRACTION
        const pressure = parseFloat(realtimeData?.values?.pressure || "0.62");
        const isTripped = realtimeData?.status === "TRIPPED";
        const alarm = realtimeData?.alarm;

        const handleClick = (e) => {
            e.stopPropagation();
            onSelect &&
                onSelect({
                    id,
                    name: "Circuit Breaker 400kV",
                    type: "breaker",
                    data: { pressure },
                });
        };

        return (
            <group
                name={id}
                position={new THREE.Vector3(...position)}
                onClick={handleClick}
                onPointerOver={() => {
                    setHovered(true);
                    document.body.style.cursor = "pointer";
                }}
                onPointerOut={() => {
                    setHovered(false);
                    document.body.style.cursor = "auto";
                }}
            >
                {/* EARTHING SYSTEM */}
                <GroundRiser position={[0, 0, 0]} height={0.6} offset={[0.5, 0, 0.5]} />
                <GIStrip start={[0.5, 0, 0.5]} end={[1.5, 0, 1.5]} />
                <GIStrip start={[0.5, 0, 0.5]} end={[-0.5, 0, 0.5]} />

                {/* STRUCTURE */}
                <Box args={[1.2, 2.5, 1.2]} position={[0, 1.25, 0]} material={matBase} />

                <Box args={[1.4, 1.0, 0.6]} position={[0, 2.5, 0.5]} material={matMetal} />

                <PressureGauge position={[0.3, 2.6, 0.82]} pressure={pressure} />

                {/* BREAKER POLES */}
                <group position={[0, 3, 0]}>
                    <Box args={[3, 0.6, 0.8]} material={matMetal} />

                    <group position={[-1.2, 0.3, 0]} rotation={[0, 0, 0.2]}>
                        <Cylinder args={[0.25, 0.25, 2.5]} position={[0, 1.25, 0]} material={matPorcelain} />
                        <Cylinder args={[0.3, 0.3, 0.2]} position={[0, 2.5, 0]} material={matMetal} />
                    </group>

                    <group position={[1.2, 0.3, 0]} rotation={[0, 0, -0.2]}>
                        <Cylinder args={[0.25, 0.25, 2.5]} position={[0, 1.25, 0]} material={matPorcelain} />
                        <Cylinder args={[0.3, 0.3, 0.2]} position={[0, 2.5, 0]} material={matMetal} />
                    </group>
                </group>

                {/* ARC FLASH */}
                <ArcFlash active={isTripped} />

                {/* LABEL ON HOVER */}
                {hovered && (
                    <Html position={[0, 6, 0]} center distanceFactor={15}>
                        <div className="bg-white text-black border border-black px-2 py-1 text-xs font-bold shadow-sm whitespace-nowrap">
                            {id} | SF6: {pressure.toFixed(2)} MPa
                        </div>
                    </Html>
                )}

                {/* ALARM */}
                {alarm && !alarm.acknowledged && (
                    <AlarmMarker
                        position={[0, 6.5, 0]}
                        message={alarm.message}
                        severity={alarm.severity}
                        onAcknowledge={() => onAcknowledge && onAcknowledge(id)}
                    />
                )}
            </group>
        );
    },
    (prev, next) =>
        prev.id === next.id &&
        prev.realtimeData === next.realtimeData &&
        prev.position?.every((v, i) => v === next.position?.[i])
);

export default Breaker;
