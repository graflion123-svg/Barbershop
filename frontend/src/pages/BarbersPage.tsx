import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award, Clock, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { api } from '../api/client';
import { Barber } from '../types';

export const BarbersPage: React.FC = () => {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);

  const fallbackImg = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80';
  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = fallbackImg;
  };

  useEffect(() => {
    api.get('/barbers')
      .then(res => {
        if (res.data.success) {
          setBarbers(res.data.barbers);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const dayNames = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-[#0a0c10]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-gold-500/10 text-gold-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mutaxassislarimiz</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
            BIZNING BARBERLAR
          </h1>
          <div className="w-16 h-0.5 bg-gold-500 mx-auto mt-3 mb-4" />
          <p className="text-sm text-gray-400">
            Har bir barberimiz xalqaro standartlar bo'yicha tayyorgarlikdan o'tgan va mijozning istaklarini mukammal amalga oshiradi.
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-500 text-sm">
            Barberlar yuklanmoqda...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {barbers.map((barber) => (
              <div
                key={barber.id}
                className="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-80 overflow-hidden">
                    <img
                      src={barber.image}
                      alt={barber.fullName}
                      onError={handleImgError}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#12151c] via-transparent to-transparent" />
                    <span className="absolute bottom-4 left-4 px-3 py-1 rounded-full text-xs font-semibold bg-gold-500 text-black shadow-lg">
                      {barber.experience}
                    </span>
                  </div>

                  <div className="p-6">
                    <h3 className="font-serif text-2xl font-bold text-white mb-2 group-hover:text-gold-400 transition-colors">
                      {barber.fullName}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed mb-6">
                      {barber.description}
                    </p>

                    {/* Schedule working days indicator */}
                    {barber.schedules && barber.schedules.length > 0 && (
                      <div className="pt-4 border-t border-white/5">
                        <span className="text-[11px] text-gray-500 uppercase block font-medium mb-2">
                          Haftalik Ish Rejimi:
                        </span>
                        <div className="flex items-center gap-1">
                          {barber.schedules.map((s) => (
                            <span
                              key={s.id}
                              title={`${dayNames[s.dayOfWeek]}: ${s.isWorking ? `${s.startTime}-${s.endTime}` : "Dam olish"}`}
                              className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                s.isWorking
                                  ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
                                  : 'bg-charcoal-800 text-gray-600 line-through'
                              }`}
                            >
                              {dayNames[s.dayOfWeek]}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link
                    to={`/book?barberId=${barber.id}`}
                    className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-gold-500 text-black hover:bg-gold-400 transition-colors flex items-center justify-center gap-2 shadow-md shadow-gold-500/20"
                  >
                    <span>Ushbu Barberga Yozilish</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
