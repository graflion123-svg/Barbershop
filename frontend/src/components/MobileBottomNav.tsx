import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Scissors, CalendarCheck, Phone, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { customer, openAuthModal } = useAuth();

  // Hide mobile bottom nav on admin routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0c10]/95 backdrop-blur-xl border-t border-gold-500/20 px-2 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* 1. Home */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              isActive ? 'text-gold-400 font-semibold' : 'text-gray-400 hover:text-gray-200'
            }`
          }
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Asosiy</span>
        </NavLink>

        {/* 2. Services */}
        <NavLink
          to="/services"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              isActive ? 'text-gold-400 font-semibold' : 'text-gray-400 hover:text-gray-200'
            }`
          }
        >
          <Scissors className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Xizmatlar</span>
        </NavLink>

        {/* 3. CENTER HIGHLIGHTED CTA: Book Now */}
        <NavLink
          to="/book"
          className="flex flex-col items-center justify-center -mt-5 group"
        >
          <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-gold-500 to-gold-400 p-3 shadow-lg shadow-gold-500/30 text-black border-2 border-[#0a0c10] group-hover:scale-105 active:scale-95 transition-all flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold text-gold-400 mt-0.5">Bron</span>
        </NavLink>

        {/* 4. My Bookings / Cabinet */}
        <NavLink
          to="/my-bookings"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              isActive ? 'text-gold-400 font-semibold' : 'text-gray-400 hover:text-gray-200'
            }`
          }
        >
          <CalendarCheck className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Kabinet</span>
        </NavLink>

        {/* 5. Direct Phone Call */}
        <a
          href="tel:+998901234567"
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-gray-400 hover:text-gold-400 transition-all"
        >
          <Phone className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Qo'ng'iroq</span>
        </a>
      </div>
    </nav>
  );
};
