import React from 'react';
import { Sphere } from '@react-three/drei';

const HeatmapOverlay = () => {
    // Simulated hotspots
    const hotspots = [
        { pos: [-10, 3, -5], temp: 1.0 }, // Transformer 1
        { pos: [10, 3, 10], temp: 0.6 },  // Breaker 3
    ];

    return (
        <group>
            {hotspots.map((spot, idx) => (
                <mesh key={idx} position={spot.pos}>
                    <sphereGeometry args={[3, 32, 32]} />
                    <meshBasicMaterial
                        color={spot.temp > 0.8 ? "#ef4444" : "#eab308"}
                        transparent
                        opacity={0.3 * spot.temp}
                        depthWrite={false}
                    />
                </mesh>
            ))}
        </group>
    );
};

export default HeatmapOverlay;
