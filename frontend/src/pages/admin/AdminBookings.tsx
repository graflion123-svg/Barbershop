import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  Scissors,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Edit,
  Eye,
  RefreshCw,
  Phone
} from 'lucide-react';
import { api, getErrorMessage } from '../../api/client';
import { Booking, Barber, Service } from '../../types';

export const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [barberFilter, setBarberFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');

  // Modals
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (barberFilter !== 'ALL') params.barberId = barberFilter;
      if (dateFilter) params.date = dateFilter;
      if (search.trim()) params.search = search.trim();

      const [bookingsRes, barbersRes, servicesRes] = await Promise.all([
        api.get('/bookings/admin/all', { params }),
        api.get('/barbers/admin/all'),
        api.get('/services/admin/all'),
      ]);

      if (bookingsRes.data.success) setBookings(bookingsRes.data.bookings);
      if (barbersRes.data.success) setBarbers(barbersRes.data.barbers);
      if (servicesRes.data.success) setServices(servicesRes.data.services);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, barberFilter, dateFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      setActionLoading(true);
      const res = await api.patch(`/bookings/admin/${id}/status`, { status });
      if (res.data.success) {
        setBookings(prev => prev.map(b => (b.id === id ? { ...b, status: status as any } : b)));
      }
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!window.confirm("Rostdan ham ushbu bronni o'chirmoqchimisiz?")) return;
    try {
      setActionLoading(true);
      const res = await api.delete(`/bookings/admin/${id}`);
      if (res.data.success) {
        setBookings(prev => prev.filter(b => b.id !== id));
      }
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;
    try {
      setActionLoading(true);
      const res = await api.put(`/bookings/admin/${editingBooking.id}`, {
        barberId: editingBooking.barberId,
        serviceId: editingBooking.serviceId,
        date: editingBooking.date,
        startTime: editingBooking.startTime,
        peopleCount: editingBooking.peopleCount,
        status: editingBooking.status,
      });

      if (res.data.success) {
        setBookings(prev => prev.map(b => (b.id === editingBooking.id ? res.data.booking : b)));
        setEditingBooking(null);
      }
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            CONFIRMED
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            PENDING
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            COMPLETED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
            CANCELLED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            BRONLAR BOSHQARUVI
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Barcha onlayn bronlarni nazorat qilish, tasdiqlash va tahrirlash
          </p>
        </div>

        <button
          onClick={fetchBookings}
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

      {/* FILTER BAR */}
      <div className="glass-panel p-4 rounded-2xl border-white/5 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search box */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Ism, telefon yoki xizmat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0b0d10] border border-gray-700 text-white pl-9 pr-3 py-2 rounded-xl text-xs focus:outline-none focus:border-gold-500"
            />
          </form>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#0b0d10] border border-gray-700 text-white px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-gold-500"
            >
              <option value="ALL">Barcha holatlar (All Status)</option>
              <option value="PENDING">Kutilmoqda (Pending)</option>
              <option value="CONFIRMED">Tasdiqlangan (Confirmed)</option>
              <option value="COMPLETED">Tugallangan (Completed)</option>
              <option value="CANCELLED">Bekor qilingan (Cancelled)</option>
            </select>
          </div>

          {/* Barber filter */}
          <div>
            <select
              value={barberFilter}
              onChange={(e) => setBarberFilter(e.target.value)}
              className="w-full bg-[#0b0d10] border border-gray-700 text-white px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-gold-500"
            >
              <option value="ALL">Barcha barberlar</option>
              {barbers.map(b => (
                <option key={b.id} value={b.id}>{b.fullName}</option>
              ))}
            </select>
          </div>

          {/* Date filter */}
          <div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full bg-[#0b0d10] border border-gray-700 text-white px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-gold-500"
            />
          </div>
        </div>

        {/* Clear filter shortcut */}
        {(statusFilter !== 'ALL' || barberFilter !== 'ALL' || dateFilter || search) && (
          <div className="flex justify-end pt-1">
            <button
              onClick={() => {
                setStatusFilter('ALL');
                setBarberFilter('ALL');
                setDateFilter('');
                setSearch('');
              }}
              className="text-xs text-gold-400 hover:text-gold-300 underline"
            >
              Filtrlarni tozalash
            </button>
          </div>
        )}
      </div>

      {/* BOOKINGS TABLE */}
      <div className="glass-panel rounded-2xl border-white/5 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-gray-500 text-xs">
            Bronlar yuklanmoqda...
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-xs">
            Filtr bo'yicha hech qanday bron topilmadi
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0e1117] text-gray-400 uppercase font-mono tracking-wider border-b border-gray-800">
                <tr>
                  <th className="py-3 px-4">Mijoz</th>
                  <th className="py-3 px-4">Telefon</th>
                  <th className="py-3 px-4">Barber</th>
                  <th className="py-3 px-4">Xizmat</th>
                  <th className="py-3 px-4">Odam</th>
                  <th className="py-3 px-4">Sana va Vaqt</th>
                  <th className="py-3 px-4">Davomiylik</th>
                  <th className="py-3 px-4">Narx</th>
                  <th className="py-3 px-4">Holat</th>
                  <th className="py-3 px-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">
                      {b.user?.fullName}
                    </td>
                    <td className="py-3 px-4 text-gray-300 font-mono text-[11px]">
                      {b.user?.phone}
                    </td>
                    <td className="py-3 px-4 text-gold-400 font-medium">
                      {b.barber?.fullName}
                    </td>
                    <td className="py-3 px-4 text-gray-300 max-w-[140px] truncate">
                      {b.service?.name}
                    </td>
                    <td className="py-3 px-4 text-gray-300 font-bold">
                      {b.peopleCount}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="block text-white font-medium">{b.date}</span>
                      <span className="text-[11px] text-gold-400 font-mono">{b.startTime} — {b.endTime}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-400 font-mono">
                      {b.totalDuration} daq
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-400 whitespace-nowrap">
                      {b.totalPrice?.toLocaleString()} UZS
                    </td>
                    <td className="py-3 px-4">
                      {statusBadge(b.status)}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      {/* Status actions */}
                      {b.status === 'PENDING' && (
                        <button
                          title="Tasdiqlash"
                          onClick={() => handleUpdateStatus(b.id, 'CONFIRMED')}
                          className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {b.status === 'CONFIRMED' && (
                        <button
                          title="Tugallash"
                          onClick={() => handleUpdateStatus(b.id, 'COMPLETED')}
                          className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {b.status !== 'CANCELLED' && (
                        <button
                          title="Bekor qilish"
                          onClick={() => handleUpdateStatus(b.id, 'CANCELLED')}
                          className="p-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600 text-amber-400 hover:text-white transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Edit */}
                      <button
                        title="Tahrirlash"
                        onClick={() => setEditingBooking(b)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        title="O'chirish"
                        onClick={() => handleDeleteBooking(b.id)}
                        className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900 text-red-400 hover:text-white transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#12141a] border border-gold-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <h3 className="font-serif text-xl font-bold text-white mb-4">
              Bronni Tahrirlash (#{editingBooking.id.slice(0, 8)})
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Mijoz: {editingBooking.user?.fullName} ({editingBooking.user?.phone})
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Barber</label>
                  <select
                    value={editingBooking.barberId}
                    onChange={(e) => setEditingBooking({ ...editingBooking, barberId: e.target.value })}
                    className="w-full bg-[#0b0d10] border border-gray-700 text-white px-3 py-2 rounded-xl text-xs"
                  >
                    {barbers.map(b => (
                      <option key={b.id} value={b.id}>{b.fullName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Xizmat</label>
                  <select
                    value={editingBooking.serviceId}
                    onChange={(e) => setEditingBooking({ ...editingBooking, serviceId: e.target.value })}
                    className="w-full bg-[#0b0d10] border border-gray-700 text-white px-3 py-2 rounded-xl text-xs"
                  >
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.price} UZS)</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Sana</label>
                  <input
                    type="date"
                    value={editingBooking.date}
                    onChange={(e) => setEditingBooking({ ...editingBooking, date: e.target.value })}
                    className="w-full bg-[#0b0d10] border border-gray-700 text-white px-2 py-2 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Boshlanish</label>
                  <input
                    type="time"
                    value={editingBooking.startTime}
                    onChange={(e) => setEditingBooking({ ...editingBooking, startTime: e.target.value })}
                    className="w-full bg-[#0b0d10] border border-gray-700 text-white px-2 py-2 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Odamlar soni</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={editingBooking.peopleCount}
                    onChange={(e) => setEditingBooking({ ...editingBooking, peopleCount: Number(e.target.value) })}
                    className="w-full bg-[#0b0d10] border border-gray-700 text-white px-2 py-2 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Bron Holati</label>
                <select
                  value={editingBooking.status}
                  onChange={(e) => setEditingBooking({ ...editingBooking, status: e.target.value as any })}
                  className="w-full bg-[#0b0d10] border border-gray-700 text-white px-3 py-2 rounded-xl text-xs font-semibold"
                >
                  <option value="PENDING">PENDING (Kutilmoqda)</option>
                  <option value="CONFIRMED">CONFIRMED (Tasdiqlangan)</option>
                  <option value="COMPLETED">COMPLETED (Tugallangan)</option>
                  <option value="CANCELLED">CANCELLED (Bekor qilingan)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-white/5"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-black bg-gold-500 hover:bg-gold-400"
                >
                  {actionLoading ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
