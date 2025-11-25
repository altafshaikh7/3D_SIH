import React, { useMemo } from 'react';
import * as THREE from 'three';

const Busbar = React.memo(
    ({ start, end, color = "#e2e8f0", thickness = 0.06, slack = 0, segments = 6 }) => {

        const effectiveSegments = slack > 0 ? segments : 1;
        const isFlexible = slack > 0;

        const geometry = useMemo(() => {
            const startVec = new THREE.Vector3(...start);
            const endVec = new THREE.Vector3(...end);

            let curve;

            if (slack > 0) {
                // MID-POINT FIXED HERE
                const mid = new THREE.Vector3(
                    (startVec.x + endVec.x) / 2,
                    (startVec.y + endVec.y) / 2 - slack,
                    (startVec.z + endVec.z) / 2
                );

                curve = new THREE.QuadraticBezierCurve3(startVec, mid, endVec);
            } else {
                curve = new THREE.LineCurve3(startVec, endVec);
            }

            return new THREE.TubeGeometry(curve, effectiveSegments, thickness, 8, false);
        }, [
            start[0], start[1], start[2],
            end[0], end[1], end[2],
            slack, thickness, effectiveSegments
        ]);

        return (
            <mesh geometry={geometry} castShadow={false} receiveShadow={false}>
                <meshPhysicalMaterial
                    color={color}
                    metalness={0.7}
                    roughness={isFlexible ? 0.35 : 0.2}
                    emissive={color}
                    emissiveIntensity={0.4}
                    clearcoat={isFlexible ? 0 : 0.6}
                    clearcoatRoughness={0.1}
                    reflectivity={0.8}
                />
            </mesh>
        );
    },
    (prev, next) => {
        const startSame =
            prev.start[0] === next.start[0] &&
            prev.start[1] === next.start[1] &&
            prev.start[2] === next.start[2];

        const endSame =
            prev.end[0] === next.end[0] &&
            prev.end[1] === next.end[1] &&
            prev.end[2] === next.end[2];

        return (
            startSame &&
            endSame &&
            prev.color === next.color &&
            prev.thickness === next.thickness &&
            prev.slack === next.slack &&
            prev.segments === next.segments
        );
    }
);

export default Busbar;
