import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "../store";
import { ArrowRight, Mountain, ShieldCheck, Clock, Map, Sparkles, Phone, MessageSquare, Globe } from "lucide-react";
import { toast } from "react-toastify";
import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import InteractiveJourney from "../components/InteractiveJourney";
import highAngleForestFog from "../assets/images/high_angle_forest_fog_1780117459264.png";
import verticalForestSoignes from "../assets/images/vertical_forest_soignes_1780117482844.png";
import { useTranslation } from "react-i18next";

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const { user, setAuth } = useStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const heroRef = useRef<HTMLDivElement>(null);
  const title1Ref = useRef<HTMLHeadingElement>(null);
  const title2Ref = useRef<HTMLSpanElement>(null);
  const pRef = useRef<HTMLParagraphElement>(null);
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null);

  const faqItems = [
    {
      question: t('landing.faq_q1'),
      answer: t('landing.faq_a1')
    },
    {
      question: t('landing.faq_q2'),
      answer: t('landing.faq_a2')
    },
    {
      question: t('landing.faq_q3'),
      answer: t('landing.faq_a3')
    },
    {
      question: t('landing.faq_q4'),
      answer: t('landing.faq_a4')
    },
    {
      question: t('landing.faq_q5'),
      answer: t('landing.faq_a5')
    }
  ];
  
  useEffect(() => {
    // Initial GSAP Reveal
    const tl = gsap.timeline();
    tl.fromTo(title1Ref.current, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.2 })
      .fromTo(title2Ref.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, "-=0.5")
      .fromTo(pRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }, "-=0.4");

    // ScrollTrigger Parallax on Hero
    gsap.to(heroRef.current, {
      y: 150,
      opacity: 0,
      scale: 0.95,
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      }
    });

    // Clean up
    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  const handleDemoLogin = async (role: 'admin' | 'customer') => {
    try {
      const res = await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setAuth(data.user, data.token);
      toast.success(`Berhasil masuk sebagai Demo ${role === 'admin' ? 'Admin' : 'Pelanggan'}`);
      
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal masuk Demo Mode");
    }
  };

  const scrollToSection = (id: string) => {
    if ((window as any).lenis) {
      (window as any).lenis.scrollTo(`#${id}`);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const RevealText = ({ children, delay = 0, yOffset = 40 }: { children: React.ReactNode, delay?: number, yOffset?: number }) => (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#070708] text-white font-sans selection:bg-[#E67E22] selection:text-white pb-0 mb-0">
      {/* Header */}
      <motion.header 
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-4 md:top-6 left-0 right-0 z-50 flex justify-center px-4 sm:px-6 md:px-8 pointer-events-none"
      >
        <div className="w-full max-w-6xl pointer-events-auto relative rounded-full bg-black/35 backdrop-blur-2xl border border-white/[0.08] shadow-[0_16px_40px_-10px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.16)] flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-10 h-16 transition-all duration-300 ease-out duration-300 hover:border-white/[0.14] hover:shadow-[0_20px_45px_-5px_rgba(0,0,0,0.7),inset_0_1px_1.5px_rgba(255,255,255,0.22)] hover:bg-transparent/45 overflow-visible">
          
          {/* Liquid Glass Premium Reflection Layer */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/[0.01] via-white/[0.04] to-transparent pointer-events-none" />
          <div className="absolute inset-[0.5px] rounded-full border border-white/[0.03] pointer-events-none" />

          <button 
            onClick={() => scrollToSection('hero')} 
            className="font-semibold text-[17px] sm:text-base md:text-lg lg:text-xl tracking-tight text-white select-none cursor-pointer flex items-center gap-1 hover:opacity-85 transition-opacity relative z-10 shrink-0"
          >
            OUTRENT<span className="text-[#E67E22]">.</span>
          </button>
          
          <nav className="hidden md:flex gap-0.5 lg:gap-1.5 items-center relative z-10 mx-auto">
            <button onClick={() => scrollToSection('story')} className="text-[11px] lg:text-[13px] font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] py-1.5 px-2 md:px-3 lg:px-4 rounded-full transition-all duration-300 ease-out duration-200 cursor-pointer">{t('landing.nav_philosophy')}</button>
            <button onClick={() => scrollToSection('equipment')} className="text-[11px] lg:text-[13px] font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] py-1.5 px-2 md:px-3 lg:px-4 rounded-full transition-all duration-300 ease-out duration-200 cursor-pointer">{t('landing.nav_exploration')}</button>
            <button onClick={() => scrollToSection('journey')} className="text-[11px] lg:text-[13px] font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] py-1.5 px-2 md:px-3 lg:px-4 rounded-full transition-all duration-300 ease-out duration-200 cursor-pointer">{t('landing.nav_journey')}</button>
            <button onClick={() => scrollToSection('system')} className="text-[11px] lg:text-[13px] font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] py-1.5 px-2 md:px-3 lg:px-4 rounded-full transition-all duration-300 ease-out duration-200 cursor-pointer">{t('landing.nav_system')}</button>
            <button onClick={() => scrollToSection('faq')} className="text-[11px] lg:text-[13px] font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] py-1.5 px-2 md:px-3 lg:px-4 rounded-full transition-all duration-300 ease-out duration-200 cursor-pointer">{t('landing.nav_faq')}</button>
          </nav>

          {/* Mobile/Tablet Language Switcher */}
          <div className="flex md:hidden items-center z-10 shrink-0">
            <button 
              onClick={() => {
                const nextLang = i18n.language === 'id' ? 'en' : 'id';
                i18n.changeLanguage(nextLang);
              }}
              className="p-1.5 sm:p-2 text-zinc-300 hover:text-white hover:bg-white/10 rounded-full transition-all relative cursor-pointer flex items-center justify-center gap-1.5 bg-white/[0.04] border border-white/[0.08]"
              title="Toggle Language"
            >
              <Globe size={13} className="text-zinc-400" />
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-zinc-300 pr-0.5">{i18n.language === 'id' ? 'ID' : 'EN'}</span>
            </button>
          </div>
          
          <div className="hidden md:flex gap-2 lg:gap-3 items-center relative z-10 shrink-0">
            <button 
              onClick={() => {
                const nextLang = i18n.language === 'id' ? 'en' : 'id';
                i18n.changeLanguage(nextLang);
              }}
              className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-all relative cursor-pointer"
              title="Toggle Language"
            >
              <Globe size={15} />
              <span className="sr-only">Toggle Language</span>
            </button>
            {user ? (
              <button 
                onClick={() => {
                  const role = user.role?.toLowerCase() || '';
                  const isAdmin = role === 'admin' || role === 'super_admin' || role === 'demo_admin';
                  navigate(isAdmin ? '/admin/dashboard' : '/customer/dashboard');
                }}
                className="text-[11px] lg:text-sm font-semibold bg-[#E67E22] text-white px-3.5 lg:px-6 h-9 lg:h-10 rounded-full transition-all duration-300 ease-out flex items-center shadow-lg hover:bg-[#CF6E1B] hover:shadow-[#E67E22]/25 hover:-translate-y-0.5 active:translate-y-0 duration-200 cursor-pointer"
              >
                {t('landing.workspace')}
              </button>
            ) : (
              <>
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden text-[11.5px] font-semibold bg-white text-black hover:bg-white hover:-translate-y-0.5 px-4 h-9 rounded-full flex items-center justify-center transition-all duration-300 ease-out shadow-md duration-200 cursor-pointer"
                >
                  {t('landing.login')} / {t('landing.register')}
                </button>
                <Link to="/login" className="hidden lg:block text-sm font-semibold text-zinc-400 hover:text-white px-4 py-2 transition-colors duration-200">{t('landing.login')}</Link>
                <Link to="/register" className="hidden lg:flex text-sm font-semibold bg-white text-black hover:bg-white hover:-translate-y-0.5 px-6 h-10 rounded-full items-center justify-center transition-all duration-300 ease-out shadow-md duration-200">{t('landing.register')}</Link>
              </>
            )}
          </div>
        </div>
      </motion.header>

      {/* iOS-Style Floating Bottom Dock for Mobile */}
      <div className="md:hidden fixed bottom-8 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto flex items-center p-1.5 apple-liquid-glass rounded-full relative overflow-visible shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)]">
          {/* Liquid Glass Premium Reflection Layer */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-white/[0.02] to-white/[0.06] pointer-events-none" />
          <div className="absolute inset-[0.5px] rounded-full border border-white/[0.08] pointer-events-none" />
          
          <div className="flex items-center gap-1.5 relative z-10 px-1">
            <button onClick={() => scrollToSection('story')} className="flex flex-col items-center justify-center w-[4.5rem] py-2.5 px-2 rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition-all duration-300 ease-out overflow-hidden relative group">
              <span className="text-[11px] font-semibold tracking-wide z-10">{t('landing.story')}</span>
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
            </button>
            <button onClick={() => scrollToSection('equipment')} className="flex flex-col items-center justify-center w-[4.5rem] py-2.5 px-2 rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition-all duration-300 ease-out overflow-hidden relative group">
              <span className="text-[11px] font-semibold tracking-wide z-10">{t('landing.exploration')}</span>
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
            </button>
            <button onClick={() => scrollToSection('journey')} className="flex flex-col items-center justify-center w-[4.5rem] py-2.5 px-2 rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition-all duration-300 ease-out overflow-hidden relative group">
              <span className="text-[11px] font-semibold tracking-wide z-10">{t('landing.journey')}</span>
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
            </button>
            
            <div className="w-[1px] h-7 bg-white/[0.12] mx-1" />
            
            {user ? (
              <button 
                onClick={() => {
                  const role = user.role?.toLowerCase() || '';
                  const isAdmin = role === 'admin' || role === 'super_admin' || role === 'demo_admin';
                  navigate(isAdmin ? '/admin/dashboard' : '/customer/dashboard');
                }}
                className="flex items-center justify-center w-[4.5rem] h-9 rounded-full bg-[#E67E22]/90 backdrop-blur-md border border-[#E67E22]/50 text-white text-[11px] font-bold hover:bg-[#E67E22] transition-colors shadow-[0_0_20px_rgba(230,126,34,0.4)] mx-1 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                <span className="relative z-10">{t('landing.workspace').split(' ')[0]}</span>
              </button>
            ) : (
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="flex items-center justify-center w-[4.5rem] h-9 rounded-full bg-white/10 backdrop-blur-md text-white text-[11px] font-bold hover:bg-white/20 transition-all shadow-[0_8px_16px_rgba(0,0,0,0.4),0_0_20px_rgba(255,255,255,0.05)] mx-1 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent pointer-events-none" />
                <span className="relative z-10">{t('landing.login')}</span>
              </button>
            )}
           </div>
        </div>
      </div>

      {/* Auth Modal for Mobile */}
      <AnimatePresence>
        {mobileMenuOpen && !user && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.4 }}
              className="w-full max-w-sm bg-[#0B0B0C] border border-white/[0.08] rounded-2xl p-6 shadow-xl shadow-black/30 relative"
            >
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2"
              >
                {t('landing.close')}
              </button>
              <h3 className="text-xl font-semibold mb-6">{t('landing.start_exp')}</h3>
              <div className="flex flex-col gap-3">
                <Link to="/login" className="w-full text-center text-sm font-semibold bg-white/5 border border-white/[0.08] hover:bg-white/10 text-white py-3.5 rounded-full transition-all duration-300 ease-out">{t('landing.login_acct')}</Link>
                <Link to="/register" className="w-full text-center text-sm font-semibold bg-white text-black py-3.5 rounded-full shadow-lg transition-all duration-300 ease-out">{t('landing.register_acct')}</Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 w-full flex flex-col items-center">
        
        {/* SCENE 1 - HERO */}
        <section 
          id="hero"
          className="relative min-h-[100svh] w-full flex flex-col items-center justify-center px-6 pt-28 md:pt-32 pb-16 overflow-hidden"
        >
          {/* Majestic High-Quality Cover Background SVG Artwork */}
          <div className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden bg-[#070708]">
            
            {/* Ambient Base Darkness and Slate Layered Linear Gradients */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#070708] via-[#0D0F14] to-[#070708]" />

            {/* Immersive High-Quality Misty Forest High Angle Background Asset */}
            <img 
              src={highAngleForestFog} 
              alt="Majestic Wilderness High Angle Forest Background" 
              className="absolute inset-0 w-full h-full object-cover opacity-[0.62] pointer-events-none select-none filter brightness-[0.75] contrast-[1.1]"
              referrerPolicy="no-referrer"
            />

            {/* Glowing Sunset/Sunrise Horizon Sun-glow (Radial Gradients for Depth) */}
            <div className="absolute bottom-[20%] md:bottom-[25%] left-1/2 -translate-x-1/2 w-[160%] sm:w-[120%] lg:w-[100%] aspect-square rounded-full bg-[radial-gradient(circle_at_center,rgba(230,126,34,0.12)_0%,rgba(180,83,9,0.03)_50%,transparent_100%)] blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-[120%] sm:w-[80%] aspect-video rounded-full bg-[radial-gradient(ellipse_at_center,rgba(251,146,60,0.06)_0%,transparent_70%)] blur-[90px] pointer-events-none" />
            <div className="absolute top-[10%] right-[10%] w-[350px] h-[350px] rounded-full bg-gradient-to-br from-[#E67E22]/10 to-transparent blur-[140px] pointer-events-none" />

            {/* Dynamic Interactive Ambient Floating Sparks/Embers */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(12)].map((_, i) => {
                const size = [3, 5, 6, 4, 7][i % 5];
                const left = [10, 24, 38, 52, 68, 82, 94, 18, 33, 61, 77, 89][i % 12];
                const duration = [16, 20, 24, 18, 26, 28][i % 6];
                const delay = i * 1.2;
                return (
                  <motion.div
                    key={i}
                    className="absolute rounded-full bg-[radial-gradient(circle_at_center,rgba(230,126,34,0.45)_0%,rgba(230,126,34,0.05)_70%,transparent_100%)] filter blur-[1px]"
                    style={{
                      width: size * 3,
                      height: size * 3,
                      left: `${left}%`,
                      bottom: `${15 + (i * 5)}%`,
                      opacity: 0.12 + (i % 3) * 0.08,
                    }}
                    animate={{
                      y: [-40, -420],
                      x: [0, Math.sin(i) * 35, Math.cos(i) * -25, 0],
                      opacity: [0, 0.45, 0.6, 0.2, 0],
                      scale: [0.8, 1.25, 1, 0.85, 0.6],
                    }}
                    transition={{
                      duration: duration,
                      repeat: Infinity,
                      delay: delay,
                      ease: "easeInOut",
                    }}
                  />
                );
              })}
            </div>

            {/* Dense Bottom Fade Out overlay ensuring seamless continuation with the following component */}
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#070708] via-[#070708]/92 to-transparent pointer-events-none" />
            
            {/* Subtle high-contrast soft spotlight overhead */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[40svh] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.015)_0%,transparent_75%)] pointer-events-none" />

            {/* Subtle micro grain noise texture overlay */}
            <div 
              className="absolute inset-0 opacity-[0.012] pointer-events-none mix-blend-overlay"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
              }}
            />
          </div>
          
          <div ref={heroRef} className="max-w-4xl mx-auto z-10 flex flex-col items-center text-center px-8 sm:px-12 md:px-16 mt-4 md:mt-0">
            <h1 className="text-[44px] sm:text-[60px] md:text-[76px] lg:text-[84px] leading-[1.08] font-semibold tracking-[-0.03em] text-white mb-8" style={{ opacity: 0 }} ref={title1Ref as any}>
              {t('landing.hero_title').split(' ').slice(0, 5).join(' ')} <br className="hidden md:block"/>
              <span className="text-white/60" ref={title2Ref as any}>{t('landing.hero_title').split(' ').slice(5).join(' ')}</span>
            </h1>
            
            <p 
              ref={pRef}
              style={{ opacity: 0 }}
              className="text-[16px] md:text-[20px] text-zinc-400 max-w-[640px] mb-10 font-light leading-[1.6]"
            >
              {t('landing.hero_subtitle')}
            </p>
          </div>

          <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 2, delay: 1.5 }}
             className="absolute bottom-12 flex flex-col items-center gap-4 text-white/30"
          >
             <motion.div 
               animate={{ y: [0, 8, 0] }}
               transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
               className="w-[1px] h-[40px] bg-gradient-to-b from-white/30 to-transparent" 
              />
          </motion.div>
        </section>

        {/* SCENE 2 - STORY */}
        <section id="story" className="py-[120px] md:py-[160px] bg-[#070708] w-full relative z-10">
          <div className="max-w-5xl mx-auto px-8 sm:px-12 md:px-16 flex flex-col md:flex-row items-center gap-12 lg:gap-20">
             <div className="flex-1 flex flex-col gap-6">
               <RevealText yOffset={60}>
                 <span className="text-xs font-mono text-[#E67E22] tracking-widest uppercase">{t('landing.philosophy_badge')}</span>
                 <h2 className="text-[32px] md:text-[44px] lg:text-[48px] font-extrabold tracking-tight leading-[1.15] mb-2 mt-1">
                   {t('landing.philosophy_title_1')} <br className="hidden md:block" /> <span className="text-white font-black">{t('landing.philosophy_title_2')}</span>
                 </h2>
               </RevealText>
               <RevealText delay={0.2} yOffset={40}>
                 <p className="text-[16px] md:text-[18px] text-zinc-400 leading-[1.7] font-light max-w-[480px]">
                   {t('landing.philosophy_desc1')}
                 </p>
               </RevealText>
               <RevealText delay={0.3} yOffset={40}>
                 <p className="text-[16px] md:text-[18px] text-zinc-400 leading-[1.7] font-light max-w-[480px]">
                   {t('landing.philosophy_desc2')}
                 </p>
               </RevealText>
             </div>
             
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
               whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
               viewport={{ once: true, margin: "-100px" }}
               transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
               className="flex-1 w-full aspect-square md:aspect-[4/5] liquid-glass-card rounded-2xl overflow-hidden relative border border-white/5 shadow-xl shadow-black/30 liquid-glass-card"
             >
                <motion.img 
                  src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop"
                  alt="Nature mountains trekking preparation safety standard"
                  className="absolute inset-0 w-full h-full object-cover opacity-50 pointer-events-none scale-100"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  referrerPolicy="no-referrer"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-[#070708]/80 via-transparent to-transparent opacity-80" />
                
                {/* Floating Glassmorphic Status Indicator Card overlay */}
                <div className="absolute bottom-8 right-8 left-8 p-6 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/5 flex items-center gap-4 z-10 shadow-xl shadow-black/30 liquid-glass-card">
                  <div className="w-10 h-10 rounded-full bg-[#E67E22]/20 flex items-center justify-center text-[#E67E22]">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <div className="text-white text-xs font-mono uppercase tracking-wider font-semibold">{t('landing.lab_standard_badge')}</div>
                    <div className="text-zinc-400 text-xs">{t('landing.lab_standard_desc')}</div>
                  </div>
                </div>
             </motion.div>
          </div>
        </section>

        {/* SCENE 3 - EQUIPMENT */}
        <section id="equipment" className="py-[120px] md:py-[160px] w-full bg-[#070708] overflow-hidden relative z-10">
          <div className="max-w-5xl mx-auto px-8 sm:px-12 md:px-16 w-full">
            <RevealText yOffset={50}>
              <div className="flex flex-col items-center">
                <span className="text-xs font-mono text-[#E67E22] tracking-widest uppercase mb-2">{t('landing.exploration_badge')}</span>
                <h2 className="text-[32px] md:text-[44px] lg:text-[48px] font-extrabold tracking-tight mb-6 text-center text-white">{t('landing.exploration_title')}</h2>
              </div>
            </RevealText>
            <RevealText delay={0.1}>
              <p className="text-[16px] md:text-[18px] text-zinc-400 text-center max-w-[580px] mx-auto mb-[60px] font-light leading-[1.6]">
                {t('landing.exploration_desc')}
              </p>
            </RevealText>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
               {[
                 { 
                   title: t('landing.exploration_item_1_title'), 
                   desc: t('landing.exploration_item_1_desc'), 
                   img: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=600&auto=format&fit=crop"
                 },
                 { 
                   title: t('landing.exploration_item_2_title'), 
                   desc: t('landing.exploration_item_2_desc'), 
                   img: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?q=80&w=600&auto=format&fit=crop"
                 },
                 { 
                   title: t('landing.exploration_item_3_title'), 
                   desc: t('landing.exploration_item_3_desc'), 
                   img: "https://images.unsplash.com/photo-1526253038957-bce54e05968e?q=80&w=600&auto=format&fit=crop"
                 },
                 { 
                   title: t('landing.exploration_item_4_title'), 
                   desc: t('landing.exploration_item_4_desc'), 
                   img: "https://images.unsplash.com/photo-1517824806704-9040b037703b?q=80&w=600&auto=format&fit=crop"
                 },
                 { 
                   title: t('landing.exploration_item_5_title'), 
                   desc: t('landing.exploration_item_5_desc'), 
                   img: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=600&auto=format&fit=crop"
                 },
                 { 
                   title: t('landing.exploration_item_6_title'), 
                   desc: t('landing.exploration_item_6_desc'), 
                   img: "https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?q=80&w=600&auto=format&fit=crop"
                 }
               ].map((item, i) => (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0, y: 60, scale: 0.95 }}
                   whileInView={{ opacity: 1, y: 0, scale: 1 }}
                   viewport={{ once: true, margin: "-50px" }}
                   transition={{ duration: 1.2, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                   whileHover={{ y: -8, scale: 1.02 }}
                   className="rounded-[40px] h-[520px] flex flex-col justify-end group transition-all duration-300 ease-out border border-white/5 relative overflow-hidden shadow-xl shadow-black/30"
                 >
                    {/* High Quality Gear Aspect Image */}
                    <img 
                      src={item.img} 
                      alt={item.title} 
                      className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-65 group- transition-all duration-300 ease-out duration-700 pointer-events-none"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col p-10 pb-8">
                      <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center mb-6 bg-black/40 backdrop-blur-md group-hover:bg-white group-hover:text-black transition-all duration-300 ease-out duration-500 ease-out">
                        <ArrowRight size={20} className="transform group-hover:rotate-[-45deg] transition-transform duration-500" />
                      </div>
                      <h3 className="text-[26px] font-semibold text-white mb-3 tracking-tight">{item.title}</h3>
                      <p className="text-[14px] text-zinc-400 font-light leading-[1.6]">{item.desc}</p>
                    </div>
                 </motion.div>
               ))}
            </div>
          </div>
        </section>

        {/* SCENE 4 - BOOKING JOURNEY */}
        <section id="journey" className="py-[120px] md:py-[160px] bg-[#070708] w-full relative z-10">
          <div className="max-w-5xl mx-auto px-8 sm:px-12 md:px-16">
            <RevealText yOffset={50}>
               <div className="flex flex-col items-start mb-16">
                 <span className="text-xs font-mono text-[#E67E22] tracking-widest uppercase">{t('landing.journey_badge')}</span>
                 <h2 className="text-[32px] md:text-[44px] lg:text-[48px] font-extrabold tracking-tight mt-1 leading-[1.15] text-white">{t('landing.journey_title')}</h2>
               </div>
            </RevealText>
            
            {/* Interactive Journey Step Playground */}
            <InteractiveJourney />
          </div>
        </section>

        {/* SCENE 5 & 6 - SYSTEM REVEAL / OPERATIONAL EXCELLENCE */}
        <section id="system" className="py-[120px] md:py-[160px] bg-[#070708] w-full overflow-hidden relative z-10">
          {/* Immersive Dark Misty Landscape Background image for Majestik Dashboard system section from Bruxelles Forêt de Soignes */}
          <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
            <img 
              src={verticalForestSoignes} 
              alt="Misty Forêt de Soignes Backdrop for Majestik Dashboard" 
              className="absolute inset-0 w-full h-full object-cover opacity-[0.42] filter brightness-[0.7] contrast-[1.25] select-none pointer-events-none"
              referrerPolicy="no-referrer"
            />
            {/* Blends smoothly with sections before and after */}
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#070708] via-[#070708]/80 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#070708] via-[#070708]/80 to-transparent pointer-events-none" />
            {/* Soft Ambient Radial Lights */}
            <div className="absolute top-[20%] left-[10%] w-[450px] h-[450px] rounded-full bg-[#E67E22]/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[30%] right-[10%] w-[500px] h-[500px] rounded-full bg-[#E67E22]/5 blur-[150px] pointer-events-none" />
          </div>

          <div className="max-w-5xl mx-auto px-8 sm:px-12 md:px-16 w-full relative z-10">
            {/* Title and first description next to each other on desktop/tablet, stacked on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 lg:gap-16 items-start">
              
              {/* Left Column (Desktop/Tablet): Badge & Title */}
              <div className="md:col-span-5 w-full flex flex-col gap-4">
                 <RevealText yOffset={40}>
                   <span className="text-xs font-mono text-[#E67E22] tracking-widest uppercase">{t('landing.system_badge')}</span>
                   <h2 className="text-[28px] sm:text-[32px] md:text-[38px] lg:text-[44px] font-extrabold tracking-tight mt-1 leading-[1.15] text-white">
                     {t('landing.system_title')}
                   </h2>
                 </RevealText>
              </div>

              {/* Right Column (Desktop/Tablet): Description 1 next to the title */}
              <div className="md:col-span-7 w-full flex flex-col gap-6">
                 <RevealText delay={0.1} yOffset={40}>
                   <p className="text-[15px] sm:text-[16px] md:text-[17px] lg:text-[18px] text-zinc-300 font-light leading-[1.7]">
                     {t('landing.system_desc1')}
                   </p>
                 </RevealText>
                 <RevealText delay={0.2} yOffset={40}>
                   <p className="text-[15px] sm:text-[16px] md:text-[17px] lg:text-[18px] text-zinc-400 font-light leading-[1.7]">
                     {t('landing.system_desc2')}
                   </p>
                 </RevealText>
              </div>

            </div>
          </div>
        </section>

        {/* SCENE 6.5 - FAQ ACCORDION */}
        <section id="faq" className="py-[120px] md:py-[160px] bg-[#070708] w-full relative z-10">
          <div className="max-w-4xl mx-auto px-8 sm:px-12 md:px-16 w-full">
            <RevealText yOffset={50}>
              <div className="flex flex-col items-center mb-16 text-center">
                <span className="text-xs font-mono text-[#E67E22] tracking-widest uppercase mb-2">{t('landing.faq_badge')}</span>
                <h2 className="text-[32px] md:text-[44px] lg:text-[48px] font-extrabold tracking-tight mb-4 text-white">{t('landing.faq_title')}</h2>
                <p className="text-[16px] md:text-[18px] text-zinc-400 max-w-[580px] font-light leading-[1.6]">
                  {t('landing.faq_desc')}
                </p>
              </div>
            </RevealText>

            <div className="flex flex-col gap-4 max-w-3xl mx-auto">
              {faqItems.map((item, index) => {
                const isOpen = openFAQIndex === index;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="rounded-3xl border border-white/5 bg-[#121214]/40 hover:bg-[#121214]/60 overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => setOpenFAQIndex(isOpen ? null : index)}
                      className="w-full text-left p-6 md:p-8 flex items-center justify-between gap-6 cursor-pointer"
                    >
                      <span className="text-base md:text-lg font-medium text-white hover:text-[#E67E22] transition-colors font-sans">
                        {item.question}
                      </span>
                      <div className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center bg-black/40 text-zinc-400 shrink-0 transform transition-all duration-300 ${isOpen ? 'rotate-180 text-[#E67E22] border-[#E67E22]/30' : ''}`}>
                        <ArrowRight size={16} className="-rotate-90" />
                      </div>
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 md:px-8 pb-6 md:pb-8 text-sm md:text-base text-zinc-400 font-light leading-[1.7] border-t border-white/[0.03] pt-4 font-sans">
                            {item.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {/* Call Center Block */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-16 p-8 md:p-10 rounded-3xl border border-[#E67E22]/20 bg-gradient-to-r from-[#121214]/60 to-[#18181A]/60 max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#E67E22]/10 flex items-center justify-center text-[#E67E22] shrink-0 mt-1">
                  <Phone size={22} />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-white mb-1">{t('landing.help_title')}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed font-light">
                    {t('landing.help_desc')}
                  </p>
                  <div className="mt-2 text-xs text-zinc-500 flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mt-1" />
                    <div className="flex flex-col">
                      {t('landing.help_hours').split(': ').length > 1 ? (
                        <>
                          <span className="font-semibold text-zinc-300">{t('landing.help_hours').split(': ')[0]}:</span>
                          <span>{t('landing.help_hours').split(': ')[1]}</span>
                        </>
                      ) : (
                        <span>{t('landing.help_hours')}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0 justify-center">
                <a
                  href="tel:+6285236826505"
                  className="flex items-center justify-center gap-2 border border-white/10 hover:border-white/25 text-xs font-semibold uppercase tracking-widest text-zinc-300 hover:text-white px-5 py-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] transition-all cursor-pointer text-center"
                >
                  <Phone size={14} /> {t('landing.btn_phone')}
                </a>
                <a
                  href="https://wa.me/6285236826505"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#E67E22] hover:bg-[#D35400] text-xs font-bold uppercase tracking-widest text-white px-5 py-3 rounded-2xl transition-all shadow-[0_4px_12px_rgba(230,126,34,0.3)] hover:shadow-[0_6px_20px_rgba(230,126,34,0.4)] cursor-pointer text-center"
                >
                  <MessageSquare size={14} /> {t('landing.btn_chat')}
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SCENE 7 - DEMO CTA */}
        <section id="demo-cta" className="py-[120px] md:py-[160px] bg-[#070708] w-full text-center relative overflow-hidden z-10">
           <div className="absolute inset-0 flex items-center justify-center opacity-[0.12] pointer-events-none blur-[120px]">
              <div className="w-[600px] h-[400px] bg-[#E67E22] rounded-full" />
           </div>

           <div className="max-w-5xl mx-auto px-8 sm:px-12 md:px-16 relative z-10">
              <RevealText yOffset={60}>
                <span className="text-xs font-mono text-[#E67E22] tracking-widest uppercase">{t('landing.demo_badge')}</span>
                <h2 className="text-[40px] md:text-[64px] lg:text-[76px] font-extrabold tracking-tight mb-6 mt-1 leading-none text-white">{t('landing.demo_title')}</h2>
              </RevealText>
              <RevealText delay={0.1} yOffset={40}>
                <p className="text-[16px] md:text-[18px] text-zinc-400 max-w-[540px] mx-auto font-light leading-[1.6] mb-10">
                  {t('landing.demo_desc')}
                </p>
              </RevealText>
              
              {/* Premium Role Selective Link Cards with rich Unsplash background imagery */}
              <RevealText delay={0.2} yOffset={40}>
                <div className="flex flex-col sm:flex-row justify-center gap-6 w-full max-w-3xl mx-auto mt-6">
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -6 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDemoLogin('customer')}
                    className="flex-1 min-h-[300px] rounded-[40px] transition-all duration-300 ease-out cursor-pointer group border border-white/5 hover:border-white/5 relative overflow-hidden shadow-xl shadow-black/30 text-left flex flex-col justify-end p-6 lg:p-8 sm:p-10"
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=800&auto=format&fit=crop"
                      alt="Enchanting hikers path through green forest canopy"
                      className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:opacity-50 transition-all duration-300 ease-out pointer-events-none"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
                    
                    <div className="relative z-10 space-y-2">
                      <span className="text-[10px] font-mono tracking-widest text-[#E67E22] font-semibold uppercase">{t('landing.demo_cust_badge')}</span>
                      <h3 className="text-2xl sm:text-3xl font-semibold text-white group-hover:text-[#E67E22] transition-colors leading-tight">{t('landing.demo_cust_title')}</h3>
                      <p className="text-sm text-zinc-400 font-light">{t('landing.demo_cust_desc')}</p>
                    </div>
                  </motion.button>
                  
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -6 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDemoLogin('admin')}
                    className="flex-1 min-h-[300px] rounded-[40px] transition-all duration-300 ease-out cursor-pointer group border border-white/5 hover:border-white/5 relative overflow-hidden shadow-xl shadow-black/30 text-left flex flex-col justify-end p-6 lg:p-8 sm:p-10"
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1517824806704-9040b037703b?q=80&w=800&auto=format&fit=crop"
                      alt="Cosmic sky aurora mountain campsite hub"
                      className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:opacity-50 transition-all duration-300 ease-out pointer-events-none"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
                    
                    <div className="relative z-10 space-y-2">
                      <span className="text-[10px] font-mono tracking-widest text-[#E67E22] font-semibold uppercase">{t('landing.demo_admin_badge')}</span>
                      <h3 className="text-2xl sm:text-3xl font-semibold text-white group-hover:text-[#E67E22] transition-colors leading-tight">{t('landing.demo_admin_title')}</h3>
                      <p className="text-sm text-zinc-400 font-light">{t('landing.demo_admin_desc')}</p>
                    </div>
                  </motion.button>
                </div>
              </RevealText>
           </div>
         </section>

       </main>

       <footer className="w-full bg-[#070708] pt-16 pb-32 md:pb-12 relative z-10 mt-auto">
          <div className="max-w-5xl mx-auto px-8 sm:px-12 md:px-16 flex flex-col items-center text-center">
             <h2 className="text-2xl font-semibold tracking-tight mb-8 text-white">OUTRENT.</h2>
             <div className="flex flex-wrap justify-center gap-6 sm:gap-12 mb-10 text-center">
                <Link to="/about" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">{t('landing.about_us')}</Link>
                <Link to="/terms" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">{t('landing.terms_conditions')}</Link>
             </div>
             <div className="text-[11px] sm:text-xs text-zinc-500 font-light tracking-wide uppercase text-center px-4">
                &copy; 2026 OUTRENT Digital Platform.<br className="block sm:hidden" /> <span className="hidden sm:inline"></span>{t('landing.rights')}
             </div>
          </div>
       </footer>
    </div>
  );
}



