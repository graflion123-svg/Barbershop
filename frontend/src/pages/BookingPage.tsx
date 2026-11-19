import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scissors,
  User,
  Users,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Phone,
  ShieldCheck,
  Check
} from 'lucide-react';
import { api, getErrorMessage } from '../api/client';
import { Barber, Service, TimeSlot } from '../types';
import { useAuth } from '../context/AuthContext';

export const BookingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { customer, identifyCustomer } = useAuth();

  // Wizard state: 1: Barber -> 2: Service -> 3: PeopleCount -> 4: Date & Available Times -> 5: Confirm & Finish
  const [step, setStep] = useState<number>(1);

  // Selections
  const [selectedBarberId, setSelectedBarberId] = useState<string>(searchParams.get('barberId') || '');
  const [selectedServiceId, setSelectedServiceId] = useState<string>(searchParams.get('serviceId') || '');
  const [peopleCount, setPeopleCount] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);

  const fallbackImg = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80';
  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = fallbackImg;
  };

  // Customer contact details
  const [fullName, setFullName] = useState<string>(customer?.fullName || '');
  const [phone, setPhone] = useState<string>(customer?.phone || '+998 ');

  // Loaded data
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Update contact details if customer logged in
  useEffect(() => {
    if (customer) {
      setFullName(customer.fullName);
      setPhone(customer.phone);
    }
  }, [customer]);

  // Fetch Barbers and Services
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [barbersRes, servicesRes] = await Promise.all([
          api.get('/barbers'),
          api.get('/services'),
        ]);

        if (barbersRes.data.success) {
          setBarbers(barbersRes.data.barbers);
          if (searchParams.get('barberId')) {
            setSelectedBarberId(searchParams.get('barberId')!);
            setStep(2); // Jump to step 2 if barber was preselected
          }
        }
        if (servicesRes.data.success) {
          setServices(servicesRes.data.services);
          if (searchParams.get('serviceId')) {
            setSelectedServiceId(searchParams.get('serviceId')!);
          }
        }
      } catch (err) {
        console.error('Error fetching initial booking data:', err);
      }
    };

    fetchInitial();
  }, [searchParams]);

  // Fetch Available Times whenever barberId, date, or peopleCount changes
  useEffect(() => {
    if (!selectedBarberId || !selectedDate) return;

    const fetchSlots = async () => {
      try {
        setLoadingSlots(true);
        setError(null);
        setSelectedTimeSlot(null);

        const res = await api.get('/bookings/available-times', {
          params: {
            barberId: selectedBarberId,
            date: selectedDate,
            peopleCount,
          },
        });

        if (res.data.success) {
          setAvailableSlots(res.data.availableSlots || []);
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedBarberId, selectedDate, peopleCount]);

  // Selected entities helper
  const selectedBarber = barbers.find((b) => b.id === selectedBarberId);
  const selectedService = services.find((s) => s.id === selectedServiceId);
  const totalDurationMinutes = peopleCount * 45;
  const totalPrice = (selectedService?.price || 0) * peopleCount;

  // Handle final submit
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedBarberId || !selectedServiceId || !selectedDate || !selectedTimeSlot) {
      setError("Iltimos, barcha bosqichlarni to'liq tanlang");
      return;
    }

    if (!fullName.trim() || fullName.trim().length < 2) {
      setError("Ism va familiyangizni to'liq kiriting");
      return;
    }

    if (!phone.trim() || phone.trim().length < 9) {
      setError("Telefon raqamingizni to'liq kiriting");
      return;
    }

    try {
      setSubmitting(true);

      // Auto identify/save customer in background if needed
      if (!customer) {
        try {
          await identifyCustomer(fullName.trim(), phone.trim());
        } catch {
          // Continue booking anyway
        }
      }

      const res = await api.post('/bookings', {
        barberId: selectedBarberId,
        serviceId: selectedServiceId,
        date: selectedDate,
        startTime: selectedTimeSlot.startTime,
        peopleCount,
        fullName: fullName.trim(),
        phone: phone.trim(),
      });

      if (res.data.success) {
        setBookingSuccess(res.data.booking);
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Min selectable date: Today
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[#0a0c10]">
      <div className="max-w-4xl mx-auto">
        {/* Title Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tezkor va Qulay Bron Tizimi</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
            ONLAYN QABULGA YOZILISH
          </h1>
          <div className="w-16 h-0.5 bg-gold-500 mx-auto mt-3 mb-2" />
          <p className="text-sm text-gray-400">
            1 kishi = 45 daqiqa. Band qilingan vaqtlar avtomatik filtrlanadi va faqat bo'sh vaqtlar ko'rsatiladi.
          </p>
        </div>

        {/* Multi-step Progress Bar */}
        {!bookingSuccess && (
          <div className="mb-6 sm:mb-10">
            <div className="flex items-center justify-between max-w-2xl mx-auto px-1">
              {[
                { num: 1, label: 'Barber' },
                { num: 2, label: 'Xizmat' },
                { num: 3, label: 'Mehmon' },
                { num: 4, label: 'Vaqt' },
                { num: 5, label: 'Tasdiq' },
              ].map((s) => (
                <div key={s.num} className="flex flex-col items-center flex-1 relative">
                  <button
                    onClick={() => {
                      if (s.num < step) setStep(s.num);
                    }}
                    disabled={s.num > step}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${
                      step === s.num
                        ? 'bg-gold-500 text-black ring-4 ring-gold-500/20 scale-105 sm:scale-110 shadow-lg'
                        : step > s.num
                        ? 'bg-gold-500/30 text-gold-400 border border-gold-500'
                        : 'bg-charcoal-800 text-gray-500 border border-gray-700'
                    }`}
                  >
                    {step > s.num ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : s.num}
                  </button>
                  <span
                    className={`text-[9px] sm:text-[11px] mt-1.5 font-medium tracking-wider uppercase text-center ${
                      step === s.num ? 'text-gold-400 font-bold' : 'text-gray-500'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-sm flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* SUCCESS CONFIRMATION MODAL / SCREEN */}
        {bookingSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel border-gold-500/50 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-2xl shadow-gold-500/10"
          >
            <div className="w-20 h-20 rounded-full bg-gold-500/20 border-2 border-gold-500 flex items-center justify-center mx-auto mb-6 text-gold-400 animate-pulse">
              <CheckCircle className="w-10 h-10" />
            </div>

            <span className="text-xs font-semibold text-gold-500 uppercase tracking-widest block mb-1">
              Bron Qabul Qilindi
            </span>
            <h2 className="font-serif text-3xl font-bold text-white mb-3">
              SIZNI KUTIB QOLAMIZ!
            </h2>
            <p className="text-sm text-gray-300 mb-8 leading-relaxed">
              Hurmatli <strong>{bookingSuccess.user?.fullName || fullName}</strong>, sizning broningiz muvaffaqiyatli ro'yxatga olindi.
            </p>

            {/* Summary card */}
            <div className="bg-[#0e1117] border border-gold-500/20 rounded-2xl p-6 text-left space-y-3 mb-8 text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                <span className="text-gray-400">Bron raqami:</span>
                <span className="text-white font-mono font-bold text-xs">#{bookingSuccess.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Barber:</span>
                <span className="text-gold-400 font-semibold">{bookingSuccess.barber?.fullName || selectedBarber?.fullName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Xizmat:</span>
                <span className="text-white">{bookingSuccess.service?.name || selectedService?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Odamlar soni:</span>
                <span className="text-white">{bookingSuccess.peopleCount} kishi ({bookingSuccess.totalDuration} daqiqa)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Sana va Vaqt:</span>
                <span className="text-gold-400 font-bold">{bookingSuccess.date} | {bookingSuccess.startTime} — {bookingSuccess.endTime}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-800 text-base">
                <span className="text-gray-300 font-medium">Umumiy Narx:</span>
                <span className="text-gold-400 font-bold">
                  {bookingSuccess.totalPrice?.toLocaleString()} UZS
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/my-bookings"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-black bg-gold-500 hover:bg-gold-400 transition-colors shadow-lg"
              >
                Mijoz Kabinetida Ko'rish
              </Link>
              <button
                onClick={() => {
                  setBookingSuccess(null);
                  setStep(1);
                  setSelectedTimeSlot(null);
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-xs font-semibold text-gray-300 hover:text-white bg-white/5 border border-gray-700 hover:border-gold-500/40 transition-colors"
              >
                Yangi Bron Qilish
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="glass-panel rounded-3xl p-6 sm:p-10 border-gold-500/25 shadow-2xl">
            {/* STEP 1: SELECT BARBER */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h3 className="font-serif text-2xl font-bold text-white mb-2">
                  1-Qadam: O'zingizga ma'qul Barberni tanlang
                </h3>
                <p className="text-xs text-gray-400 mb-6">
                  Har bir barberning o'z ish uslubi va shaxsiy ish jadvali mavjud.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {barbers.map((barber) => (
                    <div
                      key={barber.id}
                      onClick={() => setSelectedBarberId(barber.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-4 ${
                        selectedBarberId === barber.id
                          ? 'bg-gold-500/15 border-gold-500 shadow-lg shadow-gold-500/10'
                          : 'bg-[#0f1218] border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <img
                        src={barber.image}
                        alt={barber.fullName}
                        onError={handleImgError}
                        className="w-16 h-16 rounded-xl object-cover border border-gold-500/30"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-serif font-bold text-white text-base">
                            {barber.fullName}
                          </h4>
                          {selectedBarberId === barber.id && (
                            <CheckCircle className="w-5 h-5 text-gold-500" />
                          )}
                        </div>
                        <span className="text-[11px] text-gold-400 block font-medium">
                          {barber.experience}
                        </span>
                        <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                          {barber.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <button
                    disabled={!selectedBarberId}
                    onClick={() => setStep(2)}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-black bg-gold-500 hover:bg-gold-400 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Keyingisi: Xizmat Tanlash</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: SELECT SERVICE */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-white">
                      2-Qadam: Xizmat yoki Soch Turmagini tanlang
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Xizmat narxlari va tavsiflari bilan tanishing
                    </p>
                  </div>
                  {selectedBarber && (
                    <div className="text-right hidden sm:block">
                      <span className="text-[11px] text-gray-500 block">Tanlangan usta:</span>
                      <span className="text-xs font-semibold text-gold-400">{selectedBarber.fullName}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => setSelectedServiceId(service.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 ${
                        selectedServiceId === service.id
                          ? 'bg-gold-500/15 border-gold-500 shadow-lg shadow-gold-500/10'
                          : 'bg-[#0f1218] border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <img
                        src={service.image}
                        alt={service.name}
                        onError={handleImgError}
                        className="w-16 h-16 rounded-xl object-cover border border-gold-500/30 shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-serif font-bold text-white text-base">
                            {service.name}
                          </h4>
                          {selectedServiceId === service.id && (
                            <CheckCircle className="w-5 h-5 text-gold-500" />
                          )}
                        </div>
                        <span className="text-sm font-bold text-gold-400 block mt-1">
                          {service.price.toLocaleString()} UZS
                        </span>
                        <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                          {service.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-semibold text-gray-400 hover:text-white flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Orqaga</span>
                  </button>

                  <button
                    disabled={!selectedServiceId}
                    onClick={() => setStep(3)}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-black bg-gold-500 hover:bg-gold-400 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Keyingisi: Mehmonlar Soni</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: PEOPLE COUNT & DURATION CALCULATION */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h3 className="font-serif text-2xl font-bold text-white mb-2">
                  3-Qadam: Keladigan Odamlar Soni
                </h3>
                <p className="text-xs text-gray-400 mb-6">
                  Har bir odam uchun standart 45 daqiqa ajratiladi. Vaqt va narx avtomatik hisoblanadi.
                </p>

                {/* People options: 1, 2, 3, 4 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  {[1, 2, 3, 4].map((count) => {
                    const dur = count * 45;
                    const price = (selectedService?.price || 0) * count;
                    return (
                      <div
                        key={count}
                        onClick={() => setPeopleCount(count)}
                        className={`p-5 rounded-2xl border text-center cursor-pointer transition-all ${
                          peopleCount === count
                            ? 'bg-gold-500/20 border-gold-500 ring-2 ring-gold-500/30'
                            : 'bg-[#0f1218] border-gray-800 hover:border-gray-700'
                        }`}
                      >
                        <Users className={`w-8 h-8 mx-auto mb-2 ${peopleCount === count ? 'text-gold-500' : 'text-gray-400'}`} />
                        <h4 className="font-bold text-white text-lg">{count} kishi</h4>
                        <span className="text-xs font-semibold text-gold-400 block mt-1">
                          {dur} daqiqa
                        </span>
                        <span className="text-[11px] text-gray-400 block mt-1">
                          {price.toLocaleString()} UZS
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Calculation info box */}
                <div className="p-4 rounded-xl bg-charcoal-800 border border-gold-500/20 flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-500 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-white text-sm font-semibold">
                      Bron davomiyligi: <span className="text-gold-400">{peopleCount * 45} daqiqa</span> ({peopleCount} x 45 daq)
                    </h5>
                    <p className="text-xs text-gray-400">
                      Backend keyingi qadamda aynan {peopleCount * 45} daqiqa uzluksiz bo'sh vaqtlarni tekshirib beradi.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-semibold text-gray-400 hover:text-white flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Orqaga</span>
                  </button>

                  <button
                    onClick={() => setStep(4)}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-black bg-gold-500 hover:bg-gold-400 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Keyingisi: Sana va Bo'sh Vaqtlar</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: DATE & AVAILABLE TIME SLOTS (CALCULATED BY BACKEND ENGINE) */}
            {step === 4 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h3 className="font-serif text-2xl font-bold text-white mb-2">
                  4-Qadam: Sanani va Bo'sh Vaqtni tanlang
                </h3>
                <p className="text-xs text-gray-400 mb-6">
                  {selectedBarber?.fullName} uchun {peopleCount * 45} daqiqalik haqiqiy bo'sh vaqtlar:
                </p>

                {/* Date Picker */}
                <div className="mb-6">
                  <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                    Tashrif Sanasi:
                  </label>
                  <div className="relative max-w-xs">
                    <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-500" />
                    <input
                      type="date"
                      min={todayStr}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-[#0b0d10] border border-gold-500/40 text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 text-sm font-medium"
                    />
                  </div>
                </div>

                {/* Available Slots Grid */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                      Mavjud bo'sh vaqtlar ({selectedDate}):
                    </span>
                    {loadingSlots && (
                      <span className="text-xs text-gold-400 flex items-center gap-1.5 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-gold-500 animate-ping" />
                        Backenddan tekshirilmoqda...
                      </span>
                    )}
                  </div>

                  {loadingSlots ? (
                    <div className="py-12 text-center text-gray-500 text-sm">
                      Bo'sh vaqtlar yuklanmoqda...
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-charcoal-800 border border-gray-800 text-center">
                      <Clock className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                      <h5 className="text-white text-base font-semibold">Ushbu kunda bo'sh vaqt topilmadi</h5>
                      <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                        Barber dam olish kunida bo'lishi yoki barcha vaqtlar band qilingan bo'lishi mumkin. Boshqa sanani tanlab ko'ring.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-72 overflow-y-auto pr-1">
                      {availableSlots.map((slot) => {
                        const isSelected = selectedTimeSlot?.startTime === slot.startTime;
                        return (
                          <button
                            key={slot.startTime}
                            type="button"
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`p-3 rounded-xl text-center border transition-all ${
                              isSelected
                                ? 'bg-gold-500 text-black border-gold-500 font-bold ring-2 ring-gold-500/30 shadow-md'
                                : 'bg-[#0f1218] border-gray-800 text-gray-200 hover:border-gold-500/50 hover:text-white'
                            }`}
                          >
                            <span className="block text-sm font-semibold">{slot.startTime}</span>
                            <span className={`block text-[10px] ${isSelected ? 'text-black/80' : 'text-gray-400'}`}>
                              {slot.endTime} gacha
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3">
                  <button
                    onClick={() => setStep(3)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-semibold text-gray-400 hover:text-white flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Orqaga</span>
                  </button>

                  <button
                    disabled={!selectedTimeSlot}
                    onClick={() => setStep(5)}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-black bg-gold-500 hover:bg-gold-400 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Keyingisi: Ma'lumotlarni Tasdiqlash</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: CUSTOMER INFORMATION & CONFIRMATION */}
            {step === 5 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h3 className="font-serif text-2xl font-bold text-white mb-2">
                  5-Qadam: Ma'lumotlaringiz va Bronni Tasdiqlash
                </h3>
                <p className="text-xs text-gray-400 mb-6">
                  Bron qilishni yakunlash uchun aloqa ma'lumotlaringizni tekshiring.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Left: Summary */}
                  <div className="p-6 rounded-2xl bg-[#0e1117] border border-gold-500/30 space-y-3 text-sm">
                    <h4 className="font-serif font-bold text-gold-400 text-base border-b border-gray-800 pb-2">
                      Bron Tafsilotlari
                    </h4>

                    <div className="flex justify-between">
                      <span className="text-gray-400">Barber:</span>
                      <span className="text-white font-medium">{selectedBarber?.fullName}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-400">Xizmat:</span>
                      <span className="text-white font-medium">{selectedService?.name}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-400">Odamlar soni:</span>
                      <span className="text-white font-medium">{peopleCount} kishi</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-400">Davomiyligi:</span>
                      <span className="text-gold-400 font-semibold">{totalDurationMinutes} daqiqa</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-400">Sana:</span>
                      <span className="text-white font-medium">{selectedDate}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-400">Vaqt oralig'i:</span>
                      <span className="text-gold-400 font-bold">{selectedTimeSlot?.startTime} — {selectedTimeSlot?.endTime}</span>
                    </div>

                    <div className="flex justify-between pt-3 border-t border-gray-800 text-base">
                      <span className="text-gray-300 font-semibold">Jami To'lov:</span>
                      <span className="text-gold-400 font-bold">
                        {totalPrice.toLocaleString()} UZS
                      </span>
                    </div>
                  </div>

                  {/* Right: Customer Inputs */}
                  <form onSubmit={handleConfirmBooking} id="booking-confirm-form" className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-1.5">
                        Ism va Familiyangiz *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          required
                          placeholder="Alisher Navoiy"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-[#0b0d10] border border-gray-700 focus:border-gold-500 text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-1.5">
                        Telefon Raqamingiz *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          required
                          placeholder="+998 90 123 45 67"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-[#0b0d10] border border-gray-700 focus:border-gold-500 text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm"
                        />
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1">
                        Bron haqida ma'lumot shu raqam bilan kabinetingizda saqlanadi.
                      </p>
                    </div>

                    <div className="pt-2 text-xs text-gray-400 flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                      <span>
                        Tasdiqlash tugmasini bosganingizdan so'ng, ushbu vaqt bazada tranzaksiya orqali zudlik bilan band qilinadi.
                      </span>
                    </div>
                  </form>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3">
                  <button
                    onClick={() => setStep(4)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-semibold text-gray-400 hover:text-white flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Orqaga</span>
                  </button>

                  <button
                    type="submit"
                    form="booking-confirm-form"
                    disabled={submitting}
                    className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-wider text-black bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 hover:from-gold-300 hover:to-gold-500 disabled:opacity-50 shadow-xl shadow-gold-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <span className="inline-block w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Bronni Yakunlash</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
