import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { useStore } from "../../store";
import { toast } from "react-toastify";
import { RefreshCw, ClipboardList, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string>("");
  const { token } = useStore();
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
  const { t } = useTranslation();
  const [cancelPromptId, setCancelPromptId] = useState<string | null>(null);

  const fetchBookings = async (isSilent = false) => {
    if (!isSilent) setSyncing(true);
    try {
      const res = await fetch('/api/bookings/my-bookings', {
        headers: { Authorization: "Bearer " + token }
      });
      if (!res.ok) return;
      const data = await res.json();
      setBookings(data.bookings || []);
      setLastSync(new Date().toLocaleTimeString("id-ID"));
    } catch {
      // silent
    } finally {
      if (!isSilent) setLoading(false);
      if (!isSilent) setSyncing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    const intervalId = setInterval(() => {
      fetchBookings(true);
    }, 60000);
    return () => clearInterval(intervalId);
  }, [token]);

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
        headers: { Authorization: "Bearer " + token }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(t("bookings.cancel_success"));
      setCancelPromptId(null);
      fetchBookings();
    } catch (err: any) {
      toast.error(err.message || t("bookings.cancel_fail"));
    }
  };

  const handleUploadPayment = async (e: React.FormEvent, bookingId: string) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fileInput = form.elements.namedItem('payment_proof') as HTMLInputElement;
    if (!fileInput.files?.[0]) return;

    setUploadingFor(bookingId);
    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    try {
      const res = await fetch("/api/upload/payment/" + bookingId, {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(t("bookings.upload_success"));
      fetchBookings();
    } catch (err: any) {
      toast.error(err.message || t("bookings.upload_fail"));
    } finally {
      setUploadingFor(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-white font-sans selection:bg-[#E67E22] selection:text-white">
      <Navbar />
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-12 md:py-16 flex flex-col gap-8 md:gap-12">
         <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-6 md:pb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-[32px] md:text-[40px] font-medium tracking-tight">
                  {t('bookings.title')}
                </h1>
                <button 
                  onClick={() => fetchBookings(false)}
                  disabled={syncing}
                  className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-300 ease-out cursor-pointer"
                  title={t('bookings.refresh_title')}
                >
                  <RefreshCw size={14} className={syncing ? 'animate-spin text-[#E67E22]' : ''} />
                </button>
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-3 mt-1.5">
                <p className="text-[14px] md:text-[16px] text-zinc-400 font-light leading-relaxed">
                  {t('bookings.subtitle')}
                </p>
                {lastSync && (
                  <span className="inline-flex self-start md:self-auto px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase font-mono tracking-wider text-zinc-300 shrink-0 whitespace-nowrap">
                    Sync: {lastSync}
                  </span>
                )}
              </div>
            </div>
         </header>

         {loading ? (
           <div className="flex flex-col gap-6">
              <div className="h-[200px] liquid-glass-card rounded-[24px] border border-white/5 animate-pulse" />
              <div className="h-[200px] liquid-glass-card rounded-[24px] border border-white/5 animate-pulse" />
           </div>
         ) : bookings.length === 0 ? (
           <div className="flex flex-col items-center justify-center liquid-glass-card border border-white/5 py-16 md:py-24 rounded-[24px] text-center px-6">
             <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <ClipboardList size={24} className="text-zinc-400" />
             </div>
             <h2 className="text-[24px] font-medium mb-2 text-white">{t('bookings.empty_title')}</h2>
             <p className="text-[16px] text-zinc-400 font-light max-w-[400px]">
                {t('bookings.empty_desc')}
             </p>
           </div>
         ) : (
           <div className="flex flex-col gap-6 lg:p-8">
             {bookings.map((b) => (
               <div key={b.id} className="liquid-glass-card border border-white/5 rounded-[24px] overflow-hidden">
                 {/* Header card */}
                 <div className="px-6 md:px-8 py-5 md:py-6 border-b border-white/5 bg-white/5/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest mb-1">{t('bookings.op_code')}</p>
                      <span className="text-[16px] font-mono font-medium text-[#E67E22]">{b.bookingNumber}</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest mb-1">{t('bookings.assign_status')}</p>
                      <span className="inline-flex px-3 py-1 bg-[#1A1A1A] border border-white/5 rounded-full text-[12px] font-medium uppercase tracking-wider text-white">
                         {String(t(`bookings.status_${b.status}`, b.status.replace(/_/g, ' ')))}
                      </span>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest mb-1">{t('bookings.cost')}</p>
                      <span className="text-[20px] font-medium text-white">Rp {b.total_price.toLocaleString('id-ID')}</span>
                    </div>
                 </div>

                 <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Left Col: Details */}
                   <div>
                     <h4 className="text-[16px] font-medium text-white mb-6">{t('bookings.logistics')}</h4>
                     <div className="flex flex-col gap-4 text-[14px]">
                       <div className="flex gap-4 border-b border-white/5 pb-4">
                         <span className="text-zinc-400 min-w-[140px]">{t('bookings.pickup')}</span>
                         <span className="font-medium text-white">{new Date(b.start_date).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                       </div>
                       <div className="flex gap-4 border-b border-white/5 pb-4">
                         <span className="text-zinc-400 min-w-[140px]">{t('bookings.return')}</span>
                         <span className="font-medium text-white">{new Date(b.end_date).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                       </div>
                     </div>

                     {b.items && b.items.length > 0 && (
                       <div className="mt-8">
                         <p className="text-[12px] font-medium text-zinc-400 uppercase tracking-widest mb-4">{t('bookings.units_title')}:</p>
                         <div className="flex flex-wrap gap-2">
                           {b.items.map((it: any) => (
                             <div key={it.id} className="flex flex-col bg-white/5 border border-white/5 px-4 py-2 rounded-[12px]">
                                <span className="text-[14px] font-medium text-white">{it.itemName}</span>
                                <code className="text-zinc-400 text-[10px] mt-1 tracking-wider uppercase">{it.unitCode}</code>
                             </div>
                           ))}
                         </div>
                       </div>
                     )}

                     {b.penalties && b.penalties.length > 0 && (
                       <div className="mt-8 p-6 bg-red-500/5 sm:bg-transparent sm:border border-red-500/20 rounded-[16px]">
                         <p className="flex items-center gap-2 text-[12px] font-medium text-red-400 uppercase tracking-widest mb-4">
                           <ShieldAlert size={14} /> {t('bookings.unpaid_penalties')}
                         </p>
                         <div className="flex flex-col gap-3">
                           {b.penalties.map((pen: any) => (
                             <div key={pen.id} className="flex justify-between items-center text-[14px]">
                               <span className="text-white font-light">
                                 {pen.reason} &bull; <strong className="font-medium ml-1">Rp {pen.amount.toLocaleString()}</strong>
                               </span>
                               <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded-full ${
                                 pen.status === "paid" ? "bg-white/10 text-white" : "bg-[#E67E22]/20 text-[#E67E22]"
                               }`}>
                                 {pen.status === "paid" ? t('bookings.p_paid') : t('bookings.p_unpaid')}
                               </span>
                             </div>
                           ))}
                         </div>
                         <p className="text-[12px] text-zinc-400 font-light mt-4 pt-4 border-t border-white/5">
                           {t('bookings.all_clear')}
                         </p>
                       </div>
                     )}
                   </div>

                   {/* Right Col: Actions & Status */}
                   <div className="flex flex-col">
                     {b.status === "waiting_payment" && (
                       <div className="bg-white/5 border border-[#E67E22]/20 p-6 md:p-8 rounded-[24px]">
                         <h4 className="flex items-center gap-2 text-[16px] font-medium text-[#E67E22] mb-4">
                            {t('bookings.pay_inst_title')}
                         </h4>
                         <p className="text-[14px] text-zinc-400 font-light leading-[1.6] mb-6">
                           {t('bookings.pay_inst_desc')} <strong className="text-white font-medium">Rp {b.total_price.toLocaleString('id-ID')}</strong> ke rekening resmi operasional kami:<br/><br/>
                           <span className="block p-4 liquid-glass-card border border-white/5 rounded-[12px] font-mono text-[14px] text-white">
                              {t('bookings.official_account')}
                           </span>
                         </p>
                         
                         <form onSubmit={(e) => handleUploadPayment(e, b.id)} className="flex flex-col gap-4">
                           <div className="relative">
                             <input 
                               name="payment_proof" 
                               type="file" 
                               accept="image/*" 
                               required 
                               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                               onChange={(e) => {
                                 if (e.target.files && e.target.files[0]) {
                                   setSelectedFiles(prev => ({...prev, [b.id]: e.target.files![0]}));
                                 } else {
                                   setSelectedFiles(prev => {
                                     const next = {...prev};
                                     delete next[b.id];
                                     return next;
                                   });
                                 }
                               }}
                             />
                             <div className="flex items-center justify-center px-4 py-3 liquid-glass-card border border-white/5 rounded-[12px] text-[14px] text-zinc-400 hover:text-white transition-colors cursor-pointer w-full text-center border-dashed">
                               {selectedFiles[b.id] ? selectedFiles[b.id].name : t('bookings.select_proof')}
                             </div>
                           </div>
                           <button 
                             type="submit" 
                             disabled={uploadingFor === b.id}
                             className="bg-white text-black hover:bg-white px-6 py-3 rounded-[12px] text-[14px] font-medium transition-all duration-300 ease-out cursor-pointer shadow flex justify-center disabled:opacity-50"
                           >
                             {uploadingFor === b.id ? t('bookings.uploading_proof') : t('bookings.confirm_btn')}
                           </button>
                         </form>

                         <div className="mt-6 pt-6 border-t border-white/5">
                           <button
                             type="button"
                             onClick={() => setCancelPromptId(b.id)} style={{ display: cancelPromptId === b.id ? 'none' : 'block' }}
                             className="w-full text-center text-[12px] font-medium tracking-wider uppercase hover:text-red-400 text-zinc-400 transition-all duration-300 ease-out cursor-pointer"
                           >
                             {t('bookings.cancel_btn')} </button> {cancelPromptId === b.id && ( <div className='flex flex-col gap-3 mt-4'> <p className='text-[12px] text-zinc-400 text-center'>{t('bookings.cancel_confirm') || 'Yakin batalkan?'}</p> <div className='flex gap-2'> <button type='button' onClick={() => handleCancelBooking(b.id)} className='flex-1 text-center py-2 rounded-lg bg-red-500/10 text-[12px] font-medium tracking-wider uppercase hover:bg-red-500 hover:text-white text-red-500 transition-all duration-300 ease-out cursor-pointer'>Ya</button> <button type='button' onClick={() => setCancelPromptId(null)} className='flex-1 text-center py-2 rounded-lg bg-white/5 text-[12px] font-medium tracking-wider uppercase hover:bg-white/10 text-white transition-all duration-300 ease-out cursor-pointer'>Tidak</button> </div> </div> )}
                         </div>
                       </div>
                     )}

                     {(b.status === "payment_verified" || b.status === "ready_pickup" || b.status === "ongoing" || b.status === "completed" || b.status === "returned" || b.status === "cancelled") && (
                      <div className="h-full min-h-[220px] border border-white/5 liquid-glass-card p-6 md:p-8 rounded-[24px] flex flex-col items-center justify-center text-center">
                         <div className="w-16 h-16 rounded-full bg-white/5 border border-white/5 flex items-center justify-center mb-6">
                            <CheckCircle2 size={24} className="text-[#E67E22]" />
                         </div>
                         <h4 className="text-[18px] font-medium text-white mb-2">{t('bookings.system_ok')}</h4>
                         <p className="text-[14px] text-zinc-400 font-light leading-[1.6]">
                           {b.status === "payment_verified" ? t('bookings.msg_payment_verified') :
                            b.status === "ready_pickup" ? t('bookings.msg_ready_pickup') :
                            b.status === "ongoing" ? t('bookings.msg_ongoing') :
                            b.status === "returned" ? t('bookings.msg_returned') :
                            b.status === "cancelled" ? t('bookings.msg_cancelled') :
                            t('bookings.msg_completed')}
                         </p>
                       </div>
                     )}
                   </div>
                 </div>
               </div>
             ))}
           </div>
         )}
      </main>
    </div>
  );
}
