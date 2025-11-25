
import React from 'react';
import { Box } from '@react-three/drei';
import '../../../types';



const Building = ({ position, args, color = "#a8a29e", type = 'office', rotation = [0,0,0] }) => {
    const [width, height, depth] = args;
    
    // Window generation logic
    const rows = Math.floor(height / 1.5);
    const colsFront = Math.floor(width / 2);
    const colsSide = Math.floor(depth / 2);

    const windows = [];

    if (type === 'office') {
        // Front Windows
        for(let r = 1; r < rows; r++) {
            for(let c = 0; c < colsFront; c++) {
                windows.push(
                    <Box key={`f-${r}-${c}`} args={[0.8, 0.8, 0.1]} position={[-width/2 + 1 + c*2, -height/2 + 1 + r*1.5, depth/2 + 0.05]}>
                        <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.8} />
                    </Box>
                );
            }
        }
        // Side Windows (Right)
        for(let r = 1; r < rows; r++) {
            for(let c = 0; c < colsSide; c++) {
                windows.push(
                    <Box key={`sr-${r}-${c}`} args={[0.1, 0.8, 0.8]} position={[width/2 + 0.05, -height/2 + 1 + r*1.5, -depth/2 + 1 + c*2]}>
                        <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.8} />
                    </Box>
                );
            }
        }
    }

    return (
        <group position={position} rotation={rotation}>
            {/* Main Block */}
            <Box args={args} castShadow receiveShadow>
                <meshStandardMaterial color={color} roughness={0.9} />
            </Box>

            {/* Roof */}
            {type === 'warehouse' ? (
                <mesh position={[0, height/2 + 1, 0]} rotation={[0, 0, 0]}>
                    <cylinderGeometry args={[0, width/1.4, depth, 4, 1]} /> 
                    <meshStandardMaterial color="#64748b" />
                </mesh>
            ) : (
                // Flat roof with rim
                <Box args={[width + 0.5, 0.2, depth + 0.5]} position={[0, height/2 + 0.1, 0]}>
                     <meshStandardMaterial color="#cbd5e1" />
                </Box>
            )}

            {/* Windows */}
            {windows}
        </group>
    );
};

export default Building;