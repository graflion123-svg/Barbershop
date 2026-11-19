import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Scissors,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { api, getErrorMessage } from '../../api/client';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/dashboard-stats');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleQuickStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      setUpdatingId(bookingId);
      const res = await api.patch(`/bookings/admin/${bookingId}/status`, {
        status: newStatus,
      });
      if (res.data.success) {
        // Refresh dashboard data
        await fetchStats();
      }
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && !data) {
    return (
      <div className="py-24 text-center text-gray-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gold-500" />
        <p className="text-xs">Statistika yuklanmoqda...</p>
      </div>
    );
  }

  const kpi = data?.kpi || {};
  const todayBookings = data?.todayBookings || [];
  const dailyChart = data?.dailyChart || [];
  const topServices = data?.topServices || [];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            BARBERSHOP BOSHQARUV PANELI
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Bugungi ko'rsatkichlar, real vaqtdagi bronlar va moliyaviy tushum
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white bg-charcoal-800 border border-gray-700 hover:border-gold-500/40 transition-colors"
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

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Clients */}
        <div className="glass-panel p-5 rounded-2xl border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Jami Mijozlar
            </span>
            <div className="p-2 rounded-lg bg-gold-500/10 text-gold-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-white block">
            {kpi.totalClients || 0}
          </span>
          <span className="text-[11px] text-gray-500 mt-1 block">Bazadagi ro'yxatga olinganlar</span>
        </div>

        {/* Today's Bookings */}
        <div className="glass-panel p-5 rounded-2xl border-gold-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gold-400">
              Bugungi Bronlar
            </span>
            <div className="p-2 rounded-lg bg-gold-500/20 text-gold-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-gold-400 block">
            {kpi.todayBookings || 0}
          </span>
          <span className="text-[11px] text-gray-400 mt-1 block">Bugungi qabulga yozilganlar</span>
        </div>

        {/* Pending & Confirmed */}
        <div className="glass-panel p-5 rounded-2xl border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Kutilmoqda / Tasdiqlangan
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-white block">
              {kpi.pendingBookings || 0}
            </span>
            <span className="text-xs text-emerald-400 font-semibold">
              / {kpi.confirmedBookings || 0} tasdiqlangan
            </span>
          </div>
          <span className="text-[11px] text-gray-500 mt-1 block">Status bo'yicha</span>
        </div>

        {/* Total Revenue */}
        <div className="glass-panel p-5 rounded-2xl border-emerald-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Umumiy Tushum
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-bold text-emerald-400 block truncate">
            {(kpi.totalRevenue || 0).toLocaleString()} <span className="text-xs">UZS</span>
          </span>
          <span className="text-[11px] text-gray-400 mt-1 block">Tasdiqlangan & Tugallangan</span>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Bookings Trend (7 Days) */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-2xl border-white/5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-serif text-lg font-bold text-white">
                Oxirgi 7 Kunlik Bronlar Dinamikasi
              </h3>
              <p className="text-xs text-gray-400">Kunlik mijozlar oqimi va tushum</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyChart}>
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f242d" />
                <XAxis dataKey="label" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#12141a',
                    borderColor: '#d4af37',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  name="Bronlar soni"
                  stroke="#d4af37"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#goldGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Booked Services */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-2xl border-white/5 flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-white mb-1">
              Eng Ommabop Xizmatlar
            </h3>
            <p className="text-xs text-gray-400 mb-6">Buyurtma soniga ko'ra</p>

            <div className="space-y-4">
              {topServices.length === 0 ? (
                <p className="text-xs text-gray-500 py-8 text-center">Ma'lumot mavjud emas</p>
              ) : (
                topServices.map((service: any, index: number) => (
                  <div key={service.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-200 font-medium truncate max-w-[180px]">
                        {index + 1}. {service.name}
                      </span>
                      <span className="text-gold-400 font-bold">
                        {service.bookingsCount} ta
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-charcoal-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gold-500 rounded-full"
                        style={{
                          width: `${Math.min(100, (service.bookingsCount / (topServices[0]?.bookingsCount || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            to="/admin/services"
            className="mt-6 inline-flex items-center justify-center gap-2 py-2 text-xs text-gold-400 hover:text-gold-300 font-semibold border-t border-white/5"
          >
            <span>Barcha xizmatlarni boshqarish</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* TODAY'S APPOINTMENT FEED */}
      <div className="glass-panel p-6 rounded-2xl border-white/5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-serif text-lg font-bold text-white">
              Bugungi Qabullar Jadvali ({todayBookings.length})
            </h3>
            <p className="text-xs text-gray-400">Bugun tashrif buyuradigan mijozlar ro'yxati</p>
          </div>

          <Link
            to="/admin/bookings"
            className="text-xs text-gold-400 font-semibold hover:text-gold-300 flex items-center gap-1.5"
          >
            <span>To'liq bronlar ro'yxati</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {todayBookings.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-xs">
            Bugun uchun rejalashtirilgan bronlar yo'q
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0e1117] text-gray-400 uppercase font-mono tracking-wider border-b border-gray-800">
                <tr>
                  <th className="py-3 px-4">Vaqt</th>
                  <th className="py-3 px-4">Mijoz</th>
                  <th className="py-3 px-4">Telefon</th>
                  <th className="py-3 px-4">Barber</th>
                  <th className="py-3 px-4">Xizmat</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {todayBookings.map((b: any) => (
                  <tr key={b.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-gold-400">
                      {b.startTime} — {b.endTime}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white">
                      {b.user?.fullName}
                    </td>
                    <td className="py-3.5 px-4 text-gray-300">
                      {b.user?.phone}
                    </td>
                    <td className="py-3.5 px-4 text-gray-300">
                      {b.barber?.fullName}
                    </td>
                    <td className="py-3.5 px-4 text-gray-300">
                      {b.service?.name}
                    </td>
                    <td className="py-3.5 px-4">
                      {b.status === 'CONFIRMED' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold">
                          Tasdiqlangan
                        </span>
                      )}
                      {b.status === 'PENDING' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-400 font-semibold">
                          Kutilmoqda
                        </span>
                      )}
                      {b.status === 'COMPLETED' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/20 text-blue-400 font-semibold">
                          Tugallandi
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      {b.status === 'PENDING' && (
                        <button
                          disabled={updatingId === b.id}
                          onClick={() => handleQuickStatusChange(b.id, 'CONFIRMED')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold"
                        >
                          Tasdiqlash
                        </button>
                      )}
                      {b.status === 'CONFIRMED' && (
                        <button
                          disabled={updatingId === b.id}
                          onClick={() => handleQuickStatusChange(b.id, 'COMPLETED')}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold"
                        >
                          Yakunlash
                        </button>
                      )}
                      <button
                        disabled={updatingId === b.id}
                        onClick={() => handleQuickStatusChange(b.id, 'CANCELLED')}
                        className="px-2.5 py-1 rounded-lg bg-red-900/60 hover:bg-red-800 text-red-200 text-[11px]"
                      >
                        Bekor qilish
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
