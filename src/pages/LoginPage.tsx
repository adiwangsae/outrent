import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../store";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "motion/react";
import { Server, User, ArrowRight, Shield, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

type LoginTab = "customer" | "admin" | "demo";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<LoginTab>("customer");
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

  const handlePreFill = (emailVal: string, passVal: string) => {
    setEmail(emailVal);
    setPassword(passVal);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      
      let data: any;
      try {
        data = await res.json();
      } catch (jsonErr) {
        throw new Error("Server respon tidak valid.");
      }
      
      if (!res.ok) throw new Error(data.error || "Gagal masuk");
      
      setAuth(data.user, data.token);
      toast.success("Otentikasi Berhasil");
      
      const userRoleLower = data.user.role.toLowerCase();
      if (userRoleLower === 'admin' || userRoleLower === 'super_admin' || userRoleLower === 'demo_admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal login");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'admin' | 'customer') => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role })
      });
      
      let data: any;
      try {
        data = await res.json();
      } catch (jsonErr) {
        throw new Error("Server respon tidak valid.");
      }
      
      if (!res.ok) throw new Error(data.error || "Gagal masuk");
      
      setAuth(data.user, data.token);
      toast.success(`Otentikasi Demo ${role === 'admin' ? 'Admin' : 'Pelanggan'} Berhasil`);
      
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal masuk Demo Mode");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex text-white bg-gradient-to-br from-[#070708] via-[#0D1016] to-[#08090C] font-sans selection:bg-[#E67E22] selection:text-white">
      {/* Visual Identity Section */}
      <div className="hidden lg:flex flex-1 relative flex-col justify-between p-12 xl:p-16 overflow-hidden bg-gradient-to-b from-[#0D1016] to-[#070708] border-r border-white/5">
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
            <h2 className="text-[38px] xl:text-[48px] font-medium leading-[1.1] tracking-[-0.03em] mb-4">
               {t('auth.login_title')} <br/> {t('auth.login_subtitle')}
            </h2>
            <p className="text-[15px] xl:text-[17px] text-zinc-400 font-light leading-[1.5]">
               {t('auth.login_desc')}
            </p>
         </div>

         {/* Abstract background graphics representing structure/mountains */}
         <div className="absolute top-[20%] right-[-20%] w-[800px] h-[800px] rounded-full border-[1px] border-white/5" />
         <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] rounded-full border-[1px] border-white/5" />
         <div className="absolute bottom-[0%] left-[-10%] w-[400px] h-[400px] rounded-full bg-gradient-to-t from-[#E67E22]/5 to-transparent blur-[100px]" />
      </div>

      {/* Auth Panel */}
      <div className="flex-1 h-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-12 relative overflow-y-auto">
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

          <h3 className="text-[24px] sm:text-[28px] font-medium tracking-tight mb-4 text-center lg:text-left">{t('auth.welcome')}</h3>

          {/* Simple Clean Tabs */}
          <div className="flex justify-center lg:justify-start gap-4 border-b border-white/5 mb-5 pb-0.5">
             <button 
               onClick={() => setActiveTab("customer")}
               className={`pb-2 text-[13px] sm:text-[14px] font-medium transition-colors cursor-pointer ${activeTab === 'customer' ? 'text-white border-b-2 border-white' : 'text-zinc-400 hover:text-white'}`}
             >
               {t('auth.tab_customer')}
             </button>
             <button 
               onClick={() => setActiveTab("admin")}
               className={`pb-2 text-[13px] sm:text-[14px] font-medium transition-colors cursor-pointer ${activeTab === 'admin' ? 'text-white border-b-2 border-white' : 'text-zinc-400 hover:text-white'}`}
             >
               {t('auth.tab_admin')}
             </button>
             <button 
               onClick={() => setActiveTab("demo")}
               className={`pb-2 text-[13px] sm:text-[14px] font-medium transition-colors cursor-pointer ${activeTab === 'demo' ? 'text-[#E67E22] border-b-2 border-[#E67E22]' : 'text-zinc-400 hover:text-[#E67E22]'}`}
             >
               {t('auth.tab_demo')}
             </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab !== "demo" ? (
              <motion.form 
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                onSubmit={handleLogin} 
                className="flex flex-col gap-4"
              >
                 <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                      {t('auth.email')}
                    </label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder={activeTab === "customer" ? t('auth.email_placeholder') : "admin@outrent.com"}
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
                    />
                 </div>

                 {/* Development Helper for Testing */}
                 <div className="flex justify-between items-center bg-white/5 py-2.5 px-4 rounded-xl border border-white/5">
                   <div className="text-[11px] text-zinc-400 font-light">
                     {t('auth.test_account')}
                   </div>
                   <button 
                      type="button"
                      onClick={() => handlePreFill(
                        activeTab === 'customer' ? "pelanggan@outrent.com" : "owner@outrent.com",
                        activeTab === 'customer' ? "pelanggan123" : "owner123"
                      )}
                      className="text-[11px] text-[#E67E22] font-medium hover:text-white transition-colors cursor-pointer"
                   >
                     {t('auth.auto_fill')}
                   </button>
                 </div>

                 <button 
                    type="submit" 
                    disabled={loading}
                    className="mt-1 w-full bg-white hover:bg-white text-black py-2.5 px-4 rounded-xl font-medium text-[15px] transition-all duration-300 ease-out flex items-center justify-center gap-2 cursor-pointer"
                 >
                    {loading ? t('auth.connecting') : t('auth.login_btn')}
                    {!loading && <ArrowRight size={16} />}
                 </button>
              </motion.form>
            ) : (
              <motion.div
                key="demo"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-3.5"
              >
                 <div className="text-[13px] text-zinc-400 font-light leading-[1.5] text-center lg:text-left">
                   {t('auth.demo_desc')}
                 </div>

                 <button
                    onClick={() => handleDemoLogin('customer')}
                    className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-colors group text-left cursor-pointer"
                 >
                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-[#E67E22]/20 transition-colors shrink-0">
                      <User size={20} className="text-zinc-400 group-hover:text-[#E67E22]" />
                    </div>
                    <div>
                       <div className="text-[14px] font-medium text-white mb-0.5">{t('auth.demo_cust')}</div>
                       <div className="text-[12px] text-zinc-400 font-light">{t('auth.demo_cust_desc')}</div>
                    </div>
                 </button>

                 <button
                    onClick={() => handleDemoLogin('admin')}
                    className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-colors group text-left cursor-pointer"
                 >
                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-[#E67E22]/20 transition-colors shrink-0">
                      <Shield size={20} className="text-zinc-400 group-hover:text-[#E67E22]" />
                    </div>
                    <div>
                       <div className="text-[14px] font-medium text-white mb-0.5">{t('auth.demo_admin')}</div>
                       <div className="text-[12px] text-zinc-400 font-light">{t('auth.demo_admin_desc')}</div>
                    </div>
                 </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-5 text-center text-[13px] text-zinc-400/80 font-light border-t border-white/5 pt-4">
             {t('auth.no_account')} <Link to="/register" className="text-white font-medium hover:text-[#E67E22] transition-colors text-shadow-sm">{t('auth.register_link')}</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
