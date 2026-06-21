import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";

export default function AboutPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col bg-[#070708] text-white font-sans selection:bg-[#E67E22] selection:text-white">
      <Navbar />
      <main className="flex-1 max-w-[900px] w-full mx-auto px-6 py-[120px] md:py-[160px] flex flex-col items-center text-center gap-[64px]">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-6 flex flex-col items-center"
        >
          <span className="text-[#E67E22] text-sm font-semibold tracking-widest uppercase">{t("about.badge")}</span>
          <h1 className="text-[48px] md:text-[72px] font-semibold tracking-tight text-white m-0 leading-[1.1]">
            {t("about.title")} <br/> {t("about.subtitle")}
          </h1>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="space-y-8 text-zinc-400 font-light text-[18px] md:text-[22px] leading-[1.8] max-w-[800px]"
        >
          <p>
            {t("about.p1")}
          </p>
          <p>
            {t("about.p2")}
          </p>
          <p>
            {t("about.p3")}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="grid md:grid-cols-2 gap-[32px] mt-[48px] w-full text-left"
        >
          <div className="liquid-glass-card p-[40px] rounded-[32px] hover:shadow-xl shadow-black/30 hover:border-[#E67E22]/30 transition-all duration-300 ease-out duration-300">
            <h3 className="font-semibold text-[24px] mb-4 text-white tracking-tight">{t("about.vision_title")}</h3>
            <p className="text-zinc-400 font-light text-[16px] md:text-[18px] leading-[1.7]">
              {t("about.vision_desc")}
            </p>
          </div>
          <div className="liquid-glass-card p-[40px] rounded-[32px] hover:shadow-xl shadow-black/30 hover:border-[#E67E22]/30 transition-all duration-300 ease-out duration-300">
            <h3 className="font-semibold text-[24px] mb-4 text-white tracking-tight">{t("about.mission_title")}</h3>
            <p className="text-zinc-400 font-light text-[16px] md:text-[18px] leading-[1.7]">
              {t("about.mission_desc")}
            </p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="flex justify-center pt-12"
        >
          <button 
            onClick={() => navigate(-1)} 
            className="inline-flex items-center gap-3 text-sm font-semibold bg-white/5 hover:bg-white/10 hover:text-[#E67E22] text-white px-8 py-4 rounded-full transition-all duration-300 ease-out duration-300 border border-white/5 cursor-pointer shadow-lg hover:shadow-[#E67E22]/20 hover:scale-[1.02]"
          >
            <ArrowLeft size={18} /> {t("about.back_btn")}
          </button>
        </motion.div>
      </main>
      
      <footer className="bg-[#121212] pt-[80px] pb-[40px] px-6 mt-auto">
         <div className="max-w-[1440px] mx-auto flex flex-col items-center text-center">
            <h2 className="text-[24px] font-semibold tracking-tight mb-[40px]">OUTRENT.</h2>
            <div className="text-[12px] text-zinc-400/60 font-light tracking-wide uppercase text-center px-4">
               {t("about.footer_rights")}
            </div>
         </div>
      </footer>
    </div>
  );
}
