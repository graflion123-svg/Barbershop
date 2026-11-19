import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scissors, User as UserIcon, Calendar, Menu, X, Shield, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { customer, openAuthModal, logoutCustomer } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: 'Bosh Sahifa', path: '/' },
    { name: 'Xizmatlar', path: '/services' },
    { name: 'Barberlar', path: '/barbers' },
    { name: 'Bron Qilish', path: '/book' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0c0e12]/80 backdrop-blur-md border-b border-gold-500/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gold-500/10 border border-gold-500/40 flex items-center justify-center text-gold-500 group-hover:scale-105 group-hover:border-gold-500 transition-all duration-300 shadow-lg shadow-gold-500/10">
              <Scissors className="w-6 h-6 transform -rotate-45" />
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-white group-hover:text-gold-400 transition-colors">
                THE NOBLE BLADE
              </span>
              <span className="block text-[10px] uppercase tracking-[0.25em] text-gold-500/80 font-medium">
                Exclusive Barbershop
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-gold-400 ${
                  isActive(link.path)
                    ? 'text-gold-500 border-b-2 border-gold-500 pb-1'
                    : 'text-gray-300'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* My Bookings link */}
            <Link
              to="/my-bookings"
              className={`text-sm font-medium flex items-center gap-1.5 transition-colors hover:text-gold-400 ${
                isActive('/my-bookings') ? 'text-gold-500' : 'text-gray-300'
              }`}
            >
              <Calendar className="w-4 h-4 text-gold-500" />
              <span>Mening Bronlarim</span>
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            {customer ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/my-bookings"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-medium hover:bg-gold-500/20 transition-all"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>{customer.fullName.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={logoutCustomer}
                  title="Chiqish"
                  className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                >
                  Chiqish
                </button>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-gold-400 border border-gold-500/40 hover:bg-gold-500/10 transition-all"
              >
                <UserIcon className="w-4 h-4" />
                <span>Kirish / Ro'yxatdan o'tish</span>
              </button>
            )}

            {/* Primary CTA Book Now */}
            <Link
              to="/book"
              className="px-5 py-2.5 rounded-xl font-semibold text-xs tracking-wide uppercase text-black bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 hover:from-gold-300 hover:to-gold-500 shadow-md shadow-gold-500/20 hover:shadow-gold-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Bron Qilish
            </Link>

            {/* Admin Link shortcut */}
            <Link
              to="/admin/login"
              title="Admin Panel"
              className="p-2 text-gray-500 hover:text-gold-400 hover:bg-white/5 rounded-lg transition-colors"
            >
              <Shield className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              to="/book"
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gold-500 text-black uppercase"
            >
              Bron
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-300 hover:text-white rounded-lg hover:bg-white/5"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0e1117] border-b border-gold-500/20 px-4 pt-3 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-base font-medium ${
                isActive(link.path)
                  ? 'bg-gold-500/15 text-gold-400 font-semibold'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {link.name}
            </Link>
          ))}

          <Link
            to="/my-bookings"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-gold-400 bg-gold-500/10"
          >
            <Calendar className="w-5 h-5" />
            <span>Mening Bronlarim</span>
          </Link>

          <div className="pt-3 border-t border-gray-800 flex flex-col gap-2">
            {customer ? (
              <div className="flex items-center justify-between px-3 py-2 bg-charcoal-800 rounded-lg">
                <span className="text-sm text-gold-400 font-medium">{customer.fullName}</span>
                <button
                  onClick={() => {
                    logoutCustomer();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-red-400"
                >
                  Chiqish
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal();
                }}
                className="w-full py-2.5 rounded-xl border border-gold-500/30 text-gold-400 text-sm font-semibold"
              >
                Kirish / Ro'yxatdan o'tish
              </button>
            )}

            <Link
              to="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 py-2 text-xs text-gray-500 hover:text-gray-300"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Panelga Kirish</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
