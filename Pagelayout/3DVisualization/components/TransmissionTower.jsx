
import React from 'react';
import { Cylinder, Box } from '@react-three/drei';
import '../../../types';



const TransmissionTower = ({ position, rotation=[0,0,0], scale=1 }) => {
    const color = "#94a3b8";
    
    return (
        <group position={position} rotation={rotation} scale={scale}>
            {/* Main Body - Tapered lattice simplified */}
            <Cylinder args={[0.5, 2, 10, 4, 1, true]} position={[0, 5, 0]} castShadow={false}>
                <meshStandardMaterial color={color} wireframe />
            </Cylinder>

            {/* Top Section */}
            <Cylinder args={[0.1, 0.5, 4, 4, 1]} position={[0, 12, 0]}>
                 <meshStandardMaterial color={color} wireframe />
            </Cylinder>

            {/* Cross Arms */}
            <Box args={[6, 0.2, 0.2]} position={[0, 8, 0]}>
                 <meshStandardMaterial color={color} />
            </Box>
            <Box args={[5, 0.2, 0.2]} position={[0, 11, 0]}>
                 <meshStandardMaterial color={color} />
            </Box>
            
            {/* Insulator strings hanging down */}
            <Cylinder args={[0.05, 0.05, 1]} position={[-2.5, 7.4, 0]}>
                <meshStandardMaterial color="#475569" />
            </Cylinder>
            <Cylinder args={[0.05, 0.05, 1]} position={[2.5, 7.4, 0]}>
                <meshStandardMaterial color="#475569" />
            </Cylinder>
        </group>
    );
};

export default TransmissionTower;
