import React, { useRef, useState } from 'react';
import { Html, Sphere } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import * as THREE from 'three';

const AlarmMarker = ({ position = [0, 0, 0], message, severity, onAcknowledge }) => {
  const sphereRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Pulsing animation
  useFrame((state) => {
    if (sphereRef.current) {
      const t = state.clock.getElapsedTime();
      const scale = 1 + Math.sin(t * 4) * 0.2;

      sphereRef.current.scale.set(scale, scale, scale);

      // FIX: Safe JS material handling (no "as" TS syntax)
      const material = sphereRef.current.material;
      if (material && material instanceof THREE.Material) {
        material.opacity = 0.4 + Math.sin(t * 4) * 0.2;
      }
    }
  });

  const color = severity === 'CRITICAL' ? '#ef4444' : '#f59e0b';

  return (
    <group position={position}>
      {/* Pulsing Sphere */}
      <Sphere
        ref={sphereRef}
        args={[1.5, 16, 16]}
        onClick={(e) => {
          e.stopPropagation();
          onAcknowledge();
        }}
      >
        <meshBasicMaterial color={color} transparent opacity={0.6} depthTest={false} />
      </Sphere>

      {/* Core Sphere */}
      <Sphere args={[0.5, 16, 16]}>
        <meshBasicMaterial color={color} toneMapped={false} />
      </Sphere>

      {/* UI Label */}
      <Html
        position={[0, 2, 0]}
        center
        distanceFactor={15}
        zIndexRange={[1000, 0]}
        style={{ pointerEvents: 'auto' }}
      >
        <div
          className="flex flex-col items-center"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg shadow-xl border border-white/20 backdrop-blur-md
              ${severity === 'CRITICAL' ? 'bg-red-600/90 text-white' : 'bg-amber-500/90 text-black'}
              transition-all duration-300 transform ${isHovered ? 'scale-110' : 'scale-100'}
            `}
          >
            <AlertTriangle size={18} className="animate-bounce" />
            <div className="flex flex-col">
              <span className="font-bold text-xs uppercase tracking-wider">System Alert</span>
              <span className="font-mono text-sm font-black whitespace-nowrap">{message}</span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAcknowledge();
            }}
            className="mt-2 px-3 py-1 bg-white text-black text-xs font-bold rounded-full shadow-lg
                         flex items-center gap-1 hover:bg-slate-100 transition-colors border border-slate-300"
          >
            <CheckCircle size={12} className="text-green-600" />
            ACKNOWLEDGE
          </button>
        </div>
      </Html>

      {/* Connection Line */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 2]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>
    </group>
  );
};

export default AlarmMarker;
