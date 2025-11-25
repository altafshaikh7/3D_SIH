
import React from 'react';
import { Cylinder } from '@react-three/drei';

const GroundFaultIndicator = ({ position }) => {
    return (
        <group position={position}>
            {/* Ground Rod / Stake */}
            <Cylinder args={[0.05, 0.05, 0.6]} position={[0, 0.3, 0]}>
                <meshStandardMaterial color="#b45309" roughness={0.8} />
            </Cylinder>
            
            {/* Copper Ground Wire Connection */}
            <Cylinder args={[0.03, 0.03, 0.8]} position={[0.3, 0.1, 0]} rotation={[0, 0, -Math.PI/3]}>
                 <meshStandardMaterial color="#d97706" metalness={0.8} /> 
            </Cylinder>
        </group>
    );
};

export default GroundFaultIndicator;
