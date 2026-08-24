import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  LogIn,
  Zap,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface HeroMasterpieceProps {
  onLoginClick?: () => void;
}

export function HeroMasterpiece({ onLoginClick }: HeroMasterpieceProps) {
  const navigate = useNavigate();

  // DOM Refs
  const heroRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const featureGridRef = useRef<HTMLDivElement>(null);

  // Crosshairs
  const crosshairTL = useRef<HTMLDivElement>(null);
  const crosshairTR = useRef<HTMLDivElement>(null);
  const crosshairBL = useRef<HTMLDivElement>(null);
  const crosshairBR = useRef<HTMLDivElement>(null);

  // 1. THREE.JS 3D WEBGL HOLOGRAPHIC GYROSCOPE & STARFIELD
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    const container = canvasContainerRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 7.5;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
      precision: "mediump",
      stencil: false,
      depth: true,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    container.appendChild(renderer.domElement);

    // Group for entire gyroscope
    const gyroGroup = new THREE.Group();
    scene.add(gyroGroup);

    // Ring 1 (Outer Ember Ring)
    const ring1Geo = new THREE.TorusGeometry(2.4, 0.04, 16, 48);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0xff6d1f,
      emissive: 0x331100,
      metalness: 0.9,
      roughness: 0.25,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    gyroGroup.add(ring1);

    // Ring 2 (Middle Champagne Ring)
    const ring2Geo = new THREE.TorusGeometry(1.8, 0.035, 16, 48);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0xf5e7c6,
      emissive: 0x221100,
      metalness: 0.85,
      roughness: 0.3,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    gyroGroup.add(ring2);

    // Ring 3 (Inner Amber Ring)
    const ring3Geo = new THREE.TorusGeometry(1.2, 0.03, 16, 48);
    const ring3Mat = new THREE.MeshStandardMaterial({
      color: 0xff6d1f,
      emissive: 0x441100,
      metalness: 0.95,
      roughness: 0.2,
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    gyroGroup.add(ring3);

    // Central Floating Core (Glowing Octahedron)
    const coreGeo = new THREE.OctahedronGeometry(0.5, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xff6d1f,
      metalness: 0.3,
      roughness: 0.3,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    gyroGroup.add(coreMesh);

    // Surrounding Star Dust Particles
    const particleCount = 70;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 16;
      positions[i + 1] = (Math.random() - 0.5) * 12;
      positions[i + 2] = (Math.random() - 0.5) * 10;
    }
    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const particleMat = new THREE.PointsMaterial({
      color: 0xf5e7c6,
      size: 0.04,
      transparent: true,
      opacity: 0.6,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    particleSystem.matrixAutoUpdate = false;
    particleSystem.updateMatrix();
    scene.add(particleSystem);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    ambientLight.matrixAutoUpdate = false;
    scene.add(ambientLight);

    const light1 = new THREE.PointLight(0xff6d1f, 3.5, 30);
    light1.position.set(4, 4, 4);
    light1.matrixAutoUpdate = false;
    light1.updateMatrix();
    scene.add(light1);

    const light2 = new THREE.PointLight(0xf5e7c6, 2.5, 30);
    light2.position.set(-4, -4, 2);
    light2.matrixAutoUpdate = false;
    light2.updateMatrix();
    scene.add(light2);

    // Smooth LERP mouse reaction
    let animationFrameId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let isVisible = true;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      targetX = x * 0.4;
      targetY = y * 0.4;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const clock = new THREE.Clock();

    const animate = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      const elapsed = clock.getElapsedTime();

      // Smooth LERP
      currentX += (targetX - currentX) * 0.04;
      currentY += (targetY - currentY) * 0.04;

      gyroGroup.rotation.y = currentX * 0.8;
      gyroGroup.rotation.x = currentY * 0.8;

      ring1.rotation.x = elapsed * 0.35;
      ring1.rotation.y = elapsed * 0.25;

      ring2.rotation.y = -elapsed * 0.4;
      ring2.rotation.z = elapsed * 0.3;

      ring3.rotation.z = -elapsed * 0.5;
      ring3.rotation.x = elapsed * 0.35;

      coreMesh.rotation.x = elapsed * 0.6;
      coreMesh.rotation.y = elapsed * 0.8;

      particleSystem.rotation.y = elapsed * 0.02;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // IntersectionObserver to pause rendering when hero is scrolled out of view
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      ring3Geo.dispose();
      ring3Mat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  // 2. GSAP SCROLLTRIGGER & ENTRANCE TIMELINE
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        titleRef.current,
        { opacity: 0, y: 40, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 1, delay: 0.1 }
      )
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.6"
        )
        .fromTo(
          ctaRef.current?.children ? Array.from(ctaRef.current.children) : [],
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.15 },
          "-=0.5"
        )
        .fromTo(
          featureGridRef.current?.children
            ? Array.from(featureGridRef.current.children)
            : [],
          { opacity: 0, y: 40, scale: 0.92 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.15 },
          "-=0.4"
        );

      // Rotating Star Crosshairs
      gsap.to(
        [
          crosshairTL.current,
          crosshairTR.current,
          crosshairBL.current,
          crosshairBR.current,
        ],
        {
          rotation: 360,
          duration: 12,
          repeat: -1,
          ease: "none",
        }
      );

      ScrollTrigger.refresh();
    }, heroRef);

    return () => ctx.revert();
  }, []);

  // GSAP 3D Card Hover Tilt
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotX = (y / (rect.height / 2)) * -8;
    const rotY = (x / (rect.width / 2)) * 8;

    gsap.to(card, {
      rotationX: rotX,
      rotationY: rotY,
      transformPerspective: 1000,
      y: -8,
      scale: 1.03,
      duration: 0.4,
      ease: "power3.out",
      borderColor: "#FF6D1F",
      boxShadow: "0 25px 45px -12px rgba(255, 109, 31, 0.25)",
    });
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      rotationX: 0,
      rotationY: 0,
      y: 0,
      scale: 1,
      duration: 0.6,
      ease: "power3.out",
      borderColor: "rgba(245, 231, 198, 0.2)",
      boxShadow: "0 10px 20px -5px rgba(0, 0, 0, 0.5)",
    });
  };

  const handleLogin = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      navigate("/auth");
    }
  };

  const handleExploreClick = () => {
    const section = document.getElementById("explore-courses");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex flex-col justify-between p-6 sm:p-12 bg-[#0B0A09] text-[#FAF3E1] font-sans select-none overflow-hidden snap-start"
    >
      {/* THREE.JS 3D GYROSCOPE WEBGL CANVAS */}
      <div
        ref={canvasContainerRef}
        className="absolute inset-0 z-0 pointer-events-none opacity-50"
      />

      {/* ARCHITECTURAL BLUEPRINT GRID & CROSSHAIR STARS */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-30">
        <div className="absolute top-16 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F5E7C6]/60 to-transparent" />
        <div className="absolute bottom-16 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F5E7C6]/60 to-transparent" />
        <div className="absolute top-0 bottom-0 left-8 sm:left-16 w-[1px] bg-gradient-to-b from-transparent via-[#F5E7C6]/60 to-transparent" />
        <div className="absolute top-0 bottom-0 right-8 sm:right-16 w-[1px] bg-gradient-to-b from-transparent via-[#F5E7C6]/60 to-transparent" />

        {/* Crosshair Stars */}
        <div
          ref={crosshairTL}
          className="absolute top-16 left-8 sm:left-16 -translate-x-1/2 -translate-y-1/2 text-[#FF6D1F] text-sm"
        >
          ✦
        </div>
        <div
          ref={crosshairTR}
          className="absolute top-16 right-8 sm:right-16 translate-x-1/2 -translate-y-1/2 text-[#FF6D1F] text-sm"
        >
          ✦
        </div>
        <div
          ref={crosshairBL}
          className="absolute bottom-16 left-8 sm:left-16 -translate-x-1/2 translate-y-1/2 text-[#FF6D1F] text-sm"
        >
          ✦
        </div>
        <div
          ref={crosshairBR}
          className="absolute bottom-16 right-8 sm:right-16 translate-x-1/2 translate-y-1/2 text-[#FF6D1F] text-sm"
        >
          ✦
        </div>
      </div>

      {/* TOP TELEMETRY HUD BAR */}
      <div className="relative z-20 flex items-center justify-between w-full border-b border-[#F5E7C6]/15 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF6D1F] animate-ping" />
          <span className="text-xs font-mono font-black text-[#FF6D1F] tracking-widest uppercase">
            MY_STUDENT_ACADEMIA // HERO_STAGE
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleLogin}
            className="px-5 py-2.5 rounded-full bg-[#141414]/90 hover:bg-[#FF6D1F] border border-[#F5E7C6]/30 hover:border-[#FF6D1F] text-xs font-black transition-all duration-300 text-[#FAF3E1] shadow-lg shadow-black/50 hover:shadow-[#FF6D1F]/25 flex items-center gap-2 cursor-pointer group backdrop-blur-md"
          >
            <LogIn className="w-3.5 h-3.5 text-[#FF6D1F] group-hover:text-[#FAF3E1] transition-colors" />
            <span>Login to Portal</span>
          </button>
        </div>
      </div>

      {/* CENTER HERO COPY & ACTION BUTTONS */}
      <div className="relative z-20 max-w-5xl mx-auto text-center flex flex-col items-center justify-center my-auto py-12 space-y-6">
        
        {/* Kinetic Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF6D1F]/15 border border-[#FF6D1F]/40 text-[#FF6D1F] text-xs font-black uppercase tracking-wider shadow-lg">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Academic Platform</span>
        </div>

        {/* Title */}
        <h1
          ref={titleRef}
          className="text-4xl sm:text-6xl md:text-7xl font-black text-[#FAF3E1] tracking-tight leading-none"
        >
          My Student <span className="text-[#FF6D1F]">Academia</span>
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-[#FAF3E1]/75 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed font-medium"
        >
          Intelligent course registration, real-time schedule conflict resolution, and automated waitlists. Crafted for student speed and success.
        </p>

        {/* Action Buttons */}
        <div
          ref={ctaRef}
          className="flex flex-col sm:flex-row items-center gap-4 pt-2"
        >
          <button
            onClick={handleLogin}
            className="px-8 py-4 rounded-2xl bg-[#FF6D1F] hover:bg-[#e65c10] text-[#FAF3E1] font-black text-sm transition-all shadow-xl shadow-[#FF6D1F]/30 flex items-center gap-3 cursor-pointer group"
          >
            <span>Enter Student Portal</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={handleExploreClick}
            className="px-8 py-4 rounded-2xl bg-[#181818] hover:bg-[#222222] border border-[#F5E7C6]/30 hover:border-[#FF6D1F] text-[#FAF3E1] font-bold transition-all flex items-center gap-2.5 text-sm shadow-lg cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-[#FF6D1F]" />
            <span>Explore Courses</span>
          </button>
        </div>

        {/* 3D Tilted Feature Cards Grid */}
        <div
          ref={featureGridRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 w-full text-left"
        >
          <div
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            className="p-6 rounded-3xl bg-[#141414]/90 border border-[#F5E7C6]/20 shadow-2xl backdrop-blur-xl transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FF6D1F]/15 border border-[#FF6D1F]/30 flex items-center justify-center text-[#FF6D1F] mb-4 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-[#FAF3E1] mb-1.5">
              Smart Timetable Grid
            </h3>
            <p className="text-xs text-[#FAF3E1]/70 leading-relaxed font-medium">
              Multi-slot class routine planner with automated minute-range collision validation.
            </p>
          </div>

          <div
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            className="p-6 rounded-3xl bg-[#141414]/90 border border-[#F5E7C6]/20 shadow-2xl backdrop-blur-xl transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#F5E7C6]/15 border border-[#F5E7C6]/30 flex items-center justify-center text-[#FAF3E1] mb-4 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5 text-[#FF6D1F]" />
            </div>
            <h3 className="text-base font-black text-[#FAF3E1] mb-1.5">
              Recommended Prep
            </h3>
            <p className="text-xs text-[#FAF3E1]/70 leading-relaxed font-medium">
              Open registration access with recommended background guidance instead of barrier blocks.
            </p>
          </div>

          <div
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            className="p-6 rounded-3xl bg-[#141414]/90 border border-[#F5E7C6]/20 shadow-2xl backdrop-blur-xl transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#222222] border border-[#222222]/40 flex items-center justify-center text-[#FAF3E1] mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5 text-[#FF6D1F]" />
            </div>
            <h3 className="text-base font-black text-[#FAF3E1] mb-1.5">
              Automated Waitlist Queue
            </h3>
            <p className="text-xs text-[#FAF3E1]/70 leading-relaxed font-medium">
              Instant waitlist positioning with real-time seat auto-promotion when slots open up.
            </p>
          </div>
        </div>

      </div>

      {/* BOTTOM TELEMETRY FOOTER */}
      <div className="relative z-20 flex flex-col sm:flex-row items-center justify-between w-full border-t border-[#F5E7C6]/15 pt-4 text-xs font-mono text-[#FAF3E1]/60">
        <div>SYSTEM: ONLINE // MULTI_SLOT_V2</div>
        <div className="text-[#FF6D1F] font-bold">LATENCY: 0.4ms // 0_CONFLICTS</div>
        <div>CAMPUS_STATUS: ACTIVE</div>
      </div>
    </section>
  );
}
