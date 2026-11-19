import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  CheckCircle,
  AlertCircle,
  MapPin,
  Phone,
  Clock,
  Instagram,
  Send,
  Globe
} from 'lucide-react';
import { api, getErrorMessage } from '../../api/client';
import { ShopSettings } from '../../types';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<Partial<ShopSettings>>({
    shopName: '',
    logo: '',
    address: '',
    phone: '',
    yandexMapsUrl: '',
    googleMapsUrl: '',
    openingHours: '',
    instagramUrl: '',
    telegramUrl: '',
    description: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    api.get('/settings')
      .then((res) => {
        if (res.data.success && res.data.settings) {
          setSettings(res.data.settings);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: keyof ShopSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      const res = await api.put('/settings', settings);
      if (res.data.success) {
        setMessage({
          type: 'success',
          text: "Barbershop sozlamalari muvaffaqiyatli saqlandi va saytda yangilandi!",
        });
      }
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
          BARBERSHOP SOZLAMALARI
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Barbershop nomi, logotip, aloqa ma'lumotlari, ish vaqti va xaritalar
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
              : 'bg-red-950/60 border-red-500/40 text-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="glass-panel p-6 sm:p-8 rounded-2xl border-white/5 space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-bold text-gold-400 border-b border-gray-800 pb-2">
            Asosiy Ma'lumotlar
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                Barbershop Nomi *
              </label>
              <input
                type="text"
                required
                value={settings.shopName || ''}
                onChange={(e) => handleChange('shopName', e.target.value)}
                placeholder="THE NOBLE BLADE"
                className="w-full bg-[#0b0d10] border border-gray-700 text-white px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                Telefon Raqami *
              </label>
              <input
                type="text"
                required
                value={settings.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+998 90 123 45 67"
                className="w-full bg-[#0b0d10] border border-gray-700 text-white px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
              Logo URL *
            </label>
            <input
              type="text"
              required
              value={settings.logo || ''}
              onChange={(e) => handleChange('logo', e.target.value)}
              placeholder="https://..."
              className="w-full bg-[#0b0d10] border border-gray-700 text-white px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-gold-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
              Qisqacha Tavsif (About)
            </label>
            <textarea
              rows={3}
              value={settings.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Barbershop haqida qisqacha ma'lumot..."
              className="w-full bg-[#0b0d10] border border-gray-700 text-white px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-gold-500"
            />
          </div>
        </div>

        {/* Location & Hours */}
        <div className="space-y-4 pt-4 border-t border-gray-800">
          <h3 className="font-serif text-lg font-bold text-gold-400 border-b border-gray-800 pb-2">
            Manzil, Xarita va Ish Rejimi
          </h3>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
              To'liq Manzil *
            </label>
            <input
              type="text"
              required
              value={settings.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Toshkent shahar, Mirobod tumani..."
              className="w-full bg-[#0b0d10] border border-gray-700 text-white px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-gold-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
              Ish Vaqti *
            </label>
            <input
              type="text"
              required
              value={settings.openingHours || ''}
              onChange={(e) => handleChange('openingHours', e.target.value)}
              placeholder="Dushanba - Shanba: 09:00 - 21:00..."
              className="w-full bg-[#0b0d10] border border-gray-700 text-white px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-gold-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                Yandex Maps URL *
              </label>
              <input
                type="url"
                required
                value={settings.yandexMapsUrl || ''}
                onChange={(e) => handleChange('yandexMapsUrl', e.target.value)}
                placeholder="https://yandex.com/maps/..."
                className="w-full bg-[#0b0d10] border border-gray-700 text-white px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                Google Maps URL
              </label>
              <input
                type="url"
                value={settings.googleMapsUrl || ''}
                onChange={(e) => handleChange('googleMapsUrl', e.target.value)}
                placeholder="https://maps.google.com/..."
                className="w-full bg-[#0b0d10] border border-gray-700 text-white px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>
        </div>

        {/* Social Networks */}
        <div className="space-y-4 pt-4 border-t border-gray-800">
          <h3 className="font-serif text-lg font-bold text-gold-400 border-b border-gray-800 pb-2">
            Ijtimoiy Tarmoqlar
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                Instagram URL
              </label>
              <input
                type="url"
                value={settings.instagramUrl || ''}
                onChange={(e) => handleChange('instagramUrl', e.target.value)}
                placeholder="https://instagram.com/..."
                className="w-full bg-[#0b0d10] border border-gray-700 text-white px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                Telegram URL
              </label>
              <input
                type="url"
                value={settings.telegramUrl || ''}
                onChange={(e) => handleChange('telegramUrl', e.target.value)}
                placeholder="https://t.me/..."
                className="w-full bg-[#0b0d10] border border-gray-700 text-white px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-800">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-black bg-gold-500 hover:bg-gold-400 transition-colors flex items-center gap-2 shadow-lg shadow-gold-500/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saqlanmoqda...' : 'Sozlamalarni Saqlash'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
