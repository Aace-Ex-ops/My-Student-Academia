import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SocialCloud } from "@/components/ui/footer-section-4-utils/social-cloud";

gsap.registerPlugin(ScrollTrigger);

const FOOTER_TITLE = "Tastefully Crafted Academic Management";

const BrandLogo = ({ className }: { className?: string }) => {
  return (
    <img
      src="/android-chrome-512x512.png"
      alt="My Student Academia Logo"
      className="w-10 h-10 object-contain rounded-xl shadow-md shadow-[#FF6D1F]/20"
    />
  );
};

export default function Footer4() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftCardRef = useRef<HTMLDivElement>(null);
  const rightCardRef = useRef<HTMLDivElement>(null);

  const footerLinks = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "Course Catalog", href: "/catalog" },
        { label: "Performance Tracker", href: "/performance" },
        { label: "Faculty Directory", href: "/instructor" },
        { label: "Student Portal", href: "/dashboard" },
        { label: "Terms of Use", href: "#" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Help & FAQ", href: "#" },
        { label: "Registration Guide", href: "#" },
        { label: "API Reference", href: "#" },
        { label: "System Status", href: "#" },
        { label: "Academic Docs", href: "#" },
        { label: "Schedule Templates", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Academia", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Academic Board", href: "#" },
        { label: "Press & News", href: "#" },
        { label: "Contact Us", href: "#" },
        { label: "Privacy Policy", href: "#" },
      ],
    },
    {
      title: "Socials",
      links: [
        { label: "X (Twitter)", href: "#" },
        { label: "LinkedIn", href: "#" },
        { label: "Facebook", href: "#" },
        { label: "Threads", href: "#" },
        { label: "Instagram", href: "#" },
        { label: "YouTube", href: "#" },
      ],
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (leftCardRef.current && rightCardRef.current) {
        gsap.fromTo(
          [leftCardRef.current, rightCardRef.current],
          { opacity: 0, y: 50, scale: 0.96 },
          {
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            stagger: 0.15,
            ease: "power3.out",
            clearProps: "opacity,transform,scale",
          }
        );
      }
      ScrollTrigger.refresh();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 px-4 bg-[#FAF3E1] border-t border-[#F5E7C6] select-none">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row gap-6 h-full">
          
          {/* Brand Accent Card (Left Panel) */}
          <div
            ref={leftCardRef}
            className="relative w-full md:w-1/3 min-h-[350px] md:min-h-[550px] overflow-hidden rounded-3xl bg-gradient-to-br from-[#222222] via-[#222222] to-[#FF6D1F]/90 flex flex-col justify-between p-8 md:p-10 shadow-2xl text-[#FAF3E1]"
          >
            {/* SVG Noise & Pattern Overlay */}
            <svg
              className="absolute inset-0 w-full h-full opacity-25 pointer-events-none mix-blend-overlay z-0"
              xmlns="http://www.w3.org/2000/svg"
            >
              <filter id="noiseFilter2">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.65"
                  numOctaves="4"
                  stitchTiles="stitch"
                />
              </filter>
              <rect width="100%" height="100%" filter="url(#noiseFilter2)" />
            </svg>

            {/* Top Brand Logo Header */}
            <div className="relative z-10">
              <div className="flex items-center gap-3 text-[#FAF3E1]">
                <BrandLogo />
                <div>
                  <span className="text-xl font-black tracking-tight block leading-none">
                    My Student
                  </span>
                  <span className="text-xl font-black tracking-tight text-[#FF6D1F] block leading-none">
                    Academia
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Content */}
            <div className="relative z-10 space-y-6">
              <h3 className="text-xl font-extrabold text-[#FAF3E1] leading-snug">
                {FOOTER_TITLE}
              </h3>
              <SocialCloud className="text-white/80 gap-3" />
              <p className="text-xs text-[#FAF3E1]/60 font-medium">
                &copy; {new Date().getFullYear()} My Student Academia. All rights reserved.
              </p>
            </div>
          </div>

          {/* Links & Newsletter Card (Right Panel) */}
          <div
            ref={rightCardRef}
            className="w-full md:w-2/3 rounded-3xl bg-[#FFFFFF] border border-[#F5E7C6] p-8 md:p-12 flex flex-col justify-between min-h-[500px] md:min-h-[550px] shadow-sm text-left"
          >
            {/* Top Categories Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
              {footerLinks.map((section, idx) => (
                <div key={idx} className="flex flex-col space-y-5">
                  <h4 className="text-base font-black text-[#222222] uppercase tracking-wider">
                    {section.title}
                  </h4>
                  <ul className="flex flex-col space-y-2.5 text-xs font-bold text-[#222222]/70">
                    {section.links.map((link, linkIdx) => (
                      <li key={linkIdx}>
                        <Link
                          to={link.href}
                          className="hover:text-[#FF6D1F] transition-colors"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Bottom Newsletter Input */}
            <div className="space-y-4 mt-12 md:mt-0 pt-8 border-t border-[#F5E7C6]">
              <h4 className="text-base font-black text-[#222222]">
                Subscribe to Academic Updates
              </h4>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md w-full">
                <input
                  type="email"
                  placeholder="Enter your student email..."
                  className="flex-1 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#FF6D1F] bg-[#FAF3E1] text-[#222222] placeholder-[#222222]/50 border border-[#F5E7C6]"
                />
                <button className="rounded-xl bg-[#222222] hover:bg-[#FF6D1F] text-[#FAF3E1] px-6 py-3 text-xs font-black transition-all shadow-md cursor-pointer">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
