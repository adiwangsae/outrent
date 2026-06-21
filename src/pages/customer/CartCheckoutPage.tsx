import { useState } from "react";
import Navbar from "../../components/Navbar";
import { useStore } from "../../store";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ShoppingCart, Tent, Backpack, Trash2, Calendar, MapPin, Receipt, CheckCircle, Package, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function CartCheckoutPage() {
  const { cart, setCart, token, user } = useStore();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const totalItemPerDay = cart.reduce((acc, c) => acc + (c.item.price_per_day * c.qty), 0);
  
  const days = startDate && endDate 
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24)))
    : 1;

  const totalCost = totalItemPerDay * days;

  const minPickupDate = new Date();
  minPickupDate.setDate(minPickupDate.getDate() + 2);
  const minPickupDateStr = minPickupDate.toISOString().split('T')[0];

  const minReturnDateObj = startDate ? new Date(startDate) : new Date(minPickupDateStr);
  minReturnDateObj.setDate(minReturnDateObj.getDate() + 1);
  const minReturnDateStr = minReturnDateObj.toISOString().split('T')[0];

  const handleCheckout = async () => {
    if (!startDate || !endDate) {
      toast.error(t("checkout.err_period"));
      return;
    }

    const pickupDateObj = new Date(startDate);
    const todayObj = new Date();
    todayObj.setHours(0, 0, 0, 0);
    
    const diffTime = pickupDateObj.getTime() - todayObj.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
    
    if (diffDays < 2) {
      toast.error("Pemesanan harus dilakukan minimal 2 hari sebelum tanggal pengambilan.");
      return;
    }

    const endDateObj = new Date(endDate);
    if (endDateObj <= pickupDateObj) {
      toast.error("Tanggal kembali harus lebih dari tanggal pengambilan.");
      return;
    }

    const isDemo = user?.isDemo === true;
    const isVerified = user?.isVerified === true;
    if (!isDemo && !isVerified) {
      toast.error(t("checkout.err_auth"));
      navigate('/customer/profile');
      return;
    }
    
    setLoading(true);
    try {
      const items = cart.map(c => ({ productId: c.item.id, qty: c.qty }));
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ startDate, endDate, items })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(t("checkout.success_checkout"));
      setCart([]);
      navigate("/customer/bookings");
    } catch (err: any) {
      toast.error(err.message || t("checkout.fail_checkout"));
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = (id: string) => {
    setCart((prev: any) => prev.filter((c: any) => c.item.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-white font-sans selection:bg-[#E67E22] selection:text-white">
      <Navbar />
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-12 md:py-16 flex flex-col gap-8 md:gap-12">
        <header className="border-b border-white/5 pb-6">
          <h1 className="text-[32px] md:text-[40px] font-medium tracking-tight mb-2">{t("checkout.title")}</h1>
          <p className="text-[16px] text-zinc-400 font-light">
            {t("checkout.subtitle")}
          </p>
        </header>

        {cart.length === 0 ? (
          <div className="liquid-glass-card border border-white/5 py-16 md:py-24 rounded-[24px] text-center max-w-2xl mx-auto w-full flex flex-col items-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 text-zinc-400">
              <ShoppingCart size={24} />
            </div>
            <h2 className="text-[20px] font-medium mb-2 text-white">{t("checkout.empty_cart")}</h2>
            <p className="text-[14px] text-zinc-400 font-light max-w-[400px] mb-8">
               {t("checkout.empty_desc")}
            </p>
            <button 
              onClick={() => navigate('/customer/catalog')} 
              className="bg-white text-black hover:bg-white px-6 py-3 rounded-[12px] font-medium text-[14px] transition-all duration-300 ease-out cursor-pointer shadow-sm"
            >
              {t("checkout.open_catalog")}
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_400px] gap-6 lg:p-8 items-start">
            
            {/* Left Col */}
            <div className="space-y-8">
              
              <div className="liquid-glass-card p-6 md:p-8 rounded-[24px] border border-white/5">
                <div className="flex items-center gap-2 text-[#E67E22] mb-6">
                  <Calendar size={20} />
                  <h3 className="text-[16px] font-medium text-white tracking-tight">{t("checkout.duration_title")}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[12px] font-medium text-zinc-400 uppercase tracking-wider mb-2">{t("checkout.pickup_time")}</label>
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      min={minPickupDateStr}
                      className="w-full px-4 py-3 bg-white/5 hover:bg-[#252525] border border-white/5 rounded-[12px] text-white text-[14px] focus:outline-none focus:border-[#E67E22] transition-colors cursor-pointer" 
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-zinc-400 uppercase tracking-wider mb-2">{t("checkout.return_time")}</label>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      min={minReturnDateStr}
                      className="w-full px-4 py-3 bg-white/5 hover:bg-[#252525] border border-white/5 rounded-[12px] text-white text-[14px] focus:outline-none focus:border-[#E67E22] transition-colors cursor-pointer" 
                    />
                  </div>
                </div>
              </div>

              <div className="liquid-glass-card p-6 md:p-8 rounded-[24px] border border-white/5">
                <div className="flex items-center gap-2 text-[#E67E22] mb-6">
                  <Package size={20} className="hidden" /> {/* just keeping spacing same */}
                  <div className="w-5 h-5 flex items-center justify-center"><Tent size={20} /></div>
                  <h3 className="text-[16px] font-medium text-white tracking-tight">{t("checkout.gear_modules")}</h3>
                </div>
                
                <div className="flex flex-col gap-4">
                  {cart.map((c, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl">
                      <div className="flex gap-3 sm:gap-4 items-center">
                        <div className="w-12 h-12 liquid-glass-card border border-white/15 rounded-xl flex items-center justify-center text-zinc-400 shrink-0">
                          {c.item.category?.includes('Tenda') ? <Tent size={20} /> : <Backpack size={20} />}
                        </div>
                        
                        <div className="min-w-0">
                          <h4 className="font-medium text-[15px] sm:text-[16px] text-white leading-tight mb-1 truncate max-w-[180px] sm:max-w-none">{c.item.name}</h4>
                          <p className="text-[12px] text-[#E67E22] font-medium font-mono">
                            Rp {c.item.price_per_day.toLocaleString('id-ID')} / 24 Jam
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between sm:justify-end gap-3 items-center border-t border-white/5 pt-3 sm:pt-0 sm:border-0">
                        <div className="text-[12px] font-medium uppercase tracking-wider bg-black/40 text-zinc-400 px-3 py-1.5 rounded-xl border border-white/5 font-mono">
                          {t("checkout.vol_label")}: {c.qty}
                        </div>
                        <button 
                          onClick={() => removeFromCart(c.item.id)} 
                          className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Col: Summary Panel */}
            <div className="sticky top-24">
               <div className="liquid-glass-card p-6 md:p-8 rounded-[24px] border border-[#E67E22]/20">
                  <div className="flex items-center gap-2 text-[#E67E22] mb-6">
                     <Receipt size={20} />
                     <h3 className="text-[16px] font-medium text-white tracking-tight">{t("checkout.calc_title")}</h3>
                  </div>

                  <div className="flex justify-between items-center py-4 border-b border-white/5 text-[14px]">
                     <span className="text-zinc-400">{t("checkout.calc_rent")}</span>
                     <span className="font-medium text-white">{cart.reduce((a, c) => a + c.qty, 0)} {t("catalog.unit", "Modul")}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-4 border-b border-white/5 text-[14px]">
                     <span className="text-zinc-400">{t("checkout.calc_duration")}</span>
                     <span className="font-medium text-white">
                       {startDate && endDate ? t("checkout.calc_duration_value", { days }) : `0 ${t("checkout.calc_duration_value", { days: 0 }).split(' ').pop()}`}
                     </span>
                  </div>

                  <div className="flex justify-between items-center py-4 border-b border-white/5 text-[14px]">
                     <span className="text-zinc-400">{t("checkout.pickup_point")}</span>
                     <span className="font-medium text-white inline-flex items-center gap-1.5"><MapPin size={12} className="text-[#E67E22]"/> {t("checkout.basecamp_point")}</span>
                  </div>

                  <div className="mt-8 mb-8">
                     <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest block mb-2">{t("checkout.bill_value")}</span>
                     <span className="text-[32px] font-medium text-[#E67E22] tracking-tight block">
                       Rp {totalCost.toLocaleString('id-ID')}
                     </span>
                  </div>

                  {(!user?.isDemo && !user?.isVerified) ? (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-[12px] mb-4">
                       <p className="text-[12px] text-red-400 font-light flex gap-2">
                          <ShieldAlert size={16} className="shrink-0" />
                          <span>{t("checkout.err_auth_desc")}</span>
                       </p>
                    </div>
                  ) : (
                    <button 
                      onClick={handleCheckout}
                      disabled={loading}
                      className="w-full bg-white hover:bg-white text-black py-4 rounded-[12px] font-medium text-[14px] transition-all duration-300 ease-out disabled:opacity-50 cursor-pointer shadow-sm flex items-center justify-center gap-2"
                    >
                      {loading ? t("checkout.connecting") : <><CheckCircle size={16} /> {t("checkout.checkout_btn")}</>}
                    </button>
                  )}
               </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
