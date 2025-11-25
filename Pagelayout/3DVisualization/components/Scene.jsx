import React, {
  Suspense,
  useState,
  useEffect,
  useRef,
  useCallback,
  memo,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Sky,
  Box,
  Cylinder,
  AdaptiveDpr,
  AdaptiveEvents,
  Html,
} from "@react-three/drei";

import SubstationGround from "./SubstationGround";
import Transformer from "./Transformer";
import Breaker from "./Breaker";
import Busbar from "./Busbar";
import Gantry from "./Gantry";
import LightningArrester from "./LightningArrester";
import InstrumentTransformer from "./InstrumentTransformer";
import Isolator from "./Isolator";
import ControlRoom from "./ControlRoom";
import TransmissionTower from "./TransmissionTower";
import { EarthPit, GIStrip } from "./EarthingSystem";

import * as THREE from "three";

// --- CONSTANTS FOR LAYOUT ---
const BAY_SPACING = 60;
const BAYS_SIDE_L = [1, 2, 3, 4, 5, 6, 7, 8];
const BAYS_SIDE_R = [1, 2, 3, 4, 5, 6, 7, 8];
const BUS_Z_OFFSETS = [-2, 0, 2];

// --- GLOBAL MATERIALS (OPTIMIZATION) ---
const MAT_INSULATOR = new THREE.MeshStandardMaterial({
  color: "#7c2d12",
  roughness: 0.2,
});
const MAT_METAL = new THREE.MeshStandardMaterial({ color: "#475569" });
const MAT_CONCRETE = new THREE.MeshStandardMaterial({
  color: "#9ca3af",
  roughness: 0.9,
});
const MAT_CONDUIT = new THREE.MeshStandardMaterial({ color: "#64748b" });
const MAT_ROAD = new THREE.MeshStandardMaterial({
  color: "#334155",
  roughness: 0.9,
});
const MAT_LINE = new THREE.MeshStandardMaterial({
  color: "white",
  emissive: "white",
  emissiveIntensity: 0.2,
});
const MAT_TRENCH_COVER_MERGED = new THREE.MeshStandardMaterial({
  color: "#475569",
  roughness: 0.8,
  map: null,
});

// --- INSULATOR STRING COMPONENT (OPTIMIZED) ---
const InsulatorString = memo(function InsulatorString({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <Cylinder
        args={[0.03, 0.03, 0.5, 4]}
        position={[0, 0, 0]}
        material={MAT_METAL}
      />
      <Cylinder
        args={[0.12, 0.12, 1.2, 5]}
        position={[0, -0.85, 0]}
        material={MAT_INSULATOR}
      />
    </group>
  );
});

// --- Optimized Cable Management ---
const CableTrench = memo(function CableTrench({
  start,
  length,
  horizontal = false,
}) {
  return (
    <group position={[start[0], 0.02, start[2]]}>
      {/* Base Trench */}
      <Box
        args={[horizontal ? length : 1.4, 0.05, horizontal ? 1.4 : length]}
        position={[
          horizontal ? length / 2 : 0,
          -0.02,
          horizontal ? 0 : length / 2,
        ]}
        material={MAT_CONCRETE}
        receiveShadow={false}
      />
      {/* Single merged cover */}
      <Box
        args={[horizontal ? length : 1.2, 0.02, horizontal ? 1.2 : length]}
        position={[
          horizontal ? length / 2 : 0,
          0.02,
          horizontal ? 0 : length / 2,
        ]}
        material={MAT_TRENCH_COVER_MERGED}
        receiveShadow={false}
      />
    </group>
  );
});

const Conduit = memo(function Conduit({ position, height }) {
  return (
    <group position={position}>
      <Cylinder
        args={[0.05, 0.05, height, 4]}
        position={[0, height / 2, 0]}
        material={MAT_CONDUIT}
      />
    </group>
  );
});

const RoadLine = memo(function RoadLine({ startX, endX }) {
  const length = endX - startX + 100;
  const centerX = (startX + endX) / 2;
  return (
    <group position={[centerX, 0.15, 0]}>
      <Box args={[length, 0.2, 12]} receiveShadow={false} material={MAT_ROAD} />
      <Box
        args={[length, 0.22, 0.3]}
        position={[0, 0.02, 0]}
        material={MAT_LINE}
      />
    </group>
  );
});

const BoundingBoxHighlighter = ({ selectedObject }) => {
  const { scene } = useThree();
  const [boxData, setBoxData] = useState(null);
  const lastId = useRef(null);

  useFrame(() => {
    if (!selectedObject) {
      if (boxData !== null) setBoxData(null);
      return;
    }

    if (boxData && lastId.current === selectedObject.id) return;

    let obj = scene.getObjectByName(selectedObject.id);
    if (!obj) {
      scene.traverse((child) => {
        if (child.name === selectedObject.id) obj = child;
      });
    }

    if (obj) {
      const box = new THREE.Box3().setFromObject(obj);
      if (!box.isEmpty()) {
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);
        size.multiplyScalar(1.1);

        setBoxData({ position: center, size });
        lastId.current = selectedObject.id;
      }
    }
  });

  useEffect(() => {
    if (!selectedObject) {
      setBoxData(null);
      lastId.current = null;
    }
  }, [selectedObject]);

  if (!boxData || !selectedObject) return null;

  if (selectedObject.type === "earthing" || selectedObject.type === "waveTrap") {
    return (
      <group position={boxData.position}>
        <mesh>
          <boxGeometry
            args={[boxData.size.x, boxData.size.y, boxData.size.z]}
          />
          <meshBasicMaterial color="#00ff00" wireframe />
        </mesh>
      </group>
    );
  }

  return (
    <group position={boxData.position}>
      <mesh>
        <boxGeometry args={[boxData.size.x, boxData.size.y, boxData.size.z]} />
        <meshBasicMaterial color="#00ff00" wireframe />
      </mesh>
      <Html
        position={[boxData.size.x / 2, boxData.size.y / 2, boxData.size.z / 2]}
        center
        distanceFactor={25}
        zIndexRange={[100, 0]}
      >
        <div className="flex flex-col items-start pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex items-center gap-2 bg-white border border-black px-2 py-1 shadow-sm">
            <span className="text-xs font-mono text-black font-bold uppercase tracking-wider">
              {selectedObject.name}
            </span>
          </div>
        </div>
      </Html>
    </group>
  );
};

// --- STATIC INFRASTRUCTURE ---
const InfrastructureLayer = memo(function InfrastructureLayer({ onSelect }) {
  const minBayX = 1 * BAY_SPACING;
  const maxBayX = 8 * BAY_SPACING;
  const roadStartX = minBayX - 100;
  const roadEndX = maxBayX + 100;

  const GEN_X = minBayX - 80;
  const CR_GEN_X = GEN_X - 80;
  const CR_MAIN_X = maxBayX + 80;

  const GROUND_WIRE_COLOR = "#94a3b8";
  const GROUND_WIRE_THICK = 0.03;

  return (
    <group>
      <SubstationGround />
      <RoadLine startX={roadStartX} endX={roadEndX} />

      {BUS_Z_OFFSETS.map((z, i) => (
        <Busbar
          key={`main-bus-${i}`}
          start={[roadStartX, 13, z]}
          end={[roadEndX, 13, z]}
          thickness={0.06}
          color="#cbd5e1"
        />
      ))}

      {/* CABLE TRENCHES */}
      <group>
        <CableTrench start={[0, 0, 32]} length={580} horizontal />
        <CableTrench start={[-120, 0, -32]} length={650} horizontal />

        {[BAYS_SIDE_L, BAYS_SIDE_R].map((bays, sideIdx) => {
          const isRight = sideIdx === 1;
          const startZ = isRight ? -32 : 15;
          const length = 17;

          return bays.map((bayIdx) => {
            const bayX = bayIdx * BAY_SPACING;
            return (
              <CableTrench
                key={`trench-${sideIdx}-${bayIdx}`}
                start={[bayX, 0, startZ]}
                length={length}
                horizontal={false}
              />
            );
          });
        })}
      </group>

      {/* EARTHING GRID */}
      <group>
        <GIStrip
          start={[roadStartX, 0, 50]}
          end={[roadEndX, 0, 50]}
          onSelect={onSelect}
        />
        <GIStrip
          start={[roadStartX, 0, -50]}
          end={[roadEndX, 0, -50]}
          onSelect={onSelect}
        />
        <GIStrip
          start={[roadStartX, 0, 0]}
          end={[roadEndX, 0, 0]}
          onSelect={onSelect}
        />
      </group>

      {[BAYS_SIDE_L, BAYS_SIDE_R].map((bays, sideIdx) => {
        const isRight = sideIdx === 1;
        const zDir = isRight ? -1 : 1;
        const sidePrefix = isRight ? "R" : "L";

        const lineGantryZ = 45 * zDir;
        const towerZ = 95 * zDir;
        const towerHeight = 30;
        const gantryHeight = 14;

        return (
          <group key={`side-${sidePrefix}`}>
            {bays.map((bayIdx, index) => {
              const bayX = bayIdx * BAY_SPACING;
              const isLast = index === bays.length - 1;

              return (
                <group
                  key={`bay-${sidePrefix}-${bayIdx}`}
                  position={[bayX, 0, 0]}
                >
                  <GIStrip
                    start={[0, 0, 0]}
                    end={[0, 0, 50 * zDir]}
                    onSelect={onSelect}
                  />
                  <EarthPit position={[2, 0, 25 * zDir]} onSelect={onSelect} />
                  <EarthPit
                    position={[-2, 0, 45 * zDir]}
                    onSelect={onSelect}
                  />

                  <Gantry
                    id={`GANTRY-LINE-${sidePrefix}-${bayIdx}`}
                    position={[0, 0, lineGantryZ]}
                    width={20}
                    height={14}
                    levels={1}
                    onSelect={onSelect}
                  />
                  <TransmissionTower
                    position={[0, 0, towerZ]}
                    scale={2.5}
                    rotation={[0, isRight ? 0 : Math.PI, 0]}
                  />

                  {/* Ground wire between towers */}
                  {!isLast && (
                    <Busbar
                      start={[0, towerHeight, towerZ]}
                      end={[BAY_SPACING, towerHeight, towerZ]}
                      slack={4}
                      thickness={GROUND_WIRE_THICK}
                      color={GROUND_WIRE_COLOR}
                      segments={6}
                    />
                  )}

                  {/* Ground wire tower to gantry */}
                  <Busbar
                    start={[0, towerHeight, towerZ]}
                    end={[0, gantryHeight + 1, lineGantryZ]}
                    slack={2}
                    thickness={GROUND_WIRE_THICK}
                    color={GROUND_WIRE_COLOR}
                    segments={4}
                  />

                  {/* PHASE EQUIPMENT PER BAY */}
                  {[-3, 0, 3].map((phaseOffset, i) => {
                    const x = phaseOffset;
                    const busZ = BUS_Z_OFFSETS[i];
                    const zBusConn = busZ;
                    const zIsoBus = 10 * zDir;
                    const zBreaker = 15 * zDir;
                    const zTrans = 25 * zDir;
                    const zIsoLine = 35 * zDir;

                    const waveTrapHeight = 11.5;

                    return (
                      <group key={`ph-${sidePrefix}-${i}`}>
                        {/* Bus to bus-side isolator */}
                        <Busbar
                          start={[x, 13, zBusConn]}
                          end={[x, 3.5, zIsoBus]}
                          slack={2}
                          thickness={0.05}
                        />
                        <Isolator
                          id={`ISO-BUS-${sidePrefix}-${bayIdx}-${i}`}
                          position={[x, 3.5, zIsoBus]}
                          rotation={[0, Math.PI / 2, 0]}
                          onSelect={onSelect}
                        />

                        {/* Isolator to breaker */}
                        <Busbar
                          start={[x, 3.5, zIsoBus]}
                          end={[x, 4, zBreaker]}
                          thickness={0.05}
                        />
                        <Conduit
                          position={[x + 0.6, 0, zBreaker]}
                          height={0.8}
                        />

                        {/* Breaker to transformer and line side */}
                        <Busbar
                          start={[x, 4, zBreaker]}
                          end={[x, 4.5, zTrans - 3 * zDir]}
                          thickness={0.05}
                        />
                        <Busbar
                          start={[x, 4.5, zTrans + 3 * zDir]}
                          end={[x, 3.5, zIsoLine]}
                          thickness={0.05}
                        />
                        <Isolator
                          id={`ISO-LINE-${sidePrefix}-${bayIdx}-${i}`}
                          position={[x, 3.5, zIsoLine]}
                          rotation={[0, Math.PI / 2, 0]}
                          onSelect={onSelect}
                        />

                        {/* Line isolator to wave trap */}
                        <Busbar
                          start={[x, 3.5, zIsoLine]}
                          end={[x, waveTrapHeight - 0.8, lineGantryZ]}
                          slack={2}
                          thickness={0.04}
                        />

                        {/* Wave trap to tower jumper */}
                        <Busbar
                          start={[x, waveTrapHeight + 0.8, lineGantryZ]}
                          end={[x * 2, 18, towerZ]}
                          slack={3}
                          thickness={0.03}
                        />
                        <InsulatorString position={[x * 2, 19, towerZ]} />

                        <LightningArrester
                          id={`LA-${sidePrefix}-${bayIdx}-${i}`}
                          position={[x + 2, 0, zIsoLine]}
                          onSelect={onSelect}
                        />
                        <InstrumentTransformer
                          id={`CVT-${sidePrefix}-${bayIdx}-${i}`}
                          type="CVT"
                          position={[x - 2, 0, zIsoLine]}
                          onSelect={onSelect}
                        />

                        {/* Suspended Wave Trap */}
                        <InstrumentTransformer
                          id={`WT-${sidePrefix}-${bayIdx}-${i}`}
                          type="WaveTrap"
                          position={[x, waveTrapHeight, lineGantryZ]}
                          onSelect={onSelect}
                        />

                        {/* Wave trap to CVT jumper */}
                        <Busbar
                          start={[x, waveTrapHeight - 0.8, lineGantryZ]}
                          end={[x - 2, 4.6, zIsoLine]}
                          slack={1}
                          thickness={0.03}
                        />
                      </group>
                    );
                  })}
                </group>
              );
            })}
          </group>
        );
      })}

      {/* CONTROL ROOMS */}
      <group>
        <ControlRoom
          id="CR-GEN"
          label="Side B Control"
          position={[CR_GEN_X, 0, -30]}
          rotation={[0, Math.PI / 2, 0]}
          onSelect={onSelect}
        />
        <ControlRoom
          id="CR-MAIN"
          label="Main HQ"
          position={[CR_MAIN_X, 0, 30]}
          rotation={[0, -Math.PI / 2, 0]}
          onSelect={onSelect}
        />
      </group>
    </group>
  );
});

// --- ACTIVE EQUIPMENT LAYER ---
const ActiveEquipmentLayer = memo(function ActiveEquipmentLayer({
  scadaData,
  onSelect,
  onAcknowledge,
}) {
  return (
    <group>
      {[BAYS_SIDE_L, BAYS_SIDE_R].map((bays, sideIdx) => {
        const isRight = sideIdx === 1;
        const zDir = isRight ? -1 : 1;
        const sidePrefix = isRight ? "R" : "L";

        return (
          <group key={`active-side-${sidePrefix}`}>
            {bays.map((bayIdx) => {
              const bayX = bayIdx * BAY_SPACING;
              const zBreaker = 15 * zDir;
              const zTrans = 25 * zDir;

              return (
                <group
                  key={`active-bay-${sidePrefix}-${bayIdx}`}
                  position={[bayX, 0, 0]}
                >
                  <Transformer
                    label={`${sidePrefix}-${bayIdx}`}
                    position={[0, 0, zTrans]}
                    rotation={[0, isRight ? Math.PI : 0, 0]}
                    onSelect={onSelect}
                    realtimeData={scadaData?.[`T-${sidePrefix}-${bayIdx}`]}
                    onAcknowledge={onAcknowledge}
                  />

                  {[-3, 0, 3].map((phaseOffset, i) => {
                    const x = phaseOffset;
                    return (
                      <group key={`cb-${sidePrefix}-${bayIdx}-${i}`}>
                        <Breaker
                          id={`CB-${sidePrefix}-${bayIdx}-${i}`}
                          position={[x, 0, zBreaker]}
                          onSelect={onSelect}
                          realtimeData={
                            scadaData?.[`CB-${sidePrefix}-${bayIdx}-${i}`]
                          }
                          onAcknowledge={onAcknowledge}
                        />
                      </group>
                    );
                  })}
                </group>
              );
            })}
          </group>
        );
      })}
    </group>
  );
});

// --- CAMERA RIG ---
const CameraRig = ({ selectedObject, controlsRef }) => {
  const { camera, scene } = useThree();
  const targetPosRef = useRef(new THREE.Vector3());
  const cameraPosRef = useRef(new THREE.Vector3());
  const isFocusing = useRef(false);
  const lastId = useRef(null);

  useFrame((_, delta) => {
    if (!selectedObject) {
      isFocusing.current = false;
      lastId.current = null;
      return;
    }

    if (selectedObject.id !== lastId.current) {
      let obj = scene.getObjectByName(selectedObject.id);
      if (!obj) {
        scene.traverse((child) => {
          if (child.name === selectedObject.id) obj = child;
        });
      }

      if (obj) {
        const box = new THREE.Box3().setFromObject(obj);
        const center = new THREE.Vector3();
        box.getCenter(center);
        const size = new THREE.Vector3();
        box.getSize(size);

        const maxDim = Math.max(size.x, size.y, size.z);
        const fov =
          (camera.fov * Math.PI) /
          180; /* PerspectiveCamera assumed, vite default is fine */
        let distance = Math.abs((maxDim / 2) / Math.tan(fov / 2));
        distance *= 2.5;

        distance = Math.max(distance, 15);
        distance = Math.min(distance, 150);

        const currentDir = new THREE.Vector3()
          .subVectors(camera.position, controlsRef.current.target)
          .normalize();
        if (currentDir.lengthSq() < 0.01) {
          currentDir.set(1, 0.5, 1).normalize();
        }

        const newCamPos = center.clone().add(currentDir.multiplyScalar(distance));
        if (newCamPos.y < 5) newCamPos.y = 5;

        targetPosRef.current.copy(center);
        cameraPosRef.current.copy(newCamPos);

        isFocusing.current = true;
        lastId.current = selectedObject.id;
      }
    }

    if (isFocusing.current && controlsRef.current) {
      const damping = 4 * delta;
      controlsRef.current.target.lerp(targetPosRef.current, damping);
      camera.position.lerp(cameraPosRef.current, damping);

      const distToTarget =
        controlsRef.current.target.distanceTo(targetPosRef.current);
      const distToCamPos = camera.position.distanceTo(cameraPosRef.current);

      if (distToTarget < 0.1 && distToCamPos < 0.5) {
        isFocusing.current = false;
      }
    }
  });

  return null;
};

const Scene = ({
  viewMode, // currently unused but kept for future
  selectedObject,
  onSelectObject,
  scadaData,
  onAcknowledgeAlarm,
}) => {
  const controlsRef = useRef(null);

  const stableOnSelect = useCallback(
    (obj) => {
      if (onSelectObject) onSelectObject(obj);
    },
    [onSelectObject]
  );

  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows={false}
        camera={{
          position: [100, 100, 200],
          fov: 45,
          near: 1,
          far: 2000,
        }}
        onPointerMissed={() => stableOnSelect(null)}
        gl={{ preserveDrawingBuffer: true, antialias: false }}
      >
        <Suspense fallback={null}>
          <Sky sunPosition={[100, 20, 100]} />
          <Environment preset="city" />
          <ambientLight intensity={0.7} />
          <directionalLight
            position={[50, 200, 50]}
            intensity={1.5}
            castShadow={false}
          />

          <OrbitControls
            ref={controlsRef}
            makeDefault
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 2 - 0.05}
            minDistance={10}
            maxDistance={2000}
          />

          <CameraRig
            selectedObject={selectedObject}
            controlsRef={controlsRef}
          />

          <InfrastructureLayer onSelect={stableOnSelect} />
          <ActiveEquipmentLayer
            scadaData={scadaData}
            onSelect={stableOnSelect}
            onAcknowledge={onAcknowledgeAlarm}
          />

          <BoundingBoxHighlighter selectedObject={selectedObject || null} />

          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene;
