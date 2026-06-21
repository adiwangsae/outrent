import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useStore } from "../store";
import { Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Lenis from "lenis";
import BottomNav from "../components/BottomNav";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    if ((window as any).lenis) {
      (window as any).lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [pathname]);
  return null;
}

export default function AppLayout() {
  const { user } = useStore();
  const isDemo = user?.email?.startsWith("demo.");
  const location = useLocation();
  const isCustomerRoute = location.pathname.startsWith("/customer");
  const [showDemoBadge, setShowDemoBadge] = useState(true);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isDemo) {
      setShowDemoBadge(true);
      const timer = setTimeout(() => {
        setShowDemoBadge(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isDemo]);

  useEffect(() => {
    const isDashboardOrAuth = 
      location.pathname.startsWith("/admin") || 
      location.pathname.startsWith("/customer") || 
      location.pathname === "/login" || 
      location.pathname === "/register";

    if (isDashboardOrAuth) {
      if ((window as any).lenis) {
        (window as any).lenis.destroy();
        delete (window as any).lenis;
      }
      return;
    }

    if ((window as any).lenis) {
      return;
    }

    const lenis = new Lenis({
      duration: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
    });

    (window as any).lenis = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      delete (window as any).lenis;
    };
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-transparent font-sans selection:bg-[#E67E22]/30 antialiased">
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15, transition: { duration: 0.2 } }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`min-h-screen flex flex-col ${isCustomerRoute ? 'pb-[100px] md:pb-0' : ''}`}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
      
      <BottomNav />
      
      <AnimatePresence>
        {isDemo && showDemoBadge && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10, transition: { duration: 0.3 } }}
            className={`fixed left-4 z-50 flex items-center gap-2 bg-black/50 text-white text-xs px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg backdrop-blur-md select-none ${isCustomerRoute ? 'bottom-24 md:bottom-4' : 'bottom-4'}`}
          >
            <Sparkles size={12} className="text-[#E67E22] animate-pulse" />
            <span className="font-semibold">Demo Mode</span>
            <span className="opacity-40">|</span>
            <span className="text-zinc-300 font-medium text-[10px] md:text-xs">Uji Simulasi Sistem</span>
          </motion.div>
        )}
      </AnimatePresence>

      <ToastContainer 
        position={isMobile ? "top-center" : "bottom-right"} 
        theme="dark" 
        hideProgressBar 
        autoClose={3000}
        closeOnClick={true}
        draggable={true}
        draggablePercent={30}
        toastClassName="!bg-black/60 !backdrop-blur-xl !border !border-white/10 !rounded-2xl !text-sm !font-medium !shadow-2xl !text-white !p-4 cursor-grab active:cursor-grabbing"
      />
    </div>
  );
}

