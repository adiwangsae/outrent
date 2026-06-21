import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../store";
import { toast } from "react-toastify";
import { motion } from "motion/react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, token, setAuth } = useStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (user && token) {
      const userRoleLower = user.role.toLowerCase();
      if (userRoleLower === 'admin' || userRoleLower === 'super_admin' || userRoleLower === 'demo_admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/customer/dashboard', { replace: true });
      }
    }
  }, [user, token, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      
      let data: any;
      try {
        data = await res.json();
      } catch (jsonErr) {
        throw new Error("Server mengirimkan respon pendaftaran tidak valid.");
      }
      
      if (!res.ok) throw new Error(data.error || "Gagal mendaftar");
      
      setAuth(data.user, data.token);
      toast.success("Pembuatan Akun Berhasil. Harap lengkapi KTP Anda.");
      navigate('/customer/profile');
    } catch (err: any) {
      toast.error(err.message || "Gagal daftar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-row-reverse text-white bg-gradient-to-br from-[#070708] via-[#0D1016] to-[#08090C] font-sans selection:bg-[#E67E22] selection:text-white">
      {/* Visual Identity Section */}
      <div className="hidden lg:flex flex-1 relative flex-col justify-between p-12 xl:p-16 overflow-hidden bg-gradient-to-b from-[#0D1016] to-[#070708] border-l border-white/5">
         <div className="flex items-center justify-between z-10">
            <Link to="/" className="text-[20px] xl:text-[24px] font-semibold tracking-tight flex items-center gap-2">
               OUTRENT<span className="text-[#E67E22]">.</span>
            </Link>
            <Link to="/" className="text-[13px] font-medium text-zinc-400 hover:text-white transition-all duration-300 ease-out flex items-center gap-2 group bg-white/5 py-1.5 px-3.5 rounded-full border border-white/5 hover:border-white/20">
               <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
               {t('auth.back')}
            </Link>
         </div>
         
         <div className="relative z-10 max-w-[460px]">
           <h2 className="text-[48px] font-medium leading-[1.05] tracking-[-0.03em] mb-6">
             {t('auth.register_title')} <br/> {t('auth.register_subtitle')}
           </h2>
           <p className="text-[18px] text-zinc-400 font-light leading-[1.6]">
             {t('auth.register_desc')}
           </p>
         </div>

         {/* Abstract background graphics representing structure/mountains */}
         <div className="absolute top-[20%] left-[-20%] w-[800px] h-[800px] rounded-full border-[1px] border-white/5" />
         <div className="absolute top-[30%] left-[-10%] w-[600px] h-[600px] rounded-full border-[1px] border-white/5" />
         <div className="absolute bottom-[0%] right-[-10%] w-[400px] h-[400px] rounded-full bg-gradient-to-t from-[#E67E22]/5 to-transparent blur-[100px]" />
      </div>

      {/* Auth Panel */}
      <div className="flex-1 h-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-12 relative overflow-y-auto animate-fade-in border-l border-white/5">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[420px] sm:max-w-[450px] flex flex-col p-6 sm:p-6 lg:p-8 rounded-2xl border border-white/5 shadow-[0_32px_64px_rgba(0,0,0,0.85)] liquid-glass-card my-auto"
        >
          <div className="lg:hidden mb-4 flex flex-col items-center gap-1">
             <Link to="/" className="text-[22px] font-semibold tracking-tight inline-flex items-center gap-2">
                OUTRENT<span className="text-[#E67E22]">.</span>
             </Link>
             <Link to="/" className="text-[12px] font-medium text-zinc-400 hover:text-[#E67E22] transition-colors flex items-center gap-1.5 mt-1 bg-white/5 py-1 px-3 rounded-full border border-white/5">
                <ArrowLeft size={12} /> {t('auth.back_home')}
             </Link>
          </div>

          <h3 className="text-[24px] sm:text-[28px] font-medium tracking-tight mb-4 text-center lg:text-left">{t('auth.register_title')}</h3>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
             <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                  {t('auth.name')}
                </label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={t('auth.name_placeholder')}
                  className="bg-black/40 border border-white/15 py-2.5 px-4 rounded-xl text-[15px] text-white focus:outline-none focus:border-[#E67E22] transition-colors"
                  required
                />
             </div>
             
             <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                  {t('auth.email')}
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t('auth.email_placeholder')}
                  className="bg-black/40 border border-white/15 py-2.5 px-4 rounded-xl text-[15px] text-white focus:outline-none focus:border-[#E67E22] transition-colors"
                  required
                />
             </div>
             
             <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                  {t('auth.password')}
                </label>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-black/40 border border-white/15 py-2.5 px-4 rounded-xl text-[15px] text-white focus:outline-none focus:border-[#E67E22] transition-colors"
                  required
                  minLength={6}
                />
             </div>

             <button 
                type="submit" 
                disabled={loading}
                className="mt-2 w-full bg-white hover:bg-white text-black py-2.5 px-4 rounded-xl font-medium text-[15px] transition-all duration-300 ease-out flex items-center justify-center gap-2 cursor-pointer"
             >
                {loading ? t('auth.connecting') : t('auth.register_btn')}
                {!loading && <ArrowRight size={16} />}
             </button>
          </form>

          <div className="mt-5 text-center text-[13px] text-zinc-400/80 font-light border-t border-[#ffffff]/10 pt-4">
             {t('auth.has_account')} <Link to="/login" className="text-white font-medium hover:text-[#E67E22] transition-colors text-shadow-sm">{t('auth.login_link')}</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
