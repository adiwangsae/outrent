import { Link, useNavigate, useLocation } from "react-router-dom";
import { useStore } from "../store";
import { ShoppingCart, CheckCircle2, AlertTriangle, Globe } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export default function Navbar() {
  const { user, logout, cart } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    logout();
    toast.success('Berhasil keluar akun');
    navigate('/');
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'id' ? 'en' : 'id';
    i18n.changeLanguage(nextLang);
  };

  if (!user) return null;

  const userRole = user.role?.toLowerCase() || '';
  const isAdmin = userRole === 'admin' || userRole === 'super_admin' || userRole === 'demo_admin';
  const isExcludedPage = location.pathname === '/about' || location.pathname === '/terms';
  const prefix = isAdmin ? '/admin' : '/customer';

  const links = isAdmin || isExcludedPage ? [] : [
    { name: t('nav.dashboard'), path: '/customer/dashboard' },
    { name: t('nav.inventory'), path: '/customer/catalog' },
    { name: t('nav.booking'), path: '/customer/bookings' }
  ];

  return (
    <header className="sticky top-0 w-full z-40 liquid-glass-navbar shadow-sm pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between relative">
        <div className="flex items-center gap-8">
          <Link 
            to={prefix} 
            className="font-semibold text-[20px] tracking-tight text-white select-none hover:opacity-80 transition-opacity z-10"
          >
            {t('app.title').replace('.', '')}<span className="text-[#E67E22]">.</span>
          </Link>

          <nav className="hidden md:flex gap-6">
            {links.map(l => {
              const active = location.pathname === l.path || location.pathname.startsWith(l.path + "/");
              return (
                <Link
                  key={l.path}
                  to={l.path}
                  className={`text-xs font-semibold uppercase tracking-widest transition-colors select-none py-1.5 ${
                    active 
                      ? 'text-white' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {l.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleLanguage} className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-all" title="Toggle Language">
            <Globe size={16} />
            <span className="sr-only">Toggle Language</span>
          </button>
          {!isAdmin && (
            <Link to="/customer/checkout" id="cart-nav-btn" className="relative p-2.5 text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center bg-white/5 border border-white/5 rounded-xl hover:bg-white/10">
              <ShoppingCart size={16} />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 bg-[#E67E22] text-white text-[10px] font-semibold flex items-center justify-center rounded-full shadow-md">
                  {cart.reduce((a, c) => a + c.qty, 0)}
                </span>
              )}
            </Link>
          )}
          <div className="flex items-center gap-4 border-l border-white/10 pl-4 bg-transparent">
            <div className="text-right hidden sm:block">
              <p className="font-medium text-sm text-white leading-tight">{user.name}</p>
              <div className="text-[10px] mt-0.5 flex items-center gap-1 justify-end select-none">
                {isAdmin ? (
                  <span className="bg-[#E67E22]/15 text-[#E67E22] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">Admin</span>
                ) : user.isDemo ? (
                  <span className="text-[#E67E22] font-medium flex items-center gap-0.5">
                    <CheckCircle2 size={10} /> Demo Account
                  </span>
                ) : user.isVerified ? (
                  <span className="text-zinc-400 font-medium flex items-center gap-0.5">
                    <CheckCircle2 size={10} /> Terverifikasi
                  </span>
                ) : (
                  <span className="text-amber-500 font-medium flex items-center gap-0.5">
                    <AlertTriangle size={10} /> Belum Edit Profil
                  </span>
                )}
              </div>
            </div>
            <button 
              onClick={handleLogout}
              id="logout-nav-btn"
              className="text-xs font-semibold uppercase tracking-widest bg-white/5 border border-white/5 text-zinc-300 px-4 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-all cursor-pointer active:scale-95"
            >
              {t('common.logout')}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
