import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CalendarDays,
  Clock,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  User,
  Coffee,
  Calendar
} from 'lucide-react';
import { api, getErrorMessage } from '../../api/client';
import { Barber, BarberSchedule, BarberDayOff } from '../../types';

export const AdminSchedule: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [selectedBarberId, setSelectedBarberId] = useState<string>(searchParams.get('barberId') || '');
  const [schedules, setSchedules] = useState<BarberSchedule[]>([]);
  const [daysOff, setDaysOff] = useState<BarberDayOff[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Day Off Form
  const [newDayOffDate, setNewDayOffDate] = useState('');
  const [newDayOffReason, setNewDayOffReason] = useState('');

  const dayNames = [
    'Yakshanba',
    'Dushanba',
    'Seshanba',
    'Chorshanba',
    'Payshanba',
    'Juma',
    'Shanba',
  ];

  // Fetch Barbers
  useEffect(() => {
    api.get('/barbers/admin/all')
      .then((res) => {
        if (res.data.success && res.data.barbers.length > 0) {
          setBarbers(res.data.barbers);
          const initialId = searchParams.get('barberId') || res.data.barbers[0].id;
          setSelectedBarberId(initialId);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [searchParams]);

  // Fetch Selected Barber Schedule & Days Off
  useEffect(() => {
    if (!selectedBarberId) return;

    api.get(`/barbers/${selectedBarberId}`)
      .then((res) => {
        if (res.data.success) {
          const barber = res.data.barber;
          // Sort schedules 0 to 6
          const sorted = (barber.schedules || []).sort(
            (a: BarberSchedule, b: BarberSchedule) => a.dayOfWeek - b.dayOfWeek
          );
          setSchedules(sorted);
          setDaysOff(barber.daysOff || []);
        }
      })
      .catch((err) => console.error(err));
  }, [selectedBarberId]);

  const handleScheduleChange = (index: number, field: keyof BarberSchedule, value: any) => {
    const updated = [...schedules];
    updated[index] = { ...updated[index], [field]: value };
    setSchedules(updated);
  };

  const handleSaveSchedule = async () => {
    try {
      setSaving(true);
      setMessage(null);
      const res = await api.put(`/barbers/admin/${selectedBarberId}/schedule`, {
        schedules: schedules.map((s) => ({
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          breakStart: s.breakStart || null,
          breakEnd: s.breakEnd || null,
          isWorking: s.isWorking,
        })),
      });

      if (res.data.success) {
        setMessage({
          type: 'success',
          text: "Haftalik ish jadvali muvaffaqiyatli saqlandi! Yangi bo'sh vaqtlar mijozlar saytida avtomatik aks etadi.",
        });
      }
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const handleAddDayOff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDayOffDate) return;
    try {
      const res = await api.post(`/barbers/admin/${selectedBarberId}/day-off`, {
        date: newDayOffDate,
        reason: newDayOffReason.trim() || undefined,
      });

      if (res.data.success) {
        setDaysOff((prev) => [...prev, res.data.dayOff]);
        setNewDayOffDate('');
        setNewDayOffReason('');
      }
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handleRemoveDayOff = async (dayOffId: string) => {
    try {
      const res = await api.delete(`/barbers/admin/${selectedBarberId}/day-off/${dayOffId}`);
      if (res.data.success) {
        setDaysOff((prev) => prev.filter((d) => d.id !== dayOffId));
      }
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const selectedBarber = barbers.find((b) => b.id === selectedBarberId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            ISH JADVALI VA DAM OLISH KUNLARI
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Har bir barber uchun ish vaqti, tanaffuslar va ta'til kunlarini boshqarish
          </p>
        </div>

        {/* Barber Picker */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 font-medium hidden sm:inline">Barberni tanlang:</span>
          <select
            value={selectedBarberId}
            onChange={(e) => setSelectedBarberId(e.target.value)}
            className="bg-[#12141a] border border-gold-500/40 text-gold-400 font-semibold px-4 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-gold-500"
          >
            {barbers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.fullName} ({b.experience})
              </option>
            ))}
          </select>
        </div>
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

      {/* WEEKLY SCHEDULE CARD */}
      <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <CalendarDays className="w-5 h-5 text-gold-500" />
            <h2 className="font-serif text-lg font-bold text-white">
              Haftalik Ish Soatlari: {selectedBarber?.fullName}
            </h2>
          </div>

          <button
            onClick={handleSaveSchedule}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-black bg-gold-500 hover:bg-gold-400 transition-colors flex items-center gap-2 shadow-lg shadow-gold-500/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saqlanmoqda...' : 'Jadvalni Saqlash'}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-gray-400 uppercase font-mono tracking-wider border-b border-gray-800">
              <tr>
                <th className="py-3 px-4">Hafta Kuni</th>
                <th className="py-3 px-4">Ish Holati</th>
                <th className="py-3 px-4">Boshlanish Vaqti</th>
                <th className="py-3 px-4">Tugash Vaqti</th>
                <th className="py-3 px-4">Tanaffus Boshlanishi</th>
                <th className="py-3 px-4">Tanaffus Tugashi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {schedules.map((item, index) => (
                <tr
                  key={item.dayOfWeek}
                  className={`hover:bg-white/5 transition-colors ${
                    !item.isWorking ? 'opacity-50 bg-black/20' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 font-semibold text-white">
                    {dayNames[item.dayOfWeek]}
                  </td>

                  <td className="py-3.5 px-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.isWorking}
                        onChange={(e) => handleScheduleChange(index, 'isWorking', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold-500" />
                      <span className="ml-2 text-xs text-gray-300 font-medium">
                        {item.isWorking ? 'Ishlaydi' : 'Dam olish'}
                      </span>
                    </label>
                  </td>

                  <td className="py-3.5 px-4">
                    <input
                      type="time"
                      disabled={!item.isWorking}
                      value={item.startTime}
                      onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                      className="bg-[#0b0d10] border border-gray-700 disabled:border-transparent text-white px-2.5 py-1.5 rounded-lg text-xs"
                    />
                  </td>

                  <td className="py-3.5 px-4">
                    <input
                      type="time"
                      disabled={!item.isWorking}
                      value={item.endTime}
                      onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                      className="bg-[#0b0d10] border border-gray-700 disabled:border-transparent text-white px-2.5 py-1.5 rounded-lg text-xs"
                    />
                  </td>

                  <td className="py-3.5 px-4">
                    <input
                      type="time"
                      disabled={!item.isWorking}
                      value={item.breakStart || ''}
                      onChange={(e) => handleScheduleChange(index, 'breakStart', e.target.value || null)}
                      className="bg-[#0b0d10] border border-gray-700 disabled:border-transparent text-white px-2.5 py-1.5 rounded-lg text-xs"
                    />
                  </td>

                  <td className="py-3.5 px-4">
                    <input
                      type="time"
                      disabled={!item.isWorking}
                      value={item.breakEnd || ''}
                      onChange={(e) => handleScheduleChange(index, 'breakEnd', e.target.value || null)}
                      className="bg-[#0b0d10] border border-gray-700 disabled:border-transparent text-white px-2.5 py-1.5 rounded-lg text-xs"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SPECIAL DAYS OFF (Dam Olish Kunlari) */}
      <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
        <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
          <Coffee className="w-5 h-5 text-gold-500" />
          <div>
            <h3 className="font-serif text-lg font-bold text-white">
              Maxsus Dam Olish Kunlari (Day Off)
            </h3>
            <p className="text-xs text-gray-400">
              Ushbu belgilangan sanalarda mijozlarga bron qilish uchun bo'sh vaqtlar ko'rsatilmaydi
            </p>
          </div>
        </div>

        {/* Add Day Off form */}
        <form onSubmit={handleAddDayOff} className="flex flex-col sm:flex-row gap-3 pt-2">
          <input
            type="date"
            required
            value={newDayOffDate}
            onChange={(e) => setNewDayOffDate(e.target.value)}
            className="bg-[#0b0d10] border border-gray-700 text-white px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-gold-500"
          />
          <input
            type="text"
            placeholder="Sababi (masalan: Ta'til, Bayram, Shaxsiy ish)..."
            value={newDayOffReason}
            onChange={(e) => setNewDayOffReason(e.target.value)}
            className="flex-1 bg-[#0b0d10] border border-gray-700 text-white px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-gold-500"
          />
          <button
            type="submit"
            className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-black bg-gold-500 hover:bg-gold-400 transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Kiritish</span>
          </button>
        </form>

        {/* List of day offs */}
        <div className="pt-2">
          {daysOff.length === 0 ? (
            <p className="text-xs text-gray-500 py-4">Belgilangan maxsus dam olish kunlari yo'q</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {daysOff.map((d) => (
                <div
                  key={d.id}
                  className="p-3 rounded-xl bg-[#0e1117] border border-gray-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white block">{d.date}</span>
                    <span className="text-[11px] text-gray-400 block">{d.reason || "Dam olish kuni"}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveDayOff(d.id)}
                    className="p-1 text-gray-500 hover:text-red-400 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
