import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Scissors, MapPin, Phone, Clock, Instagram, Send, Shield, Navigation } from 'lucide-react';
import { api } from '../api/client';
import { ShopSettings } from '../types';

export const Footer: React.FC = () => {
  const [settings, setSettings] = useState<ShopSettings | null>(null);

  useEffect(() => {
    api.get('/settings')
      .then(res => {
        if (res.data.success) {
          setSettings(res.data.settings);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-[#090b0e] border-t border-gold-500/15 pt-16 pb-8 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Col 1: About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-500">
                <Scissors className="w-5 h-5 -rotate-45" />
              </div>
              <span className="font-serif text-xl font-bold tracking-wider text-white">
                {settings?.shopName || 'THE NOBLE BLADE'}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400 mb-6">
              {settings?.description || "Toshkent markazidagi premium erkaklar barbershopi. An'anaviy ustara bilan soqol olish, zamonaviy soch turmaklari va shohona muhit."}
            </p>
            <div className="flex items-center gap-3">
              <a
                href={settings?.instagramUrl || 'https://instagram.com'}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-gold-400 hover:border-gold-500/40 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={settings?.telegramUrl || 'https://t.me'}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-gold-400 hover:border-gold-500/40 transition-colors"
              >
                <Send className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="font-serif text-white font-semibold tracking-wider text-base mb-4 border-b border-gold-500/20 pb-2">
              Tezkor Havolalar
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-gold-400 transition-colors">Bosh Sahifa</Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-gold-400 transition-colors">Xizmatlar va Narxlar</Link>
              </li>
              <li>
                <Link to="/barbers" className="hover:text-gold-400 transition-colors">Bizning Barberlar</Link>
              </li>
              <li>
                <Link to="/book" className="hover:text-gold-400 transition-colors">Onlayn Bron Qilish</Link>
              </li>
              <li>
                <Link to="/my-bookings" className="hover:text-gold-400 transition-colors">Mijoz Kabineti</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Working Hours */}
          <div>
            <h4 className="font-serif text-white font-semibold tracking-wider text-base mb-4 border-b border-gold-500/20 pb-2">
              Ish Vaqti
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-white block font-medium">Dushanba - Shanba:</span>
                  <span className="text-gray-400">09:00 — 21:00</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-white block font-medium">Yakshanba:</span>
                  <span className="text-gray-400">10:00 — 19:00</span>
                </div>
              </div>
              <p className="text-xs text-gold-500/90 bg-gold-500/10 p-2.5 rounded-lg border border-gold-500/20 mt-3">
                Har bir mijoz uchun oldindan bron qilish tavsiya etiladi.
              </p>
            </div>
          </div>

          {/* Col 4: Contact & Location */}
          <div>
            <h4 className="font-serif text-white font-semibold tracking-wider text-base mb-4 border-b border-gold-500/20 pb-2">
              Manzil va Aloqa
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                <span>{settings?.address || "Toshkent shahar, Mirobod tumani, Amir Temur shoh ko'chasi, 42-uy"}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gold-500 shrink-0" />
                <a href={`tel:${settings?.phone || '+998901234567'}`} className="hover:text-white transition-colors">
                  {settings?.phone || '+998 90 123 45 67'}
                </a>
              </div>

              {/* Map Button */}
              <div className="pt-2">
                <a
                  href={settings?.yandexMapsUrl || 'https://yandex.com/maps'}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-black bg-gold-500 hover:bg-gold-400 shadow-md transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Yandex Xaritada Ko'rish</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} {settings?.shopName || 'THE NOBLE BLADE'}. Barcha huquqlar himoyalangan.</p>
          <div className="flex items-center gap-4">
            <span>Asia/Tashkent</span>
            <span>•</span>
            <Link to="/admin/login" className="flex items-center gap-1.5 hover:text-gold-400 transition-colors">
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Panel</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
