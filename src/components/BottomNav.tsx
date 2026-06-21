import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Compass, CalendarCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function BottomNav() {
  const location = useLocation();
  const { t } = useTranslation();

  // Hide on admin routes or auth pages if needed
  if (
    location.pathname.startsWith("/admin") ||
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/" ||
    location.pathname === "/about" ||
    location.pathname === "/terms"
  ) {
    return null;
  }

  const navItems = [
    { name: t('nav.dashboard'), icon: Home, path: "/customer/dashboard" },
    { name: t('nav.inventory'), icon: Compass, path: "/customer/catalog" },
    { name: t('nav.booking'), icon: CalendarCheck, path: "/customer/bookings" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-auto shadow-[0_-12px_40px_rgba(0,0,0,0.4)]">
      {/* Safe area padding wrapper */}
      <div className="liquid-glass-navbar border-t border-white/[0.08] pb-[env(safe-area-inset-bottom,16px)]">
        <div className="flex items-center justify-around h-[68px] px-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center w-full h-full gap-1.5 relative"
              >
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute top-0 w-8 h-[2px] bg-[#E67E22] rounded-b-full shadow-[0_2px_8px_rgba(230,126,34,0.6)]"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <div
                  className={`relative flex items-center justify-center transition-colors duration-300 ${
                    isActive ? "text-[#E67E22]" : "text-zinc-400 group-hover:text-white"
                  }`}
                >
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={isActive ? "drop-shadow-[0_0_8px_rgba(230,126,34,0.4)]" : ""}
                  />
                </div>
                <span
                  className={`text-[10px] font-medium tracking-wide transition-colors duration-300 ${
                    isActive ? "text-[#E67E22]" : "text-zinc-400"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
