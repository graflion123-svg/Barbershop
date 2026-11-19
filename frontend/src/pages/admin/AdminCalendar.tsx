import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Filter,
  User,
  Clock,
  Scissors,
  RefreshCw,
  X
} from 'lucide-react';
import {
  format,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  parseISO
} from 'date-fns';
import { api, getErrorMessage } from '../../api/client';
import { Booking, Barber } from '../../types';

export const AdminCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [selectedBarberId, setSelectedBarberId] = useState<string>('ALL');
  const [events, setEvents] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Booking | null>(null);

  // Fetch Barbers
  useEffect(() => {
    api.get('/barbers/admin/all')
      .then((res) => {
        if (res.data.success) {
          setBarbers(res.data.barbers);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Fetch Calendar Events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      let startDate: string;
      let endDate: string;

      if (viewMode === 'day') {
        startDate = format(currentDate, 'yyyy-MM-dd');
        endDate = startDate;
      } else {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        const end = endOfWeek(currentDate, { weekStartsOn: 1 });
        startDate = format(start, 'yyyy-MM-dd');
        endDate = format(end, 'yyyy-MM-dd');
      }

      const res = await api.get('/bookings/admin/calendar', {
        params: {
          startDate,
          endDate,
          barberId: selectedBarberId !== 'ALL' ? selectedBarberId : undefined,
        },
      });

      if (res.data.success) {
        setEvents(res.data.events);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentDate, viewMode, selectedBarberId]);

  // Navigate dates
  const handlePrev = () => {
    if (viewMode === 'day') {
      setCurrentDate((d) => subDays(d, 1));
    } else {
      setCurrentDate((d) => subDays(d, 7));
    }
  };

  const handleNext = () => {
    if (viewMode === 'day') {
      setCurrentDate((d) => addDays(d, 1));
    } else {
      setCurrentDate((d) => addDays(d, 7));
    }
  };

  // Week days calculation
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: endOfWeek(currentDate, { weekStartsOn: 1 }),
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            BRONLAR KALENDARI
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Ustalarning bandlik jadvali, qabullar vaqti va taqvimi
          </p>
        </div>

        {/* View Mode & Barber Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Barber filter */}
          <select
            value={selectedBarberId}
            onChange={(e) => setSelectedBarberId(e.target.value)}
            className="bg-[#12141a] border border-gray-700 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-gold-500"
          >
            <option value="ALL">Barcha Barberlar</option>
            {barbers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.fullName}
              </option>
            ))}
          </select>

          {/* Mode toggle */}
          <div className="bg-[#12141a] p-1 rounded-xl border border-gray-700 flex items-center">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'day' ? 'bg-gold-500 text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Kunlik
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'week' ? 'bg-gold-500 text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Haftalik
            </button>
          </div>

          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-gray-700 text-gray-300 hover:text-white"
          >
            Bugun
          </button>
        </div>
      </div>

      {/* Date Navigation Bar */}
      <div className="glass-panel p-4 rounded-2xl border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-2 rounded-xl bg-charcoal-800 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-2 rounded-xl bg-charcoal-800 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <span className="font-serif text-base sm:text-lg font-bold text-white ml-2">
            {viewMode === 'day'
              ? format(currentDate, 'EEEE, d-MMMM yyyy')
              : `${format(weekDays[0], 'd-MMM')} — ${format(weekDays[6], 'd-MMM yyyy')}`}
          </span>
        </div>

        <button
          onClick={fetchEvents}
          className="p-2 text-gray-400 hover:text-white transition-colors"
          title="Yangilash"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* CALENDAR BODY */}
      <div className="glass-panel rounded-2xl border-white/5 p-4 sm:p-6 overflow-x-auto">
        {viewMode === 'week' ? (
          <div className="grid grid-cols-7 gap-3 min-w-[700px]">
            {weekDays.map((day: Date) => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const isToday = isSameDay(day, new Date());
              const dayEvents = events.filter((e) => e.date === dayStr);

              return (
                <div
                  key={dayStr}
                  className={`rounded-2xl p-3 border flex flex-col min-h-[420px] ${
                    isToday
                      ? 'bg-gold-500/10 border-gold-500/50'
                      : 'bg-[#0e1117] border-gray-800'
                  }`}
                >
                  {/* Day Header */}
                  <div className="text-center pb-2 border-b border-gray-800/80 mb-3">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">
                      {format(day, 'EEE')}
                    </span>
                    <span
                      className={`text-sm font-serif font-bold inline-block px-2 py-0.5 rounded-full mt-0.5 ${
                        isToday ? 'bg-gold-500 text-black' : 'text-white'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                  </div>

                  {/* Day Appointments */}
                  <div className="flex-1 space-y-2 overflow-y-auto">
                    {dayEvents.length === 0 ? (
                      <span className="text-[11px] text-gray-600 block text-center mt-6">
                        Bron yo'q
                      </span>
                    ) : (
                      dayEvents.map((evt) => (
                        <div
                          key={evt.id}
                          onClick={() => setSelectedEvent(evt)}
                          className={`p-2 rounded-xl text-[11px] cursor-pointer transition-all border ${
                            evt.status === 'CONFIRMED'
                              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200 hover:border-emerald-500'
                              : evt.status === 'PENDING'
                              ? 'bg-amber-950/40 border-amber-500/30 text-amber-200 hover:border-amber-500'
                              : evt.status === 'COMPLETED'
                              ? 'bg-blue-950/40 border-blue-500/30 text-blue-200 hover:border-blue-500'
                              : 'bg-red-950/40 border-red-500/30 text-red-300 opacity-60'
                          }`}
                        >
                          <div className="font-bold font-mono">
                            {evt.startTime} — {evt.endTime}
                          </div>
                          <div className="font-semibold truncate text-white">
                            {evt.user?.fullName}
                          </div>
                          <div className="text-[10px] opacity-75 truncate">
                            {evt.barber?.fullName}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Day View */
          <div className="space-y-3 max-w-2xl mx-auto">
            {events.length === 0 ? (
              <div className="py-16 text-center text-gray-500 text-xs">
                Bu kun uchun hech qanday bron mavjud emas
              </div>
            ) : (
              events.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className="glass-panel p-4 rounded-xl border-gray-800 hover:border-gold-500/40 cursor-pointer flex items-center justify-between text-xs transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold text-gold-400 text-sm">
                      {evt.startTime} — {evt.endTime}
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm">
                        {evt.user?.fullName}
                      </h4>
                      <p className="text-gray-400">
                        {evt.service?.name} • Barber: <strong className="text-gold-400">{evt.barber?.fullName}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-emerald-400 block">
                      {evt.totalPrice?.toLocaleString()} UZS
                    </span>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase">
                      {evt.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* EVENT DETAILS MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#12141a] border border-gold-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800 mb-4">
              <h3 className="font-serif text-lg font-bold text-white">
                Bron Ma'lumotlari (#{selectedEvent.id.slice(0, 8)})
              </h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs mb-6">
              <div className="flex justify-between">
                <span className="text-gray-400">Mijoz:</span>
                <span className="text-white font-semibold">{selectedEvent.user?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Telefon:</span>
                <span className="text-white font-mono">{selectedEvent.user?.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Barber:</span>
                <span className="text-gold-400 font-semibold">{selectedEvent.barber?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Xizmat:</span>
                <span className="text-white">{selectedEvent.service?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Sana:</span>
                <span className="text-white font-medium">{selectedEvent.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Vaqt:</span>
                <span className="text-gold-400 font-bold">{selectedEvent.startTime} — {selectedEvent.endTime} ({selectedEvent.totalDuration} daqiqa)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Odamlar soni:</span>
                <span className="text-white">{selectedEvent.peopleCount} kishi</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-800 text-sm">
                <span className="text-gray-300 font-semibold">Umumiy Narx:</span>
                <span className="text-emerald-400 font-bold">
                  {selectedEvent.totalPrice?.toLocaleString()} UZS
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-gray-300 hover:text-white bg-white/5 border border-gray-700"
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
