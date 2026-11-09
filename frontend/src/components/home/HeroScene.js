import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const pointer = { x: 0, y: 0 };

function Terrain() {
  const ref = useRef();
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(70, 34, 150, 74);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i += 1) {
      const x = p.getX(i);
      const y = p.getY(i);
      const ridge = Math.max(0, y - 2) * 0.42 * (0.6 + Math.abs(Math.sin(x * 0.12 + 1.3)));
      p.setZ(i, Math.sin(x * 0.22) * Math.cos(y * 0.27) * 0.9 + Math.sin(x * 0.06 + y * 0.1) * 1.8 + ridge);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  useFrame(({ clock }) => {
    ref.current.position.x = Math.sin(clock.elapsedTime * 0.05) * 1.5;
  });
  return (
    <mesh ref={ref} geometry={geo} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.8, -10]}>
      <meshBasicMaterial color="#B68B50" wireframe transparent opacity={0.22} />
    </mesh>
  );
}

function Dust({ count }) {
  const ref = useRef();
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      arr[i * 3] = (Math.random() - 0.5) * 24;
      arr[i * 3 + 1] = Math.random() * 10 - 3;
      arr[i * 3 + 2] = -Math.random() * 18;
    }
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, [count]);
  useEffect(() => () => geo.dispose(), [geo]);
  useFrame((_, dt) => {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i += 1) {
      let y = p.getY(i) + dt * 0.12;
      if (y > 7) y = -3;
      p.setY(i, y);
    }
    p.needsUpdate = true;
    ref.current.rotation.y += dt * 0.01;
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color="#D8C9AD" size={0.045} transparent opacity={0.75} depthWrite={false} sizeAttenuation />
    </points>
  );
}

function Rig() {
  useFrame(({ camera }) => {
    camera.position.x += (pointer.x * 0.9 - camera.position.x) * 0.03;
    camera.position.y += (1.1 + pointer.y * 0.4 - camera.position.y) * 0.03;
    camera.lookAt(0, 0.2, -10);
  });
  return null;
}

export default function HeroScene() {
  const wrap = useRef(null);
  const [visible, setVisible] = useState(true);
  const mobile = typeof window !== "undefined" && window.innerWidth < 768;

  useEffect(() => {
    const onMove = (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    const io = new IntersectionObserver(([en]) => setVisible(en.isIntersecting), { threshold: 0 });
    if (wrap.current) io.observe(wrap.current);
    return () => {
      window.removeEventListener("pointermove", onMove);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={wrap} className="pointer-events-none absolute inset-0" aria-hidden="true" data-testid="hero-3d-scene">
      <Canvas dpr={[1, mobile ? 1.25 : 1.75]} camera={{ position: [0, 1.1, 6], fov: 55 }} gl={{ alpha: true, antialias: !mobile, powerPreference: "low-power" }} frameloop={visible ? "always" : "never"}>
        <fog attach="fog" args={["#14271F", 6, 30]} />
        <Terrain />
        <Dust count={mobile ? 220 : 520} />
        <Rig />
      </Canvas>
    </div>
  );
}
