import React from 'react';
import { OrbitControls } from '@react-three/drei';

// This component is mostly a placeholder if we needed complex camera animations
// currently handled by OrbitControls in Scene.tsx
const CameraControls = () => {
    return <OrbitControls makeDefault />;
};

export default CameraControls;