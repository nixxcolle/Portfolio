import React, { useEffect, useRef, useState, useCallback } from 'react';
import './index.css';
import LoadingScreen from './LoadingScreen';

function App() {
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [projectFilter, setProjectFilter] = useState('all');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Contact form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState({
    submitting: false,
    submitted: false,
    error: null
  });

  const elementsRef = useRef([]);

  // Scroll listener for sticky header, scroll-to-top button, and reading progress bar
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setHeaderScrolled(scrollY > 40);
      setShowScrollTop(scrollY > 400);

      const winHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const totalScrollable = docHeight - winHeight;
      if (totalScrollable > 0) {
        const progress = (scrollY / totalScrollable) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // ScrollSpy observer to update active section in sticky nav
    const sectionIds = ['home', 'about', 'skills', 'academic', 'projects', 'achievements', 'contact'];
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        root: null,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) sectionObserver.observe(el);
    });

    // Parallax interactive background & spotlight tracker with requestAnimationFrame
    let rafId = null;
    const handleMouseMove = (e) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);

        const x = (e.clientX - window.innerWidth / 2) / 60;
        const y = (e.clientY - window.innerHeight / 2) / 60;

        const icons = document.querySelectorAll('.float-container');
        icons.forEach((icon, index) => {
          const depth = (index % 4) + 1;
          const xOffset = x * depth * -0.9;
          const yOffset = y * depth * -0.9;
          icon.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
        });

        const shapes = document.querySelectorAll('.floating-shape');
        shapes.forEach((shape, index) => {
          const depth = (index % 3) + 1;
          const xOffset = x * depth * 0.7;
          const yOffset = y * depth * 0.7;
          shape.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
      sectionObserver.disconnect();
    };
  }, []);

  // Scroll reveal observer for content sections and project cards
  useEffect(() => {
    if (isLoading) return;

    // Small delay to ensure React DOM has completed layout
    const timer = setTimeout(() => {
      setIsLoaded(true);

      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed');
              revealObserver.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.12,
          rootMargin: '0px 0px -40px 0px'
        }
      );

      const targets = document.querySelectorAll(
        '.reveal-on-scroll, .section-header-modern, .domain-card, .modern-project-card, .achievement-card, .timeline-node, .bento-card, .about-story-card, .contributions-panel, .modern-contact-card, .academic-degree-banner'
      );

      targets.forEach((el) => {
        if (!el.classList.contains('revealed')) {
          revealObserver.observe(el);
        }
      });
    }, 60);

    return () => clearTimeout(timer);
  }, [isLoading, projectFilter]);

  // Modal keyboard accessibility and body scroll lock
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedProject) {
        setSelectedProject(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    if (selectedProject) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedProject]);

  const handleLoadingFinish = () => {
    setIsLoading(false);
  };

  const addToRefs = (el) => {
    if (el && !elementsRef.current.includes(el)) {
      elementsRef.current.push(el);
    }
  };

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      const navOffset = 80;
      const elementPosition = targetEl.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveSection(targetId);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('risajune.tenoria@ssu.edu.ph');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setFormStatus({ submitting: true, submitted: false, error: null });

    // Simulate async submission with high responsiveness
    setTimeout(() => {
      setFormStatus({ submitting: false, submitted: true, error: null });
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => {
        setFormStatus((prev) => ({ ...prev, submitted: false }));
      }, 6000);
    }, 800);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Projects data
  const projectsData = [
    {
      id: 'shield',
      title: 'SHIELD',
      subtitle: 'Smart Home Integration for Digital Security',
      category: 'iot',
      tagText: 'SMART SECURITY & IOT',
      status: 'PROTOTYPE VERIFIED',
      badgeIcon: 'shield-checkmark-outline',
      desc: 'An integrated IoT home automation & security platform enabling property owners to monitor multi-sensor telemetry, receive real-time intrusion alerts, and control actuators remotely.',
      longDesc: 'SHIELD was engineered to address real-world home security vulnerabilities through interconnected microcontrollers, cloud event triggers, and an intuitive mobile dashboard. Built with Flutter for cross-platform agility and Google Firebase for sub-second telemetry delivery, the system integrates motion detectors, ultrasonic range sensors, and relay-driven door lock actuators. Sensor nodes push live state changes to the cloud, allowing the mobile client to dispatch immediate push notifications and provide remote manual overrides.',
      highlights: [
        'Multi-sensor IoT ecosystem with instant intrusion telemetry',
        'Firebase cloud synchronization with sub-second alert triggers',
        'Cross-platform Flutter mobile UI for remote actuator control'
      ],
      architecture: 'ESP32 / Arduino Microcontroller → MQTT / Firebase Telemetry → Flutter Mobile Dashboard',
      tech: ['FLUTTER', 'FIREBASE', 'DART', 'ESP32', 'C++', 'IOT SENSORS'],
      github: 'https://github.com/CoDeX-Ray/SHIELD',
      featured: true,
      color: '#132822',
      image: '/images/shield.png'
    },
    {
      id: 'dalak8',
      title: 'DaLak8',
      subtitle: 'RSCENE 2025 Hackathon Finalist Android App',
      category: 'mobile',
      tagText: 'RSCENE 2025 HACKATHON FINALIST',
      status: 'HACKATHON FINALIST',
      badgeIcon: 'trophy-outline',
      desc: 'Native Android mobile application engineered for the RSCENE 2025 Hackathon. Features robust Firebase cloud authentication, live Google Maps geolocation mapping, and persistent local SQLite caching.',
      longDesc: 'Developed under high-pressure competitive hackathon constraints, DaLak8 solved rapid emergency response and navigation challenges by delivering a native Android application with zero lag. Incorporating Google Maps SDK with custom map markers, users can visualize routes, pin crucial community checkpoints, and sync emergency telemetry. Authentication and cloud data are synchronized with Google Firebase Firestore, backed by local SQLite cursors for offline reliability in low-connectivity areas.',
      highlights: [
        'Engineered & pitched live under strict 48-hour hackathon deadlines',
        'Integrated Google Maps API with route visualization & geolocation',
        'Hybrid cloud Firebase Firestore + SQLite offline-first architecture'
      ],
      architecture: 'Native Android Java → Google Maps SDK → Firebase Auth/Firestore ↔ SQLite Local Cache',
      tech: ['JAVA', 'ANDROID STUDIO', 'FIREBASE', 'MAPS API', 'SQLITE', 'XML'],
      github: 'https://github.com/CoDeX-Ray/DaLak8',
      featured: true,
      color: '#2a1a1f',
      image: '/images/dalak8.png'
    },
    {
      id: 'iot-health',
      title: 'IoT Health Monitor',
      subtitle: 'Biosensing Telemetry & Cloud Dashboard',
      category: 'iot',
      tagText: 'EMBEDDED & CLOUD TELEMETRY',
      status: 'SYSTEM PROTOTYPE',
      badgeIcon: 'pulse-outline',
      desc: 'Real-time patient biosensing ecosystem coupling ESP32 sensor nodes with lightweight MQTT telemetry protocols and a high-performance React monitoring dashboard for live vitals tracking.',
      longDesc: 'An end-to-end telemetry system designed for continuous patient vital tracking. An ESP32 microcontroller samples biosensor hardware, filters sensor noise, and broadcasts encrypted telemetry packets over MQTT brokers to a Node.js gateway. The accompanying React dashboard plots pulse and temperature trends in real time using Canvas-based time-series charts, alerting medical monitors when parameters exceed safety thresholds.',
      highlights: [
        'Continuous ESP32 pulse & thermal biosensing with hardware filtering',
        'Low-latency MQTT broker messaging with WebSockets fallback',
        'Live interactive telemetry graphs rendered via modern React'
      ],
      architecture: 'Biosensors → ESP32 Firmware (C++) → MQTT Broker → Node.js / React Dashboard',
      tech: ['REACT', 'NODE.JS', 'MQTT', 'ESP32', 'C++', 'WEBSOCKETS'],
      github: 'https://github.com/nixxcolle',
      featured: false,
      color: '#16222c',
      image: '/images/card_skills.png'
    },
    {
      id: 'vb-game',
      title: 'Object-Oriented Arcade Game',
      subtitle: 'Desktop Game Engine & Logic System in VB.NET',
      category: 'software',
      tagText: 'ALGORITHMS & OOP DESIGN',
      status: 'COMPLETED MILESTONE',
      badgeIcon: 'game-controller-outline',
      desc: 'Interactive desktop game built from the ground up using VB.NET. Features custom collision detection, object-oriented state management, dynamic sound triggers, and persistent score leaderboards.',
      longDesc: 'Constructed as a major foundational milestone in software architecture, this desktop application models real-time physics and game logic. Featuring polymorphic game entities, timer-based event loops, dynamic sprite collision algorithms, and persistent high-score serialization, it showcases a deep grasp of computational thinking, GUI lifecycle management, and event-driven architectures.',
      highlights: [
        'Engineered custom 2D collision detection and bounding-box algorithms',
        'Strict object-oriented polymorphism & state machine architecture',
        'Audio trigger integration and persistent high-score leaderboards'
      ],
      architecture: 'VB.NET WinForms Engine → Event Loop System → Sprite Collision Matrix',
      tech: ['VB.NET', 'OOP', 'DATA STRUCTURES', 'EVENT LOOPS', 'WINFORMS'],
      github: 'https://github.com/nixxcolle',
      featured: false,
      color: '#211928',
      image: '/images/card_about.png'
    },
    {
      id: 'logic-breadboard',
      title: 'Digital Logic IC Gate Simulator',
      subtitle: 'Combinational Circuit Wiring & Analysis Engine',
      category: 'software',
      tagText: 'LOGIC CIRCUITS & SIMULATION',
      status: 'COMPETITION TOOL',
      badgeIcon: 'hardware-chip-outline',
      desc: 'Interactive digital logic circuit simulator modeling 74-series TTL IC chips, breadboard jumper routing, and automated Boolean truth table validation.',
      longDesc: 'Developed directly inspired by competitive training for the Regional CpE Challenge (Logic Breadboarding). This interactive tool simulates standard 74-series TTL logic gates (7408 AND, 7432 OR, 7404 NOT, 7400 NAND, 7486 XOR) on a virtual breadboard layout. Users can wire pin configurations, toggle DIP switches, measure output LEDs, and verify circuit state against automated truth table matrices.',
      highlights: [
        'Virtual breadboard simulation modeling 74-series TTL pinouts',
        'Automated Boolean algebraic verification and truth table checking',
        'Built to streamline rapid logic debugging for engineering challenges'
      ],
      architecture: 'C++ / Web Engine → Boolean Evaluation Tree → Logic State Machine',
      tech: ['C++', 'LOGIC GATES', 'BREADBOARDING', 'BOOLEAN ALGEBRA', 'HDL'],
      github: 'https://github.com/nixxcolle',
      featured: false,
      color: '#1a1f28',
      image: '/images/card_projects.png'
    },
    {
      id: 'academic-portal',
      title: 'Campus CpE Student Organization Portal',
      subtitle: 'Supabase Cloud & React Full-Stack Solution',
      category: 'mobile',
      tagText: 'FULL-STACK WEB & SUPABASE',
      status: 'ACTIVE DEVELOPMENT',
      badgeIcon: 'school-outline',
      desc: 'Full-stack academic platform for Computer Engineering students featuring Supabase cloud authentication, real-time event announcements, and interactive resource archives.',
      longDesc: 'Engineered to centralize departmental engineering resources and streamline event coordination at Samar State University. The web application leverages Supabase for PostgreSQL database schemas, Row-Level Security (RLS), and live subscription feeds. Features responsive member directory dashboards, event registration trackers, and downloadable laboratory module repositories.',
      highlights: [
        'Supabase Auth with role-based access control and Row-Level Security',
        'Real-time PostgreSQL database synchronization for event updates',
        'Mobile-first responsive design tailored for university cohorts'
      ],
      architecture: 'React.js Frontend → Supabase Client SDK → PostgreSQL Cloud + RLS Policies',
      tech: ['REACT.JS', 'SUPABASE', 'POSTGRESQL', 'TYPESCRIPT', 'REST API'],
      github: 'https://github.com/nixxcolle',
      featured: false,
      color: '#251b22',
      image: '/images/card_academic.png'
    }
  ];

  const featuredProjects = projectsData.filter((p) => p.featured);
  const filteredProjects = projectFilter === 'all'
    ? projectsData
    : projectsData.filter((p) => p.category === projectFilter);

  return (
    <div className="portfolio-app">
      {/* Dynamic Reading / Scroll Progress Bar */}
      <div
        className="scroll-progress-line"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      ></div>

      {isLoading && <LoadingScreen onFinish={handleLoadingFinish} />}

      {/* Multi-layered Custom Backdrop System */}
      <div className="ambient-backdrop-system" aria-hidden="true">
        <div className="mesh-glow mesh-1"></div>
        <div className="mesh-glow mesh-2"></div>
        <div className="mesh-glow mesh-3"></div>
        <div className="mesh-glow mesh-4"></div>
        <div className="mesh-glow mesh-5"></div>
        <div className="cursor-spotlight-glow"></div>
        <div className="cyber-tech-grid"></div>

        {/* Floating Cyber Geometric Shapes & Code Tokens */}
        <div className="floating-shapes-layer">
          <div className="floating-shape shape-cross cross-1"></div>
          <div className="floating-shape shape-cross cross-2"></div>
          <div className="floating-shape shape-cross cross-3"></div>
          <div className="floating-shape shape-diamond diamond-1"></div>
          <div className="floating-shape shape-diamond diamond-2"></div>
          <div className="floating-shape shape-ring ring-1"></div>
          <div className="floating-shape shape-ring ring-2"></div>
          <div className="floating-shape shape-token token-1">&lt;CpE /&gt;</div>
          <div className="floating-shape shape-token token-2">01001001</div>
          <div className="floating-shape shape-token token-3">&#123; logic: 1 &#125;</div>
        </div>

        <div className="floating-icons-layer">
          <div className="float-container float-1"><ion-icon name="hardware-chip-outline" className="dance-icon"></ion-icon></div>
          <div className="float-container float-2"><ion-icon name="code-slash-outline" className="dance-icon"></ion-icon></div>
          <div className="float-container float-3"><ion-icon name="terminal-outline" className="dance-icon"></ion-icon></div>
          <div className="float-container float-4"><ion-icon name="git-branch-outline" className="dance-icon"></ion-icon></div>
          <div className="float-container float-5"><ion-icon name="layers-outline" className="dance-icon"></ion-icon></div>
          <div className="float-container float-6"><ion-icon name="radio-button-on-outline" className="dance-icon"></ion-icon></div>
          <div className="float-container float-7"><ion-icon name="cube-outline" className="dance-icon"></ion-icon></div>
          <div className="float-container float-8"><ion-icon name="game-controller-outline" className="dance-icon"></ion-icon></div>
        </div>
      </div>

      {/* Sticky Navigation Header */}
      <header className={`header ${headerScrolled ? 'scrolled' : ''}`}>
        <div className="container nav-wrapper">
          <a href="#home" className="logo" onClick={(e) => handleNavClick(e, 'home')}>
            <span className="logo-badge">
              <ion-icon name="terminal-outline" className="logo-icon"></ion-icon>
            </span>
            <div className="logo-text-group">
              <span className="logo-title">RISAJUNE</span>
              <span className="logo-sub">COMPUTER ENGINEERING</span>
            </div>
          </a>

          {/* Desktop Nav Links with Scrollspy Highlighting */}
          <nav className="nav-desktop">
            <ul className="nav-links">
              <li>
                <a
                  href="#home"
                  className={`nav-link ${activeSection === 'home' ? 'active' : ''}`}
                  onClick={(e) => handleNavClick(e, 'home')}
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className={`nav-link ${activeSection === 'about' ? 'active' : ''}`}
                  onClick={(e) => handleNavClick(e, 'about')}
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#skills"
                  className={`nav-link ${activeSection === 'skills' ? 'active' : ''}`}
                  onClick={(e) => handleNavClick(e, 'skills')}
                >
                  Skills
                </a>
              </li>
              <li>
                <a
                  href="#academic"
                  className={`nav-link ${activeSection === 'academic' ? 'active' : ''}`}
                  onClick={(e) => handleNavClick(e, 'academic')}
                >
                  Academic
                </a>
              </li>
              <li>
                <a
                  href="#projects"
                  className={`nav-link ${activeSection === 'projects' ? 'active' : ''}`}
                  onClick={(e) => handleNavClick(e, 'projects')}
                >
                  Projects
                </a>
              </li>
              <li>
                <a
                  href="#achievements"
                  className={`nav-link ${activeSection === 'achievements' ? 'active' : ''}`}
                  onClick={(e) => handleNavClick(e, 'achievements')}
                >
                  Achievements
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className={`nav-link ${activeSection === 'contact' ? 'active' : ''}`}
                  onClick={(e) => handleNavClick(e, 'contact')}
                >
                  Contact
                </a>
              </li>
            </ul>
          </nav>

          <div className="nav-actions">
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary nav-btn"
            >
              <ion-icon name="document-text-outline" className="btn-icon"></ion-icon>
              <span>Resume</span>
            </a>

            <button
              className={`mobile-toggle ${mobileMenuOpen ? 'open' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
            >
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'active' : ''}`}>
          <ul className="mobile-nav-links">
            <li>
              <a
                href="#home"
                className={activeSection === 'home' ? 'active' : ''}
                onClick={(e) => handleNavClick(e, 'home')}
              >
                <ion-icon name="home-outline"></ion-icon> Home
              </a>
            </li>
            <li>
              <a
                href="#about"
                className={activeSection === 'about' ? 'active' : ''}
                onClick={(e) => handleNavClick(e, 'about')}
              >
                <ion-icon name="person-outline"></ion-icon> About
              </a>
            </li>
            <li>
              <a
                href="#skills"
                className={activeSection === 'skills' ? 'active' : ''}
                onClick={(e) => handleNavClick(e, 'skills')}
              >
                <ion-icon name="code-working-outline"></ion-icon> Skills
              </a>
            </li>
            <li>
              <a
                href="#academic"
                className={activeSection === 'academic' ? 'active' : ''}
                onClick={(e) => handleNavClick(e, 'academic')}
              >
                <ion-icon name="school-outline"></ion-icon> Academic
              </a>
            </li>
            <li>
              <a
                href="#projects"
                className={activeSection === 'projects' ? 'active' : ''}
                onClick={(e) => handleNavClick(e, 'projects')}
              >
                <ion-icon name="rocket-outline"></ion-icon> Projects
              </a>
            </li>
            <li>
              <a
                href="#achievements"
                className={activeSection === 'achievements' ? 'active' : ''}
                onClick={(e) => handleNavClick(e, 'achievements')}
              >
                <ion-icon name="medal-outline"></ion-icon> Achievements
              </a>
            </li>
            <li>
              <a
                href="#contact"
                className={activeSection === 'contact' ? 'active' : ''}
                onClick={(e) => handleNavClick(e, 'contact')}
              >
                <ion-icon name="mail-outline"></ion-icon> Contact
              </a>
            </li>
            <li className="mobile-resume-li">
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-block"
              >
                <ion-icon name="document-text-outline"></ion-icon> Download Resume
              </a>
            </li>
          </ul>
        </div>
      </header>

      {/* Main Single-Page Content Stream */}
      <main>
        {/* =========================================================
            SECTION 1: HERO / INTRODUCTION (#home)
           ========================================================= */}
        <section className={`hero container ${isLoaded ? 'hero-animated' : ''}`} id="home">
          <div className="hero-content">
            <div className="hero-top-telemetry">
              <span className="telemetry-bracket">[</span>
              <span className="telemetry-coord">11.77° N, 124.88° E</span>
              <span className="telemetry-dot">•</span>
              <span className="telemetry-loc">SSU ENGG COMPLEX</span>
              <span className="telemetry-dot">•</span>
              <span className="telemetry-status">PORTFOLIO ONLINE</span>
              <span className="telemetry-bracket">]</span>
            </div>

            <div className="hero-badge-pill">
              <span className="status-dot"></span>
              <span>Available for Internships & Collaborations</span>
            </div>

            <h1 className="hero-title">
              HELLO, I'M <br />
              <span className="hero-name-gradient">RISAJUNE BERNADA TENORIA</span>
            </h1>

            <p className="hero-role">
              <span className="role-chip">Computer Engineering Student</span>
              <span className="role-divider">•</span>
              <span className="role-chip">Embedded Systems & Full-Stack Developer</span>
            </p>

            <p className="hero-subtitle">
              Passionate about bridging hardware architecture with modern high-performance software.
              Specializing in logic circuit design, embedded IoT prototypes, and intuitive web solutions.
            </p>

            <div className="hero-cta-group">
              <a
                href="#projects"
                className="btn btn-primary btn-large"
                onClick={(e) => handleNavClick(e, 'projects')}
              >
                <ion-icon name="rocket-outline" className="btn-icon"></ion-icon>
                <span>Explore Projects</span>
              </a>
              <a
                href="#contact"
                className="btn btn-outline btn-large"
                onClick={(e) => handleNavClick(e, 'contact')}
              >
                <ion-icon name="chatbubble-ellipses-outline" className="btn-icon"></ion-icon>
                <span>Let's Talk</span>
              </a>
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-large"
              >
                <ion-icon name="cloud-download-outline" className="btn-icon"></ion-icon>
                <span>CV</span>
              </a>
            </div>

            {/* Quick Metrics Strip */}
            <div className="hero-metrics">
              <div className="metric-item">
                <span className="metric-number">4TH</span>
                <span className="metric-label">Year CpE @ SSU</span>
              </div>
              <div className="metric-separator"></div>
              <div className="metric-item">
                <span className="metric-number">100%</span>
                <span className="metric-label">Commitment & Organization</span>
              </div>
              <div className="metric-separator"></div>
              <div className="metric-item">
                <span className="metric-number">Multi</span>
                <span className="metric-label">Hackathons & Logic Challenges</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-portrait-frame-wrapper">
              <div className="portrait-halo-ring"></div>
              <div className="corner-bracket corner-tl"></div>
              <div className="corner-bracket corner-tr"></div>
              <div className="corner-bracket corner-bl"></div>
              <div className="corner-bracket corner-br"></div>

              <div className="hero-image-frame">
                <div className="hero-glow-back"></div>
                <img
                  src="/images/picprofile-o.png"
                  alt="Risajune Bernada Tenoria"
                  className="hero-img"
                />
                <div className="hero-card-floating-badge badge-top">
                  <ion-icon name="hardware-chip"></ion-icon>
                  <span>Embedded & Logic</span>
                </div>
                <div className="hero-card-floating-badge badge-bottom">
                  <ion-icon name="code-slash"></ion-icon>
                  <span>Full-Stack Web</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Tech Strip */}
        <div className="tech-strip-section">
          <div className="container">
            <div className="tech-marquee-wrapper">
              <span className="marquee-tag">CORE TECH</span>
              <div className="marquee-tags">
                <span className="tech-pill"><ion-icon name="hardware-chip-outline"></ion-icon> Logic Circuits</span>
                <span className="tech-pill"><ion-icon name="code-outline"></ion-icon> C / C++</span>
                <span className="tech-pill"><ion-icon name="logo-javascript"></ion-icon> JavaScript</span>
                <span className="tech-pill"><ion-icon name="logo-react"></ion-icon> React.js</span>
                <span className="tech-pill"><ion-icon name="logo-firebase"></ion-icon> Firebase</span>
                <span className="tech-pill"><ion-icon name="server-outline"></ion-icon> Supabase</span>
                <span className="tech-pill"><ion-icon name="phone-portrait-outline"></ion-icon> Android & Java</span>
                <span className="tech-pill"><ion-icon name="git-merge-outline"></ion-icon> Git & GitHub</span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            SECTION 2: ABOUT ME (#about)
           ========================================================= */}
        <section className="about-section" id="about">
          <div className="container">
            <div className="section-header-modern" ref={addToRefs}>
              <span className="section-tag-modern">01 • IDENTITY</span>
              <h2 className="section-title-modern">About Me</h2>
              <p className="section-subtitle-modern">
                Engineering philosophy, personal journey, and problem-solving mindset
              </p>
            </div>

            <div className="about-content-grid">
              {/* Left Column: Narrative Bio */}
              <div className="about-story-card" ref={addToRefs}>
                <div className="card-ambient-light"></div>
                <div className="story-header">
                  <div className="story-avatar-box">
                    <img src="/images/picprofile%20o.png" alt="Risajune Avatar" className="story-avatar" />
                  </div>
                  <div>
                    <h3 className="story-author">Risajune Bernada Tenoria</h3>
                    <p className="story-caption">BS Computer Engineering • Samar State University</p>
                  </div>
                </div>

                <div className="story-body">
                  <p>
                    I am a student who is deeply passionate about software development. I enjoy learning new things,
                    especially those related to my field, and I am always eager to explore different areas of technology.
                    I am not limited to just one domain—I continuously expand my knowledge and rapidly adapt to new
                    architectures, frameworks, and engineering tools.
                  </p>
                  <p>
                    Right now, I am sharpening my focus on web and mobile app development while continuously mastering
                    complementary technologies that elevate my capabilities as a developer. I possess hands-on experience
                    in computational problem solving, logic circuit design, and full-cycle system development.
                  </p>
                  <p>
                    From building an object-oriented game using <strong>VB.NET</strong> to developing responsive applications
                    with <strong>HTML/CSS, React, and Android Java</strong>, I take pride in crafting clean, resilient solutions.
                    I have actively participated in competitive arenas including the <strong>Regional CpE Challenge (Logic Breadboarding)</strong> and
                    rigorous <strong>Hackathons</strong>, strengthening both my rapid debugging abilities and cross-disciplinary teamwork skills.
                  </p>
                  <p>
                    I manage my time with high discipline and deliberately avoid cramming because I believe efficiency and
                    punctuality are vital engineering principles. My overarching ambition is to become a skilled software
                    engineer who builds innovative, dependable systems that deliver lasting real-world value.
                  </p>
                </div>

                {/* Core Strengths Chips */}
                <div className="story-strengths">
                  <span className="strength-chip"><ion-icon name="checkmark-circle"></ion-icon> Proactive Time Management</span>
                  <span className="strength-chip"><ion-icon name="checkmark-circle"></ion-icon> Logic & Circuit Analysis</span>
                  <span className="strength-chip"><ion-icon name="checkmark-circle"></ion-icon> Rapid Framework Adoption</span>
                  <span className="strength-chip"><ion-icon name="checkmark-circle"></ion-icon> Resilient Code Architecture</span>
                </div>
              </div>

              {/* Right Column: Bento Identity Cards */}
              <div className="about-bento-column">
                {/* Bento Card 1: Philosophy */}
                <div className="bento-card card-philosophy-modern" ref={addToRefs}>
                  <div className="bento-icon-box">
                    <ion-icon name="sparkles-outline"></ion-icon>
                  </div>
                  <span className="bento-label">MY PHILOSOPHY</span>
                  <p className="philosophy-quote">
                    "Code is to a developer what steel is to an architect. It must be resilient, functional, and inherently beautiful."
                  </p>
                </div>

                {/* Bento Card 2: Currently Exploring */}
                <div className="bento-card card-exploring-modern" ref={addToRefs}>
                  <div className="bento-icon-box">
                    <ion-icon name="rocket-outline"></ion-icon>
                  </div>
                  <span className="bento-label">CURRENTLY EXPLORING</span>
                  <div className="exploring-tags">
                    <span className="exploring-tag"><ion-icon name="planet-outline"></ion-icon> Quantum Computing</span>
                    <span className="exploring-tag"><ion-icon name="shield-checkmark-outline"></ion-icon> Rust Ecosystem</span>
                    <span className="exploring-tag"><ion-icon name="git-network-outline"></ion-icon> Neural Networks</span>
                    <span className="exploring-tag"><ion-icon name="hardware-chip-outline"></ion-icon> Edge IoT Systems</span>
                  </div>
                </div>

                {/* Bento Card 3: Beyond the Code */}
                <div className="bento-card card-interests-modern" ref={addToRefs}>
                  <div className="bento-icon-box">
                    <ion-icon name="game-controller-outline"></ion-icon>
                  </div>
                  <span className="bento-label">BEYOND THE CODE</span>
                  <p className="bento-text">
                    When I am disconnected from the terminal, you will find me sketching logic circuit schematics,
                    practicing creative digital design, or exploring tactical strategy games that sharpen analytical thinking.
                  </p>
                </div>

                {/* Bento Card 4: Location & Affiliation */}
                <div className="bento-card card-location-modern" ref={addToRefs}>
                  <div className="bento-icon-box">
                    <ion-icon name="location-outline"></ion-icon>
                  </div>
                  <span className="bento-label">ACADEMIC HOME</span>
                  <p className="location-title">Samar State University</p>
                  <p className="location-desc">College of Engineering • Catbalogan City, Samar, Philippines</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 3: TECHNICAL SKILLS (#skills)
           ========================================================= */}
        <section className="skills-section" id="skills">
          <div className="container">
            <div className="section-header-modern" ref={addToRefs}>
              <span className="section-tag-modern">02 • EXPERTISE</span>
              <h2 className="section-title-modern">Technical Proficiency</h2>
              <p className="section-subtitle-modern">
                A structured toolkit spanning hardware design, system programming, and modern full-stack web
              </p>
            </div>

            {/* Part A: 4 Core Engineering Domains */}
            <div className="skills-domain-grid">
              {/* Domain 1: Hardware */}
              <div className="domain-card" ref={addToRefs}>
                <div className="domain-card-header">
                  <div className="domain-icon-wrapper">
                    <ion-icon name="hardware-chip-outline"></ion-icon>
                  </div>
                  <span className="domain-index">01</span>
                </div>
                <h3 className="domain-title">Hardware & Logic</h3>
                <p className="domain-summary">
                  Designing, wiring, and simulating digital circuit systems from discrete ICs to structured HDL.
                </p>
                <div className="domain-pill-list">
                  <span className="domain-pill">Logic Circuits</span>
                  <span className="domain-pill">Breadboarding</span>
                  <span className="domain-pill">HDL (Verilog/VHDL)</span>
                  <span className="domain-pill">Combinational Logic</span>
                  <span className="domain-pill">Digital IC Gates</span>
                </div>
              </div>

              {/* Domain 2: Languages */}
              <div className="domain-card" ref={addToRefs}>
                <div className="domain-card-header">
                  <div className="domain-icon-wrapper">
                    <ion-icon name="code-slash-outline"></ion-icon>
                  </div>
                  <span className="domain-index">02</span>
                </div>
                <h3 className="domain-title">Languages</h3>
                <p className="domain-summary">
                  Strong algorithmic foundation in compiled and interpreted languages across paradigms.
                </p>
                <div className="domain-pill-list">
                  <span className="domain-pill">C / C++</span>
                  <span className="domain-pill">Java</span>
                  <span className="domain-pill">VB.NET</span>
                  <span className="domain-pill">JavaScript (ES6+)</span>
                  <span className="domain-pill">TypeScript</span>
                  <span className="domain-pill">SQL</span>
                </div>
              </div>

              {/* Domain 3: Embedded & Cloud */}
              <div className="domain-card" ref={addToRefs}>
                <div className="domain-card-header">
                  <div className="domain-icon-wrapper">
                    <ion-icon name="options-outline"></ion-icon>
                  </div>
                  <span className="domain-index">03</span>
                </div>
                <h3 className="domain-title">Embedded & Cloud</h3>
                <p className="domain-summary">
                  Connecting microcontroller hardware to scalable real-time cloud data backends.
                </p>
                <div className="domain-pill-list">
                  <span className="domain-pill">Microcontrollers (ESP32)</span>
                  <span className="domain-pill">RTOS Principles</span>
                  <span className="domain-pill">Firebase Firestore</span>
                  <span className="domain-pill">Supabase Backend</span>
                  <span className="domain-pill">MQTT Protocols</span>
                </div>
              </div>

              {/* Domain 4: Software & Web */}
              <div className="domain-card" ref={addToRefs}>
                <div className="domain-card-header">
                  <div className="domain-icon-wrapper">
                    <ion-icon name="layers-outline"></ion-icon>
                  </div>
                  <span className="domain-index">04</span>
                </div>
                <h3 className="domain-title">Software & Web</h3>
                <p className="domain-summary">
                  Modern, performant web applications with responsive architecture and clean component structures.
                </p>
                <div className="domain-pill-list">
                  <span className="domain-pill">React.js</span>
                  <span className="domain-pill">HTML5 & CSS3</span>
                  <span className="domain-pill">Node.js Basics</span>
                  <span className="domain-pill">RESTful APIs</span>
                  <span className="domain-pill">Git / GitHub</span>
                </div>
              </div>
            </div>

            {/* Part B: Contributing Competencies (Animated Skill Bars) */}
            <div className="contributions-panel" ref={addToRefs}>
              <div className="contributions-header">
                <h3 className="contributions-title">
                  Skills I Can Contribute <span className="emojis">🧠 ✍️</span>
                </h3>
                <p className="contributions-subtitle">
                  Workplace competencies, software suites, and technical disciplines evaluated by execution proficiency
                </p>
              </div>

              <div className="contributions-grid">
                <div className="contributions-column">
                  <SkillProgressBar title="📞 Communication" percentage={80} delay={0.1} />
                  <SkillProgressBar title="🕛 Time Management" percentage={100} delay={0.2} />
                  <SkillProgressBar title="📚 Organization" percentage={100} delay={0.3} />
                  <SkillProgressBar title="🎨 Canva & Visual Design" percentage={100} delay={0.4} />
                </div>
                <div className="contributions-column">
                  <SkillProgressBar title="📧 Email Management" percentage={50} delay={0.5} />
                  <SkillProgressBar title="⚡ AI Prompting & Workflows" percentage={100} delay={0.6} />
                  <SkillProgressBar title="🧠 Problem-Solving & Logic" percentage={100} delay={0.7} />
                  <SkillProgressBar title="📄 Google Workspace & Docs" percentage={80} delay={0.8} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 4: ACADEMIC FOUNDATION (#academic)
           ========================================================= */}
        <section className="academic-section-modern" id="academic">
          <div className="container">
            <div className="section-header-modern" ref={addToRefs}>
              <span className="section-tag-modern">03 • EDUCATION</span>
              <h2 className="section-title-modern">Academic Foundation</h2>
              <p className="section-subtitle-modern">
                Rigorous computer engineering education, milestone projects, and hands-on growth
              </p>
            </div>

            {/* Degree Showcase Banner */}
            <div className="academic-degree-banner" ref={addToRefs}>
              <div className="banner-left">
                <div className="academic-seal-box">
                  <ion-icon name="school-outline" className="seal-icon"></ion-icon>
                </div>
                <div>
                  <span className="degree-type-tag">UNDERGRADUATE DEGREE</span>
                  <h3 className="degree-main-heading">Bachelor of Science in Computer Engineering</h3>
                  <p className="degree-school-name">Samar State University — College of Engineering</p>
                </div>
              </div>
              <div className="banner-right">
                <div className="year-badge">
                  <ion-icon name="calendar-outline"></ion-icon>
                  <span>2023 – Present</span>
                </div>
                <span className="status-pill-small">Currently 4TH Year</span>
              </div>
            </div>

            {/* Interactive Timeline Stream */}
            <div className="academic-timeline-stream">
              {/* Year 1: Foundations */}
              <div className="timeline-node" ref={addToRefs}>
                <div className="timeline-marker">
                  <span className="node-number">01</span>
                  <div className="node-line"></div>
                </div>
                <div className="timeline-card">
                  <div className="timeline-card-header">
                    <div className="timeline-card-title-group">
                      <span className="timeline-term-badge">2023 – 2024</span>
                      <h4 className="timeline-year-title">First Year — The Foundations</h4>
                      <p className="timeline-year-sub">Logic & Structural Web + Core Programming</p>
                    </div>
                  </div>

                  <div className="timeline-grid-details">
                    <div className="detail-column">
                      <div className="detail-block-title">
                        <ion-icon name="key-outline"></ion-icon>
                        <span>Key Concepts</span>
                      </div>
                      <ul className="detail-bullet-list">
                        <li>Fundamentals of C++ Programming & Syntax</li>
                        <li>Data Structures, Array Manipulation & Algorithms</li>
                        <li>Logic Breadboarding, Truth Tables & IC Gates</li>
                      </ul>
                    </div>

                    <div className="detail-column">
                      <div className="detail-block-title">
                        <ion-icon name="build-outline"></ion-icon>
                        <span>Tech Stack & Tools</span>
                      </div>
                      <div className="timeline-tech-chips">
                        <span className="tech-badge">C++</span>
                        <span className="tech-badge">VB.NET</span>
                        <span className="tech-badge">Logic ICs</span>
                        <span className="tech-badge">Breadboard</span>
                        <span className="tech-badge">HTML/CSS</span>
                      </div>
                    </div>
                  </div>

                  <div className="timeline-project-callout">
                    <span className="callout-tag">KEY MILESTONE PROJECT</span>
                    <p className="callout-desc">
                      <strong>Interactive Game Development in VB.NET:</strong> Engineered a playable desktop game
                      applying object-oriented programming concepts, GUI design, event handling, and custom logic rules.
                    </p>
                  </div>
                </div>
              </div>

              {/* Year 2: Applied Development */}
              <div className="timeline-node" ref={addToRefs}>
                <div className="timeline-marker">
                  <span className="node-number">02</span>
                  <div className="node-line"></div>
                </div>
                <div className="timeline-card">
                  <div className="timeline-card-header">
                    <div className="timeline-card-title-group">
                      <span className="timeline-term-badge">2024 – 2025</span>
                      <h4 className="timeline-year-title">Second Year — Applied Development</h4>
                      <p className="timeline-year-sub">Mobile Applications & System Integration</p>
                    </div>
                  </div>

                  <div className="timeline-grid-details">
                    <div className="detail-column">
                      <div className="detail-block-title">
                        <ion-icon name="key-outline"></ion-icon>
                        <span>Key Concepts</span>
                      </div>
                      <ul className="detail-bullet-list">
                        <li>Android Application Engineering in Native Java</li>
                        <li>Database & Cloud Integration via Google Firebase</li>
                        <li>Data Handling through SQLite & Android Cursors</li>
                        <li>Hardware Description Language (HDL) for digital systems</li>
                      </ul>
                    </div>

                    <div className="detail-column">
                      <div className="detail-block-title">
                        <ion-icon name="build-outline"></ion-icon>
                        <span>Tech Stack & Tools</span>
                      </div>
                      <div className="timeline-tech-chips">
                        <span className="tech-badge">Java</span>
                        <span className="tech-badge">Android Studio</span>
                        <span className="tech-badge">Firebase</span>
                        <span className="tech-badge">SQL</span>
                        <span className="tech-badge">HDL</span>
                      </div>
                    </div>
                  </div>

                  <div className="timeline-project-callout">
                    <span className="callout-tag">KEY MILESTONE PROJECT</span>
                    <p className="callout-desc">
                      <strong>Android Studio Application with Firebase:</strong> Architected a mobile solution
                      integrating live authentication, real-time cloud data synchronization, and persistent local storage.
                    </p>
                  </div>
                </div>
              </div>

              {/* Year 3: Systems & Web Expansion */}
              <div className="timeline-node" ref={addToRefs}>
                <div className="timeline-marker">
                  <span className="node-number">03</span>
                  <div className="node-line last"></div>
                </div>
                <div className="timeline-card">
                  <div className="timeline-card-header">
                    <div className="timeline-card-title-group">
                      <span className="timeline-term-badge">2025 – 2026</span>
                      <h4 className="timeline-year-title">Third Year — Systems & Web Expansion</h4>
                      <p className="timeline-year-sub">Logic Circuits, Modern Web, and Embedded Architectures</p>
                    </div>
                  </div>

                  <div className="timeline-grid-details">
                    <div className="detail-column">
                      <div className="detail-block-title">
                        <ion-icon name="key-outline"></ion-icon>
                        <span>Key Concepts</span>
                      </div>
                      <ul className="detail-bullet-list">
                        <li>Advanced Combinational & Sequential Logic Circuit Design</li>
                        <li>TypeScript & Scalable Component Architecture</li>
                        <li>Cloud Database & Auth via Supabase Ecosystem</li>
                        <li>Microcontroller Interfacing & Embedded Firmware (C/C++)</li>
                      </ul>
                    </div>

                    <div className="detail-column">
                      <div className="detail-block-title">
                        <ion-icon name="build-outline"></ion-icon>
                        <span>Tech Stack & Tools</span>
                      </div>
                      <div className="timeline-tech-chips">
                        <span className="tech-badge">TypeScript</span>
                        <span className="tech-badge">Supabase</span>
                        <span className="tech-badge">React.js</span>
                        <span className="tech-badge">Embedded C</span>
                        <span className="tech-badge">HDL</span>
                      </div>
                    </div>
                  </div>

                  <div className="timeline-project-callout">
                    <span className="callout-tag">KEY MILESTONE PROJECT</span>
                    <p className="callout-desc">
                      <strong>Dynamic Web Applications & Embedded Prototypes:</strong> Developing full-stack web
                      applications connected to Supabase while constructing hardware-in-the-loop embedded prototypes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 5: PROJECTS SHOWCASE (#projects)
           ========================================================= */}
        <section className="projects-section-modern" id="projects">
          <div className="container">
            <div className="section-header-modern" ref={addToRefs}>
              <span className="section-tag-modern">04 • PORTFOLIO</span>
              <h2 className="section-title-modern">Project Showcase</h2>
              <p className="section-subtitle-modern">
                Production-ready prototypes spanning mobile development, IoT sensors, cloud backends, and desktop systems
              </p>
            </div>

            {/* Part A: Distinctive Featured Flagship Showcase (SHIELD & DaLak8) */}
            <div className="featured-flagship-container" ref={addToRefs}>
              <div className="flagship-section-header">
                <div className="flagship-header-left">
                  <span className="flagship-pill-tag">
                    <ion-icon name="sparkles"></ion-icon>
                    <span>FLAGSHIP ENGINEERING SPOTLIGHT</span>
                  </span>
                  <h3 className="flagship-section-title">Highlighted Milestone Projects</h3>
                </div>
                <p className="flagship-header-desc">
                  Top-tier engineering prototypes developed for competitive challenges, live hackathons, and real-time IoT security.
                </p>
              </div>

              <div className="flagship-cards-grid">
                {featuredProjects.map((proj) => (
                  <div
                    className="flagship-card reveal-on-scroll"
                    key={proj.id}
                    ref={addToRefs}
                  >
                    <div className="flagship-card-glow" style={{ background: `radial-gradient(circle at 50% 30%, ${proj.color} 0%, transparent 70%)` }}></div>
                    
                    {/* Visual Media Column */}
                    <div className="flagship-visual-col" style={{ backgroundColor: proj.color }}>
                      <div className="flagship-visual-inner">
                        <img src={proj.image} alt={proj.title} className="flagship-project-img" />
                        <div className="flagship-telemetry-badge">
                          <span className="status-dot-small"></span>
                          <span>{proj.status}</span>
                        </div>
                        <span className="flagship-category-pill">{proj.tagText}</span>
                      </div>
                    </div>

                    {/* Technical Content Column */}
                    <div className="flagship-details-col">
                      <div className="flagship-meta-top">
                        <span className="flagship-category-label">
                          <ion-icon name={proj.badgeIcon}></ion-icon>
                          <span>{proj.tagText}</span>
                        </span>
                        <span className="flagship-status-tag">{proj.status}</span>
                      </div>

                      <h3 className="flagship-card-title">{proj.title}</h3>
                      <p className="flagship-card-subtitle">{proj.subtitle}</p>
                      <p className="flagship-card-desc">{proj.desc}</p>

                      {/* Key Engineering Breakthroughs Checklist */}
                      <div className="flagship-highlights-box">
                        <span className="highlights-title">KEY ENGINEERING BREAKTHROUGHS:</span>
                        <ul className="highlights-list">
                          {proj.highlights.map((item, idx) => (
                            <li key={idx}>
                              <ion-icon name="checkmark-circle"></ion-icon>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Architecture Pipeline Callout */}
                      <div className="flagship-arch-box">
                        <span className="arch-label">PIPELINE:</span>
                        <span className="arch-text">{proj.architecture}</span>
                      </div>

                      {/* Technologies Chips */}
                      <div className="flagship-tech-pills">
                        {proj.tech.map((t, idx) => (
                          <span className="flagship-tech-pill" key={idx}>{t}</span>
                        ))}
                      </div>

                      {/* Dual Action Buttons */}
                      <div className="flagship-actions">
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => setSelectedProject(proj)}
                        >
                          <ion-icon name="layers-outline" className="btn-icon"></ion-icon>
                          <span>Inspect Architecture</span>
                        </button>
                        <a
                          href={proj.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline"
                        >
                          <ion-icon name="logo-github" className="btn-icon"></ion-icon>
                          <span>Source Code</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Part B: Curated Filter Navigation */}
            <div className="curated-projects-header" ref={addToRefs}>
              <div className="curated-title-group">
                <span className="curated-pill">CATALOG MATRIX</span>
                <h3 className="curated-heading">Explore All Projects by Domain</h3>
              </div>

              <div className="project-filter-tabs">
                <button
                  className={`filter-btn ${projectFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setProjectFilter('all')}
                >
                  <ion-icon name="grid-outline"></ion-icon>
                  <span>All Projects</span>
                  <span className="filter-count-badge">{projectsData.length}</span>
                </button>
                <button
                  className={`filter-btn ${projectFilter === 'iot' ? 'active' : ''}`}
                  onClick={() => setProjectFilter('iot')}
                >
                  <ion-icon name="hardware-chip-outline"></ion-icon>
                  <span>IoT & Embedded</span>
                  <span className="filter-count-badge">
                    {projectsData.filter((p) => p.category === 'iot').length}
                  </span>
                </button>
                <button
                  className={`filter-btn ${projectFilter === 'mobile' ? 'active' : ''}`}
                  onClick={() => setProjectFilter('mobile')}
                >
                  <ion-icon name="phone-portrait-outline"></ion-icon>
                  <span>Mobile & Cloud</span>
                  <span className="filter-count-badge">
                    {projectsData.filter((p) => p.category === 'mobile').length}
                  </span>
                </button>
                <button
                  className={`filter-btn ${projectFilter === 'software' ? 'active' : ''}`}
                  onClick={() => setProjectFilter('software')}
                >
                  <ion-icon name="code-slash-outline"></ion-icon>
                  <span>Software & Games</span>
                  <span className="filter-count-badge">
                    {projectsData.filter((p) => p.category === 'software').length}
                  </span>
                </button>
              </div>
            </div>

            {/* Projects Grid */}
            <div className="projects-card-grid">
              {filteredProjects.map((proj) => (
                <div className="modern-project-card reveal-on-scroll" key={proj.id} ref={addToRefs}>
                  <div className="project-card-image-box" style={{ backgroundColor: proj.color }}>
                    <img src={proj.image} alt={proj.title} className="modern-project-img" />
                    <span className="project-tag-overlay">{proj.tagText}</span>
                    <span className="project-status-overlay">
                      <span className="status-dot-small"></span>
                      {proj.status}
                    </span>
                  </div>

                  <div className="project-card-details">
                    <div className="project-header-row">
                      <h3 className="project-card-heading">{proj.title}</h3>
                      {proj.featured && (
                        <span className="card-featured-badge" title="Flagship Featured Project">
                          <ion-icon name="star"></ion-icon>
                          <span>Featured</span>
                        </span>
                      )}
                    </div>
                    <p className="project-card-subtitle-small">{proj.subtitle}</p>
                    <p className="project-card-description">{proj.desc}</p>

                    <div className="project-tags-wrap">
                      {proj.tech.map((t, idx) => (
                        <span className="project-tech-badge" key={idx}>
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="project-card-actions-dual">
                      <button
                        type="button"
                        className="btn btn-outline btn-specs-quick"
                        onClick={() => setSelectedProject(proj)}
                      >
                        <ion-icon name="eye-outline" className="btn-icon"></ion-icon>
                        <span>Inspect Specs</span>
                      </button>
                      <a
                        href={proj.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-github-quick"
                      >
                        <ion-icon name="logo-github" className="btn-icon"></ion-icon>
                        <span>GitHub</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 6: ACHIEVEMENTS & COMPETITIONS (#achievements)
           ========================================================= */}
        <section className="achievements-section-modern" id="achievements">
          <div className="container">
            <div className="section-header-modern" ref={addToRefs}>
              <span className="section-tag-modern">05 • RECOGNITIONS</span>
              <h2 className="section-title-modern">Achievements & Milestones</h2>
              <p className="section-subtitle-modern">
                Competitive engineering challenges, hackathons, and continuous technical growth
              </p>
            </div>

            <div className="achievements-grid">
              {/* Achievement 1 */}
              <div className="achievement-card" ref={addToRefs}>
                <div className="achievement-icon-wrapper gold">
                  <ion-icon name="trophy-outline"></ion-icon>
                </div>
                <span className="achievement-category">ENGINEERING COMPETITION</span>
                <h3 className="achievement-title">Regional CpE Challenge</h3>
                <p className="achievement-sub">Logic Breadboarding & Circuit Analysis</p>
                <p className="achievement-desc">
                  Competed in the prestigious Regional Computer Engineering Challenge, executing live logic IC gate wiring,
                  debugging digital hardware faults, and applying combinational logic under strict time limits.
                </p>
                <div className="achievement-footer-tag">
                  <ion-icon name="ribbon-outline"></ion-icon>
                  <span>IC Gates • Breadboarding • Boolean Optimization</span>
                </div>
              </div>

              {/* Achievement 2 */}
              <div className="achievement-card" ref={addToRefs}>
                <div className="achievement-icon-wrapper pink">
                  <ion-icon name="flash-outline"></ion-icon>
                </div>
                <span className="achievement-category">COMPETITIVE HACKATHON</span>
                <h3 className="achievement-title">RSCENE 2025 Hackathon</h3>
                <p className="achievement-sub">DaLak8 Native Android Application</p>
                <p className="achievement-desc">
                  Rapidly prototyped and delivered the DaLak8 Android application under hackathon deadlines,
                  implementing Firebase cloud authentication, geolocation features, and interactive UI for real-time users.
                </p>
                <div className="achievement-footer-tag">
                  <ion-icon name="code-working-outline"></ion-icon>
                  <span>Hackathon Finalist • Native Java • Cloud DB</span>
                </div>
              </div>

              {/* Achievement 3 */}
              <div className="achievement-card" ref={addToRefs}>
                <div className="achievement-icon-wrapper blue">
                  <ion-icon name="school-outline"></ion-icon>
                </div>
                <span className="achievement-category">ACADEMIC EXCELLENCE</span>
                <h3 className="achievement-title">Computer Engineering Leadership</h3>
                <p className="achievement-sub">Samar State University • College of Engineering</p>
                <p className="achievement-desc">
                  Maintaining strong academic performance with zero cramming discipline. Consistently proactive in laboratory
                  works, peer collaboration, and technical project execution across all semester coursework.
                </p>
                <div className="achievement-footer-tag">
                  <ion-icon name="checkmark-done-circle-outline"></ion-icon>
                  <span>Time Management • Technical Leadership</span>
                </div>
              </div>

              {/* Achievement 4 */}
              <div className="achievement-card" ref={addToRefs}>
                <div className="achievement-icon-wrapper green">
                  <ion-icon name="ribbon-outline"></ion-icon>
                </div>
                <span className="achievement-category">CONTINUOUS LEARNING</span>
                <h3 className="achievement-title">Technical Certifications</h3>
                <p className="achievement-sub">Web, Mobile & Embedded Credentials</p>
                <p className="achievement-desc">
                  Consistently upskilling in modern engineering stacks—including React.js, Supabase, Firebase Cloud,
                  microcontroller programming, and professional design with Canva.
                </p>
                <div className="achievement-footer-tag">
                  <ion-icon name="shield-checkmark-outline"></ion-icon>
                  <span>Full-Stack • Embedded • Verified Skills</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 7: CONTACT (#contact)
           ========================================================= */}
        <section className="contact-section-modern" id="contact">
          <div className="container">
            <div className="section-header-modern" ref={addToRefs}>
              <span className="section-tag-modern">06 • CONNECT</span>
              <h2 className="section-title-modern">Get In Touch</h2>
              <p className="section-subtitle-modern">
                Let's discuss opportunities, technical collaborations, or build something exceptional together
              </p>
            </div>

            <div className="modern-contact-card" ref={addToRefs}>
              {/* Left Column: Direct Contact Info */}
              <div className="contact-info-column">
                <span className="contact-info-badge">LET'S CONNECT</span>
                <h3 className="contact-info-heading">
                  Let's build something <br />
                  <span className="highlight-text">innovative together.</span>
                </h3>

                <p className="contact-info-body">
                  I am always eager to take on new technical challenges, discuss internship opportunities,
                  and collaborate on impactful software or embedded hardware projects.
                </p>

                <div className="contact-channels">
                  {/* Copy Email Box */}
                  <div className="channel-item email-box">
                    <div className="channel-icon-box">
                      <ion-icon name="mail-outline"></ion-icon>
                    </div>
                    <div className="channel-text">
                      <span className="channel-label">Direct Email</span>
                      <span className="channel-value">risajune.tenoria@ssu.edu.ph</span>
                    </div>
                    <button
                      type="button"
                      className="copy-email-btn"
                      onClick={handleCopyEmail}
                      title="Copy email to clipboard"
                    >
                      <ion-icon name={copiedEmail ? 'checkmark-outline' : 'copy-outline'}></ion-icon>
                      <span>{copiedEmail ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Location Box */}
                  <div className="channel-item">
                    <div className="channel-icon-box">
                      <ion-icon name="location-outline"></ion-icon>
                    </div>
                    <div className="channel-text">
                      <span className="channel-label">Location</span>
                      <span className="channel-value">Catbalogan City, Samar, Philippines</span>
                    </div>
                  </div>

                  {/* Status Box */}
                  <div className="channel-item">
                    <div className="channel-icon-box pulse">
                      <ion-icon name="radio-outline"></ion-icon>
                    </div>
                    <div className="channel-text">
                      <span className="channel-label">Current Availability</span>
                      <span className="channel-value status-available">Open for Internships & Projects</span>
                    </div>
                  </div>
                </div>

                {/* Social Connect Links */}
                <div className="social-connect-block">
                  <span className="social-connect-label">FOLLOW & CONNECT</span>
                  <div className="social-links-grid">
                    <a
                      href="https://github.com/nixxcolle"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-btn"
                      aria-label="GitHub Profile"
                    >
                      <ion-icon name="logo-github"></ion-icon>
                      <span>GitHub</span>
                    </a>
                    <a
                      href="https://web.facebook.com/risajune.tenoria.9"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-btn"
                      aria-label="Facebook Profile"
                    >
                      <ion-icon name="logo-facebook"></ion-icon>
                      <span>Facebook</span>
                    </a>
                    <a
                      href="https://www.instagram.com/_riszone/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-btn"
                      aria-label="Instagram Profile"
                    >
                      <ion-icon name="logo-instagram"></ion-icon>
                      <span>Instagram</span>
                    </a>
                    <a
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-btn"
                      aria-label="LinkedIn Profile"
                    >
                      <ion-icon name="logo-linkedin"></ion-icon>
                      <span>LinkedIn</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Contact Form */}
              <div className="contact-form-column">
                <div className="form-card-wrapper">
                  <h4 className="form-title">Send a Direct Message</h4>
                  <p className="form-subtitle">Fill in the fields below and I'll respond promptly.</p>

                  {formStatus.submitted && (
                    <div className="form-alert-success">
                      <ion-icon name="checkmark-circle-outline"></ion-icon>
                      <span>Thank you! Your message has been sent successfully. I will get back to you soon.</span>
                    </div>
                  )}

                  <form className="contact-form-modern" onSubmit={handleFormSubmit}>
                    <div className="form-row-two">
                      <div className="form-field">
                        <label htmlFor="name" className="form-label">Your Name</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleFormChange}
                          placeholder="Juan Dela Cruz"
                          className="modern-input"
                          required
                        />
                      </div>
                      <div className="form-field">
                        <label htmlFor="email" className="form-label">Email Address</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleFormChange}
                          placeholder="juan@example.com"
                          className="modern-input"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-field">
                      <label htmlFor="subject" className="form-label">Subject</label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleFormChange}
                        placeholder="Internship / Collaboration / Inquiries"
                        className="modern-input"
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="message" className="form-label">Your Message</label>
                      <textarea
                        id="message"
                        name="message"
                        rows="5"
                        value={formData.message}
                        onChange={handleFormChange}
                        placeholder="Write your message or project requirements here..."
                        className="modern-input textarea"
                        required
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary btn-block form-submit-btn"
                      disabled={formStatus.submitting}
                    >
                      {formStatus.submitting ? (
                        <>
                          <span className="spinner"></span>
                          <span>Sending Message...</span>
                        </>
                      ) : (
                        <>
                          <ion-icon name="send-outline" className="btn-icon"></ion-icon>
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modern Global Footer */}
      <footer className="footer-modern">
        <div className="container footer-content-wrapper">
          <div className="footer-top-row">
            <div className="footer-brand">
              <a href="#home" className="footer-logo" onClick={(e) => handleNavClick(e, 'home')}>
                <ion-icon name="terminal-outline" className="footer-logo-icon"></ion-icon>
                <span>Risajune Bernada Tenoria</span>
              </a>
              <p className="footer-bio">
                Computer Engineering student crafting resilient digital hardware & full-stack software solutions.
                Samar State University • Catbalogan City, Samar.
              </p>
            </div>

            <div className="footer-nav-columns">
              <div className="footer-nav-col">
                <span className="footer-heading">NAVIGATION</span>
                <ul className="footer-links-list">
                  <li><a href="#home" onClick={(e) => handleNavClick(e, 'home')}>Home</a></li>
                  <li><a href="#about" onClick={(e) => handleNavClick(e, 'about')}>About Me</a></li>
                  <li><a href="#skills" onClick={(e) => handleNavClick(e, 'skills')}>Technical Skills</a></li>
                  <li><a href="#academic" onClick={(e) => handleNavClick(e, 'academic')}>Academic Foundation</a></li>
                </ul>
              </div>

              <div className="footer-nav-col">
                <span className="footer-heading">PORTFOLIO</span>
                <ul className="footer-links-list">
                  <li><a href="#projects" onClick={(e) => handleNavClick(e, 'projects')}>Featured Projects</a></li>
                  <li><a href="#achievements" onClick={(e) => handleNavClick(e, 'achievements')}>Achievements</a></li>
                  <li><a href="#contact" onClick={(e) => handleNavClick(e, 'contact')}>Contact & Inquiries</a></li>
                  <li><a href="/resume.pdf" target="_blank" rel="noopener noreferrer">Download Resume</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="footer-bottom-row">
            <p className="footer-copyright-text">
              © {new Date().getFullYear()} Risajune Bernada Tenoria. Designed & Built with Pride.
            </p>

            <div className="footer-social-icons">
              <a href="https://github.com/nixxcolle" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <ion-icon name="logo-github"></ion-icon>
              </a>
              <a href="https://web.facebook.com/risajune.tenoria.9" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <ion-icon name="logo-facebook"></ion-icon>
              </a>
              <a href="https://www.instagram.com/_riszone/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <ion-icon name="logo-instagram"></ion-icon>
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <ion-icon name="logo-linkedin"></ion-icon>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Scroll To Top Button */}
      <button
        className={`scroll-to-top-btn ${showScrollTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Scroll back to top"
      >
        <ion-icon name="arrow-up-outline"></ion-icon>
      </button>

      {/* In-Page Interactive Project Inspection Modal */}
      {selectedProject && (
        <div
          className="project-modal-backdrop"
          onClick={() => setSelectedProject(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-project-title"
        >
          <div
            className="project-modal-window"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close-btn"
              onClick={() => setSelectedProject(null)}
              aria-label="Close Project Details"
            >
              <ion-icon name="close-outline"></ion-icon>
            </button>

            <div className="modal-header-section">
              <div className="modal-badges-row">
                <span className="modal-category-badge">{selectedProject.tagText}</span>
                <span className="modal-status-badge">
                  <span className="status-dot-small"></span>
                  {selectedProject.status}
                </span>
              </div>
              <h2 id="modal-project-title" className="modal-project-title">{selectedProject.title}</h2>
              <p className="modal-project-subtitle">{selectedProject.subtitle}</p>
            </div>

            <div className="modal-body-content">
              <div className="modal-preview-canvas" style={{ backgroundColor: selectedProject.color }}>
                <img src={selectedProject.image} alt={selectedProject.title} className="modal-preview-img" />
                <div className="modal-canvas-glow"></div>
              </div>

              <div className="modal-text-block">
                <h4 className="modal-subheading">
                  <ion-icon name="document-text-outline"></ion-icon>
                  <span>Overview & Problem Statement</span>
                </h4>
                <p className="modal-desc-text">{selectedProject.longDesc || selectedProject.desc}</p>

                <h4 className="modal-subheading">
                  <ion-icon name="hardware-chip-outline"></ion-icon>
                  <span>System Architecture & Telemetry Pipeline</span>
                </h4>
                <div className="modal-architecture-box">
                  <span className="arch-flow-label">DATA & CONTROL PIPELINE:</span>
                  <code className="arch-flow-code">{selectedProject.architecture}</code>
                </div>

                <h4 className="modal-subheading">
                  <ion-icon name="flash-outline"></ion-icon>
                  <span>Key Engineering Highlights</span>
                </h4>
                <ul className="modal-highlights-list">
                  {selectedProject.highlights.map((item, idx) => (
                    <li key={idx}>
                      <ion-icon name="checkmark-circle"></ion-icon>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <h4 className="modal-subheading">
                  <ion-icon name="code-working-outline"></ion-icon>
                  <span>Technologies & Tools Employed</span>
                </h4>
                <div className="modal-tech-pills-row">
                  {selectedProject.tech.map((t, idx) => (
                    <span className="modal-tech-pill" key={idx}>{t}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer-actions">
              <a
                href={selectedProject.github}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <ion-icon name="logo-github" className="btn-icon"></ion-icon>
                <span>View Source Code on GitHub</span>
              </a>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setSelectedProject(null)}
              >
                <span>Close Specs</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable animated skill progress bar component
const SkillProgressBar = ({ title, percentage, delay = 0 }) => {
  const [inView, setInView] = useState(false);
  const barRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );

    if (barRef.current) observer.observe(barRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="modern-skill-bar" ref={barRef}>
      <div className="skill-bar-labels">
        <span className="skill-bar-name">{title}</span>
        <span className="skill-bar-badge">{percentage}%</span>
      </div>
      <div className="skill-bar-rail">
        <div
          className="skill-bar-fill-glow"
          style={{
            width: inView ? `${percentage}%` : '0%',
            transitionDelay: `${delay}s`
          }}
        ></div>
      </div>
    </div>
  );
};

export default App;
