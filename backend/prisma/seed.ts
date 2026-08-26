import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding My Student Academia database with comprehensive academic ecosystem...');

  // Clean existing academic data (preserves user data if any, but resets courses)
  await prisma.waitlist.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.scheduleSlot.deleteMany();
  await prisma.courseSection.deleteMany();
  await prisma.prerequisite.deleteMany();
  await prisma.course.deleteMany();
  await prisma.department.deleteMany();
  await prisma.term.deleteMany();

  // Term
  const fallTerm = await prisma.term.create({
    data: {
      name: 'Fall 2026',
      isCurrent: true,
      registrationOpen: true
    }
  });

  // Instructors
  const profSethi = await prisma.user.create({
    data: { email: 'vikram.sethi@faculty.academia.edu', name: 'Dr. Vikram Sethi', role: 'INSTRUCTOR' }
  });
  const profDeshmukh = await prisma.user.create({
    data: { email: 'priya.deshmukh@faculty.academia.edu', name: 'Dr. Priya Deshmukh', role: 'INSTRUCTOR' }
  });
  const profRao = await prisma.user.create({
    data: { email: 'rajeshwar.rao@faculty.academia.edu', name: 'Dr. Rajeshwar Rao', role: 'INSTRUCTOR' }
  });
  const profKulkarni = await prisma.user.create({
    data: { email: 'suresh.kulkarni@faculty.academia.edu', name: 'Dr. Suresh Kulkarni', role: 'INSTRUCTOR' }
  });
  const profMehra = await prisma.user.create({
    data: { email: 'kabir.mehra@faculty.academia.edu', name: 'Prof. Kabir Mehra', role: 'INSTRUCTOR' }
  });
  const profSundaram = await prisma.user.create({
    data: { email: 'meenakshi.sundaram@faculty.academia.edu', name: 'Dr. Meenakshi Sundaram', role: 'INSTRUCTOR' }
  });
  const profRostova = await prisma.user.create({
    data: { email: 'elena.rostova@faculty.academia.edu', name: 'Prof. Elena Rostova', role: 'INSTRUCTOR' }
  });
  const profVance = await prisma.user.create({
    data: { email: 'marcus.vance@faculty.academia.edu', name: 'Dr. Marcus Vance', role: 'INSTRUCTOR' }
  });

  // Departments
  const deptCS = await prisma.department.create({ data: { code: 'CS', name: 'Computer Science & AI' } });
  const deptECE = await prisma.department.create({ data: { code: 'ECE', name: 'Electrical & Electronics' } });
  const deptME = await prisma.department.create({ data: { code: 'ME', name: 'Mechanical & Aerospace' } });
  const deptFIN = await prisma.department.create({ data: { code: 'FIN', name: 'Fintech & Management' } });
  const deptBIO = await prisma.department.create({ data: { code: 'BIO', name: 'Biotechnology & Health' } });
  const deptDES = await prisma.department.create({ data: { code: 'DES', name: 'Design & Interactive Media' } });
  const deptCYB = await prisma.department.create({ data: { code: 'CYB', name: 'Cybersecurity & Cloud' } });
  const deptCE = await prisma.department.create({ data: { code: 'CE', name: 'Civil & Environmental' } });
  const deptCHEM = await prisma.department.create({ data: { code: 'CHEM', name: 'Chemical & Materials' } });
  const deptLAW = await prisma.department.create({ data: { code: 'LAW', name: 'Legal Studies & Policy' } });
  const deptMED = await prisma.department.create({ data: { code: 'MED', name: 'Medical & Health Informatics' } });
  const deptMATH = await prisma.department.create({ data: { code: 'MATH', name: 'Mathematics & Statistics' } });
  const deptPHYS = await prisma.department.create({ data: { code: 'PHYS', name: 'Physics & Astronomy' } });

  // Courses Array
  const rawCourses = [
    { code: 'CS101', title: 'Computational Thinking & Algorithm Design', desc: 'Foundations of programming, asymptotic complexity analysis, memory models, and algorithmic problem-solving in Python & C++.', credits: 4, dept: deptCS.id, inst: profSethi.id, days: ['MON', 'WED', 'FRI'], time: '09:00', endTime: '10:30', room: 'Turing Hall 101' },
    { code: 'CS201', title: 'Data Structures & High-Performance Computing', desc: 'Advanced graph theory, self-balancing search trees (AVL/Red-Black), spatial trees, concurrency patterns, and cache-oblivious algorithms.', credits: 4, dept: deptCS.id, inst: profSethi.id, days: ['TUE', 'THU'], time: '10:45', endTime: '12:15', room: 'Knuth Auditorium' },
    { code: 'CS301', title: 'Modern Full-Stack Architecture & Cloud Systems', desc: 'Reactive web architectures, micro-frontends, event-driven backends, WebSockets, Kafka streaming, containerization with Docker, and Kubernetes deployment.', credits: 4, dept: deptCS.id, inst: profSethi.id, days: ['MON', 'WED'], time: '14:00', endTime: '15:30', room: 'Cloud Lab 304' },
    { code: 'CS310', title: 'Distributed Systems & Consensus Protocols', desc: 'CAP theorem, Raft & Paxos consensus protocols, Byzantine fault tolerance, distributed transactions (2PC/Saga), and peer-to-peer storage architectures.', credits: 4, dept: deptCS.id, inst: profSethi.id, days: ['TUE', 'THU'], time: '15:45', endTime: '17:15', room: 'Systems Seminar 202' },
    { code: 'AI301', title: 'Machine Learning & Statistical Pattern Recognition', desc: 'Supervised and unsupervised learning, empirical risk minimization, gradient boosting (XGBoost), kernel methods, SVMs, PCA, and probabilistic clustering.', credits: 4, dept: deptCS.id, inst: profDeshmukh.id, days: ['MON', 'WED', 'FRI'], time: '11:00', endTime: '12:30', room: 'Neural Lab 402' },
    { code: 'AI402', title: 'Deep Learning & Neural Network Architectures', desc: 'Backpropagation dynamics, Transformers, Self-Attention, CNNs, Recurrent architectures, Autoencoders, and PyTorch multi-GPU model training.', credits: 4, dept: deptCS.id, inst: profDeshmukh.id, days: ['TUE', 'THU'], time: '13:30', endTime: '15:00', room: 'Compute Cluster Lab 5' },
    { code: 'AI405', title: 'Computer Vision & Spatial 3D Intelligence', desc: 'Object detection (YOLO/R-CNN), semantic segmentation, Neural Radiance Fields (NeRF), 3D Gaussian Splatting, and visual SLAM for autonomous robotics.', credits: 4, dept: deptCS.id, inst: profDeshmukh.id, days: ['MON', 'WED'], time: '15:45', endTime: '17:15', room: 'Vision Studio 108' },
    { code: 'AI408', title: 'Generative AI, Large Language Models & Agentic Systems', desc: 'LLM pre-training, RLHF alignment, Retrieval-Augmented Generation (RAG), Autonomous Agent orchestration (LangGraph, MCP), and reasoning loops.', credits: 4, dept: deptCS.id, inst: profDeshmukh.id, days: ['TUE', 'THU'], time: '17:30', endTime: '19:00', room: 'AI Innovation Pavilion' },
    { code: 'ECE201', title: 'Digital Logic & Microprocessor Architecture', desc: 'Boolean algebra, sequential state machines, RISC-V ISA design, pipelining, cache memory hierarchies, and hardware description in Verilog.', credits: 4, dept: deptECE.id, inst: profRao.id, days: ['MON', 'WED', 'FRI'], time: '09:00', endTime: '10:30', room: 'Silicon Lab 102' },
    { code: 'ECE202', title: 'Embedded IoT Systems & Real-Time Operating Systems', desc: 'ARM Cortex-M firmware engineering, FreeRTOS scheduling, sensor buses (I2C/SPI/CAN), low-power wireless (BLE/Zigbee/LoRaWAN), and Edge ML.', credits: 4, dept: deptECE.id, inst: profRao.id, days: ['TUE', 'THU'], time: '10:45', endTime: '12:15', room: 'Embedded Systems Suite' },
    { code: 'ECE305', title: 'VLSI Chip Design, Synthesis & Tapeout', desc: 'CMOS layout, static timing analysis (STA), clock tree synthesis, place-and-route with Cadence/Synopsys, and physical design verification.', credits: 4, dept: deptECE.id, inst: profRao.id, days: ['MON', 'WED'], time: '14:00', endTime: '15:30', room: 'VLSI Cleanroom 201' },
    { code: 'ROB401', title: 'Autonomous Robotics, Kinematics & ROS 2', desc: 'Forward and inverse kinematics, trajectory planning, PID and MPC motor control, LiDAR mapping, and ROS 2 middleware architecture.', credits: 4, dept: deptECE.id, inst: profRao.id, days: ['MON', 'WED', 'FRI'], time: '08:00', endTime: '09:30', room: 'Robotics Arena & Lab' },
    { code: 'ME101', title: 'Thermodynamics & Continuum Mechanics', desc: 'First and second laws of thermodynamics, entropy generation, Rankine and Brayton cycles, stress-strain tensors, and fluid statics.', credits: 4, dept: deptME.id, inst: profKulkarni.id, days: ['MON', 'WED', 'FRI'], time: '11:00', endTime: '12:30', room: 'Carnot Hall 104' },
    { code: 'ME204', title: 'Generative CAD/CAM, FEA & Additive Manufacturing', desc: 'Parametric 3D solid modeling in SolidWorks/Fusion360, finite element stress analysis (FEA), topological optimization, and 5-axis CNC machining.', credits: 4, dept: deptME.id, inst: profKulkarni.id, days: ['TUE', 'THU'], time: '13:30', endTime: '15:00', room: 'Advanced Fab Lab' },
    { code: 'AERO401', title: 'Aerodynamics, Hypersonic Flow & Orbital Mechanics', desc: 'Compressible aerodynamics, shock waves, Prandtl-Meyer expansion, rocket propulsion equations, and two-body Keplerian orbital mechanics.', credits: 4, dept: deptME.id, inst: profKulkarni.id, days: ['MON', 'WED'], time: '15:45', endTime: '17:15', room: 'Propulsion Hangar 3' },
    { code: 'FIN101', title: 'Corporate Finance, Asset Pricing & Valuation', desc: 'Discounted cash flow (DCF) modeling, Capital Asset Pricing Model (CAPM), WACC estimation, capital structure, and M&A transaction analysis.', credits: 3, dept: deptFIN.id, inst: profMehra.id, days: ['TUE', 'THU'], time: '10:45', endTime: '12:15', room: 'Bloomberg Finance Suite' },
    { code: 'FIN305', title: 'Quantitative Trading & Algorithmic Execution', desc: 'Statistical arbitrage, order book microstructure, Black-Scholes options pricing, high-frequency backtesting in Python/C++, and risk factor models.', credits: 4, dept: deptFIN.id, inst: profMehra.id, days: ['MON', 'WED'], time: '14:00', endTime: '15:30', room: 'Trading Floor Terminal' },
    { code: 'FIN402', title: 'Decentralized Finance (DeFi) & Blockchain Protocols', desc: 'Smart contract engineering in Solidity, Automated Market Makers (Uniswap AMM formulas), lending pools (Aave), cross-chain bridges, and MEV extraction.', credits: 3, dept: deptFIN.id, inst: profMehra.id, days: ['TUE', 'THU'], time: '15:45', endTime: '17:15', room: 'Crypto Economy Lab' },
    { code: 'BIO101', title: 'Molecular Genetics & Cellular Biochemistry', desc: 'DNA replication, transcription, translational regulation, enzyme kinetics (Michaelis-Menten), metabolic pathways, and signal transduction cascades.', credits: 4, dept: deptBIO.id, inst: profSundaram.id, days: ['MON', 'WED', 'FRI'], time: '09:00', endTime: '10:30', room: 'Bio-Genetics Lab 1' },
    { code: 'BIO203', title: 'Computational Genomics & Next-Gen Sequencing (NGS)', desc: 'FASTA/FASTQ sequence alignment (BLAST, Bowtie), genome assembly, variant calling pipelines, RNA-Seq transcriptomics, and AlphaFold protein folding.', credits: 4, dept: deptBIO.id, inst: profSundaram.id, days: ['MON', 'WED'], time: '15:45', endTime: '17:15', room: 'Bioinformatics Cluster 3' },
    { code: 'BIO305', title: 'CRISPR Gene Editing & Synthetic Biology', desc: 'Cas9/Cas12 endonuclease mechanisms, guide RNA design, prime editing, metabolic pathway re-engineering, and ethical biocontainment frameworks.', credits: 4, dept: deptBIO.id, inst: profSundaram.id, days: ['TUE', 'THU'], time: '17:30', endTime: '19:00', room: 'Synthetic Biology Cleanroom' },
    { code: 'DES101', title: 'Design Systems, Visual Hierarchy & Typography', desc: 'Atomic design theory, typographic scales, color psychology, accessible contrast (WCAG AAA), component tokenization, and Figma auto-layout mastery.', credits: 3, dept: deptDES.id, inst: profRostova.id, days: ['TUE', 'THU'], time: '13:30', endTime: '15:00', room: 'Studio Arts 205' },
    { code: 'DES105', title: 'Cognitive Psychology, Usability & User Research', desc: 'Hick\'s Law, Fitts\'s Law, cognitive load reduction, qualitative user interviews, eye-tracking heatmap analytics, and A/B hypothesis testing.', credits: 3, dept: deptDES.id, inst: profRostova.id, days: ['MON', 'WED'], time: '15:45', endTime: '17:15', room: 'Usability Testing Suite' },
    { code: 'DES302', title: 'AR/VR Spatial Computing & 3D Interaction Design', desc: 'Spatial audio design, 6-DoF hand-tracking gestures in visionOS / Unity, immersive physics, shaders, and real-time WebGL experiences in Three.js.', credits: 4, dept: deptDES.id, inst: profRostova.id, days: ['TUE', 'THU'], time: '17:30', endTime: '19:00', room: 'Spatial Reality Holodeck' },
    { code: 'CYB201', title: 'Network Security, Applied Cryptography & PKI', desc: 'Symmetric (AES-GCM) & asymmetric (RSA, ECC, Post-Quantum Dilithium) ciphers, TLS 1.3 handshakes, PKI certificate authorities, and VPN tunnels.', credits: 4, dept: deptCYB.id, inst: profVance.id, days: ['MON', 'WED', 'FRI'], time: '11:00', endTime: '12:30', room: 'Cyber Defense Bunker' },
    { code: 'CYB302', title: 'Offensive Security, Penetration Testing & Exploit Dev', desc: 'Buffer overflows, binary exploitation with Ghidra, web vulnerabilities (OWASP Top 10), privilege escalation on Linux/Windows, and red-team operations.', credits: 4, dept: deptCYB.id, inst: profVance.id, days: ['TUE', 'THU'], time: '13:30', endTime: '15:00', room: 'Red Team Cyber Range' },
    { code: 'CYB405', title: 'Zero-Trust Cloud Architecture & DevSecOps', desc: 'Identity and Access Management (IAM), mutual TLS (mTLS), container escape defense, cloud security posture management (CSPM), and automated CI/CD gating.', credits: 3, dept: deptCYB.id, inst: profVance.id, days: ['MON', 'WED'], time: '14:00', endTime: '15:30', room: 'Cloud Security Hub' },
    { code: 'CE101', title: 'Structural Mechanics & Earthquake-Resilient Design', desc: 'Bending moments, shear force distributions, seismic response spectrums, base isolation dampers, and reinforced concrete structural design.', credits: 4, dept: deptCE.id, inst: profKulkarni.id, days: ['MON', 'WED', 'FRI'], time: '09:00', endTime: '10:30', room: 'Structures Lab 101' },
    { code: 'CHEM201', title: 'Nanotechnology, Battery Chemistry & Energy Materials', desc: 'Solid-state electrolyte transport, lithium-ion degradation mechanisms, graphene 2D materials, hydrogen fuel cells, and quantum dots.', credits: 4, dept: deptCHEM.id, inst: profSundaram.id, days: ['TUE', 'THU'], time: '10:45', endTime: '12:15', room: 'Nanotech Cleanroom 1' },
    { code: 'LAW201', title: 'Cyber Law, Digital Privacy & Global AI Governance', desc: 'EU AI Act risk tiers, GDPR compliance, digital sovereignty, algorithmic liability, patent law for AI-generated works, and cross-border data transfer laws.', credits: 3, dept: deptLAW.id, inst: profVance.id, days: ['TUE', 'THU'], time: '15:45', endTime: '17:15', room: 'Moot Court Hall A' },
    { code: 'MED201', title: 'Healthcare Data Architecture, HL7 FHIR & Clinical AI', desc: 'HL7 FHIR clinical data interoperability, HIPAA/DPDP privacy compliance, DICOM medical imaging pipelines, and clinical trial predictive modeling.', credits: 4, dept: deptMED.id, inst: profSundaram.id, days: ['MON', 'WED'], time: '15:45', endTime: '17:15', room: 'Clinical Informatics Center' },
    { code: 'MATH210', title: 'Linear Algebra, SVD & Optimization for ML', desc: 'Vector spaces, Singular Value Decomposition (SVD), positive definite matrices, Lagrange multipliers, and convex optimization fundamentals.', credits: 4, dept: deptMATH.id, inst: profSethi.id, days: ['MON', 'WED', 'FRI'], time: '11:00', endTime: '12:30', room: 'Ramanujan Hall 301' },
    { code: 'PHYS301', title: 'Quantum Mechanics & Superconducting Quantum Circuits', desc: 'Schrödinger wave equation, Dirac bra-ket notation, quantum entanglement, Bell inequalities, and Josephson junction superconducting qubits.', credits: 4, dept: deptPHYS.id, inst: profRao.id, days: ['TUE', 'THU'], time: '15:45', endTime: '17:15', room: 'Quantum Optics Laboratory' },
  ];

  // Insert courses, sections, and slots
  for (const c of rawCourses) {
    const course = await prisma.course.create({
      data: {
        code: c.code,
        title: c.title,
        description: c.desc,
        credits: c.credits,
        departmentId: c.dept,
      }
    });

    await prisma.courseSection.create({
      data: {
        courseId: course.id,
        sectionNumber: '01',
        termId: fallTerm.id,
        instructorId: c.inst,
        maxCapacity: 75,
        room: c.room,
        slots: {
          create: c.days.map(d => ({
            day: d,
            startTime: c.time,
            endTime: c.endTime,
          }))
        }
      }
    });
  }

  console.log(`Successfully seeded ${rawCourses.length} rich university courses across all departments!`);
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
