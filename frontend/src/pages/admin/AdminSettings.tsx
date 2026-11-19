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
  Globe,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { api, getErrorMessage } from '../../api/client';
import { ShopSettings } from '../../types';
import { useSettings } from '../../context/SettingsContext';

export const AdminSettings: React.FC = () => {
  const { updateSettings, settings: globalSettings, refreshSettings } = useSettings();
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
    if (globalSettings) {
      setSettings(globalSettings);
      setLoading(false);
    } else {
      api.get('/settings')
        .then((res) => {
          if (res.data.success && res.data.settings) {
            setSettings(res.data.settings);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [globalSettings]);

  const handleChange = (field: keyof ShopSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: "Rasm hajmi 2MB dan oshmasligi kerak" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        handleChange('logo', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      const res = await updateSettings(settings);
      if (res.success) {
        setMessage({
          type: 'success',
          text: "Barbershop sozlamalari muvaffaqiyatli saqlandi va saytda yangilandi!",
        });
        await refreshSettings();
      } else {
        setMessage({ type: 'error', text: res.message || "Xatolik yuz berdi" });
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
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">
              Barbershop Logotipi (Rasm yoki Havola)
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-[#0b0d10] border border-gray-700">
              <div className="w-16 h-16 rounded-xl bg-[#12151c] border border-gold-500/30 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
                {settings.logo ? (
                  <img
                    src={settings.logo}
                    alt="Logo Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <ImageIcon className="w-6 h-6 text-gray-500" />
                )}
              </div>
              <div className="flex-1 w-full space-y-2">
                <input
                  type="text"
                  value={settings.logo || ''}
                  onChange={(e) => handleChange('logo', e.target.value)}
                  placeholder="https://... rasm havolasini kiriting"
                  className="w-full bg-[#12151c] border border-gray-700 text-white px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-gold-500"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold bg-gold-500/15 border border-gold-500/40 text-gold-400 hover:bg-gold-500 hover:text-black transition-all inline-flex items-center gap-1.5 shadow-sm">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Kompyuter yoki Telefondan rasm tanlash</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileUpload}
                      className="hidden"
                    />
                  </label>
                  {settings.logo && (
                    <button
                      type="button"
                      onClick={() => handleChange('logo', '')}
                      className="px-2.5 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      Logoni o'chirish
                    </button>
                  )}
                </div>
              </div>
            </div>
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
