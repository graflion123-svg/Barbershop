import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  User,
  Scissors,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Plus,
  Phone,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { api, getErrorMessage } from '../api/client';
import { Booking } from '../types';
import { useAuth } from '../context/AuthContext';

export const MyBookingsPage: React.FC = () => {
  const { customer, openAuthModal } = useAuth();
  const [phoneQuery, setPhoneQuery] = useState(customer?.phone || '');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);

  const fetchBookings = async (phone: string) => {
    if (!phone.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/bookings/my-bookings', {
        params: { phone: phone.trim() },
      });
      if (res.data.success) {
        setBookings(res.data.bookings || []);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customer?.phone) {
      setPhoneQuery(customer.phone);
      fetchBookings(customer.phone);
    }
  }, [customer]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookings(phoneQuery);
  };

  const handleCancelBooking = async () => {
    if (!cancelModalBooking) return;
    try {
      setCancellingId(cancelModalBooking.id);
      const res = await api.post(`/bookings/${cancelModalBooking.id}/cancel`, {
        phone: cancelModalBooking.user.phone,
      });

      if (res.data.success) {
        // Update local state
        setBookings((prev) =>
          prev.map((b) =>
            b.id === cancelModalBooking.id ? { ...b, status: 'CANCELLED' } : b
          )
        );
        setCancelModalBooking(null);
      }
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setCancellingId(null);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Tasdiqlangan
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            Kutilmoqda
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            Tugallangan
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
            Bekor qilingan
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[#0a0c10]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
              MIJOZ KABINETI
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Shaxsiy bronlaringiz, kelish vaqtlari va tashriflar tarixi
            </p>
          </div>

          <Link
            to="/book"
            className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-black bg-gold-500 hover:bg-gold-400 flex items-center gap-2 transition-colors shadow-lg shadow-gold-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi Bron Qilish</span>
          </Link>
        </div>

        {/* Customer Profile card or phone lookup */}
        <div className="glass-panel rounded-2xl p-6 mb-8 border-gold-500/20">
          {customer ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400 font-serif font-bold text-xl">
                  {customer.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-white">
                    {customer.fullName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-gold-500" />
                    <span>{customer.phone}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={openAuthModal}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-gray-700 hover:border-gold-500/40 text-gray-300 hover:text-white transition-colors"
                >
                  Ma'lumotlarni tahrirlash
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">
                Bronlaringizni ko'rish uchun telefon raqamingizni kiriting:
              </h3>
              <form onSubmit={handleManualSearch} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="tel"
                  placeholder="+998 90 123 45 67"
                  value={phoneQuery}
                  onChange={(e) => setPhoneQuery(e.target.value)}
                  className="flex-1 bg-[#0b0d10] border border-gray-700 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-gold-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-black bg-gold-500 hover:bg-gold-400 transition-colors"
                >
                  {loading ? 'Qidirilmoqda...' : 'Bronlarni Ko\'rish'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Global Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Bookings List */}
        <div>
          <h2 className="font-serif text-xl font-bold text-white mb-4">
            Bronlar Ro'yxati ({bookings.length})
          </h2>

          {loading ? (
            <div className="py-12 text-center text-gray-500 text-sm">
              Bronlar yuklanmoqda...
            </div>
          ) : bookings.length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center border-gray-800">
              <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <h4 className="text-white font-semibold text-base mb-1">
                Hozircha hech qanday bron mavjud emas
              </h4>
              <p className="text-xs text-gray-400 max-w-sm mx-auto mb-6">
                Siz hali qabulga yozilmadingiz. Sevimli ustangiz va qulay vaqtingizni hoziroq band qiling.
              </p>
              <Link
                to="/book"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-black bg-gold-500 hover:bg-gold-400 transition-colors"
              >
                <span>Hozirroq Bron Qilish</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="glass-panel rounded-2xl p-5 sm:p-6 border-gold-500/20 hover:border-gold-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  {/* Left: Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-gray-400">
                        #{booking.id.slice(0, 8).toUpperCase()}
                      </span>
                      {statusBadge(booking.status)}
                    </div>

                    <h3 className="font-serif text-xl font-bold text-white">
                      {booking.service?.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1.5 text-gold-400 font-medium">
                        <User className="w-3.5 h-3.5" />
                        <span>Barber: {booking.barber?.fullName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-300">
                        <Calendar className="w-3.5 h-3.5 text-gold-500" />
                        <span>{booking.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-300">
                        <Clock className="w-3.5 h-3.5 text-gold-500" />
                        <span>{booking.startTime} — {booking.endTime} ({booking.totalDuration} daq)</span>
                      </div>
                      <div className="text-gray-300">
                        <span>{booking.peopleCount} kishi</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Price & Cancel Action */}
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 pt-4 md:pt-0 border-gray-800 gap-3">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-gray-500 uppercase block">Jami</span>
                      <span className="text-base font-bold text-gold-400">
                        {booking.totalPrice?.toLocaleString()} UZS
                      </span>
                    </div>

                    {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                      <button
                        onClick={() => setCancelModalBooking(booking)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-white hover:bg-red-950/60 border border-red-500/30 transition-colors"
                      >
                        Bronni Bekor Qilish
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cancellation Confirmation Modal */}
        <AnimatePresence>
          {cancelModalBooking && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-[#12141a] border border-red-500/40 rounded-2xl p-6 text-center"
              >
                <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4 text-red-400">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-xl font-bold text-white mb-2">
                  Bronni bekor qilmoqchimisiz?
                </h3>
                <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                  <strong>{cancelModalBooking.date}</strong> kuni soat <strong>{cancelModalBooking.startTime}</strong> ga
                  rejalashtirilgan broningiz bekor qilinadi va ushbu vaqt boshqa mijozlar uchun ochiladi.
                </p>

                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setCancelModalBooking(null)}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-gray-300 hover:text-white bg-white/5 border border-gray-700"
                  >
                    Bekor Qilmaslik
                  </button>
                  <button
                    disabled={!!cancellingId}
                    onClick={handleCancelBooking}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {cancellingId ? 'Bekor qilinmoqda...' : 'Ha, Bekor Qilinsin'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
