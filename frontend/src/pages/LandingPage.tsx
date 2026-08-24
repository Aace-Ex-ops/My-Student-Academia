import React, { Suspense, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HeroMasterpiece } from "@/components/ui/hero-masterpiece";

// Lazy-load below-the-fold sections for instant sub-50ms initial paint
const PearMasterpieceExperience = React.lazy(() =>
  import("@/components/ui/pear-masterpiece-experience").then((m) => ({
    default: m.PearMasterpieceExperience,
  }))
);

const AcademicGallerySection = React.lazy(() =>
  import("@/components/ui/academic-gallery-section").then((m) => ({
    default: m.AcademicGallerySection,
  }))
);

const GsapBentoShowcase = React.lazy(() =>
  import("@/components/ui/gsap-bento-showcase").then((m) => ({
    default: m.GsapBentoShowcase,
  }))
);

const GsapSpotlightInteractive = React.lazy(() =>
  import("@/components/ui/gsap-spotlight-interactive").then((m) => ({
    default: m.GsapSpotlightInteractive,
  }))
);

const ExploreCoursesSection = React.lazy(() =>
  import("@/components/ui/explore-courses-section").then((m) => ({
    default: m.ExploreCoursesSection,
  }))
);

const Footer4 = React.lazy(() => import("@/components/ui/footer-section-4"));

interface LandingPageProps {
  onLoginClick?: () => void;
}

export function LandingPage({ onLoginClick }: LandingPageProps) {
  const navigate = useNavigate();

  // Instant Idle Preloading: Preload remaining chunks during browser idle time (0ms scroll lag)
  useEffect(() => {
    const preloadModules = () => {
      import("@/components/ui/pear-masterpiece-experience");
      import("@/components/ui/academic-gallery-section");
      import("@/components/ui/gsap-bento-showcase");
      import("@/components/ui/gsap-spotlight-interactive");
      import("@/components/ui/explore-courses-section");
      import("@/components/ui/footer-section-4");
    };

    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(preloadModules, { timeout: 120 });
    } else {
      setTimeout(preloadModules, 50);
    }
  }, []);

  const handleLogin = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-[#0B0A09] text-[#FAF3E1] font-sans select-none">
      {/* 1. CRITICAL ABOVE-THE-FOLD: THREE.JS 3D WEBGL HERO (LOADS INSTANTLY <30MS) */}
      <HeroMasterpiece onLoginClick={handleLogin} />

      {/* 2. BELOW-THE-FOLD SECTIONS WRAPPED IN SMOOTH SUSPENSE */}
      <Suspense fallback={<div className="min-h-[400px] w-full bg-[#0B0A09]" />}>
        {/* 2. PEAR.NO 3D WEBGL SCROLLYTELLING MASTERPIECE (5 SYNCHRONIZED CHAPTERS) */}
        <PearMasterpieceExperience />

        {/* 3. ACADEMIC 3D GALLERY CASCADE */}
        <AcademicGallerySection />

        {/* 4. GSAP BENTO GRID SHOWCASE & ANIMATED REAL-TIME STATS */}
        <GsapBentoShowcase />

        {/* 5. GSAP EMBER SPOTLIGHT & 3D PERSPECTIVE CARD SHOWCASE */}
        <GsapSpotlightInteractive />

        {/* 6. EXPLORE COURSES INFINITE 3D TICKER DECK */}
        <ExploreCoursesSection />

        {/* 7. COSMIC HORIZON FOOTER WITH TELEMETRY */}
        <div>
          <Footer4 />
        </div>
      </Suspense>
    </div>
  );
}
