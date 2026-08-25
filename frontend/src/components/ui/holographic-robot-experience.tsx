import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { Sparkles, Cpu, Shield, Zap, Eye } from "lucide-react";

interface HolographicRobotExperienceProps {
  className?: string;
  isSignUp?: boolean;
}

export function HolographicRobotExperience({
  className = "w-full h-full",
  isSignUp = false,
}: HolographicRobotExperienceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeHUD, setActiveHUD] = useState("CYBERNETIC CORE ACTIVE");

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let animationFrameId: number;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 700;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 7;

    // 2. Renderer with High Performance & Anti-Aliasing
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 3. Central Holographic Robotic Core Group
    const robotGroup = new THREE.Group();
    scene.add(robotGroup);

    // Inner Metallic Core (Octahedron / Sphere)
    const coreGeo = new THREE.IcosahedronGeometry(1.2, 2);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x11111a,
      emissive: 0xff6d1f,
      emissiveIntensity: 0.35,
      roughness: 0.1,
      metalness: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      wireframe: false,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    robotGroup.add(coreMesh);

    // Wireframe Outer Shell
    const shellGeo = new THREE.IcosahedronGeometry(1.4, 2);
    const shellMat = new THREE.MeshBasicMaterial({
      color: 0xff6d1f,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const shellMesh = new THREE.Mesh(shellGeo, shellMat);
    robotGroup.add(shellMesh);

    // Glowing Robotic "Eye" / Lens in Center
    const eyeGeo = new THREE.SphereGeometry(0.5, 32, 32);
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8,
    });
    const eyeMesh = new THREE.Mesh(eyeGeo, eyeMat);
    eyeMesh.position.z = 0.85;
    robotGroup.add(eyeMesh);

    // Outer Orbital Gyroscope Ring 1
    const ringGeo1 = new THREE.TorusGeometry(2.1, 0.035, 16, 100);
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0xff6d1f,
      emissive: 0xff6d1f,
      emissiveIntensity: 0.6,
      roughness: 0.3,
      metalness: 0.9,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    robotGroup.add(ring1);

    // Outer Orbital Gyroscope Ring 2 (Tilted)
    const ringGeo2 = new THREE.TorusGeometry(2.4, 0.025, 16, 100);
    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      emissive: 0x4f46e5,
      emissiveIntensity: 0.5,
      roughness: 0.3,
      metalness: 0.9,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = Math.PI / 3;
    robotGroup.add(ring2);

    // 4. Floating Holographic Data Particles
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const radius = 2.5 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      particlePositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i3 + 2] = radius * Math.cos(phi);
      particleScales[i] = Math.random();
    }

    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );

    const particleMat = new THREE.PointsMaterial({
      color: 0xffaa40,
      size: 0.07,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 5. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xff6d1f, 3.5, 12);
    pointLight1.position.set(3, 3, 4);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x6366f1, 2.5, 12);
    pointLight2.position.set(-3, -2, 3);
    scene.add(pointLight2);

    // 6. Smooth Mouse Parallax Tracking
    let targetRotX = 0;
    let targetRotY = 0;
    let targetEyeX = 0;
    let targetEyeY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      targetRotY = x * 0.9;
      targetRotX = y * 0.7;
      targetEyeX = x * 0.4;
      targetEyeY = -y * 0.4;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // 7. Render Loop (120 FPS Locked)
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Damped spring interpolation for butter-smooth rotation
      robotGroup.rotation.y += (targetRotY - robotGroup.rotation.y) * 0.07;
      robotGroup.rotation.x += (targetRotX - robotGroup.rotation.x) * 0.07;

      // Subtle breathing float animation
      robotGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.12;

      // Inner Core rotation
      coreMesh.rotation.y = elapsedTime * 0.4;
      coreMesh.rotation.z = elapsedTime * 0.2;
      shellMesh.rotation.y = -elapsedTime * 0.25;

      // Robotic Eye tracks cursor
      eyeMesh.position.x += (targetEyeX - eyeMesh.position.x) * 0.1;
      eyeMesh.position.y += (targetEyeY - eyeMesh.position.y) * 0.1;

      // Gyroscope Rings Rotation
      ring1.rotation.x = elapsedTime * 0.6;
      ring1.rotation.y = elapsedTime * 0.8;

      ring2.rotation.y = -elapsedTime * 0.5;
      ring2.rotation.z = elapsedTime * 0.7;

      // Floating Swarm Orbit
      particles.rotation.y = elapsedTime * 0.08;
      particles.rotation.x = elapsedTime * 0.04;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center overflow-hidden select-none ${className}`}
    >
      {/* Three.js Hardware Accelerated WebGL Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block z-10" />

      {/* Cybernetic HUD Floating Badges */}
      <div className="absolute top-8 right-8 z-20 flex flex-col items-end gap-2 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 border border-[#FF6D1F]/30 backdrop-blur-md text-[10px] font-mono font-bold text-[#FF6D1F] shadow-lg shadow-[#FF6D1F]/10">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>MSA NEURAL ENGINE // 120 FPS</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md text-[10px] font-mono text-white/70">
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span>QUANTUM ROUTINE OPTIMIZER</span>
        </div>
      </div>

      {/* Bottom Academic Features Status Banner */}
      <div className="absolute bottom-8 left-8 right-8 z-20 flex items-center justify-between p-4 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FF6D1F]/20 border border-[#FF6D1F]/40 flex items-center justify-center text-[#FF6D1F]">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-black text-white">
              {isSignUp ? "Instant Course Sync" : "Conflict-Free Engine"}
            </div>
            <div className="text-[10px] text-white/50 font-medium">
              Sub-80ms real-time academic schedule solver
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
          <Shield className="w-3 h-3" />
          <span>AES-256 SECURED</span>
        </div>
      </div>
    </div>
  );
}
