import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Scissors,
  CalendarDays,
  Sparkles,
  Settings,
  LogOut,
  ExternalLink,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

export const AdminSidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({ isOpen = false, onClose }) => {
  const { admin, logoutAdmin } = useAuth();
  const { settings } = useSettings();
  const [logoError, setLogoError] = React.useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Bronlar', path: '/admin/bookings', icon: CalendarCheck },
    { name: 'Mijozlar', path: '/admin/clients', icon: Users },
    { name: 'Barberlar', path: '/admin/barbers', icon: Scissors },
    { name: 'Ish Jadvali', path: '/admin/schedule', icon: CalendarDays },
    { name: 'Xizmatlar', path: '/admin/services', icon: Sparkles },
    { name: 'Bronlar Kalendari', path: '/admin/calendar', icon: CalendarDays },
    { name: 'Sozlamalar', path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0c10] border-r border-gold-500/15 flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      <div>
        {/* Brand header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings?.logo && !logoError ? (
              <img
                src={settings.logo}
                alt={settings.shopName || 'Logo'}
                onError={() => setLogoError(true)}
                className="w-10 h-10 rounded-xl object-cover border border-gold-500/40 shadow-lg"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gold-500/15 border border-gold-500/40 flex items-center justify-center text-gold-500 shadow-lg">
                <Shield className="w-5 h-5" />
              </div>
            )}
            <div>
              <span className="font-serif text-lg font-bold text-white tracking-wider block">
                ADMIN PANEL
              </span>
              <span className="text-[10px] uppercase tracking-widest text-gold-500/80 font-semibold block truncate max-w-[130px]">
                {settings?.shopName || 'The Noble Blade'}
              </span>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden text-gray-400 hover:text-white p-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Nav Links */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/20 font-bold'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer user & logout */}
      <div className="p-4 border-t border-white/5 space-y-2">
        <Link
          to="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-gray-400 hover:text-gold-400 hover:bg-white/5 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Mijozlar Saytiga O'tish</span>
          </span>
        </Link>

        <div className="p-3 rounded-xl bg-charcoal-800/80 border border-white/5 flex items-center justify-between">
          <div className="overflow-hidden">
            <span className="text-xs font-semibold text-white block truncate">
              {admin?.email}
            </span>
            <span className="text-[10px] text-gold-500 uppercase font-bold tracking-wider block">
              {admin?.role}
            </span>
          </div>

          <button
            onClick={handleLogout}
            title="Tizimdan chiqish"
            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
