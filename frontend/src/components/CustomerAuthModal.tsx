import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, User as UserIcon, Scissors, CheckCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/client';

export const CustomerAuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, identifyCustomer, customer } = useAuth();
  const [fullName, setFullName] = useState(customer?.fullName || '');
  const [phone, setPhone] = useState(customer?.phone || '+998 ');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (fullName.trim().length < 2) {
      setError("Iltimos, ism va familiyangizni to'liq kiriting");
      return;
    }

    if (phone.trim().length < 9) {
      setError("Iltimos, to'liq telefon raqamingizni kiriting");
      return;
    }

    try {
      setLoading(true);
      await identifyCustomer(fullName.trim(), phone.trim());
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        closeAuthModal();
      }, 1200);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md max-h-[92vh] overflow-y-auto bg-[#12141a] border border-gold-500/30 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl shadow-gold-500/10"
        >
          {/* Close button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gold-500/10 border border-gold-500/30 mb-3 text-gold-500">
              <Scissors className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold font-serif text-white tracking-wide">
              {customer ? "Profilni Yangilash" : "Xush Kelibsiz"}
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Onlayn bron qilish va shaxsiy kabinetingizga kirish uchun ma'lumotlaringizni kiriting
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-200 text-sm"
            >
              {error}
            </motion.div>
          )}

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center"
            >
              <CheckCircle className="w-16 h-16 text-gold-500 mx-auto mb-3 animate-bounce" />
              <h4 className="text-xl font-semibold text-white">Muvaffaqiyatli saqlandi!</h4>
              <p className="text-sm text-gray-400 mt-1">Xush kelibsiz, {fullName}!</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-1.5">
                  Ism va Familiya
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Alisher Navoiy"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#0b0d10] border border-gray-700 focus:border-gold-500 text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-500 transition-colors text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-1.5">
                  Telefon Raqami
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    required
                    placeholder="+998 90 123 45 67"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#0b0d10] border border-gray-700 focus:border-gold-500 text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-500 transition-colors text-sm"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Keyingi safar ushbu raqam orqali sizni avtomatik taniymiz
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-6 rounded-xl font-semibold text-black bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 hover:from-gold-300 hover:to-gold-500 shadow-lg shadow-gold-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Tasdiqlash va Kirish</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-gray-800 text-center">
            <span className="text-xs text-gray-500">
              Shaxsiy ma'lumotlaringiz xavfsiz saqlanadi va uchinchi shaxslarga berilmaydi.
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
