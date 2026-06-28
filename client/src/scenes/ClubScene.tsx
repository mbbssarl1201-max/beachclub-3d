import { Canvas } from "@react-three/fiber";
import { OrbitControls, RoundedBox, Environment, Text, Float } from "@react-three/drei";
import { useState } from "react";
import type { Daybed } from "@beachclub/shared/types";

function DaybedMesh({
  daybed,
  reserved,
  onSelect,
}: {
  daybed: Daybed;
  reserved: boolean;
  onSelect: (d: Daybed) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isCabana = daybed.type === "cabana";
  const w = isCabana ? 3 : daybed.type === "sunbed" ? 1.2 : 2.2;
  const d = isCabana ? 3 : 2;
  const color = reserved ? "#7a7f87" : hovered ? "#ffd27a" : "#1fb6b0";

  return (
    <group position={[daybed.x, 0, daybed.z]}>
      {/* base mattress */}
      <RoundedBox
        args={[w, 0.4, d]}
        radius={0.15}
        position={[0, 0.2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          if (!reserved) onSelect(daybed);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = reserved ? "not-allowed" : "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "default";
        }}
      >
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
      </RoundedBox>
      {/* pillow */}
      <RoundedBox args={[w * 0.8, 0.25, 0.5]} radius={0.1} position={[0, 0.5, -d / 2 + 0.4]}>
        <meshStandardMaterial color={reserved ? "#5d6168" : "#fff3e0"} roughness={0.8} />
      </RoundedBox>
      {/* cabana posts + canopy */}
      {isCabana && (
        <>
          {[
            [-w / 2 + 0.2, -d / 2 + 0.2],
            [w / 2 - 0.2, -d / 2 + 0.2],
            [-w / 2 + 0.2, d / 2 - 0.2],
            [w / 2 - 0.2, d / 2 - 0.2],
          ].map(([px, pz], i) => (
            <mesh key={i} position={[px, 1.2, pz]}>
              <cylinderGeometry args={[0.06, 0.06, 2.2]} />
              <meshStandardMaterial color="#caa472" />
            </mesh>
          ))}
          <RoundedBox args={[w + 0.4, 0.15, d + 0.4]} radius={0.08} position={[0, 2.3, 0]}>
            <meshStandardMaterial color={reserved ? "#5d6168" : "#ff7a59"} />
          </RoundedBox>
        </>
      )}
      <Float speed={2} floatIntensity={0.4} enabled={hovered && !reserved}>
        <Text position={[0, isCabana ? 2.7 : 0.95, 0]} fontSize={0.3} color="#fff7ee" anchorX="center">
          {reserved ? `${daybed.label} · réservé` : daybed.label}
        </Text>
      </Float>
    </group>
  );
}

export function ClubScene({
  daybeds,
  reservedIds,
  onSelect,
}: {
  daybeds: Daybed[];
  reservedIds: Set<string>;
  onSelect: (d: Daybed) => void;
}) {
  return (
    <Canvas shadows camera={{ position: [0, 14, 20], fov: 45 }} dpr={[1, 2]}>
      <color attach="background" args={["#1a1230"]} />
      <fog attach="fog" args={["#3a2350", 25, 60]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 18, 6]} intensity={1.6} color="#ffd9a8" castShadow />
      <Environment preset="sunset" />

      {/* sea */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, -16]}>
        <planeGeometry args={[80, 24]} />
        <meshStandardMaterial color="#0e7d83" roughness={0.2} metalness={0.4} />
      </mesh>
      {/* sand */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 4]} receiveShadow>
        <planeGeometry args={[80, 40]} />
        <meshStandardMaterial color="#f0d6a8" roughness={1} />
      </mesh>
      {/* pool */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 1]}>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color="#1fb6b0" roughness={0.1} metalness={0.3} />
      </mesh>

      {daybeds.map((d) => (
        <DaybedMesh key={d.id} daybed={d} reserved={reservedIds.has(d.id)} onSelect={onSelect} />
      ))}

      <OrbitControls
        enablePan={false}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={10}
        maxDistance={36}
      />
    </Canvas>
  );
}
