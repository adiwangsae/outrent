import { useEffect, useState, useMemo } from "react";
import Navbar from "../../components/Navbar";
import { useStore } from "../../store";
import { toast } from "react-toastify";
import { Search, Filter, ShoppingBag, AlertCircle, Tent, Backpack, Flame, Package, Flashlight, Plus } from "lucide-react";
import { SkeletonLoader } from "../../components/SkeletonLoader";
import { FeatureSafeBoundary } from "../../components/FeatureSafeBoundary";
import { useTranslation } from "react-i18next";

// Catalog Page View
export default function CatalogPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string>("");
  const { cart, setCart, user } = useStore();
  const { t } = useTranslation();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const fetchInventory = async (isSilent = false) => {
    if (!isSilent) setSyncing(true);
    try {
      const res = await fetch('/api/inventory');
      if (!res.ok) throw new Error("Gagal mengambil data katalog");
      const data = await res.json();
      setProducts(data.products || []);
      setLastSync(new Date().toLocaleTimeString("id-ID"));
    } catch (err) {
      if (!isSilent) toast.error("Gagal terhubung ke katalog. Coba lagi nanti.");
    } finally {
      if (!isSilent) setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    const intervalId = setInterval(() => {
      fetchInventory(true);
    }, 45000); 
    return () => clearInterval(intervalId);
  }, []);

  const addToCart = (product: any) => {
    const isDemo = user?.isDemo === true;
    const isVerified = user?.isVerified === true;
    if (!isDemo && !isVerified) {
      toast.error("Upload identitas terlebih dahulu sebelum melakukan penyewaan.");
      return;
    }

    setCart((prev: any) => {
      const existing = prev.find((p: any) => p.item.id === product.id);
      if (existing) {
        if (existing.qty >= product.available_stock) {
          toast.warning(`Maksimal ${product.available_stock} unit untuk item ini.`);
          return prev;
        }
        toast.success(`${product.name} diperbarui di keranjang`);
        return prev.map((p: any) => p.item.id === product.id ? { ...p, qty: p.qty + 1 } : p);
      }
      toast.success(`${product.name} dimasukkan ke keranjang`);
      return [...prev, { item: product, qty: 1 }];
    });
  };

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ["All", ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategory === "All" || p.category === selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-white font-sans selection:bg-[#E67E22]/30 antialiased">
      <Navbar />
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-12 lg:py-16 flex flex-col gap-10">
        
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-white/5 pb-8">
           <div>
             <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-2">{t('catalog.title')}</h1>
             <p className="text-sm text-zinc-400 font-normal">
               {t('catalog.subtitle')}
               {lastSync && <span className="ml-2 px-2 py-0.5 rounded-md border border-white/10 text-[10px] uppercase font-mono tracking-wider bg-white/5 text-zinc-300">Sync: {lastSync}</span>}
             </p>
           </div>
           
           <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
             <div className="relative w-full sm:w-[280px]">
               <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
               <input 
                 type="text" 
                 placeholder={t('catalog.search_placeholder')} 
                 value={searchQuery}
                 onChange={e => setSearchQuery(e.target.value)}
                 className="w-full pl-10 pr-4 py-2.5 bg-white/5 text-white border border-white/10 rounded-xl text-sm focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all placeholder:text-zinc-500"
               />
             </div>
             <div className="relative w-full sm:w-auto flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 transition-all focus-within:border-white/20 focus-within:ring-1 focus-within:ring-white/10">
               <Filter className="text-zinc-400 mr-2" size={16} />
               <select 
                 value={selectedCategory}
                 onChange={e => setSelectedCategory(e.target.value)}
                 className="bg-transparent text-sm w-full outline-none cursor-pointer font-medium text-white appearance-none pr-4"
               >
                 {categories.map(cat => (
                   <option key={cat} value={cat} className="text-black">{cat}</option>
                 ))}
               </select>
             </div>
           </div>
        </header>

        <FeatureSafeBoundary fallbackMessage="Katalog Gagal Dimuat">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <SkeletonLoader key={i} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 card-uniform text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 text-zinc-400">
              <Search size={24} />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">{t('catalog.empty_title')}</h3>
            <p className="text-sm text-zinc-400 font-normal max-w-sm">{t('catalog.empty_desc')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(p => (
              <div key={p.id} className="relative card-uniform p-6 flex flex-col group overflow-hidden">
                {/* Visual Icon Header */}
                <div className="flex justify-between items-start mb-5">
                  <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors duration-300">
                    {p.category.includes('Tenda') ? <Tent size={20} /> : p.category.includes('Tas') ? <Backpack size={20} /> : p.category.includes('Masak') ? <Flame size={20} /> : p.category.includes('Penerangan') ? <Flashlight size={20} /> : <Package size={20} />}
                  </div>
                  {p.available_stock <= 2 && p.available_stock > 0 && (
                    <span className="flex items-center gap-1 text-[10px] uppercase font-medium text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                      {t('catalog.remaining')} {p.available_stock}
                    </span>
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 flex flex-col">
                  <h3 className="font-semibold text-lg text-white tracking-tight mb-1 leading-snug line-clamp-2">
                     {p.name}
                  </h3>
                  <p className="text-sm text-zinc-400 font-normal mb-5 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>
                  
                  <div className="mt-auto flex items-end justify-between mb-6 pb-6 border-b border-white/5">
                    <div>
                      <p className="text-[10px] font-medium text-zinc-500 mb-0.5">{t('catalog.daily_rent')}</p>
                      <p className="font-semibold text-white text-base">Rp {p.price_per_day.toLocaleString('id-ID')} <span className="text-xs text-zinc-500 font-normal">/ hr</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-medium text-zinc-500 mb-0.5">{t('catalog.stock')}</p>
                      <p className={`font-semibold text-sm ${p.available_stock > 0 ? 'text-white' : 'text-red-400'}`}>
                        {p.available_stock > 0 ? `${p.available_stock} ${t('catalog.unit')}` : t('catalog.empty_stock')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Direct Action */}
                <button 
                  onClick={() => addToCart(p)}
                  disabled={p.available_stock === 0}
                  className={`w-full py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                    p.available_stock === 0 
                      ? 'bg-transparent border border-white/5 text-zinc-500 cursor-not-allowed' 
                      : 'bg-white text-black hover:bg-zinc-200 shadow-sm active:scale-[0.98]'
                  }`}
                >
                  <ShoppingBag size={16} />
                  {p.available_stock === 0 ? t('catalog.empty_stock') : t('catalog.add_to_cart')}
                </button>
              </div>
            ))}
          </div>
        )}
        </FeatureSafeBoundary>
      </main>
    </div>
  );
}
