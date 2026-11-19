import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  X
} from 'lucide-react';
import { api, getErrorMessage } from '../../api/client';
import { Service } from '../../types';

export const AdminServices: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [price, setPrice] = useState<number>(100000);
  const [duration, setDuration] = useState<number>(45);
  const [category, setCategory] = useState('Soch');
  const [isActive, setIsActive] = useState(true);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/services/admin/all');
      if (res.data.success) {
        setServices(res.data.services);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openCreateModal = () => {
    setEditingService(null);
    setName('');
    setDescription('');
    setImage('https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&auto=format&fit=crop&q=80');
    setPrice(120000);
    setDuration(45);
    setCategory('Soch');
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (s: Service) => {
    setEditingService(s);
    setName(s.name);
    setDescription(s.description);
    setImage(s.image);
    setPrice(s.price);
    setDuration(s.duration);
    setCategory(s.category);
    setIsActive(s.isActive);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      if (editingService) {
        const res = await api.put(`/services/admin/${editingService.id}`, {
          name,
          description,
          image,
          price,
          duration,
          category,
          isActive,
        });
        if (res.data.success) {
          setServices(prev => prev.map(s => (s.id === editingService.id ? res.data.service : s)));
          setModalOpen(false);
        }
      } else {
        const res = await api.post('/services/admin', {
          name,
          description,
          image,
          price,
          duration,
          category,
          isActive,
        });
        if (res.data.success) {
          setServices(prev => [res.data.service, ...prev]);
          setModalOpen(false);
        }
      }
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Rostdan ham ushbu xizmatni o'chirmoqchimisiz?")) return;
    try {
      const res = await api.delete(`/services/admin/${id}`);
      if (res.data.success) {
        setServices(prev => prev.filter(s => s.id !== id));
      }
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            XIZMATLAR VA NARXLAR BOSHQARUVI
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Mijozlar saytidagi barcha xizmatlar, narxlar va tavsiflarni tahrirlash
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchServices}
            className="p-2.5 rounded-xl text-gray-400 hover:text-white bg-charcoal-800 border border-gray-700"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-black bg-gold-500 hover:bg-gold-400 transition-colors flex items-center gap-2 shadow-lg shadow-gold-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi Xizmat Qo'shish</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs">
          {error}
        </div>
      )}

      {/* Services Grid */}
      {loading ? (
        <div className="py-20 text-center text-gray-500 text-xs">
          Xizmatlar yuklanmoqda...
        </div>
      ) : services.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border-white/5">
          <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h4 className="text-white text-base font-semibold mb-1">Xizmatlar topilmadi</h4>
          <p className="text-xs text-gray-400 mb-4">Birinchi xizmatni qo'shing</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <div
              key={s.id}
              className="glass-panel rounded-2xl p-6 border-white/5 flex flex-col justify-between group hover:border-gold-500/30 transition-all"
            >
              <div>
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={s.image}
                    alt={s.name}
                    className="w-20 h-20 rounded-2xl object-cover border border-gold-500/30 shadow-md shrink-0"
                  />
                  <div className="overflow-hidden">
                    <span className="text-[10px] uppercase font-bold text-gold-400 tracking-wider">
                      {s.category}
                    </span>
                    <h3 className="font-serif font-bold text-lg text-white truncate">
                      {s.name}
                    </h3>
                    <span className="text-base font-bold text-emerald-400 block mt-1">
                      {s.price.toLocaleString()} UZS
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                  {s.description}
                </p>

                <div className="flex items-center justify-between text-xs py-2 border-t border-gray-800 text-gray-400">
                  <span>Holati:</span>
                  {s.isActive ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Faol
                    </span>
                  ) : (
                    <span className="text-red-400 font-semibold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Yashirilgan
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-mono">
                  {s.duration} daqiqa
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(s)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900 text-red-400 hover:text-white transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#12141a] border border-gold-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800 mb-4">
              <h3 className="font-serif text-xl font-bold text-white">
                {editingService ? "Xizmatni Tahrirlash" : "Yangi Xizmat Qo'shish"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Xizmat Nomi *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Klassik Soch Turmagi"
                  className="w-full bg-[#0b0d10] border border-gray-700 text-white px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Narxi (UZS) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={5000}
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-[#0b0d10] border border-gray-700 text-white px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Kategoriya *
                  </label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Soch, Soqol, VIP..."
                    className="w-full bg-[#0b0d10] border border-gray-700 text-white px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Rasm URL *
                </label>
                <input
                  type="url"
                  required
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#0b0d10] border border-gray-700 text-white px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Tavsif *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Xizmat haqida batafsil ma'lumot..."
                  className="w-full bg-[#0b0d10] border border-gray-700 text-white px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="serviceActiveCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-gold-500 focus:ring-gold-500"
                />
                <label htmlFor="serviceActiveCheck" className="text-xs text-gray-300 select-none">
                  Xizmat mijozlar saytida faol va ko'rinadi
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-white/5"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-black bg-gold-500 hover:bg-gold-400"
                >
                  {formLoading ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
