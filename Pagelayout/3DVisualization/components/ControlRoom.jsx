import React, { useState, useMemo, useRef } from "react";
import { Box, Cylinder, Text, Html, Plane, Sphere, Torus } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import BatterySystem from "./BatterySystem";

// --- GLOBAL MATERIALS (OPTIMIZATION) ---
const MAT_WALL = new THREE.MeshStandardMaterial({ color: "#f1f5f9", roughness: 0.8 });
const MAT_FLOOR_EPOXY = new THREE.MeshStandardMaterial({ color: "#e2e8f0", roughness: 0.2, metalness: 0.1 });
const MAT_FLOOR_TILE = new THREE.MeshStandardMaterial({ color: "#cbd5e1", roughness: 0.5 });
const MAT_TRENCH_COVER = new THREE.MeshStandardMaterial({ color: "#475569", roughness: 0.7, metalness: 0.6 });
const MAT_GLASS_DARK = new THREE.MeshPhysicalMaterial({
  color: "#1e293b",
  metalness: 0.9,
  roughness: 0.05,
  transparent: true,
  opacity: 0.3,
});
const MAT_SERVER_BLACK = new THREE.MeshStandardMaterial({ color: "#0f172a", roughness: 0.4, metalness: 0.6 });
const MAT_SERVER_BLADE = new THREE.MeshStandardMaterial({ color: "#334155" });
const MAT_RTU_GREY = new THREE.MeshStandardMaterial({ color: "#94a3b8", roughness: 0.5, metalness: 0.4 });
const MAT_SCREEN_GLOW = new THREE.MeshStandardMaterial({
  color: "#0ea5e9",
  emissive: "#0ea5e9",
  emissiveIntensity: 0.6,
});
const MAT_SCREEN_SLD = new THREE.MeshStandardMaterial({
  color: "#0f172a",
  emissive: "#0f172a",
  emissiveIntensity: 0.2,
});
const MAT_LED_GREEN = new THREE.MeshBasicMaterial({ color: "#22c55e" });
const MAT_LED_RED = new THREE.MeshBasicMaterial({ color: "#ef4444" });
const MAT_LED_YELLOW = new THREE.MeshBasicMaterial({ color: "#eab308" });
const MAT_PLASTIC_WHITE = new THREE.MeshStandardMaterial({ color: "#f8fafc", roughness: 0.3 });
const MAT_DESK_WOOD = new THREE.MeshStandardMaterial({ color: "#78350f", roughness: 0.6 });
const MAT_FIRE_RED = new THREE.MeshStandardMaterial({ color: "#dc2626" });
const MAT_FIRE_BLACK = new THREE.MeshStandardMaterial({ color: "black" });
const MAT_HVAC_BODY = new THREE.MeshStandardMaterial({ color: "#cbd5e1", roughness: 0.4 });
const MAT_HVAC_GRILL = new THREE.MeshStandardMaterial({ color: "#64748b" });
const MAT_TRENCH_BODY = new THREE.MeshStandardMaterial({ color: "#1e293b" });
const MAT_PERIPHERAL = new THREE.MeshStandardMaterial({ color: "#1e293b" });
const MAT_BUTTON_YELLOW = new THREE.MeshStandardMaterial({ color: "#fbbf24" });
const MAT_SCREEN_OFF = new THREE.MeshStandardMaterial({ color: "#000000" });
const MAT_TABLE_TOP = new THREE.MeshStandardMaterial({ color: "#9ca3af" });
const MAT_TABLE_LEG = new THREE.MeshStandardMaterial({ color: "#4b5563" });
const MAT_TABLE_CHAIR = new THREE.MeshStandardMaterial({ color: "#1e293b" });
const MAT_LIGHT_BODY = new THREE.MeshStandardMaterial({ color: "#334155" });
const MAT_LIGHT_EMIT = new THREE.MeshStandardMaterial({
  color: "#fef3c7",
  emissive: "#fef3c7",
  emissiveIntensity: 0.5,
});
const MAT_ROOF = new THREE.MeshStandardMaterial({ color: "#334155" });
const MAT_FRAME = new THREE.MeshStandardMaterial({ color: "#1e293b" });
const MAT_FOUNDATION = new THREE.MeshStandardMaterial({ color: "#78716c" });

// Translucent materials for interior view
const MAT_WALL_TRANS = new THREE.MeshStandardMaterial({
  color: "#f1f5f9",
  transparent: true,
  opacity: 0.1,
  depthWrite: false,
});
const MAT_GLASS_TRANS = new THREE.MeshStandardMaterial({
  color: "#0ea5e9",
  metalness: 0.9,
  roughness: 0.1,
  transparent: true,
  opacity: 0.05,
  depthWrite: false,
});
const MAT_ROOF_TRANS = new THREE.MeshStandardMaterial({
  color: "#334155",
  transparent: true,
  opacity: 0.1,
  depthWrite: false,
});
const MAT_FRAME_TRANS = new THREE.MeshStandardMaterial({
  color: "#1e293b",
  transparent: true,
  opacity: 0.1,
  depthWrite: false,
});

// --- SUB-COMPONENTS ---

const FireExtinguisher = React.memo(({ position }) => (
  <group position={position}>
    <Cylinder args={[0.12, 0.12, 0.6, 8]} position={[0, 0.3, 0]} material={MAT_FIRE_RED} />
    <Sphere
      args={[0.12, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]}
      position={[0, 0.6, 0]}
      material={MAT_FIRE_RED}
    />
    <Box args={[0.05, 0.1, 0.05]} position={[0.08, 0.65, 0]} material={MAT_FIRE_BLACK} />
    <Torus
      args={[0.08, 0.01, 4, 6]}
      position={[-0.05, 0.6, 0]}
      rotation={[0, 0, Math.PI / 4]}
      material={MAT_FIRE_BLACK}
    />
  </group>
));

const CableTrench = React.memo(({ length, position, rotation = [0, 0, 0] }) => (
  <group position={position} rotation={new THREE.Euler(...rotation)}>
    <Box args={[length, 0.05, 0.6]} position={[0, -0.02, 0]} material={MAT_TRENCH_BODY} />
    <Box args={[length, 0.02, 0.6]} position={[0, 0.01, 0]} material={MAT_TRENCH_COVER} />
  </group>
));

const HVACUnit = React.memo(({ position }) => {
  return (
    <group position={position}>
      <Box args={[2.5, 1.2, 1.5]} position={[0, 0.6, 0]} material={MAT_HVAC_BODY} />
      <Box args={[2.6, 0.8, 0.1]} position={[0, 0.6, 0.76]} material={MAT_HVAC_GRILL} />
    </group>
  );
});

const ServerRack = React.memo(({ position, rotation = [0, 0, 0] }) => {
  const ledRef = useRef(null);

  useFrame(({ clock }) => {
    if (ledRef.current) {
      ledRef.current.visible = Math.floor(clock.elapsedTime * 8) % 2 === 0;
    }
  });

  return (
    <group position={position} rotation={new THREE.Euler(...rotation)}>
      <Box args={[0.8, 2.2, 1.0]} position={[0, 1.1, 0]} material={MAT_SERVER_BLACK} />
      <Box args={[0.75, 2.1, 0.05]} position={[0, 1.1, 0.52]} material={MAT_GLASS_DARK} />

      {Array.from({ length: 10 }).map((_, i) => (
        <group key={i} position={[0, 0.3 + i * 0.2, 0.45]}>
          <Box args={[0.7, 0.15, 0.05]} material={MAT_SERVER_BLADE} />
          <mesh position={[-0.3, 0, 0.03]} material={MAT_LED_GREEN}>
            <circleGeometry args={[0.01, 4]} />
          </mesh>
          <mesh
            position={[-0.25, 0, 0.03]}
            material={i % 3 === 0 ? MAT_LED_YELLOW : MAT_LED_GREEN}
          >
            <circleGeometry args={[0.01, 4]} />
          </mesh>
          <mesh
            position={[-0.2, 0, 0.03]}
            material={i % 7 === 0 ? MAT_LED_RED : MAT_LED_GREEN}
          >
            <circleGeometry args={[0.01, 4]} />
          </mesh>
        </group>
      ))}

      <group ref={ledRef} position={[0.2, 1.8, 0.48]}>
        <mesh position={[0, 0, 0]} material={MAT_LED_GREEN}>
          <circleGeometry args={[0.015, 4]} />
        </mesh>
        <mesh position={[0.05, 0, 0]} material={MAT_LED_GREEN}>
          <circleGeometry args={[0.015, 4]} />
        </mesh>
      </group>

      <Text position={[0, 2.3, 0.5]} fontSize={0.08} color="white" anchorX="center">
        SCADA SRV
      </Text>
    </group>
  );
});

const RTUPanel = React.memo(({ position, rotation = [0, 0, 0] }) => {
  return (
    <group position={position} rotation={new THREE.Euler(...rotation)}>
      <Box args={[0.8, 2.2, 0.6]} position={[0, 1.1, 0]} material={MAT_RTU_GREY} />
      <Box args={[0.05, 0.2, 0.05]} position={[0.3, 1.1, 0.32]} material={MAT_FIRE_BLACK} />

      <Box args={[0.6, 0.1, 0.01]} position={[0, 1.8, 0.31]} material={MAT_PLASTIC_WHITE} />
      <Text position={[0, 1.8, 0.32]} fontSize={0.06} color="black" anchorX="center">
        RTU PANEL
      </Text>

      <group position={[-0.2, 1.6, 0.31]}>
        <mesh material={MAT_LED_GREEN}>
          <circleGeometry args={[0.02, 8]} />
        </mesh>
        <Text position={[0, -0.05, 0]} fontSize={0.03} color="black">
          RUN
        </Text>
      </group>

      <group position={[0, 1.6, 0.31]}>
        <mesh material={MAT_LED_RED}>
          <circleGeometry args={[0.02, 8]} />
        </mesh>
        <Text position={[0, -0.05, 0]} fontSize={0.03} color="black">
          ERR
        </Text>
      </group>

      <group position={[0.2, 1.6, 0.31]}>
        <mesh material={MAT_LED_YELLOW}>
          <circleGeometry args={[0.02, 8]} />
        </mesh>
        <Text position={[0, -0.05, 0]} fontSize={0.03} color="black">
          TX/RX
        </Text>
      </group>

      <Box args={[0.6, 0.3, 0.02]} position={[0, 0.4, 0.3]} material={MAT_SERVER_BLADE} />
    </group>
  );
});

const LargeWallScreen = React.memo(({ position, rotation = [0, 0, 0] }) => {
  return (
    <group position={position} rotation={new THREE.Euler(...rotation)}>
      <Box args={[4, 2.2, 0.1]} material={MAT_SERVER_BLACK} />
      <Box args={[3.8, 2.0, 0.05]} position={[0, 0, 0.05]} material={MAT_SCREEN_SLD} />

      <group position={[-1.5, 0, 0.08]}>
        <Box args={[0.1, 1.5, 0]} material={MAT_SCREEN_GLOW} />
        <Box args={[1.5, 0.1, 0]} position={[0.8, 0.7, 0]} material={MAT_SCREEN_GLOW} />
        <Box args={[1.5, 0.1, 0]} position={[0.8, -0.7, 0]} material={MAT_SCREEN_GLOW} />
        <mesh position={[0.8, 0, 0]} material={MAT_LED_RED}>
          <circleGeometry args={[0.1, 8]} />
        </mesh>
        <mesh position={[1.2, 0, 0]} material={MAT_LED_GREEN}>
          <circleGeometry args={[0.1, 8]} />
        </mesh>
      </group>

      <Text position={[0, 1.2, 0]} fontSize={0.1} color="white">
        SUBSTATION OVERVIEW - 400kV
      </Text>
    </group>
  );
});

const SCADAWorkstation = React.memo(({ position, rotation = [0, 0, 0] }) => {
  return (
    <group position={position} rotation={new THREE.Euler(...rotation)}>
      <Box args={[2.5, 0.1, 1.2]} position={[0, 0.8, 0]} material={MAT_DESK_WOOD} />
      <Box args={[2.3, 0.8, 1.0]} position={[0, 0.4, 0]} material={MAT_SERVER_BLADE} />

      {/* Keyboard + mouse */}
      <Box args={[0.6, 0.02, 0.2]} position={[0, 0.86, 0.3]} material={MAT_PERIPHERAL} />
      <Box args={[0.1, 0.03, 0.15]} position={[0.5, 0.86, 0.3]} material={MAT_PERIPHERAL} />

      {/* E-stop */}
      <group position={[-0.8, 0.86, 0.3]}>
        <Box args={[0.15, 0.05, 0.15]} material={MAT_BUTTON_YELLOW} />
        <Cylinder args={[0.05, 0.05, 0.05, 8]} position={[0, 0.05, 0]} material={MAT_FIRE_RED} />
      </group>

      {/* Main Screens */}
      <group position={[0, 0.85, -0.2]}>
        <group position={[0, 0.3, 0]}>
          <Box args={[0.9, 0.5, 0.05]} material={MAT_SCREEN_OFF} />
          <Box
            args={[0.85, 0.45, 0.01]}
            position={[0, 0, 0.03]}
            material={MAT_SCREEN_GLOW}
          />
          <Cylinder
            args={[0.05, 0.05, 0.3]}
            position={[0, -0.4, 0]}
            material={MAT_FIRE_BLACK}
          />
        </group>

        <group position={[-0.95, 0.3, 0.15]} rotation={[0, 0.25, 0]}>
          <Box args={[0.9, 0.5, 0.05]} material={MAT_SCREEN_OFF} />
          <Box
            args={[0.85, 0.45, 0.01]}
            position={[0, 0, 0.03]}
            material={MAT_SCREEN_GLOW}
          />
          <Cylinder
            args={[0.05, 0.05, 0.3]}
            position={[0, -0.4, 0]}
            material={MAT_FIRE_BLACK}
          />
        </group>

        <group position={[0.95, 0.3, 0.15]} rotation={[0, -0.25, 0]}>
          <Box args={[0.9, 0.5, 0.05]} material={MAT_SCREEN_OFF} />
          <Box
            args={[0.85, 0.45, 0.01]}
            position={[0, 0, 0.03]}
            material={MAT_SCREEN_GLOW}
          />
          <Cylinder
            args={[0.05, 0.05, 0.3]}
            position={[0, -0.4, 0]}
            material={MAT_FIRE_BLACK}
          />
        </group>
      </group>

      {/* Chair */}
      <group position={[0, 0, 1.0]} rotation={[0, Math.PI, 0]}>
        <Box args={[0.6, 0.1, 0.6]} position={[0, 0.5, 0]} material={MAT_PERIPHERAL} />
        <Box args={[0.6, 0.8, 0.1]} position={[0, 0.9, 0.25]} material={MAT_PERIPHERAL} />
        <Cylinder args={[0.05, 0.05, 0.5]} position={[0, 0.25, 0]} material={MAT_FIRE_BLACK} />
        <Cylinder
          args={[0.35, 0.35, 0.05, 5]}
          position={[0, 0.025, 0]}
          material={MAT_FIRE_BLACK}
        />
      </group>
    </group>
  );
});

const ConferenceTable = React.memo(({ position }) => {
  return (
    <group position={position}>
      <Box args={[4, 0.1, 1.5]} position={[0, 0.8, 0]} material={MAT_TABLE_TOP} />
      <Cylinder args={[0.2, 0.2, 0.8]} position={[1, 0.4, 0]} material={MAT_TABLE_LEG} />
      <Cylinder args={[0.2, 0.2, 0.8]} position={[-1, 0.4, 0]} material={MAT_TABLE_LEG} />
      {[-1.5, -0.5, 0.5, 1.5].map((x, i) => (
        <React.Fragment key={i}>
          <Box args={[0.5, 0.05, 0.5]} position={[x, 0.5, 1]} material={MAT_TABLE_CHAIR} />
          <Box args={[0.5, 0.6, 0.05]} position={[x, 0.8, 1.25]} material={MAT_TABLE_CHAIR} />
          <Box args={[0.5, 0.05, 0.5]} position={[x, 0.5, -1]} material={MAT_TABLE_CHAIR} />
          <Box args={[0.5, 0.6, 0.05]} position={[x, 0.8, -1.25]} material={MAT_TABLE_CHAIR} />
        </React.Fragment>
      ))}
    </group>
  );
});

const WallLight = ({ position, rotation = [0, 0, 0] }) => (
  <group position={position} rotation={new THREE.Euler(...rotation)}>
    <Box args={[0.1, 0.2, 0.1]} position={[0, 0, 0]} material={MAT_LIGHT_BODY} />
    <Box args={[0.15, 0.15, 0.15]} position={[0, 0.1, 0.05]} material={MAT_LIGHT_EMIT} />
  </group>
);

const ConnectingCorridor = React.memo(({ startX, endX }) => {
  const length = Math.abs(endX - startX);
  const midX = (startX + endX) / 2;

  return (
    <group position={[midX, 0, 0]}>
      <Box
        args={[length, 0.2, 2]}
        position={[0, 0.5, 0]}
        material={MAT_FOUNDATION}
      />
      <Box
        args={[length, 0.2, 2.4]}
        position={[0, 3, 0]}
        material={MAT_ROOF_TRANS}
      />
      <Box
        args={[length, 2.5, 0.05]}
        position={[0, 1.75, 1]}
        material={MAT_GLASS_TRANS}
      />
      <Box
        args={[length, 2.5, 0.05]}
        position={[0, 1.75, -1]}
        material={MAT_GLASS_TRANS}
      />
    </group>
  );
});

// ✅ FIXED BatteryBuilding (pure JSX)
const BatteryBuilding = ({ position, onSelect }) => {
  const [showInterior, setShowInterior] = useState(false);
  const [hovered, setHovered] = useState(false);

  const id = "BAT-BLDG";

  const width = 10;
  const depth = 8;
  const height = 5;
  const wallThick = 0.2;

  const matDoor = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#334155", metalness: 0.4 }),
    []
  );

  const matDoorTrans = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#334155",
        metalness: 0.4,
        transparent: true,
        opacity: 0.1,
        depthWrite: false,
      }),
    []
  );

  const handleClick = (e) => {
    e.stopPropagation();
    setShowInterior(!showInterior);
    if (onSelect) {
      onSelect({
        id: id,
        name: "Battery Room Annex",
        type: "unknown",
      });
    }
  };

  const WallMat = showInterior ? MAT_WALL_TRANS : MAT_WALL;
  const RoofMat = showInterior ? MAT_ROOF_TRANS : MAT_ROOF;
  const DoorMat = showInterior ? matDoorTrans : matDoor;

  return (
    <group
      name={id}
      position={position}
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
      <Box
        args={[width + 1, 0.4, depth + 1]}
        position={[0, 0.2, 0]}
        material={MAT_FOUNDATION}
      />
      <Box
        args={[width, 0.2, depth]}
        position={[0, 0.5, 0]}
        material={MAT_FLOOR_EPOXY}
      />

      {/* Inside equipment */}
      <group position={[0, 0.6, 0]}>
        <BatterySystem position={[0, 0, 0]} onSelect={onSelect} />

        <group position={[0, 3.5, 0]}>
          <Box
            args={[8, 0.1, 0.2]}
            position={[0, 0, 2]}
            material={MAT_LIGHT_EMIT}
          />
          <Box
            args={[8, 0.1, 0.2]}
            position={[0, 0, -2]}
            material={MAT_LIGHT_EMIT}
          />
        </group>
      </group>

      {/* Outer walls & doors */}
      <group>
        {/* Back Wall */}
        <Box
          args={[width, height, wallThick]}
          position={[0, height / 2 + 0.4, -depth / 2 + wallThick / 2]}
          material={WallMat}
        />

        {/* Front Wall with Doors */}
        <group position={[0, height / 2 + 0.4, depth / 2 - wallThick / 2]}>
          <Box
            args={[width / 2 - 1.5, height, wallThick]}
            position={[-width / 4 - 0.75, 0, 0]}
            material={WallMat}
          />
          <Box
            args={[width / 2 - 1.5, height, wallThick]}
            position={[width / 4 + 0.75, 0, 0]}
            material={WallMat}
          />
          <Box
            args={[3, height - 3, wallThick]}
            position={[0, 1.5, 0]}
            material={WallMat}
          />

          {/* Double Doors */}
          <Box
            args={[1.4, 2.8, 0.1]}
            position={[-0.75, -height / 2 + 1.4, 0.1]}
            material={DoorMat}
          />
          <Box
            args={[1.4, 2.8, 0.1]}
            position={[0.75, -height / 2 + 1.4, 0.1]}
            material={DoorMat}
          />

          {!showInterior && (
            <>
              <Text
                position={[0, 1.8, 0.15]}
                fontSize={0.25}
                color="black"
                anchorX="center"
              >
                BATTERY ROOM
              </Text>
              <Text
                position={[0, 1.5, 0.15]}
                fontSize={0.15}
                color="red"
                anchorX="center"
              >
                DANGER: HIGH VOLTAGE
              </Text>
            </>
          )}
        </group>

        {/* Side Walls */}
        <Box
          args={[wallThick, height, depth]}
          position={[-width / 2 + wallThick / 2, height / 2 + 0.4, 0]}
          material={WallMat}
        />
        <Box
          args={[wallThick, height, depth]}
          position={[width / 2 - wallThick / 2, height / 2 + 0.4, 0]}
          material={WallMat}
        />

        {/* Roof */}
        <group position={[0, height + 0.4, 0]}>
          <Box
            args={[width / 2 + 0.5, 0.2, depth + 1]}
            position={[-width / 4, 1, 0]}
            rotation={[0, 0, 0.4]}
            material={RoofMat}
          />
          <Box
            args={[width / 2 + 0.5, 0.2, depth + 1]}
            position={[width / 4, 1, 0]}
            rotation={[0, 0, -0.4]}
            material={RoofMat}
          />
        </group>
      </group>

      {/* Hover Label */}
      {hovered && !showInterior && (
        <Html position={[0, height + 3, 0]} center distanceFactor={20}>
          <div className="bg-white text-black px-2 py-1 rounded border border-black shadow-md text-xs font-bold whitespace-nowrap">
            Battery Bank
          </div>
        </Html>
      )}
    </group>
  );
};

// --- MAIN CONTROL ROOM BUILDING ---

const ControlRoom = ({
  id = "CR-MAIN",
  label = "Control Center",
  position,
  rotation = [0, 0, 0],
  onSelect,
}) => {
  const width = 22;
  const depth = 14;
  const numFloors = 6;
  const floorHeight = 4.5;
  const totalHeight = floorHeight * numFloors;
  const wallThick = 0.4;

  const [showInterior, setShowInterior] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    setShowInterior(!showInterior);
    if (onSelect) {
      onSelect({
        id: id,
        name: label,
        type: "unknown",
      });
    }
  };

  const WallMat = showInterior ? MAT_WALL_TRANS : MAT_WALL;
  const GlassMat = showInterior ? MAT_GLASS_TRANS : MAT_GLASS_DARK;
  const RoofMat = showInterior ? MAT_ROOF_TRANS : MAT_ROOF;
  const FrameMat = showInterior ? MAT_FRAME_TRANS : MAT_FRAME;

  const showBatteryAnnex = id === "CR-GEN";

  return (
    <group
      name={id}
      position={position}
      rotation={new THREE.Euler(...rotation)}
      onPointerOver={() => {
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      <group onClick={handleClick}>
        {/* Foundation */}
        <Box
          args={[width + 2, 0.5, depth + 2]}
          position={[0, 0.25, 0]}
          material={MAT_FOUNDATION}
        />

        {/* FLOORS */}
        {Array.from({ length: numFloors }).map((_, i) => (
          <group key={`floor-${i}`} position={[0, i * floorHeight, 0]}>
            {/* Floor slab */}
            <Box
              args={[width, 0.2, depth]}
              position={[0, 0.1, 0]}
              material={i === 0 ? MAT_FLOOR_EPOXY : MAT_FLOOR_TILE}
            />

            {/* Interior layout per floor */}
            {i === 0 ? (
              // --- Ground Floor: SCADA + Server Room ---
              <group position={[0, 0.1, 0]}>
                <CableTrench length={18} position={[0, 0, -2]} />
                <CableTrench length={18} position={[0, 0, 4]} />

                {[-8, -6, -4, -2, 0, 2, 4, 6, 8].map((x, idx) => (
                  <ServerRack key={`srv-${idx}`} position={[x, 0, -5]} />
                ))}

                <RTUPanel position={[-9, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
                <RTUPanel position={[-9, 0, 2]} rotation={[0, Math.PI / 2, 0]} />

                <SCADAWorkstation position={[-3, 0, 1]} rotation={[0, Math.PI, 0]} />
                <SCADAWorkstation position={[3, 0, 1]} rotation={[0, Math.PI, 0]} />
                <SCADAWorkstation position={[0, 0, 1]} rotation={[0, Math.PI, 0]} />

                <LargeWallScreen position={[0, 1.5, 6]} rotation={[0, Math.PI, 0]} />

                <FireExtinguisher position={[9, 0, 6]} />
                <FireExtinguisher position={[-9, 0, 6]} />

                <pointLight
                  position={[0, 3.5, 0]}
                  intensity={showInterior ? 0.5 : 0}
                  distance={15}
                  color="#f0f9ff"
                />
                <rectAreaLight
                  width={10}
                  height={2}
                  position={[0, 4, 6]}
                  intensity={showInterior ? 2 : 0}
                  color="#0ea5e9"
                />
              </group>
            ) : (
              // --- Upper Floors: Conference / Office ---
              <group position={[0, 0.6, 0]}>
                <ConferenceTable position={[0, 0, 0]} />
                <Box
                  args={[1.5, 0.8, 3]}
                  position={[-5, 0.4, 3]}
                  material={MAT_TABLE_TOP}
                />
              </group>
            )}
          </group>
        ))}

        {/* Structural Walls */}
        <Box
          args={[width, totalHeight, wallThick]}
          position={[0, totalHeight / 2, -depth / 2 + wallThick / 2]}
          material={WallMat}
        />
        <Box
          args={[wallThick, totalHeight, depth - wallThick * 2]}
          position={[-width / 2 + wallThick / 2, totalHeight / 2, 0]}
          material={WallMat}
        />
        <Box
          args={[wallThick, totalHeight, depth - wallThick * 2]}
          position={[width / 2 - wallThick / 2, totalHeight / 2, 0]}
          material={WallMat}
        />

        <Cylinder
          args={[0.4, 0.4, totalHeight]}
          position={[width / 3, totalHeight / 2, 0]}
          material={WallMat}
        />
        <Cylinder
          args={[0.4, 0.4, totalHeight]}
          position={[-width / 3, totalHeight / 2, 0]}
          material={WallMat}
        />

        {/* Side HVAC block */}
        <group position={[width / 2 - 2, totalHeight / 2, -depth / 2 + 3]}>
          <Box args={[2, totalHeight, 4]} material={MAT_HVAC_GRILL} />
        </group>

        {/* Roof + rooftop HVAC */}
        <group>
          <group position={[0, totalHeight, 0]}>
            <Box
              args={[width + 1, 0.5, depth + 1]}
              position={[0, 0.25, 0]}
              material={RoofMat}
            />
            <Box
              args={[width + 1, 1, 0.3]}
              position={[0, 0.5, depth / 2 + 0.35]}
              material={WallMat}
            />
            <Box
              args={[width + 1, 1, 0.3]}
              position={[0, 0.5, -depth / 2 - 0.35]}
              material={WallMat}
            />
            <Box
              args={[0.3, 1, depth + 1]}
              position={[width / 2 + 0.35, 0.5, 0]}
              material={WallMat}
            />
            <Box
              args={[0.3, 1, depth + 1]}
              position={[-width / 2 - 0.35, 0.5, 0]}
              material={WallMat}
            />

            <HVACUnit position={[-6, 0.5, 2]} />
            <HVACUnit position={[-6, 0.5, -2]} />
            <HVACUnit position={[5, 0.5, 0]} />
            <HVACUnit position={[0, 0.5, 3]} />
          </group>

          {/* Front glass facade */}
          <group position={[0, totalHeight / 2, depth / 2]}>
            {Array.from({ length: numFloors }).map((_, i) => (
              <group
                key={`facade-${i}`}
                position={[0, (i - numFloors / 2 + 0.5) * floorHeight, 0]}
              >
                <Box
                  args={[width - 1, floorHeight - 0.5, 0.1]}
                  position={[0, 0, 0]}
                  material={GlassMat}
                />
                <Box
                  args={[width, 0.5, 0.4]}
                  position={[0, -floorHeight / 2 + 0.25, 0]}
                  material={WallMat}
                />
              </group>
            ))}
            <Box
              args={[width, 0.5, 0.4]}
              position={[0, totalHeight / 2 - 0.25, 0]}
              material={WallMat}
            />
            {[-8, -4, 0, 4, 8].map((x, i) => (
              <Box
                key={i}
                args={[0.3, totalHeight, 0.3]}
                position={[x, 0, 0.1]}
                material={FrameMat}
              />
            ))}
          </group>

          {/* Entrance canopy */}
          <group position={[0, 0, depth / 2 + 2]}>
            <Box
              args={[5, 0.2, 3]}
              position={[0, 3.5, 0]}
              material={RoofMat}
            />
            <Cylinder
              args={[0.15, 0.15, 3.5]}
              position={[-2, 1.75, 1]}
              material={FrameMat}
            />
            <Cylinder
              args={[0.15, 0.15, 3.5]}
              position={[2, 1.75, 1]}
              material={FrameMat}
            />
            {!showInterior && (
              <Text
                position={[0, 3.8, 1.5]}
                fontSize={0.35}
                color="white"
                anchorX="center"
              >
                HQ & CONTROL
              </Text>
            )}
          </group>

          {/* Exterior wall lights */}
          {!showInterior &&
            Array.from({ length: numFloors }).map((_, i) => (
              <group key={`lights-${i}`}>
                <WallLight position={[-4, i * floorHeight + 2.5, depth / 2 + 0.2]} />
                <WallLight position={[4, i * floorHeight + 2.5, depth / 2 + 0.2]} />
              </group>
            ))}
        </group>

        {/* Hover label */}
        {hovered && !showInterior && (
          <Html position={[0, totalHeight + 2, 0]} center distanceFactor={35}>
            <div className="bg-white text-black px-3 py-1.5 rounded-lg border border-black shadow-lg backdrop-blur-md text-sm font-bold whitespace-nowrap flex flex-col items-center">
              <span>{label}</span>
              <span className="text-[10px] font-normal text-slate-600">
                Tap to View Interior
              </span>
            </div>
          </Html>
        )}
      </group>

      {/* Battery Annex on some variants */}
      {showBatteryAnnex && (
        <group>
          <ConnectingCorridor startX={-11} endX={-20} />
          <BatteryBuilding position={[-25, 0, 0]} onSelect={onSelect} />
        </group>
      )}
    </group>
  );
};

export default ControlRoom;
