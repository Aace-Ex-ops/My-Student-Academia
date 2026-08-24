import React from "react";

interface VectorProps {
  className?: string;
}

// Student 1: Scholar Graduating Student with Diploma & Backpack (Static Theme Vector)
export function StudentScholarVector({ className }: VectorProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background Soft Glow */}
      <circle cx="100" cy="120" r="90" fill="#F5E7C6" opacity="0.6" />
      
      {/* Backpack */}
      <rect x="52" y="110" width="30" height="60" rx="10" fill="#222222" />
      <path d="M60 110V90C60 85 65 80 70 80C75 80 80 85 80 90V110" stroke="#FF6D1F" strokeWidth="4" />

      {/* Body & Jacket */}
      <path d="M70 110C70 100 80 90 100 90C120 90 130 100 130 110L135 180C135 190 125 200 115 200H85C75 200 65 190 65 180L70 110Z" fill="#222222" />
      <path d="M90 90L100 120L110 90" stroke="#FF6D1F" strokeWidth="4" />

      {/* T-Shirt Accent */}
      <polygon points="90,90 110,90 100,130" fill="#FF6D1F" />

      {/* Head & Skin */}
      <circle cx="100" cy="65" r="24" fill="#FAF3E1" stroke="#222222" strokeWidth="3" />
      
      {/* Hair */}
      <path d="M80 60C80 48 90 42 100 42C110 42 120 48 120 60C115 54 105 52 100 52C95 52 85 54 80 60Z" fill="#222222" />

      {/* Glasses */}
      <circle cx="92" cy="64" r="6" stroke="#FF6D1F" strokeWidth="2.5" fill="none" />
      <circle cx="108" cy="64" r="6" stroke="#FF6D1F" strokeWidth="2.5" fill="none" />
      <line x1="98" y1="64" x2="102" y2="64" stroke="#FF6D1F" strokeWidth="2.5" />

      {/* Smile */}
      <path d="M94 74C96 76 104 76 106 74" stroke="#222222" strokeWidth="2.5" strokeLinecap="round" />

      {/* Mortarboard Graduation Cap */}
      <polygon points="100,20 145,34 100,48 55,34" fill="#222222" />
      <polygon points="100,24 135,34 100,44 65,34" fill="#FF6D1F" />
      <rect x="82" y="38" width="36" height="12" rx="3" fill="#222222" />
      <path d="M135 34V52" stroke="#FF6D1F" strokeWidth="3" strokeLinecap="round" />
      <circle cx="135" cy="54" r="3" fill="#FF6D1F" />

      {/* Raised Arm Holding Diploma Scroll */}
      <path d="M130 115L155 130L165 110" stroke="#222222" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="155" y="95" width="22" height="28" rx="4" fill="#FAF3E1" stroke="#222222" strokeWidth="3" transform="rotate(-15 155 95)" />
      <rect x="162" y="105" width="16" height="6" rx="2" fill="#FF6D1F" transform="rotate(-15 162 105)" />

      {/* Floating Sparkle Stars */}
      <path d="M45 40L47 45L52 47L47 49L45 54L43 49L38 47L43 45Z" fill="#FF6D1F" />
      <path d="M155 45L156.5 48.5L160 50L156.5 51.5L155 55L153.5 51.5L150 50L153.5 48.5Z" fill="#FF6D1F" />
    </svg>
  );
}

// Student 2: Tech Laptop Student studying Timetable & Catalog (Static Theme Vector)
export function StudentLaptopVector({ className }: VectorProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background Soft Glow */}
      <circle cx="100" cy="120" r="90" fill="#FAF3E1" stroke="#F5E7C6" strokeWidth="4" />

      {/* Body & Hoodie */}
      <path d="M65 130C65 115 80 105 100 105C120 105 135 115 135 130L140 190H60L65 130Z" fill="#FF6D1F" />
      
      {/* Hoodie Strings */}
      <path d="M95 105V135M105 105V135" stroke="#FAF3E1" strokeWidth="3" strokeLinecap="round" />

      {/* Head & Skin */}
      <circle cx="100" cy="72" r="26" fill="#FAF3E1" stroke="#222222" strokeWidth="3" />

      {/* Modern Haircut & Headset */}
      <path d="M74 68C74 54 84 46 100 46C116 46 126 54 126 68C126 58 114 52 100 52C86 52 74 58 74 68Z" fill="#222222" />
      
      {/* Headphones */}
      <path d="M72 70C72 52 84 42 100 42C116 42 128 52 128 70" stroke="#222222" strokeWidth="5" fill="none" />
      <rect x="68" y="64" width="10" height="18" rx="4" fill="#FF6D1F" stroke="#222222" strokeWidth="2.5" />
      <rect x="122" y="64" width="10" height="18" rx="4" fill="#FF6D1F" stroke="#222222" strokeWidth="2.5" />

      {/* Eyes & Smile */}
      <circle cx="92" cy="74" r="2.5" fill="#222222" />
      <circle cx="108" cy="74" r="2.5" fill="#222222" />
      <path d="M95 82C98 85 102 85 105 82" stroke="#222222" strokeWidth="2.5" strokeLinecap="round" />

      {/* Open Laptop */}
      <polygon points="50,160 150,160 140,200 60,200" fill="#222222" />
      <rect x="60" y="125" width="80" height="40" rx="5" fill="#FAF3E1" stroke="#222222" strokeWidth="3" />
      
      {/* Laptop Screen Content Grid */}
      <rect x="66" y="132" width="22" height="10" rx="2" fill="#FF6D1F" />
      <rect x="92" y="132" width="42" height="4" rx="2" fill="#222222" />
      <rect x="92" y="138" width="28" height="4" rx="2" fill="#222222" opacity="0.6" />
      <rect x="66" y="146" width="68" height="12" rx="3" fill="#F5E7C6" stroke="#FF6D1F" strokeWidth="1.5" />

      {/* Glow Code Symbol on Screen */}
      <path d="M72 152L70 150L72 148M76 148L78 150L76 152" stroke="#FF6D1F" strokeWidth="1.5" strokeLinecap="round" />

      {/* Floating Sparkle Icons */}
      <path d="M160 80L162 85L167 87L162 89L160 94L158 89L153 87L158 85Z" fill="#FF6D1F" />
      <path d="M35 100L36.5 103.5L40 105L36.5 106.5L35 110L33.5 106.5L30 105L33.5 103.5Z" fill="#FF6D1F" />
    </svg>
  );
}
