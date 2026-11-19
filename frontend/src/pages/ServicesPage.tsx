import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Clock, Sparkles, ArrowRight } from 'lucide-react';
import { api } from '../api/client';
import { Service } from '../types';

export const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [category, setCategory] = useState<string>('Barchasi');
  const [loading, setLoading] = useState(true);

  const fallbackImg = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80';
  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = fallbackImg;
  };

  useEffect(() => {
    api.get('/services')
      .then(res => {
        if (res.data.success) {
          setServices(res.data.services);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['Barchasi', ...Array.from(new Set(services.map(s => s.category)))];

  const filtered = category === 'Barchasi'
    ? services
    : services.filter(s => s.category === category);

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-[#0a0c10]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-gold-500/10 text-gold-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Premium Xizmatlarimiz</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
            XIZMATLAR VA SOCH TURMAKLARI
          </h1>
          <div className="w-16 h-0.5 bg-gold-500 mx-auto mt-3 mb-4" />
          <p className="text-sm text-gray-400">
            Har bir xizmat uchun individual steril asboblar to'plami va sifatli kosmetika ishlatiladi.
          </p>
        </div>

        {/* Category filter pills with smooth mobile swipe */}
        <div className="flex items-center sm:justify-center gap-2 mb-8 sm:mb-12 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 sm:px-5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                category === cat
                  ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/20 font-bold scale-105'
                  : 'bg-[#12141a] text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="py-20 text-center text-gray-500 text-sm">
            Xizmatlar yuklanmoqda...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((service) => (
              <div
                key={service.id}
                className="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col justify-between group"
              >
                <div className="relative h-60 overflow-hidden">
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
                    <p className="text-xs text-gray-400 leading-relaxed mb-4">
                      {service.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-gray-500 uppercase block font-medium">Narxi</span>
                      <span className="text-xl font-bold text-gold-400">
                        {service.price.toLocaleString()} <span className="text-xs text-gray-400 font-normal">UZS</span>
                      </span>
                    </div>

                    <Link
                      to={`/book?serviceId=${service.id}`}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gold-500 text-black hover:bg-gold-400 transition-colors flex items-center gap-1.5 shadow-md shadow-gold-500/20"
                    >
                      <span>Bron qilish</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
