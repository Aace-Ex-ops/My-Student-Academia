import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Phone,
  Building,
  AtSign,
  Briefcase,
  Calendar,
  Check,
  Zap,
  Crown,
  CreditCard,
  Lock,
  Search,
  ChevronDown,
  Upload,
  Camera,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { User as UserType, OnboardingData } from "@/types";

interface OnboardingPageProps {
  currentUser?: UserType;
  onCompleteOnboarding?: (data: OnboardingData) => void;
}

// Country Code Data
const countryCodes = [
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+1", country: "USA / Canada", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+65", country: "Singapore", flag: "🇸🇬" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
];

// Comprehensive Categorized Indian Universities Dataset (NAAC Graded & NIRF Ranked)
const indianUniversitiesGrouped = [
  {
    category: "🏛️ IITs & IISc (Premier Institutes of National Importance)",
    universities: [
      "Indian Institute of Science (IISc), Bangalore",
      "Indian Institute of Technology (IIT) Bombay",
      "Indian Institute of Technology (IIT) Delhi",
      "Indian Institute of Technology (IIT) Madras",
      "Indian Institute of Technology (IIT) Kharagpur",
      "Indian Institute of Technology (IIT) Kanpur",
      "Indian Institute of Technology (IIT) Roorkee",
      "Indian Institute of Technology (IIT) Guwahati",
      "Indian Institute of Technology (IIT) Hyderabad",
      "Indian Institute of Technology (IIT) BHU Varanasi",
      "Indian Institute of Technology (IIT) Indore",
      "Indian Institute of Technology (IIT) Ropar",
      "Indian Institute of Technology (IIT) Mandi",
      "Indian Institute of Technology (IIT) Gandhinagar",
      "Indian Institute of Technology (IIT) Jodhpur",
      "Indian Institute of Technology (IIT) Patna",
      "Indian Institute of Technology (IIT) Bhubaneswar",
      "Indian Institute of Technology (IIT) Tirupati",
      "Indian Institute of Technology (IIT) Bhilai",
      "Indian Institute of Technology (IIT) Goa",
      "Indian Institute of Technology (IIT) Jammu",
      "Indian Institute of Technology (IIT) Palakkad",
      "Indian Institute of Technology (IIT) Dharwad",
      "Indian Institute of Technology (IIT) ISM Dhanbad",
    ],
  },
  {
    category: "⚡ NITs & IIITs (National & Information Tech Institutes)",
    universities: [
      "National Institute of Technology (NIT) Trichy (Tiruchirappalli)",
      "National Institute of Technology (NIT) Surathkal (Karnataka)",
      "National Institute of Technology (NIT) Rourkela",
      "National Institute of Technology (NIT) Warangal",
      "National Institute of Technology (NIT) Calicut",
      "Motilal Nehru National Institute of Technology (MNNIT) Allahabad",
      "Malaviya National Institute of Technology (MNIT) Jaipur",
      "Visvesvaraya National Institute of Technology (VNIT) Nagpur",
      "Sardar Vallabhbhai National Institute of Technology (SVNIT) Surat",
      "National Institute of Technology (NIT) Kurukshetra",
      "National Institute of Technology (NIT) Silchar",
      "National Institute of Technology (NIT) Durgapur",
      "National Institute of Technology (NIT) Jamshedpur",
      "National Institute of Technology (NIT) Hamirpur",
      "National Institute of Technology (NIT) Raipur",
      "National Institute of Technology (NIT) Agartala",
      "National Institute of Technology (NIT) Goa",
      "National Institute of Technology (NIT) Puducherry",
      "National Institute of Technology (NIT) Meghalaya",
      "National Institute of Technology (NIT) Uttarakhand",
      "National Institute of Technology (NIT) Manipur",
      "National Institute of Technology (NIT) Nagaland",
      "Indian Institute of Information Technology (IIIT) Hyderabad",
      "Indian Institute of Information Technology (IIIT) Bangalore",
      "Indian Institute of Information Technology (IIIT) Allahabad",
      "Indian Institute of Information Technology (IIIT) Delhi (IIITD)",
      "Indian Institute of Information Technology (IIIT) Gwalior",
      "Indian Institute of Information Technology (IIIT) Jabalpur",
      "Indian Institute of Information Technology (IIIT) Kancheepuram",
    ],
  },
  {
    category: "🎓 Top Central & State Universities (Delhi, Mumbai, Kolkata, Madras)",
    universities: [
      "University of Delhi (DU) - North & South Campus",
      "Jawaharlal Nehru University (JNU), New Delhi",
      "Jamia Millia Islamia (JMI), New Delhi",
      "Banaras Hindu University (BHU), Varanasi",
      "Aligarh Muslim University (AMU), Aligarh",
      "University of Calcutta, Kolkata",
      "Jadavpur University, Kolkata",
      "Presidency University, Kolkata",
      "University of Mumbai, Mumbai",
      "Savitribai Phule Pune University, Pune",
      "University of Madras, Chennai",
      "Anna University, Chennai",
      "University of Hyderabad, Hyderabad",
      "Osmania University, Hyderabad",
      "Panjab University (PU), Chandigarh",
      "Kerala University, Thiruvananthapuram",
      "Calicut University, Kerala",
      "Bangalore University, Bengaluru",
      "Gauhati University, Assam",
      "Tezpur University, Assam",
      "Utkal University, Bhubaneswar",
      "Patna University, Bihar",
      "Rajasthan University, Jaipur",
      "Gujarat University, Ahmedabad",
    ],
  },
  {
    category: "🌟 Top Private, Deemed & Leading Tech Universities",
    universities: [
      "Adamas University, Kolkata",
      "Techno India University, Kolkata",
      "Institute of Engineering and Management (IEM), Kolkata",
      "University of Engineering & Management (UEM), Kolkata / Jaipur",
      "BITS Pilani (Pilani, Goa, Hyderabad)",
      "Vellore Institute of Technology (VIT), Vellore / Chennai",
      "Manipal Academy of Higher Education (MAHE), Manipal",
      "SRM Institute of Science and Technology, Chennai",
      "Thapar Institute of Engineering and Technology, Patiala",
      "Amity University (Noida, Kolkata, Mumbai, Jaipur, Gurugram)",
      "Shiv Nadar University (SNU), Greater Noida / Chennai",
      "Ashoka University, Sonipat",
      "O.P. Jindal Global University (JGU), Sonipat",
      "Kalinga Institute of Industrial Technology (KIIT), Bhubaneswar",
      "Siksha 'O' Anusandhan (SOA), Bhubaneswar",
      "Symbiosis International University, Pune",
      "Christ University, Bengaluru",
      "Narsee Monjee Institute of Management Studies (NMIMS), Mumbai",
      "PES University, Bengaluru",
      "RV College of Engineering (RVCE), Bengaluru",
      "BMS College of Engineering (BMSCE), Bengaluru",
      "MS Ramaiah Institute of Technology, Bengaluru",
      "Heritage Institute of Technology, Kolkata",
      "Kalyani Government Engineering College, West Bengal",
      "Jalpaiguri Government Engineering College, West Bengal",
      "PSG College of Technology, Coimbatore",
      "Coimbatore Institute of Technology (CIT), Coimbatore",
      "College of Engineering Guindy (CEG), Anna University",
      "Veermata Jijabai Technological Institute (VJTI), Mumbai",
      "College of Engineering Pune (COEP), Pune",
      "Delhi Technological University (DTU), Delhi",
      "Netaji Subhas University of Technology (NSUT), Delhi",
      "Indraprastha Institute of Information Technology (IIITD), Delhi",
      "Other Prestigious University / Autonomous College",
    ],
  },
];

// Flat list for live dynamic searching
const allIndianUniversitiesFlat = indianUniversitiesGrouped.flatMap((g) => g.universities);

// Avatar Persona Choices
const avatarOptions = [
  { id: "scholar", label: "Scholar", icon: "👨‍🎓", bg: "from-amber-500 to-orange-600" },
  { id: "coder", label: "Developer", icon: "💻", bg: "from-blue-600 to-cyan-600" },
  { id: "researcher", label: "Researcher", icon: "🔬", bg: "from-emerald-600 to-teal-600" },
  { id: "innovator", label: "Innovator", icon: "🚀", bg: "from-purple-600 to-pink-600" },
];

// Major to Career Targets Mapping
const majorCareerMap: Record<string, string[]> = {
  "Computer Science & Engineering": [
    "Full-Stack Software Engineer",
    "AI / Machine Learning Engineer",
    "Cloud Solutions Architect",
    "DevOps & SRE Engineer",
    "Cybersecurity Analyst",
    "Data Scientist / Quant Analyst",
    "Mobile App Developer (iOS/Android)",
  ],
  "Artificial Intelligence & Data Science": [
    "Generative AI Engineer (LLMs)",
    "Deep Learning Researcher",
    "Computer Vision Engineer",
    "NLP / Speech Processing Specialist",
    "AI Product Manager",
    "Big Data Platform Engineer",
  ],
  "Electrical & Electronics Engineering": [
    "Embedded Systems Engineer",
    "Robotics & Automation Specialist",
    "VLSI Chip Design Engineer",
    "IoT Systems Developer",
    "Renewable Energy Systems Engineer",
  ],
  "Mechanical & Mechatronics Engineering": [
    "Robotics Hardware Engineer",
    "Aerospace Systems Designer",
    "Automotive CAD/CAM Engineer",
    "Thermodynamics & Energy Analyst",
    "Mechatronics Control Specialist",
  ],
  "Business, Fintech & Management": [
    "Quantitative Financial Trader",
    "Tech Product Manager (PM)",
    "Venture Capital & Investment Analyst",
    "Management Consultant",
    "Business Intelligence Architect",
  ],
  "Biotechnology & Health Sciences": [
    "Bioinformatics Computational Scientist",
    "Pharmaceutical R&D Specialist",
    "Clinical Trials Analyst",
    "Genetic Engineering Researcher",
    "Biomedical Device Designer",
  ],
  "Design, UI/UX & Human-Computer Interaction": [
    "Principal UI/UX Product Designer",
    "Design Systems Architect",
    "AR/VR Spatial Computing Designer",
    "UX Researcher & Cognitive Analyst",
  ],
};

export function OnboardingPage({ currentUser, onCompleteOnboarding }: OnboardingPageProps) {
  const navigate = useNavigate();

  // Multi-step State (1 to 5)
  const [step, setStep] = useState(1);

  // Form State
  const [displayName, setDisplayName] = useState(
    currentUser?.name || "Aditya Chatterjee"
  );
  const [displayEmail, setDisplayEmail] = useState(
    currentUser?.email || "aditya.chatterjee@gmail.com"
  );
  const [username, setUsername] = useState(
    currentUser?.username
      ? currentUser.username.replace(/^@/, "")
      : currentUser?.name
      ? currentUser.name.toLowerCase().replace(/\s+/g, "_")
      : "aditya_chatterjee"
  );
  const [university, setUniversity] = useState(
    currentUser?.university || "Indian Institute of Technology (IIT) Kharagpur"
  );
  const [customUniversity, setCustomUniversity] = useState("");
  const [uniSearchQuery, setUniSearchQuery] = useState("");
  const [isUniMenuOpen, setIsUniMenuOpen] = useState(false);

  // Contact Details
  const [selectedCountryCode, setSelectedCountryCode] = useState("+91");
  const [phoneDigits, setPhoneDigits] = useState(
    currentUser?.phone ? currentUser.phone.replace(/^\+\d+\s*/, "") : "9876543210"
  );

  // Academic Standing
  const [educationLevel, setEducationLevel] = useState("Undergraduate - Sophomore (2nd Year)");
  const [selectedMajor, setSelectedMajor] = useState(
    currentUser?.major || "Computer Science & Engineering"
  );
  const [selectedCareerTarget, setSelectedCareerTarget] = useState("Full-Stack Software Engineer");
  const [gradYear, setGradYear] = useState("2026");

  // Custom Uploaded / Google Photo
  const [customPhoto, setCustomPhoto] = useState<string | null>(
    currentUser?.googlePhotoUrl || currentUser?.avatarUrl || null
  );
  const onboardingPhotoInputRef = useRef<HTMLInputElement>(null);

  const handleOnboardingPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          const photoData = uploadEvent.target.result as string;
          setCustomPhoto(photoData);
          setSelectedAvatar("custom_photo");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Dynamic Avatar Choices (including Google / Custom Uploaded Photo)
  const dynamicAvatarOptions = [
    ...(customPhoto
      ? [
          {
            id: "custom_photo",
            label: "Profile Photo",
            icon: "🌐",
            imgUrl: customPhoto,
            bg: "from-blue-600 to-indigo-600",
          },
        ]
      : []),
    { id: "scholar", label: "Scholar", icon: "👨‍🎓", bg: "from-amber-500 to-orange-600" },
    { id: "coder", label: "Developer", icon: "💻", bg: "from-blue-600 to-cyan-600" },
    { id: "researcher", label: "Researcher", icon: "🔬", bg: "from-emerald-600 to-teal-600" },
    { id: "innovator", label: "Innovator", icon: "🚀", bg: "from-purple-600 to-pink-600" },
    { id: "astronaut", label: "Astronaut", icon: "👨‍🚀", bg: "from-purple-600 to-indigo-600" },
    { id: "minimalist", label: "Minimalist", icon: "✨", bg: "from-emerald-600 to-teal-500" },
  ];

  // Avatar Choice
  const [selectedAvatar, setSelectedAvatar] = useState(
    customPhoto ? "custom_photo" : currentUser?.avatar || "scholar"
  );

  // Membership Plan Choice
  const [selectedPlan, setSelectedPlan] = useState<"free" | "monthly" | "yearly">("free");

  // Payment Details (Step 4 for paid plans)
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // Refs
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const mainCardRef = useRef<HTMLDivElement>(null);
  const uniDropdownRef = useRef<HTMLDivElement>(null);

  // Crosshairs
  const crosshairTL = useRef<HTMLDivElement>(null);
  const crosshairTR = useRef<HTMLDivElement>(null);
  const crosshairBL = useRef<HTMLDivElement>(null);
  const crosshairBR = useRef<HTMLDivElement>(null);

  const isPremiumPlan = selectedPlan === "monthly" || selectedPlan === "yearly";

  // GSAP 3D Interactive Tilt & Card Entrance
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (mainCardRef.current) {
        gsap.fromTo(
          mainCardRef.current,
          { opacity: 0, y: 40, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "power3.out" }
        );
      }

      // Crosshairs Spin
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
    }, pageContainerRef);

    return () => ctx.revert();
  }, []);

  // GSAP 3D Main Card Perspective Tilt
  const handleMainCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = mainCardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotX = (y / (rect.height / 2)) * -4;
    const rotY = (x / (rect.width / 2)) * 4;

    gsap.to(card, {
      rotationX: rotX,
      rotationY: rotY,
      transformPerspective: 1400,
      duration: 0.4,
      ease: "power3.out",
    });
  };

  const handleMainCardMouseLeave = () => {
    if (!mainCardRef.current) return;
    gsap.to(mainCardRef.current, {
      rotationX: 0,
      rotationY: 0,
      duration: 0.6,
      ease: "power3.out",
    });
  };

  // Close university dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (uniDropdownRef.current && !uniDropdownRef.current.contains(event.target as Node)) {
        setIsUniMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Major Change -> Auto-select first career target
  const handleMajorChange = (major: string) => {
    setSelectedMajor(major);
    const targets = majorCareerMap[major] || [];
    if (targets.length > 0) {
      setSelectedCareerTarget(targets[0]);
    }
  };

  // Filtered universities based on search query
  const filteredUniversities = allIndianUniversitiesFlat.filter((u) =>
    u.toLowerCase().includes(uniSearchQuery.toLowerCase())
  );

  const finalUniversityName =
    university.includes("Other") && customUniversity.trim()
      ? customUniversity.trim()
      : university;

  // Step Navigation Handlers
  const handleNext = () => {
    if (step === 1 && !username.trim()) {
      alert("Please choose a valid username.");
      return;
    }
    if (step === 3 && !isPremiumPlan) {
      setStep(5);
      return;
    }
    if (step < 5) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (step === 5 && !isPremiumPlan) {
      setStep(3);
      return;
    }
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    const selectedOption = dynamicAvatarOptions.find((a) => a.id === selectedAvatar);
    const onboardingData = {
      name: displayName.trim() || currentUser?.name || "Student",
      email: displayEmail.trim() || currentUser?.email || "student@academia.edu",
      username: username.startsWith("@") ? username : `@${username}`,
      avatar: selectedAvatar,
      avatarIcon: selectedOption?.icon || "👨‍🎓",
      avatarUrl: selectedOption?.imgUrl || (selectedAvatar === "google_photo" ? (currentUser?.googlePhotoUrl || currentUser?.avatarUrl) : undefined),
      avatarBg: selectedOption?.bg || "from-amber-500 to-orange-600",
      university: finalUniversityName,
      phone: `${selectedCountryCode} ${phoneDigits}`,
      educationLevel,
      major: selectedMajor,
      careerInterest: selectedCareerTarget,
      gradYear,
      plan: selectedPlan,
      paymentStatus: (isPremiumPlan ? "PAID" : "FREE") as "PAID" | "FREE",
    };

    if (onCompleteOnboarding) onCompleteOnboarding(onboardingData);
    navigate("/dashboard");
  };

  const stepsHeader = isPremiumPlan
    ? [
        { number: 1, title: "Profile", icon: User },
        { number: 2, title: "Academic", icon: GraduationCap },
        { number: 3, title: "Plan", icon: Crown },
        { number: 4, title: "Payment", icon: CreditCard },
        { number: 5, title: "Ready", icon: Sparkles },
      ]
    : [
        { number: 1, title: "Profile", icon: User },
        { number: 2, title: "Academic", icon: GraduationCap },
        { number: 3, title: "Plan", icon: Crown },
        { number: 5, title: "Ready", icon: Sparkles },
      ];

  return (
    <div
      ref={pageContainerRef}
      className="min-h-screen bg-[#0B0A09] text-[#FAF3E1] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden select-none font-sans"
    >
      {/* Blueprint Grid Lines & Crosshairs */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-25">
        <div className="absolute top-16 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F5E7C6] to-transparent" />
        <div className="absolute bottom-16 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F5E7C6] to-transparent" />
        <div className="absolute top-0 bottom-0 left-8 sm:left-16 w-[1px] bg-gradient-to-b from-transparent via-[#F5E7C6] to-transparent" />
        <div className="absolute top-0 bottom-0 right-8 sm:right-16 w-[1px] bg-gradient-to-b from-transparent via-[#F5E7C6] to-transparent" />

        <div ref={crosshairTL} className="absolute top-16 left-8 sm:left-16 -translate-x-1/2 -translate-y-1/2 text-[#FF6D1F]">✦</div>
        <div ref={crosshairTR} className="absolute top-16 right-8 sm:right-16 translate-x-1/2 -translate-y-1/2 text-[#FF6D1F]">✦</div>
        <div ref={crosshairBL} className="absolute bottom-16 left-8 sm:left-16 -translate-x-1/2 translate-y-1/2 text-[#FF6D1F]">✦</div>
        <div ref={crosshairBR} className="absolute bottom-16 right-8 sm:right-16 translate-x-1/2 translate-y-1/2 text-[#FF6D1F]">✦</div>
      </div>

      {/* Ambient Glow Circles */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#FF6D1F]/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[250px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container Card with GSAP 3D Hover Tilt */}
      <div
        ref={mainCardRef}
        onMouseMove={handleMainCardMouseMove}
        onMouseLeave={handleMainCardMouseLeave}
        className="relative z-10 max-w-3xl w-full bg-[#141418]/95 border border-[#F5E7C6]/20 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-2xl my-auto"
      >
        {/* Top Progress Tracker */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            {stepsHeader.map((s) => {
              const Icon = s.icon;
              const isDone = step > s.number;
              const isCurrent = step === s.number;

              return (
                <div key={s.number} className="flex flex-col items-center gap-1.5 flex-1">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs transition-all duration-300",
                      isDone
                        ? "bg-[#FF6D1F] text-[#FAF3E1] shadow-lg shadow-[#FF6D1F]/30"
                        : isCurrent
                        ? "bg-[#FAF3E1] text-[#0B0A09] shadow-xl scale-110"
                        : "bg-[#1c1c22] border border-[#F5E7C6]/20 text-[#FAF3E1]/40"
                    )}
                  >
                    {isDone ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span
                    className={cn(
                      "text-[11px] font-black hidden sm:block truncate max-w-[100px] text-center uppercase tracking-wider",
                      isCurrent ? "text-[#FF6D1F]" : isDone ? "text-[#FAF3E1]" : "text-[#FAF3E1]/40"
                    )}
                  >
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress Bar Line */}
          <div className="w-full bg-[#1c1c22] h-2 rounded-full overflow-hidden border border-[#F5E7C6]/15">
            <motion.div
              className="h-full bg-gradient-to-r from-[#FF6D1F] via-[#FF6D1F] to-[#f5e7c6] rounded-full shadow-md shadow-[#FF6D1F]/50"
              initial={{ width: "0%" }}
              animate={{ width: `${(step / 5) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Step Form Body */}
        <AnimatePresence mode="wait">
          
          {/* STEP 1: Personal Info */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 text-left"
            >
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#FAF3E1]">Personalize Your Student Profile</h2>
                <p className="text-xs text-[#FAF3E1]/70 font-medium mt-1">
                  Setup your full name, email, username, institution, avatar, and phone contact for instant sync.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-black text-[#FAF3E1]/80 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#FF6D1F]" /> Full Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Aditya Sharma"
                    className="w-full bg-[#1c1c22] border border-[#F5E7C6]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#FAF3E1] font-bold placeholder-[#FAF3E1]/40 focus:outline-none focus:ring-2 focus:ring-[#FF6D1F]"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-black text-[#FAF3E1]/80 mb-1.5 flex items-center gap-1.5">
                    <AtSign className="w-3.5 h-3.5 text-[#FF6D1F]" /> Email Address
                  </label>
                  <input
                    type="email"
                    value={displayEmail}
                    onChange={(e) => setDisplayEmail(e.target.value)}
                    placeholder="e.g. aditya@gmail.com"
                    className="w-full bg-[#1c1c22] border border-[#F5E7C6]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#FAF3E1] font-bold placeholder-[#FAF3E1]/40 focus:outline-none focus:ring-2 focus:ring-[#FF6D1F]"
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="block text-xs font-black text-[#FAF3E1]/80 mb-1.5 flex items-center gap-1.5">
                    <AtSign className="w-3.5 h-3.5 text-[#FF6D1F]" /> Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. aditya_sharma"
                    className="w-full bg-[#1c1c22] border border-[#F5E7C6]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#FAF3E1] font-bold placeholder-[#FAF3E1]/40 focus:outline-none focus:ring-2 focus:ring-[#FF6D1F]"
                  />
                </div>

                {/* Searchable University / Institution Combobox */}
                <div className="relative" ref={uniDropdownRef}>
                  <label className="block text-xs font-black text-[#FAF3E1]/80 mb-1.5 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#FF6D1F]" /> University / Institution
                  </label>
                  
                  {/* Select Trigger Box */}
                  <button
                    type="button"
                    onClick={() => setIsUniMenuOpen(!isUniMenuOpen)}
                    className="w-full bg-[#1c1c22] border border-[#F5E7C6]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#FAF3E1] font-bold text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#FF6D1F] cursor-pointer"
                  >
                    <span className="truncate pr-2">{university}</span>
                    <ChevronDown className="w-4 h-4 text-[#FF6D1F] flex-shrink-0" />
                  </button>

                  {/* Search Popover Menu */}
                  <AnimatePresence>
                    {isUniMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 right-0 top-full mt-1.5 bg-[#18181e] border border-[#F5E7C6]/25 rounded-2xl shadow-2xl z-50 p-3 max-h-72 flex flex-col space-y-2 overflow-hidden"
                      >
                        {/* Live Search Input */}
                        <div className="flex items-center gap-2 bg-[#121216] border border-[#F5E7C6]/20 rounded-xl px-3 py-2">
                          <Search className="w-3.5 h-3.5 text-[#FF6D1F] flex-shrink-0" />
                          <input
                            type="text"
                            value={uniSearchQuery}
                            onChange={(e) => setUniSearchQuery(e.target.value)}
                            placeholder="Search IIT, BITS, VIT, NIT, Calcutta..."
                            className="bg-transparent text-xs text-[#FAF3E1] font-bold placeholder-[#FAF3E1]/40 focus:outline-none w-full"
                            autoFocus
                          />
                        </div>

                        {/* Search Results List */}
                        <div className="overflow-y-auto max-h-56 pr-1 space-y-1">
                          {uniSearchQuery.trim() ? (
                            filteredUniversities.length > 0 ? (
                              filteredUniversities.map((uni) => (
                                <button
                                  key={uni}
                                  type="button"
                                  onClick={() => {
                                    setUniversity(uni);
                                    setIsUniMenuOpen(false);
                                    setUniSearchQuery("");
                                  }}
                                  className={cn(
                                    "w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-between",
                                    university === uni
                                      ? "bg-[#FF6D1F] text-[#FAF3E1]"
                                      : "hover:bg-[#25252e] text-[#FAF3E1]"
                                  )}
                                >
                                  <span className="truncate">{uni}</span>
                                  {university === uni && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                                </button>
                              ))
                            ) : (
                              <div className="text-center py-4 text-xs font-semibold text-[#FAF3E1]/50">
                                No matching university found. Select "Other" below to type custom name.
                              </div>
                            )
                          ) : (
                            indianUniversitiesGrouped.map((group) => (
                              <div key={group.category} className="space-y-1 pt-1">
                                <div className="text-[10px] font-black text-[#FF6D1F] uppercase px-2 py-1 bg-[#121216] rounded-lg">
                                  {group.category}
                                </div>
                                {group.universities.map((uni) => (
                                  <button
                                    key={uni}
                                    type="button"
                                    onClick={() => {
                                      setUniversity(uni);
                                      setIsUniMenuOpen(false);
                                      setUniSearchQuery("");
                                    }}
                                    className={cn(
                                      "w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-between",
                                      university === uni
                                        ? "bg-[#FF6D1F] text-[#FAF3E1]"
                                        : "hover:bg-[#25252e] text-[#FAF3E1]"
                                    )}
                                  >
                                    <span className="truncate">{uni}</span>
                                    {university === uni && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                                  </button>
                                ))}
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Custom Institution Input if "Other" is selected */}
                {university.includes("Other") && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-black text-[#FAF3E1]/80 mb-1.5">
                      Specify Custom University / Institution Name
                    </label>
                    <input
                      type="text"
                      value={customUniversity}
                      onChange={(e) => setCustomUniversity(e.target.value)}
                      placeholder="Type your university / college name..."
                      className="w-full bg-[#1c1c22] border border-[#F5E7C6]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#FAF3E1] font-bold focus:outline-none focus:ring-2 focus:ring-[#FF6D1F]"
                    />
                  </div>
                )}

                {/* Phone Number with Country Code Dropdown */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-[#FAF3E1]/80 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#FF6D1F]" /> Phone Number (Optional SMS alerts)
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedCountryCode}
                      onChange={(e) => setSelectedCountryCode(e.target.value)}
                      className="bg-[#1c1c22] border border-[#F5E7C6]/20 rounded-xl px-3 py-2.5 text-xs text-[#FAF3E1] font-bold focus:outline-none focus:ring-2 focus:ring-[#FF6D1F] cursor-pointer"
                    >
                      {countryCodes.map((c) => (
                        <option key={c.code} value={c.code} className="bg-[#18181e]">
                          {c.flag} {c.code} ({c.country})
                        </option>
                      ))}
                    </select>

                    <input
                      type="tel"
                      value={phoneDigits}
                      onChange={(e) => setPhoneDigits(e.target.value)}
                      placeholder="9876543210"
                      className="flex-1 bg-[#1c1c22] border border-[#F5E7C6]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#FAF3E1] font-bold placeholder-[#FAF3E1]/40 focus:outline-none focus:ring-2 focus:ring-[#FF6D1F]"
                    />
                  </div>
                </div>
              </div>

              {/* Avatar Persona Choice */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-[#FAF3E1]/80">
                    Choose Your Student Avatar
                  </label>
                  
                  {/* Upload Custom Photo Input & Button */}
                  <input
                    type="file"
                    ref={onboardingPhotoInputRef}
                    onChange={handleOnboardingPhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => onboardingPhotoInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-[#22222E] hover:bg-[#2F2F3D] border border-white/10 text-xs font-bold text-[#FAF3E1] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#FF6D1F]" />
                    <span>Upload Photo</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                  {dynamicAvatarOptions.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setSelectedAvatar(av.id)}
                      className={cn(
                        "p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2",
                        selectedAvatar === av.id
                          ? "bg-[#1f1f28] border-[#FF6D1F] shadow-lg shadow-[#FF6D1F]/25 scale-105"
                          : "bg-[#18181e] border-[#F5E7C6]/15 hover:border-[#FF6D1F]/50"
                      )}
                    >
                      {av.imgUrl ? (
                        <img
                          src={av.imgUrl}
                          alt={av.label}
                          className="w-12 h-12 rounded-xl object-cover border-2 border-blue-500 shadow-md"
                        />
                      ) : (
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${av.bg} flex items-center justify-center text-2xl shadow-md`}
                        >
                          {av.icon}
                        </div>
                      )}
                      <span className="text-[11px] font-black text-[#FAF3E1] truncate w-full text-center">{av.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Academic & Career Path */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 text-left"
            >
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#FAF3E1]">Academic Standing & Career Path</h2>
                <p className="text-xs text-[#FAF3E1]/70 font-medium mt-1">
                  Select your current education level, major field, and matching career target.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Education Level */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-[#FAF3E1]/80 mb-1.5 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-[#FF6D1F]" /> Current Education Level
                  </label>
                  <select
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                    className="w-full bg-[#1c1c22] border border-[#F5E7C6]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#FAF3E1] font-bold focus:outline-none focus:ring-2 focus:ring-[#FF6D1F] cursor-pointer"
                  >
                    <option className="bg-[#18181e]" value="High School Senior (12th Grade)">High School Senior (12th Grade)</option>
                    <option className="bg-[#18181e]" value="Undergraduate - Freshman (1st Year)">Undergraduate - Freshman (1st Year)</option>
                    <option className="bg-[#18181e]" value="Undergraduate - Sophomore (2nd Year)">Undergraduate - Sophomore (2nd Year)</option>
                    <option className="bg-[#18181e]" value="Undergraduate - Junior (3rd Year)">Undergraduate - Junior (3rd Year)</option>
                    <option className="bg-[#18181e]" value="Undergraduate - Senior (4th Year)">Undergraduate - Senior (4th Year)</option>
                    <option className="bg-[#18181e]" value="Post-Graduate / Master's (1st Year)">Post-Graduate / Master's (1st Year)</option>
                    <option className="bg-[#18181e]" value="Post-Graduate / Master's (2nd Year)">Post-Graduate / Master's (2nd Year)</option>
                    <option className="bg-[#18181e]" value="Doctoral / PhD Candidate">Doctoral / PhD Candidate</option>
                    <option className="bg-[#18181e]" value="Post-Doctoral Researcher">Post-Doctoral Researcher</option>
                    <option className="bg-[#18181e]" value="Lifelong Learner / Working Professional">Lifelong Learner / Working Professional</option>
                  </select>
                </div>

                {/* Primary Major Dropdown */}
                <div>
                  <label className="block text-xs font-black text-[#FAF3E1]/80 mb-1.5 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#FF6D1F]" /> Primary Major / Field
                  </label>
                  <select
                    value={selectedMajor}
                    onChange={(e) => handleMajorChange(e.target.value)}
                    className="w-full bg-[#1c1c22] border border-[#F5E7C6]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#FAF3E1] font-bold focus:outline-none focus:ring-2 focus:ring-[#FF6D1F] cursor-pointer"
                  >
                    {Object.keys(majorCareerMap).map((m) => (
                      <option key={m} value={m} className="bg-[#18181e]">
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Career Target Dropdown */}
                <div>
                  <label className="block text-xs font-black text-[#FAF3E1]/80 mb-1.5 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-[#FF6D1F]" /> Career Target & Interests
                  </label>
                  <select
                    value={selectedCareerTarget}
                    onChange={(e) => setSelectedCareerTarget(e.target.value)}
                    className="w-full bg-[#1c1c22] border border-[#F5E7C6]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#FAF3E1] font-bold focus:outline-none focus:ring-2 focus:ring-[#FF6D1F] cursor-pointer"
                  >
                    {(majorCareerMap[selectedMajor] || []).map((t) => (
                      <option key={t} value={t} className="bg-[#18181e]">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Graduation Year */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-[#FAF3E1]/80 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#FF6D1F]" /> Expected Graduation Year
                  </label>
                  <select
                    value={gradYear}
                    onChange={(e) => setGradYear(e.target.value)}
                    className="w-full bg-[#1c1c22] border border-[#F5E7C6]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#FAF3E1] font-bold focus:outline-none focus:ring-2 focus:ring-[#FF6D1F] cursor-pointer"
                  >
                    <option className="bg-[#18181e]" value="2024">2024</option>
                    <option className="bg-[#18181e]" value="2025">2025</option>
                    <option className="bg-[#18181e]" value="2026">2026</option>
                    <option className="bg-[#18181e]" value="2027">2027</option>
                    <option className="bg-[#18181e]" value="2028">2028</option>
                    <option className="bg-[#18181e]" value="2029">2029</option>
                    <option className="bg-[#18181e]" value="2030">2030</option>
                    <option className="bg-[#18181e]" value="2031+">2031 or later</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Membership Plan Selection */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 text-left"
            >
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#FAF3E1]">Select Your Membership Plan</h2>
                <p className="text-xs text-[#FAF3E1]/70 font-medium mt-1">
                  Choose how you'd like to access course registrations and schedule conflict tools.
                </p>
              </div>

              {/* Plan Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Free Surfer */}
                <div
                  onClick={() => setSelectedPlan("free")}
                  className={cn(
                    "p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative",
                    selectedPlan === "free"
                      ? "bg-[#1e1e26] border-[#FF6D1F] shadow-lg shadow-[#FF6D1F]/25 scale-102"
                      : "bg-[#18181e] border-[#F5E7C6]/15 hover:border-[#FF6D1F]/50"
                  )}
                >
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-[#222228] flex items-center justify-center text-[#FF6D1F] mb-3">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <h3 className="font-black text-sm text-[#FAF3E1]">Free Course Surfer</h3>
                    <div className="text-xl font-black text-[#FAF3E1] my-2">
                      ₹0 <span className="text-xs text-[#FAF3E1]/60 font-semibold">/forever</span>
                    </div>
                    <ul className="text-xs text-[#FAF3E1]/70 space-y-1.5 mt-3 font-medium">
                      <li>✓ Browse Course Catalog</li>
                      <li>✓ Basic Timetable View</li>
                      <li>✓ Standard Waitlist Queue</li>
                    </ul>
                  </div>
                </div>

                {/* Monthly Pro */}
                <div
                  onClick={() => setSelectedPlan("monthly")}
                  className={cn(
                    "p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative",
                    selectedPlan === "monthly"
                      ? "bg-[#1e1e26] border-[#FF6D1F] shadow-lg shadow-[#FF6D1F]/25 scale-102"
                      : "bg-[#18181e] border-[#F5E7C6]/15 hover:border-[#FF6D1F]/50"
                  )}
                >
                  <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-[#FF6D1F] text-[#FAF3E1] text-[10px] font-black uppercase tracking-wider shadow-sm">
                    Most Popular
                  </span>
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-[#FF6D1F]/20 flex items-center justify-center text-[#FF6D1F] mb-3">
                      <Zap className="w-5 h-5" />
                    </div>
                    <h3 className="font-black text-sm text-[#FAF3E1]">Pro Student Monthly</h3>
                    <div className="text-xl font-black text-[#FF6D1F] my-2">
                      ₹499 <span className="text-xs text-[#FAF3E1]/60 font-semibold">/month</span>
                    </div>
                    <ul className="text-xs text-[#FAF3E1]/80 space-y-1.5 mt-3 font-medium">
                      <li>✓ Unlimited Course Register</li>
                      <li>✓ Automated Conflict Engine</li>
                      <li>✓ Priority Waitlist Bump</li>
                    </ul>
                  </div>
                </div>

                {/* Annual Pro */}
                <div
                  onClick={() => setSelectedPlan("yearly")}
                  className={cn(
                    "p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative",
                    selectedPlan === "yearly"
                      ? "bg-[#1e1e26] border-[#FF6D1F] shadow-lg shadow-[#FF6D1F]/25 scale-102"
                      : "bg-[#18181e] border-[#F5E7C6]/15 hover:border-[#FF6D1F]/50"
                  )}
                >
                  <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-emerald-600 text-[#FAF3E1] text-[10px] font-black uppercase tracking-wider shadow-sm">
                    Save 50%
                  </span>
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-purple-900/30 text-purple-400 flex items-center justify-center mb-3">
                      <Crown className="w-5 h-5" />
                    </div>
                    <h3 className="font-black text-sm text-[#FAF3E1]">Pro Student Annual</h3>
                    <div className="text-xl font-black text-emerald-400 my-2">
                      ₹2,999 <span className="text-xs text-[#FAF3E1]/60 font-semibold">/year</span>
                    </div>
                    <ul className="text-xs text-[#FAF3E1]/80 space-y-1.5 mt-3 font-medium">
                      <li>✓ Everything in Monthly Pro</li>
                      <li>✓ Faculty Advisory Priority</li>
                      <li>✓ iCal Calendar Sync</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Banking & Payment */}
          {step === 4 && isPremiumPlan && (
            <motion.div
              key="step-4-payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 text-left"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl sm:text-3xl font-black text-[#FAF3E1]">Banking & Payment Details</h2>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3" /> 256-Bit Encrypted
                  </span>
                </div>
                <p className="text-xs text-[#FAF3E1]/70 font-medium mt-1">
                  Complete payment for{" "}
                  <span className="text-[#FF6D1F] font-bold">
                    {selectedPlan === "monthly"
                      ? "Pro Student Monthly (₹499/mo)"
                      : "Pro Student Annual (₹2,999/yr)"}
                  </span>.
                </p>
              </div>

              {/* Payment Method Selector */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi")}
                  className={cn(
                    "flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                    paymentMethod === "upi"
                      ? "bg-[#FF6D1F] text-[#FAF3E1] border-[#FF6D1F]"
                      : "bg-[#1c1c22] text-[#FAF3E1]/70 border-[#F5E7C6]/15"
                  )}
                >
                  BHIM UPI / GPay
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={cn(
                    "flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                    paymentMethod === "card"
                      ? "bg-[#FF6D1F] text-[#FAF3E1] border-[#FF6D1F]"
                      : "bg-[#1c1c22] text-[#FAF3E1]/70 border-[#F5E7C6]/15"
                  )}
                >
                  Credit / Debit Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("netbanking")}
                  className={cn(
                    "flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                    paymentMethod === "netbanking"
                      ? "bg-[#FF6D1F] text-[#FAF3E1] border-[#FF6D1F]"
                      : "bg-[#1c1c22] text-[#FAF3E1]/70 border-[#F5E7C6]/15"
                  )}
                >
                  NetBanking
                </button>
              </div>

              {/* UPI Input */}
              {paymentMethod === "upi" && (
                <div className="p-4 rounded-2xl bg-[#1c1c22] border border-[#F5E7C6]/20 space-y-3">
                  <label className="block text-xs font-black text-[#FAF3E1]">
                    Enter Virtual Payment Address (VPA / UPI ID)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="username@okaxis / username@paytm"
                    className="w-full bg-[#141418] border border-[#F5E7C6]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#FAF3E1] font-bold focus:outline-none focus:ring-2 focus:ring-[#FF6D1F]"
                  />
                  <p className="text-[11px] text-[#FAF3E1]/60 font-semibold">
                    Instant UPI payment request will be sent to your UPI App.
                  </p>
                </div>
              )}

              {/* Card Inputs */}
              {paymentMethod === "card" && (
                <div className="p-4 rounded-2xl bg-[#1c1c22] border border-[#F5E7C6]/20 space-y-3">
                  <div>
                    <label className="block text-xs font-black text-[#FAF3E1] mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4532 0000 0000 0000"
                      className="w-full bg-[#141418] border border-[#F5E7C6]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#FAF3E1] font-bold focus:outline-none focus:ring-2 focus:ring-[#FF6D1F]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black text-[#FAF3E1] mb-1">Expiry Date</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full bg-[#141418] border border-[#F5E7C6]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#FAF3E1] font-bold focus:outline-none focus:ring-2 focus:ring-[#FF6D1F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-[#FAF3E1] mb-1">CVV Security Code</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                        maxLength={4}
                        className="w-full bg-[#141418] border border-[#F5E7C6]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#FAF3E1] font-bold focus:outline-none focus:ring-2 focus:ring-[#FF6D1F]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* NetBanking */}
              {paymentMethod === "netbanking" && (
                <div className="p-4 rounded-2xl bg-[#1c1c22] border border-[#F5E7C6]/20 space-y-3">
                  <label className="block text-xs font-black text-[#FAF3E1]">Select Your Bank</label>
                  <select className="w-full bg-[#141418] border border-[#F5E7C6]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#FAF3E1] font-bold focus:outline-none focus:ring-2 focus:ring-[#FF6D1F]">
                    <option className="bg-[#18181e]">HDFC Bank</option>
                    <option className="bg-[#18181e]">ICICI Bank</option>
                    <option className="bg-[#18181e]">State Bank of India (SBI)</option>
                    <option className="bg-[#18181e]">Axis Bank</option>
                    <option className="bg-[#18181e]">Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 5: Finish Page */}
          {step === 5 && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="space-y-8 text-center py-4"
            >
              {/* Sparkles Celebration */}
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.12, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#141418] via-[#FF6D1F] to-[#FF6D1F] flex items-center justify-center text-[#FAF3E1] shadow-2xl shadow-[#FF6D1F]/40"
                >
                  <Sparkles className="w-10 h-10" />
                </motion.div>
                <div className="absolute -top-2 -right-2 text-2xl animate-bounce">🎉</div>
                <div className="absolute -bottom-2 -left-2 text-2xl animate-bounce delay-150">🚀</div>
              </div>

              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-[#FAF3E1]">
                  Congratulations, {currentUser?.name || "Scholar"}!
                </h2>
                <p className="text-sm text-[#FAF3E1]/70 font-medium mt-2 max-w-md mx-auto">
                  Your profile and academic path have been initialized. You're ready to plan conflict-free schedules and enroll in courses.
                </p>
              </div>

              {/* Onboarding Summary Badge */}
              <div className="p-5 rounded-3xl bg-[#1c1c22] border border-[#F5E7C6]/20 text-left max-w-md mx-auto space-y-2.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#FAF3E1]/70">Username:</span>
                  <span className="text-[#FF6D1F]">@{username}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#FAF3E1]/70">Institution:</span>
                  <span className="text-[#FAF3E1]">{finalUniversityName}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#FAF3E1]/70">Contact:</span>
                  <span className="text-[#FAF3E1]">{selectedCountryCode} {phoneDigits}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#FAF3E1]/70">Field & Career:</span>
                  <span className="text-[#FAF3E1]">{selectedCareerTarget}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#FAF3E1]/70">Education Level:</span>
                  <span className="text-[#FAF3E1]">{educationLevel}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#FAF3E1]/70">Chosen Plan:</span>
                  <span className="text-emerald-400 font-extrabold uppercase">
                    {selectedPlan === "free"
                      ? "Free Course Surfer (₹0)"
                      : selectedPlan === "monthly"
                      ? "Pro Monthly (₹499/mo)"
                      : "Pro Annual (₹2,999/yr)"}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Footer Navigation Buttons */}
        <div className="mt-10 pt-6 border-t border-[#F5E7C6]/15 flex items-center justify-between">
          {step > 1 && step < 5 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-5 py-2.5 rounded-xl border border-[#F5E7C6]/20 bg-[#1c1c22] hover:bg-[#25252e] text-[#FAF3E1] font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#FF6D1F]" />
              <span>Back</span>
            </button>
          ) : <div />}

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-7 py-2.5 rounded-xl bg-[#FF6D1F] hover:bg-[#e65c10] text-[#FAF3E1] font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-[#FF6D1F]/25 cursor-pointer ml-auto"
            >
              <span>{step === 4 && isPremiumPlan ? "Confirm Payment & Continue" : "Continue"}</span>
              <ArrowRight className="w-4 h-4 text-[#FAF3E1]" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="w-full py-4 px-6 rounded-2xl bg-[#FF6D1F] hover:bg-[#e65c10] text-[#FAF3E1] font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-[#FF6D1F]/30 cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Complete Onboarding & Enter Dashboard</span>
              <ArrowRight className="w-5 h-5 text-[#FAF3E1]" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
