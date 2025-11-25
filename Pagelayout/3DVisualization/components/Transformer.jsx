import React, { useRef, useState, useMemo, useEffect, memo } from "react";
import { Box, Cylinder, Html, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import AlarmMarker from "./AlarmMarker";
import { GroundRiser } from "./EarthingSystem";

// --- MATERIALS ---
const MAT_TANK_BODY = new THREE.MeshStandardMaterial({
  color: "#e2e8f0",
  roughness: 0.3,
  metalness: 0.2,
});
const MAT_RADIATOR = new THREE.MeshStandardMaterial({
  color: "#94a3b8",
  roughness: 0.4,
  metalness: 0.3,
});
const MAT_FAN_HOUSING = new THREE.MeshStandardMaterial({
  color: "#cbd5e1",
  roughness: 0.4,
  metalness: 0.4,
});
const MAT_BUSHING_BROWN = new THREE.MeshStandardMaterial({
  color: "#7c2d12",
  roughness: 0.1,
  metalness: 0.1,
});
const MAT_DARK_METAL = new THREE.MeshStandardMaterial({
  color: "#1e293b",
  roughness: 0.7,
  metalness: 0.5,
});
const MAT_BRASS = new THREE.MeshStandardMaterial({
  color: "#d97706",
  roughness: 0.2,
  metalness: 0.8,
});
const MAT_FAN_BLADE = new THREE.MeshStandardMaterial({
  color: "#1e293b",
  roughness: 0.5,
  metalness: 0.1,
});
const MAT_PIPE = new THREE.MeshStandardMaterial({
  color: "#cbd5e1",
  roughness: 0.3,
  metalness: 0.3,
});
const MAT_GUARD_WIRE = new THREE.MeshStandardMaterial({
  color: "#e2e8f0",
  roughness: 0.2,
  metalness: 0.8,
});

// --- SUB-COMPONENTS ---

const DetailedBushing = memo(function DetailedBushing({
  height,
  radius = 0.12,
  isHV = false,
}) {
  const sheds = [];
  const shedCount = isHV ? 6 : 4;
  const shedSpacing = (height * 0.7) / shedCount;

  for (let i = 0; i < shedCount; i += 1) {
    sheds.push(
      <Cylinder
        key={i}
        args={[radius * 1.8, radius * 1.2, 0.05, 6]}
        position={[0, i * shedSpacing - height * 0.3, 0]}
        material={MAT_BUSHING_BROWN}
      />
    );
  }

  return (
    <group>
      <Cylinder
        args={[radius, radius * 0.8, height, 6]}
        material={MAT_BUSHING_BROWN}
      />
      <group position={[0, height * 0.1, 0]}>{sheds}</group>
      <Cylinder
        args={[0.04, 0.04, 0.4, 4]}
        position={[0, height / 2 + 0.2, 0]}
        material={MAT_BRASS}
      />
      {isHV && (
        <mesh position={[0, height / 2, 0]} material={MAT_PIPE}>
          <torusGeometry args={[0.3, 0.02, 3, 5]} />
        </mesh>
      )}
    </group>
  );
});

const CoolingFanUnit = ({ speedLevel, isAuto, onChangeSpeed }) => {
  const fanRef = useRef(null);
  const speedRef = useRef(0);
  const [hovered, setHovered] = useState(false);

  const targetMaxSpeed = useMemo(() => {
    switch (speedLevel) {
      case "low":
        return 0.15;
      case "medium":
        return 0.35;
      case "high":
        return 0.8;
      case "off":
      default:
        return 0;
    }
  }, [speedLevel]);

  useFrame((_, delta) => {
    if (fanRef.current) {
      speedRef.current += (targetMaxSpeed - speedRef.current) * delta * 2;
      if (speedRef.current > 0.001) {
        fanRef.current.rotation.z -= speedRef.current;
      }
    }
  });

  const FanBlade = ({ rotation }) => (
    <group rotation={[0, 0, rotation]}>
      <group position={[0, 0.22, -0.01]} rotation={[0.6, 0, 0]}>
        <RoundedBox
          args={[0.13, 0.42, 0.015]}
          radius={0.015}
          smoothness={1}
          material={MAT_FAN_BLADE}
          castShadow={false}
        />
      </group>
    </group>
  );

  return (
    <group
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
    >
      <Box
        args={[1.05, 1.05, 0.2]}
        material={
          hovered
            ? new THREE.MeshStandardMaterial({
                color: "#94a3b8",
                emissive: "#38bdf8",
                emissiveIntensity: 0.2,
              })
            : MAT_FAN_HOUSING
        }
      />

      <Cylinder
        args={[0.5, 0.5, 0.21, 12]}
        rotation={[Math.PI / 2, 0, 0]}
        material={MAT_DARK_METAL}
      />

      {/* Rotating assembly */}
      <group ref={fanRef} position={[0, 0, 0.05]}>
        <Cylinder
          args={[0.1, 0.1, 0.08, 8]}
          rotation={[Math.PI / 2, 0, 0]}
          material={MAT_FAN_BLADE}
        />
        <FanBlade rotation={0} />
        <FanBlade rotation={Math.PI * 0.4} />
        <FanBlade rotation={Math.PI * 0.8} />
        <FanBlade rotation={Math.PI * 1.2} />
        <FanBlade rotation={Math.PI * 1.6} />
      </group>

      {/* Wire Guard */}
      <group position={[0, 0, 0.14]}>
        <mesh material={MAT_GUARD_WIRE}>
          <torusGeometry args={[0.48, 0.01, 3, 8]} />
        </mesh>
        <mesh material={MAT_GUARD_WIRE}>
          <torusGeometry args={[0.35, 0.008, 3, 6]} />
        </mesh>
        <mesh material={MAT_GUARD_WIRE}>
          <torusGeometry args={[0.2, 0.008, 3, 6]} />
        </mesh>

        {Array.from({ length: 4 }).map((_, i) => (
          <Box
            key={i}
            args={[1.0, 0.015, 0.01]}
            rotation={[0, 0, i * (Math.PI / 4)]}
            material={MAT_GUARD_WIRE}
          />
        ))}
      </group>

      {hovered && (
        <Html
          position={[0, 0.8, 0.2]}
          center
          distanceFactor={10}
          zIndexRange={[2000, 0]}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerOver={(e) => e.stopPropagation()}
        >
          <div className="bg-slate-900/95 backdrop-blur text-white p-3 rounded-xl border border-slate-600 shadow-2xl flex flex-col gap-2 min-w-[180px] transform transition-all duration-200">
            <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-1">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Fan Control
              </span>
              <div className="flex items-center gap-1.5 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    speedLevel !== "off"
                      ? "bg-emerald-500 animate-pulse"
                      : "bg-slate-500"
                  }`}
                />
                <span className="text-[9px] font-mono text-slate-400">
                  IoT LINK
                </span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onChangeSpeed("auto");
              }}
              className={`w-full px-2 py-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-2 ${
                isAuto
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/50 ring-1 ring-emerald-400/50"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
              }`}
            >
              <span>AUTO MODE</span>
              {isAuto && (
                <span className="block w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </button>

            <div className="text-[9px] text-slate-500 font-mono uppercase text-center mt-1">
              Manual Override
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onChangeSpeed("off");
                }}
                className={`px-2 py-1.5 rounded text-[10px] font-bold transition-all border ${
                  !isAuto && speedLevel === "off"
                    ? "bg-red-600/90 border-red-500 text-white shadow shadow-red-900/50"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                }`}
              >
                OFF
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onChangeSpeed("low");
                }}
                className={`px-2 py-1.5 rounded text-[10px] font-bold transition-all border ${
                  !isAuto && speedLevel === "low"
                    ? "bg-cyan-600/90 border-cyan-500 text-white shadow shadow-cyan-900/50"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                }`}
              >
                LOW
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onChangeSpeed("medium");
                }}
                className={`px-2 py-1.5 rounded text-[10px] font-bold transition-all border ${
                  !isAuto && speedLevel === "medium"
                    ? "bg-cyan-600/90 border-cyan-500 text-white shadow shadow-cyan-900/50"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                }`}
              >
                MED
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onChangeSpeed("high");
                }}
                className={`px-2 py-1.5 rounded text-[10px] font-bold transition-all border ${
                  !isAuto && speedLevel === "high"
                    ? "bg-cyan-600/90 border-cyan-500 text-white shadow shadow-cyan-900/50"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                }`}
              >
                HIGH
              </button>
            </div>

            <div className="text-[9px] text-center text-slate-500 mt-1 font-mono border-t border-slate-700 pt-1">
              RPM:{" "}
              {speedLevel === "off"
                ? "0"
                : speedLevel === "low"
                ? "850"
                : speedLevel === "medium"
                ? "1800"
                : "3200"}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

const RadiatorBank = memo(function RadiatorBank({
  position,
  rotation = [0, 0, 0],
  speedLevel,
  isAuto,
  onChangeSpeed,
}) {
  return (
    <group position={position} rotation={new THREE.Euler(...rotation)}>
      <Box args={[2.2, 2.5, 0.5]} position={[0, 0, 0]} material={MAT_RADIATOR} />
      <Box
        args={[2.4, 0.2, 0.6]}
        position={[0, 1.35, 0]}
        material={MAT_TANK_BODY}
      />
      <Box
        args={[2.4, 0.2, 0.6]}
        position={[0, -1.35, 0]}
        material={MAT_TANK_BODY}
      />

      <group position={[-0.55, 0.2, 0.4]}>
        <CoolingFanUnit
          speedLevel={speedLevel}
          isAuto={isAuto}
          onChangeSpeed={onChangeSpeed}
        />
      </group>
      <group position={[0.55, 0.2, 0.4]}>
        <CoolingFanUnit
          speedLevel={speedLevel}
          isAuto={isAuto}
          onChangeSpeed={onChangeSpeed}
        />
      </group>
      <group position={[-0.55, -0.9, 0.4]}>
        <CoolingFanUnit
          speedLevel={speedLevel}
          isAuto={isAuto}
          onChangeSpeed={onChangeSpeed}
        />
      </group>
      <group position={[0.55, -0.9, 0.4]}>
        <CoolingFanUnit
          speedLevel={speedLevel}
          isAuto={isAuto}
          onChangeSpeed={onChangeSpeed}
        />
      </group>

      <group position={[0, 1.2, -0.6]}>
        <Cylinder
          args={[0.08, 0.08, 0.8, 4]}
          rotation={[Math.PI / 2, 0, 0]}
          material={MAT_PIPE}
        />
      </group>
      <group position={[0, -1.2, -0.6]}>
        <Cylinder
          args={[0.08, 0.08, 0.8, 4]}
          rotation={[Math.PI / 2, 0, 0]}
          material={MAT_PIPE}
        />
      </group>
    </group>
  );
});

const OilPiping = () => (
  <group>
    <mesh position={[0.8, 4.2, 0]} rotation={[0, 0, -0.2]}>
      <cylinderGeometry args={[0.1, 0.1, 1.5, 5]} />
      <meshStandardMaterial color="#cbd5e1" />
    </mesh>
    <mesh position={[1.5, 3.5, 0]}>
      <cylinderGeometry args={[0.08, 0.08, 3, 5]} />
      <meshStandardMaterial color="#cbd5e1" />
    </mesh>
  </group>
);

const Transformer = memo(function Transformer({
  label,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  onSelect,
  realtimeData,
  onAcknowledge,
}) {
  const [hovered, setHovered] = useState(false);

  const [manualOverride, setManualOverride] = useState(false);
  const [fanSpeed, setFanSpeed] = useState("off");

  const id = realtimeData?.id || `T-${label}`;
  const tapPos = realtimeData?.values?.tapPos ?? 7;
  const tempStr = realtimeData?.values?.oilTemp ?? "45";
  const temp = parseFloat(String(tempStr));
  const load = realtimeData?.values?.loadPct ?? "--";
  const alarm = realtimeData?.alarm;

  useEffect(() => {
    if (!manualOverride) {
      if (temp > 55) setFanSpeed("high");
      else if (temp > 50) setFanSpeed("medium");
      else if (temp > 45) setFanSpeed("low");
      else setFanSpeed("off");
    }
  }, [temp, manualOverride]);

  const handleFanChange = (speed) => {
    if (speed === "auto") {
      setManualOverride(false);
    } else {
      setManualOverride(true);
      setFanSpeed(speed);
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect({
        id,
        name: `Auto-Transformer 400/220kV ${label}`,
        type: "transformer",
      });
    }
  };

  return (
    <group
      name={id}
      position={new THREE.Vector3(...position)}
      rotation={new THREE.Euler(...rotation)}
      onPointerOver={() => {
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
      onClick={handleClick}
    >
      <GroundRiser position={[0, 0, 0]} height={1.0} offset={[2, 0, 1]} />
      <GroundRiser position={[0, 0, 0]} height={1.0} offset={[-2, 0, -1]} />

      <group position={[0, 2, 0]}>
        <Box args={[4.2, 3.2, 2.5]} material={MAT_TANK_BODY} />
        <Box
          args={[4.4, 0.2, 2.7]}
          position={[0, 1.7, 0]}
          material={MAT_TANK_BODY}
        />
        <Box
          args={[4.4, 0.3, 2.7]}
          position={[0, -1.75, 0]}
          material={MAT_DARK_METAL}
        />
        {[-1.5, -0.5, 0.5, 1.5].map((x) => (
          <Box
            key={`front-${x}`}
            args={[0.1, 2.8, 0.1]}
            position={[x, 0, 1.26]}
            material={MAT_TANK_BODY}
          />
        ))}
        {[-1.5, -0.5, 0.5, 1.5].map((x) => (
          <Box
            key={`back-${x}`}
            args={[0.1, 2.8, 0.1]}
            position={[x, 0, -1.26]}
            material={MAT_TANK_BODY}
          />
        ))}
      </group>

      <group position={[0.5, 5, 1.2]}>
        <Cylinder
          args={[0.5, 0.5, 3.5, 8]}
          rotation={[0, 0, Math.PI / 2]}
          material={MAT_TANK_BODY}
        />
        <Box
          args={[0.4, 0.4, 0.1]}
          position={[0, 0, 0.5]}
          material={MAT_FAN_HOUSING}
        />
        <Box
          args={[0.1, 1.5, 0.1]}
          position={[-1, -1, -0.2]}
          rotation={[0, 0, -0.2]}
          material={MAT_PIPE}
        />
        <Box
          args={[0.1, 1.5, 0.1]}
          position={[1, -1, -0.2]}
          rotation={[0, 0, 0.2]}
          material={MAT_PIPE}
        />
      </group>

      <OilPiping />

      <RadiatorBank
        position={[-2.8, 2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        speedLevel={fanSpeed}
        isAuto={!manualOverride}
        onChangeSpeed={handleFanChange}
      />
      <RadiatorBank
        position={[2.8, 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        speedLevel={fanSpeed}
        isAuto={!manualOverride}
        onChangeSpeed={handleFanChange}
      />

      {/* HV Bushings */}
      <group position={[0, 3.8, 0]}>
        {[-1.2, 0, 1.2].map((x, i) => (
          <group key={i} position={[x, 0, -0.5]} rotation={[0.1, 0, 0]}>
            <Cylinder
              args={[0.25, 0.35, 0.6, 6]}
              position={[0, 0, 0]}
              material={MAT_TANK_BODY}
            />
            <group position={[0, 1.8, 0]}>
              <DetailedBushing height={3.0} radius={0.12} isHV />
            </group>
          </group>
        ))}
      </group>

      {/* LV bushings & tertiary */}
      <group position={[0, 3, 0.8]}>
        <Box
          args={[3.5, 0.6, 0.8]}
          position={[0, 0.3, 0]}
          material={MAT_TANK_BODY}
        />
        {[-1.0, 0, 1.0].map((x, i) => (
          <group key={i} position={[x, 0.6, 0]} rotation={[-0.1, 0, 0]}>
            <DetailedBushing height={1.8} radius={0.09} />
          </group>
        ))}
        <group position={[1.8, 0.6, 0]} rotation={[-0.1, 0, 0.2]}>
          <DetailedBushing height={1.2} radius={0.07} />
        </group>
      </group>

      {/* Tap changer box */}
      <group position={[2.2, 1.5, 1.3]}>
        <Box args={[0.6, 1.0, 0.3]} material={MAT_TANK_BODY} />
        <Html
          position={[0.31, 0.2, 0]}
          transform
          scale={0.15}
          rotation={[0, Math.PI / 2, 0]}
        >
          <div className="bg-white border border-black px-2 py-1 flex flex-col items-center select-none shadow-sm">
            <span className="text-[0.6rem] text-black font-bold tracking-widest mb-0.5">
              TAP
            </span>
            <div className="font-mono text-lg leading-none font-bold text-amber-600">
              {Number(tapPos).toString().padStart(2, "0")}
            </div>
          </div>
        </Html>
      </group>

      {hovered && (
        <Html
          position={[0, 6.5, 0]}
          center
          distanceFactor={20}
          zIndexRange={[100, 0]}
        >
          <div className="flex flex-col gap-1">
            <div className="bg-white text-black px-2 py-1 rounded border border-black shadow-sm text-xs font-bold whitespace-nowrap flex items-center gap-2 pointer-events-none">
              {label}
            </div>
            {realtimeData && (
              <div className="bg-white text-black rounded border border-slate-300 text-[10px] font-mono whitespace-nowrap flex flex-col shadow-sm overflow-hidden pointer-events-auto">
                <div className="px-2 py-1 flex flex-col gap-0.5">
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">TMP</span>
                    <span
                      className={`${
                        temp > 50 ? "text-red-600" : "text-green-600"
                      } font-bold`}
                    >
                      {temp}°C
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">LOAD</span>
                    <span className="text-cyan-600 font-bold">{load}%</span>
                  </div>
                </div>

                <div
                  className={`border-t py-0.5 text-center ${
                    fanSpeed !== "off"
                      ? "bg-blue-50 border-blue-200"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <span
                    className={`text-[8px] font-bold uppercase ${
                      fanSpeed !== "off"
                        ? "text-blue-600"
                        : "text-slate-400"
                    }`}
                  >
                    {manualOverride
                      ? `MAN: ${fanSpeed}`
                      : `AUTO: ${fanSpeed}`}
                  </span>
                </div>
              </div>
            )}
          </div>
        </Html>
      )}

      {alarm && !alarm.acknowledged && (
        <AlarmMarker
          position={[0, 7.5, 0]}
          message={alarm.message}
          severity={alarm.severity}
          onAcknowledge={() => onAcknowledge && onAcknowledge(id)}
        />
      )}
    </group>
  );
},
// memo comparator
(prev, next) => {
  const posSame =
    prev.position?.[0] === next.position?.[0] &&
    prev.position?.[1] === next.position?.[1] &&
    prev.position?.[2] === next.position?.[2];

  const rotSame =
    prev.rotation?.[0] === next.rotation?.[0] &&
    prev.rotation?.[1] === next.rotation?.[1] &&
    prev.rotation?.[2] === next.rotation?.[2];

  return (
    posSame &&
    rotSame &&
    prev.realtimeData === next.realtimeData &&
    prev.label === next.label
  );
});

export default Transformer;
