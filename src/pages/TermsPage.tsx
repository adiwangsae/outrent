import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";

export default function TermsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col bg-[#070708] text-white font-sans selection:bg-[#E67E22] selection:text-white">
      <Navbar />
      <main className="flex-1 max-w-[900px] w-full mx-auto px-6 py-[120px] md:py-[160px] space-y-[64px]">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-4 flex flex-col items-center text-center"
        >
          <span className="text-[#E67E22] text-sm font-semibold tracking-widest uppercase">{t("terms.badge")}</span>
          <h1 className="text-[48px] md:text-[64px] font-semibold tracking-tight text-white leading-tight">{t("terms.title")}</h1>
          <p className="text-zinc-400 text-[18px] font-light max-w-[600px] mt-4">
            {t("terms.subtitle")}
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-[32px]"
        >
          <section className="liquid-glass-card p-[40px] rounded-[32px] space-y-6 hover:border-[#E67E22]/30 transition-all duration-300 ease-out duration-300">
            <div className="flex items-center gap-4">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#E67E22]/10 text-[#E67E22] font-semibold text-lg">1</span>
              <h2 className="text-[22px] font-semibold tracking-tight text-white m-0">{t("terms.sec1_title")}</h2>
            </div>
            <ul className="space-y-4 text-zinc-400 font-light text-[15px] leading-[1.7]">
              <li className="flex gap-3">
                <span className="text-[#E67E22] mt-1">•</span> 
                <span>{t("terms.sec1_bullet1")}</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#E67E22] mt-1">•</span> 
                <span>{t("terms.sec1_bullet2")}</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#E67E22] mt-1">•</span> 
                <span>{t("terms.sec1_bullet3")}</span>
              </li>
            </ul>
          </section>

          <section className="liquid-glass-card p-[40px] rounded-[32px] space-y-6 hover:border-[#E67E22]/30 transition-all duration-300 ease-out duration-300">
            <div className="flex items-center gap-4">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#E67E22]/10 text-[#E67E22] font-semibold text-lg">2</span>
              <h2 className="text-[22px] font-semibold tracking-tight text-white m-0">{t("terms.sec2_title")}</h2>
            </div>
            <ul className="space-y-4 text-zinc-400 font-light text-[15px] leading-[1.7]">
              <li className="flex gap-3">
                <span className="text-[#E67E22] mt-1">•</span> 
                <span>{t("terms.sec2_bullet1")}</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#E67E22] mt-1">•</span> 
                <span>{t("terms.sec2_bullet2")}</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#E67E22] mt-1">•</span> 
                <span>{t("terms.sec2_bullet3")}</span>
              </li>
            </ul>
          </section>

          <section className="liquid-glass-card p-[40px] rounded-[32px] space-y-6 hover:border-[#E67E22]/30 transition-all duration-300 ease-out duration-300">
            <div className="flex items-center gap-4">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#E67E22]/10 text-[#E67E22] font-semibold text-lg">3</span>
              <h2 className="text-[22px] font-semibold tracking-tight text-white m-0">{t("terms.sec3_title")}</h2>
            </div>
            <ul className="space-y-4 text-zinc-400 font-light text-[15px] leading-[1.7]">
              <li className="flex gap-3">
                <span className="text-[#E67E22] mt-1">•</span> 
                <span>{t("terms.sec3_bullet1")}</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#E67E22] mt-1">•</span> 
                <span>{t("terms.sec3_bullet2")}</span>
              </li>
            </ul>
          </section>
          
          <section className="liquid-glass-card p-[40px] rounded-[32px] space-y-6 hover:border-[#E67E22]/30 transition-all duration-300 ease-out duration-300">
            <div className="flex items-center gap-4">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#E67E22]/10 text-[#E67E22] font-semibold text-lg">4</span>
              <h2 className="text-[22px] font-semibold tracking-tight text-white m-0">{t("terms.sec4_title")}</h2>
            </div>
            <ul className="space-y-4 text-zinc-400 font-light text-[15px] leading-[1.7]">
              <li className="flex gap-3">
                <span className="text-[#E67E22] mt-1">•</span> 
                <span>{t("terms.sec4_bullet1")}</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#E67E22] mt-1">•</span> 
                <span>{t("terms.sec4_bullet2")}</span>
              </li>
            </ul>
          </section>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
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
