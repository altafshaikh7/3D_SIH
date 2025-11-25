
import React from 'react';
import { Cone, Cylinder } from '@react-three/drei';
import '../../../types';



const Tree = ({ position, scale = 1 }) => {
    return (
        <group position={position} scale={scale}>
            {/* Trunk */}
            <Cylinder args={[0.2, 0.3, 1.5]} position={[0, 0.75, 0]} castShadow>
                <meshStandardMaterial color="#573c29" />
            </Cylinder>
            {/* Leaves */}
            <Cone args={[1.2, 2.5, 8]} position={[0, 2.5, 0]} castShadow>
                <meshStandardMaterial color="#166534" roughness={0.8} />
            </Cone>
            <Cone args={[1, 2, 8]} position={[0, 3.5, 0]} castShadow>
                <meshStandardMaterial color="#15803d" roughness={0.8} />
            </Cone>
        </group>
    );
};

export default Tree;