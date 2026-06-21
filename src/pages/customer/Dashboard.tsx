import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { Link } from "react-router-dom";
import { useStore } from "../../store";
import { toast } from "react-toastify";
import { ShieldAlert, CheckCircle2, Clock, ShoppingBag, ClipboardList, RefreshCw, ArrowRight, Phone, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function CustomerDashboard() {
  const { user, token, setAuth } = useStore();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string>("");
  const { t } = useTranslation();

  const refreshUser = async (isSilent = false) => {
    if (!isSilent) setSyncing(true);
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: "Bearer " + token }
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.user) {
        setAuth(data.user, token);
      }
      setLastSync(new Date().toLocaleTimeString("id-ID"));
    } catch {
      // silent
    } finally {
      if (!isSilent) setSyncing(false);
    }
  };

  useEffect(() => {
    refreshUser();
    const intervalId = setInterval(() => {
      refreshUser(true);
    }, 60000);
    return () => clearInterval(intervalId);
  }, [token, setAuth]);

  const handleUploadId = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("identityType", "KTP");

    try {
      const res = await fetch("/api/upload/identity", {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Dokumen berhasil diunggah.");
      await refreshUser();
    } catch (err: any) {
      toast.error(err.message || "Gagal upload dokumen.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-white font-sans selection:bg-[#E67E22]/30 antialiased">
      <Navbar />
      
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-12 lg:py-16 flex flex-col gap-10">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight">
                {t('customer_dashboard.title')}
              </h1>
              <button 
                onClick={() => refreshUser(false)}
                disabled={syncing}
                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all duration-300 ease-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/20"
                title="Sinkronisasi Data"
              >
                <RefreshCw size={14} className={syncing ? "animate-spin text-white" : ""} />
              </button>
            </div>
            <p className="text-sm text-zinc-400 font-normal">
              {t('customer_dashboard.subtitle')} {user?.name}. 
              {lastSync && <span className="ml-2 px-2 py-0.5 rounded-md border border-white/10 text-[10px] uppercase font-mono tracking-wider bg-white/5 text-zinc-300">Sync: {lastSync}</span>}
            </p>
          </div>
          
          <div className="flex gap-3 flex-wrap">
            {user?.isDemo && (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-500">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[11px] font-medium uppercase tracking-wider">{t('customer_dashboard.simulation')}</span>
              </div>
            )}
            {user?.isVerified ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full card-uniform text-white">
                <CheckCircle2 size={16} className="text-[#E67E22]"/>
                <span className="text-[11px] font-medium uppercase tracking-wider">{t('customer_dashboard.id_valid')}</span>
              </div>
            ) : user?.identityUrl ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full card-uniform text-zinc-400">
                <Clock size={16} />
                <span className="text-[11px] font-medium uppercase tracking-wider">{t('customer_dashboard.id_pending')}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full card-uniform border-red-500/20 text-red-400">
                <ShieldAlert size={16} />
                <span className="text-[11px] font-medium uppercase tracking-wider">{t('customer_dashboard.id_empty')}</span>
              </div>
            )}
          </div>
        </header>

        {/* Verification Alert */}
        {!user?.isDemo && !user?.isVerified && (
          <section className="card-uniform p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-[600px]">
              <h2 className="text-xl font-semibold text-white mb-2 tracking-tight">{t('customer_dashboard.auth_required')}</h2>
              <p className="text-sm text-zinc-400 font-normal leading-relaxed">
                {t('customer_dashboard.auth_desc')}
              </p>
            </div>
            
            {user?.identityUrl ? (
              <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-[#E67E22]">
                <Clock size={18} />
                <span className="text-sm font-medium">{t('customer_dashboard.in_review')}</span>
              </div>
            ) : (
              <form onSubmit={handleUploadId} className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />
                  <div className="flex items-center justify-center px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white transition-all cursor-pointer w-full min-w-[200px] active:scale-[0.98]">
                    {file ? file.name : t('customer_dashboard.select_file')}
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={uploading || !file}
                  className="px-6 py-3 bg-white text-black hover:bg-zinc-200 font-semibold rounded-xl text-sm transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm active:scale-[0.98]"
                >
                  {uploading ? t('customer_dashboard.uploading') : t('customer_dashboard.upload')}
                </button>
              </form>
            )}
          </section>
        )}

        {/* Action Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Catalog Action */}
          <Link 
            to="/customer/catalog"
            className="group flex flex-col card-uniform p-6 md:p-8 lg:p-10 cursor-pointer overflow-hidden relative"
          >
             <div className="absolute top-0 right-0 p-8 -mr-6 -mt-6 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
               <ShoppingBag size={120} strokeWidth={1} />
             </div>
             
             <div className="relative z-10">
               <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:bg-white group-hover:text-black transition-all duration-300 shadow-sm">
                  <ShoppingBag size={24} className="text-zinc-400 group-hover:text-black transition-colors" />
               </div>
               <h3 className="text-2xl font-semibold mb-3 tracking-tight">{t('customer_dashboard.explore_title')}</h3>
               <p className="text-sm text-zinc-400 font-normal leading-relaxed mb-12">
                  {t('customer_dashboard.explore_desc')}
               </p>
               <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-white group-hover:text-black transition-colors bg-white/5 group-hover:bg-white w-fit px-4 py-2 rounded-full border border-white/10 group-hover:border-transparent">
                  {t('customer_dashboard.explore_btn')} <ArrowRight size={16} />
               </div>
             </div>
          </Link>
          
          {/* Bookings Action */}
          <Link 
            to="/customer/bookings"
            className="group flex flex-col card-uniform p-6 md:p-8 lg:p-10 cursor-pointer overflow-hidden relative"
          >
             <div className="absolute top-0 right-0 p-8 -mr-6 -mt-6 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
               <ClipboardList size={120} strokeWidth={1} />
             </div>

             <div className="relative z-10">
               <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:bg-white group-hover:text-black transition-all duration-300 shadow-sm">
                  <ClipboardList size={24} className="text-zinc-400 group-hover:text-black transition-colors" />
               </div>
               <h3 className="text-2xl font-semibold mb-3 tracking-tight">{t('customer_dashboard.tx_title')}</h3>
               <p className="text-sm text-zinc-400 font-normal leading-relaxed mb-12">
                  {t('customer_dashboard.tx_desc')}
               </p>
               <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-white group-hover:text-black transition-colors bg-white/5 group-hover:bg-white w-fit px-4 py-2 rounded-full border border-white/10 group-hover:border-transparent">
                  {t('customer_dashboard.tx_btn')} <ArrowRight size={16} />
               </div>
             </div>
          </Link>
        </section>

        {/* Call Center Section */}
        <section className="card-uniform p-6 md:p-8 lg:p-10 flex flex-col md:flex-row items-center justify-between gap-8 mt-4 border border-[#E67E22]/10 bg-gradient-to-r from-white/[0.01] to-[#E67E22]/[0.02]">
          <div className="flex items-start gap-4 text-left w-full md:max-w-xl">
            <div className="w-12 h-12 rounded-2xl bg-[#E67E22]/10 flex items-center justify-center text-[#E67E22] shrink-0 mt-1">
              <Phone size={22} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Layanan Call Center Pelanggan</h3>
              <p className="text-sm text-zinc-400 leading-relaxed font-light">
                Ada pertanyaan mengenai jadwal pendakian, penyesuaian pesanan, atau perpanjangan sewa di luar pertanyaan umum FAQ? Hubungi kami langsung melalui WhatsApp atau Saluran Telepon.
              </p>
              <div className="mt-2 text-xs text-zinc-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>Call Center: 0852-3682-6505 (Aktif 08.00 - 22.00 WIB)</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0 justify-center">
            <a
              href="tel:+6285236826505"
              className="flex items-center justify-center gap-2 border border-white/10 hover:border-white/25 text-xs font-semibold uppercase tracking-widest text-[#E67E22] hover:text-white px-5 py-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] transition-all cursor-pointer text-center"
            >
              <Phone size={14} /> Telepon
            </a>
            <a
              href="https://wa.me/6285236826505"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#E67E22] hover:bg-[#D35400] text-xs font-bold uppercase tracking-widest text-white px-6 py-3.5 rounded-xl transition-all shadow-[0_4px_12px_rgba(230,126,34,0.3)] hover:shadow-[0_6px_20px_rgba(230,126,34,0.4)] cursor-pointer text-center"
            >
              <MessageSquare size={14} /> Chat WA
            </a>
          </div>
        </section>

      </main>
    </div>
  );
}


