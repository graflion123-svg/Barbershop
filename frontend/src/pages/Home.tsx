import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Scissors,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  Coffee,
  Check,
  Star,
  Navigation,
  ExternalLink
} from 'lucide-react';
import { api } from '../api/client';
import { Barber, Service, ShopSettings } from '../types';
import { useSettings } from '../context/SettingsContext';

export const Home: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const { settings } = useSettings();
  const [loading, setLoading] = useState(true);

  const fallbackImg = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80';
  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = fallbackImg;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, barbersRes] = await Promise.all([
          api.get('/services'),
          api.get('/barbers'),
        ]);

        if (servicesRes.data.success) setServices(servicesRes.data.services);
        if (barbersRes.data.success) setBarbers(barbersRes.data.barbers);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        {/* Background Darkened Image with Gold Vignette */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transform animate-pulse duration-[10000ms]"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1920&auto=format&fit=crop&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e12] via-[#0c0e12]/80 to-[#0c0e12]/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-500/10 via-transparent to-transparent pointer-events-none" />

        {/* Content */}
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs sm:text-sm font-medium uppercase tracking-widest mb-6"
          >
            <Sparkles className="w-4 h-4 text-gold-500" />
            <span>Toshkentning eng nufuzli erkaklar saloni</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-serif text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6"
          >
            SOCH VA SOQOLDA <br />
            <span className="gold-gradient-text">MUTLAQ MUKAMMALLIK</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-2xl mx-auto text-base sm:text-lg text-gray-300 font-light leading-relaxed mb-10"
          >
            Har bir erkak o'ziga xos uslub va mukammal ko'rinishga loyiq. Tajribali ustalar,
            zamonaviy texnika va shohona mehmondo'stlik bir makonda.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
          >
            <Link
              to="/book"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm tracking-wider uppercase text-black bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 hover:from-gold-300 hover:to-gold-500 shadow-xl shadow-gold-500/25 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <span>Vaqtni Bron Qilish</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/services"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-sm tracking-wider uppercase text-white bg-white/5 border border-gold-500/30 hover:bg-gold-500/10 hover:border-gold-500 transition-all flex items-center justify-center gap-2"
            >
              <span>Xizmatlar va Narxlar</span>
            </Link>
          </motion.div>

          {/* Quick Metrics */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-16 mt-12 border-t border-white/10"
          >
            <div className="text-center">
              <span className="block font-serif text-3xl font-bold text-gold-400">100%</span>
              <span className="text-xs text-gray-400 uppercase tracking-wider">Steril Asboblar</span>
            </div>
            <div className="text-center">
              <span className="block font-serif text-3xl font-bold text-gold-400">8+ Yil</span>
              <span className="text-xs text-gray-400 uppercase tracking-wider">Katta Tajriba</span>
            </div>
            <div className="text-center">
              <span className="block font-serif text-3xl font-bold text-gold-400">5 000+</span>
              <span className="text-xs text-gray-400 uppercase tracking-wider">Mamnun Mijozlar</span>
            </div>
            <div className="text-center">
              <span className="block font-serif text-3xl font-bold text-gold-400">4.9 ★</span>
              <span className="text-xs text-gray-400 uppercase tracking-wider">Reyting</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. ABOUT US & FEATURES SECTION */}
      <section className="py-24 bg-[#0a0c10] border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Images Mosaic */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img
                  src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&auto=format&fit=crop&q=80"
                  alt="Barbershop Interyer"
                  onError={handleImgError}
                  className="rounded-2xl border border-gold-500/20 object-cover h-64 w-full shadow-lg"
                />
                <img
                  src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&auto=format&fit=crop&q=80"
                  alt="Soch kesish jarayoni"
                  onError={handleImgError}
                  className="rounded-2xl border border-gold-500/20 object-cover h-48 w-full shadow-lg"
                />
              </div>
              <div className="space-y-4 pt-8">
                <img
                  src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80"
                  alt="Soqol olish"
                  onError={handleImgError}
                  className="rounded-2xl border border-gold-500/20 object-cover h-48 w-full shadow-lg"
                />
                <img
                  src="https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&auto=format&fit=crop&q=80"
                  alt="Premium Barber Salon"
                  onError={handleImgError}
                  className="rounded-2xl border border-gold-500/20 object-cover h-64 w-full shadow-lg"
                />
              </div>
            </div>

            {/* Right: Text & Badges */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-gold-500/10 text-gold-400 text-xs font-semibold uppercase tracking-wider mb-3">
                <Award className="w-4 h-4 text-gold-500" />
                <span>Biz Haqimizda</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight mb-6">
                ERKAKLAR UCHUN <br />
                <span className="gold-gradient-text">HAQIQIY SIFAT VA QADRIYAT</span>
              </h2>
              <p className="text-gray-300 leading-relaxed mb-6">
                <strong>{settings?.shopName || 'THE NOBLE BLADE'}</strong> — bu shunchaki soch qisqartirish joyi emas.
                Bu yerda har bir mijoz qulay charm kreslolarda hordiq chiqaradi, maxsus italiyalik qahva yoki ichimliklar tatib ko'radi
                va o'z qiyofasini eng yuqori darajada parvarishlaydi.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-gold-500/10 text-gold-400 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">Tibbiy Darajada Sterilizatsiya</h4>
                    <p className="text-xs text-gray-400">Har bir mijoz uchun alohida ochiladigan, ultrabinafsha va termik tozalangan asboblar.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-gold-500/10 text-gold-400 shrink-0">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">Premium Lounge & Bar</h4>
                    <p className="text-xs text-gray-400">Kutish vaqtida bepul xushbo'y espresso, choy va qulay erkaklar muhiti.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-gold-500/10 text-gold-400 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">Vaqtning Qadr-Qimmati</h4>
                    <p className="text-xs text-gray-400">Bron qilingan vaqtingizda kutishsiz qabul. 1 kishi uchun 45 daqiqalik individual e'tibor.</p>
                  </div>
                </div>
              </div>

              <Link
                to="/book"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-black bg-gold-500 hover:bg-gold-400 transition-colors shadow-lg shadow-gold-500/20"
              >
                <span>Hozirroq Qabulga Yozilish</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. POPULAR SERVICES SECTION */}
      <section className="py-24 bg-[#0c0e12] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-gold-500 font-semibold">
              Katalog
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-2">
              XIZMATLAR VA NARXLAR
            </h2>
            <div className="w-16 h-0.5 bg-gold-500 mx-auto mt-4 mb-4" />
            <p className="text-sm text-gray-400">
              Ustalik bilan bajariladigan xizmatlarimiz ro'yxati. Narxlar shaffof va barchasi backend bilan sinxronlangan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.slice(0, 6).map((service) => (
              <div
                key={service.id}
                className="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col justify-between group"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.name}
                    onError={handleImgError}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12151c] via-transparent to-transparent" />
                  <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold bg-black/70 border border-gold-500/40 text-gold-400 backdrop-blur-md">
                    {service.category}
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-white mb-2 group-hover:text-gold-400 transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-gray-500 uppercase block">Narxi</span>
                      <span className="text-lg font-bold text-gold-400">
                        {service.price.toLocaleString()} <span className="text-xs text-gray-400">UZS</span>
                      </span>
                    </div>

                    <Link
                      to={`/book?serviceId=${service.id}`}
                      className="px-4 py-2 rounded-lg text-xs font-semibold bg-gold-500/10 border border-gold-500/30 text-gold-400 hover:bg-gold-500 hover:text-black transition-all flex items-center gap-1.5"
                    >
                      <span>Bron qilish</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-sm text-gold-400 font-semibold hover:text-gold-300 transition-colors border-b border-gold-500/40 pb-1"
            >
              <span>Barcha xizmatlarni ko'rish ({services.length})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. BARBERS SECTION */}
      <section className="py-24 bg-[#090b0e] border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-gold-500 font-semibold">
              Kafolatlangan Mahorat
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-2">
              BIZNING USTA BARBERLAR
            </h2>
            <div className="w-16 h-0.5 bg-gold-500 mx-auto mt-4 mb-4" />
            <p className="text-sm text-gray-400">
              O'z sohasining haqiqiy ustalari. Har bir usta o'z individual dastxatiga ega.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {barbers.map((barber) => (
              <div
                key={barber.id}
                className="glass-panel glass-panel-hover rounded-2xl overflow-hidden text-center group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-72 overflow-hidden">
                    <img
                      src={barber.image}
                      alt={barber.fullName}
                      onError={handleImgError}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#12151c] via-transparent to-transparent" />
                    <span className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-semibold bg-gold-500 text-black shadow-md">
                      {barber.experience}
                    </span>
                  </div>

                  <div className="p-6">
                    <h3 className="font-serif text-xl font-bold text-white mb-1 group-hover:text-gold-400 transition-colors">
                      {barber.fullName}
                    </h3>
                    <p className="text-xs text-gray-400 mb-4 line-clamp-3 leading-relaxed">
                      {barber.description}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2">
                  <Link
                    to={`/book?barberId=${barber.id}`}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold bg-white/5 border border-gold-500/30 text-gold-400 hover:bg-gold-500 hover:text-black transition-all block"
                  >
                    Ushbu Barberni Tanlash
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. LOCATION & CONTACT SECTION */}
      <section className="py-24 bg-[#0c0e12] relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-gold-500 font-semibold">
              Bizni Topish Oson
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-2">
              MANZIL VA ALOQA
            </h2>
            <div className="w-16 h-0.5 bg-gold-500 mx-auto mt-3 mb-4" />
            <p className="text-sm text-gray-400">
              Qulay joylashuv, bepul avtoturargoh va mehmondo'st shinam muhit.
            </p>
          </div>

          {/* 3 Luxury Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Address Card */}
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-gold-500/30 transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-500 mb-5">
                  <MapPin className="w-6 h-6" />
                </div>
                <span className="text-xs text-gray-400 uppercase tracking-wider block font-semibold mb-1">
                  Barbershop Manzili
                </span>
                <p className="text-base text-white font-medium leading-relaxed">
                  {settings?.address || "Toshkent shahar, Mirobod tumani, Amir Temur shoh ko'chasi, 42-uy"}
                </p>
              </div>
            </div>

            {/* Phone Card */}
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-gold-500/30 transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-500 mb-5">
                  <Phone className="w-6 h-6" />
                </div>
                <span className="text-xs text-gray-400 uppercase tracking-wider block font-semibold mb-1">
                  Telefon Raqami
                </span>
                <a
                  href={`tel:${settings?.phone || '+998901234567'}`}
                  className="text-lg text-white font-bold hover:text-gold-400 transition-colors block"
                >
                  {settings?.phone || '+998 90 123 45 67'}
                </a>
                <p className="text-xs text-gray-400 mt-2">
                  Qabulga yozilish yoki savollar bo'yicha bog'lanishingiz mumkin.
                </p>
              </div>
            </div>

            {/* Hours Card */}
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-gold-500/30 transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-500 mb-5">
                  <Clock className="w-6 h-6" />
                </div>
                <span className="text-xs text-gray-400 uppercase tracking-wider block font-semibold mb-1">
                  Ish Rejimi
                </span>
                <p className="text-base text-gold-400 font-bold">
                  {settings?.openingHours || 'Dushanba - Yakshanba: 09:00 — 21:00'}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Dam olish kunlarisiz, siz uchun qulay vaqtda xizmat ko'rsatamiz.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Maps Action Buttons */}
          <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-gold-500/25 text-center max-w-3xl mx-auto shadow-2xl shadow-gold-500/10">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-2">
              Xarita orqali yo'nalish (marshrut) olish
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 mb-8 max-w-lg mx-auto leading-relaxed">
              Tugmani bosing va o'zingizga qulay xarita ilovasida barbershopgacha bo'lgan eng tez marshrutni oching:
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={
                  settings?.yandexMapsUrl ||
                  `https://yandex.com/maps/?text=${encodeURIComponent(settings?.address || 'Toshkent Barbershop')}`
                }
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-wider text-black bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 hover:from-gold-300 hover:to-gold-500 shadow-xl shadow-gold-500/25 flex items-center justify-center gap-2.5 transition-all"
              >
                <Navigation className="w-4 h-4" />
                <span>Yandex Xarita: Yo'nalish olish</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href={
                  settings?.googleMapsUrl ||
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings?.address || 'Toshkent Barbershop')}`
                }
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-xs uppercase tracking-wider text-white bg-white/5 border border-gold-500/30 hover:bg-gold-500/10 hover:border-gold-500 flex items-center justify-center gap-2.5 transition-all"
              >
                <MapPin className="w-4 h-4 text-gold-400" />
                <span>Google Maps orqali ko'rish</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BOTTOM CALL TO ACTION BANNER */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-[#0c0e12] to-[#08090c] border-t border-gold-500/20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Scissors className="w-12 h-12 text-gold-500 mx-auto mb-4 -rotate-45" />
          <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-white mb-4">
            BUGUNGI KUN UCHUN O'RNINGIZNI BAND QILING
          </h2>
          <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Kutishsiz, qulay va professional xizmat. Har bir odam uchun 45 daqiqa kafolatlangan vaqt.
          </p>
          <Link
            to="/book"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-wider text-black bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 hover:from-gold-300 hover:to-gold-500 shadow-xl shadow-gold-500/30 hover:scale-105 active:scale-95 transition-all"
          >
            <span>Onlayn Bron Qilishga O'tish</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};
