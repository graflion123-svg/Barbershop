import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Phone,
  Calendar,
  Clock,
  History,
  X,
  RefreshCw,
  Award,
  Scissors
} from 'lucide-react';
import { api, getErrorMessage } from '../../api/client';

export const AdminClients: React.FC = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClientDetails, setSelectedClientDetails] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/clients', {
        params: { search: search.trim() || undefined },
      });
      if (res.data.success) {
        setClients(res.data.clients);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClients();
  };

  const handleViewDetails = async (clientId: string) => {
    try {
      setDetailsLoading(true);
      const res = await api.get(`/admin/clients/${clientId}`);
      if (res.data.success) {
        setSelectedClientDetails(res.data.client);
      }
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            MIJOZLAR BAZASI
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Barcha ro'yxatdan o'tgan mijozlar, ularning tashriflar soni va tarixi
          </p>
        </div>

        <button
          onClick={fetchClients}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white bg-charcoal-800 border border-gray-700 hover:border-gold-500/40"
        >
          <RefreshCw className="w-3.5 h-3.5 text-gold-500" />
          <span>Yangilash</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs">
          {error}
        </div>
      )}

      {/* SEARCH BAR */}
      <div className="glass-panel p-4 rounded-2xl border-white/5">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Ism yoki telefon raqami orqali qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0b0d10] border border-gray-700 text-white pl-9 pr-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-gold-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-black bg-gold-500 hover:bg-gold-400 transition-colors"
          >
            Qidirish
          </button>
        </form>
      </div>

      {/* CLIENTS TABLE */}
      <div className="glass-panel rounded-2xl border-white/5 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-gray-500 text-xs">
            Mijozlar yuklanmoqda...
          </div>
        ) : clients.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-xs">
            Hech qanday mijoz topilmadi
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0e1117] text-gray-400 uppercase font-mono tracking-wider border-b border-gray-800">
                <tr>
                  <th className="py-3 px-4">Mijoz</th>
                  <th className="py-3 px-4">Telefon</th>
                  <th className="py-3 px-4">Birinchi Tashrif</th>
                  <th className="py-3 px-4">Tashriflar Soni</th>
                  <th className="py-3 px-4">So'nggi Bron</th>
                  <th className="py-3 px-4 text-right">Tarix</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-400 font-bold font-serif">
                          {c.fullName.charAt(0)}
                        </div>
                        <span className="font-semibold text-white">{c.fullName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-300">
                      {c.phone}
                    </td>
                    <td className="py-3.5 px-4 text-gray-400">
                      {new Date(c.createdAt).toLocaleDateString('uz-UZ')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-gold-500/15 text-gold-400 font-bold text-[11px] border border-gold-500/30">
                        {c.totalBookings} marta
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-300">
                      {c.lastBooking ? (
                        <span>
                          {c.lastBooking.date} ({c.lastBooking.service?.name})
                        </span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleViewDetails(c.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-gold-500 hover:text-black border border-gray-700 hover:border-gold-500 text-gray-300 transition-all inline-flex items-center gap-1.5"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>Tarixi</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CLIENT DETAILS & BOOKINGS HISTORY MODAL */}
      {selectedClientDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-[#12141a] border border-gold-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400 font-bold font-serif text-lg">
                  {selectedClientDetails.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-white">
                    {selectedClientDetails.fullName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-gold-500" />
                    <span>{selectedClientDetails.phone}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedClientDetails(null)}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* History Feed */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Bron Tarixi ({selectedClientDetails.bookings?.length || 0}):
              </h4>

              {selectedClientDetails.bookings?.length === 0 ? (
                <p className="text-xs text-gray-500 py-6 text-center">Tarix mavjud emas</p>
              ) : (
                selectedClientDetails.bookings.map((b: any) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-xl bg-[#0e1117] border border-gray-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{b.service?.name}</span>
                        <span className="text-[10px] text-gray-500">#{b.id.slice(0, 6)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-400 mt-1">
                        <span>Barber: <strong className="text-gold-400">{b.barber?.fullName}</strong></span>
                        <span>{b.date} ({b.startTime} - {b.endTime})</span>
                        <span>{b.peopleCount} kishi</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-emerald-400 block">
                        {b.totalPrice?.toLocaleString()} UZS
                      </span>
                      <span className={`text-[10px] font-semibold ${
                        b.status === 'CONFIRMED' ? 'text-emerald-400' :
                        b.status === 'COMPLETED' ? 'text-blue-400' :
                        b.status === 'CANCELLED' ? 'text-red-400' : 'text-amber-400'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-gray-800 flex justify-end">
              <button
                onClick={() => setSelectedClientDetails(null)}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white bg-white/5 border border-gray-700"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
