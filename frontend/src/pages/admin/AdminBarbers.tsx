import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Scissors,
  Plus,
  Edit,
  Trash2,
  Calendar,
  CheckCircle,
  XCircle,
  Phone,
  RefreshCw,
  X
} from 'lucide-react';
import { api, getErrorMessage } from '../../api/client';
import { Barber } from '../../types';

export const AdminBarbers: React.FC = () => {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [image, setImage] = useState('');
  const [experience, setExperience] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fetchBarbers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/barbers/admin/all');
      if (res.data.success) {
        setBarbers(res.data.barbers);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBarbers();
  }, []);

  const openCreateModal = () => {
    setEditingBarber(null);
    setFullName('');
    setPhone('+998 90 ');
    setImage('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80');
    setExperience('5 yil tajriba');
    setDescription('');
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (b: Barber) => {
    setEditingBarber(b);
    setFullName(b.fullName);
    setPhone(b.phone);
    setImage(b.image);
    setExperience(b.experience);
    setDescription(b.description);
    setIsActive(b.isActive);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      if (editingBarber) {
        const res = await api.put(`/barbers/admin/${editingBarber.id}`, {
          fullName,
          phone,
          image,
          experience,
          description,
          isActive,
        });
        if (res.data.success) {
          setBarbers(prev => prev.map(b => (b.id === editingBarber.id ? res.data.barber : b)));
          setModalOpen(false);
        }
      } else {
        const res = await api.post('/barbers/admin', {
          fullName,
          phone,
          image,
          experience,
          description,
          isActive,
        });
        if (res.data.success) {
          setBarbers(prev => [...prev, res.data.barber]);
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
    if (!window.confirm("Rostdan ham ushbu barberni o'chirmoqchimisiz?")) return;
    try {
      const res = await api.delete(`/barbers/admin/${id}`);
      if (res.data.success) {
        setBarbers(prev => prev.filter(b => b.id !== id));
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
            BARBERLAR BOSHQARUVI
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Mavjud ustalar, ularning profillari, tajribasi va sozlamalari
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchBarbers}
            className="p-2.5 rounded-xl text-gray-400 hover:text-white bg-charcoal-800 border border-gray-700"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-black bg-gold-500 hover:bg-gold-400 transition-colors flex items-center gap-2 shadow-lg shadow-gold-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi Barber Qo'shish</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs">
          {error}
        </div>
      )}

      {/* Barbers Grid */}
      {loading ? (
        <div className="py-20 text-center text-gray-500 text-xs">
          Barberlar yuklanmoqda...
        </div>
      ) : barbers.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border-white/5">
          <Scissors className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h4 className="text-white text-base font-semibold mb-1">Hozircha birorta barber yo'q</h4>
          <p className="text-xs text-gray-400 mb-4">Yangi usta qo'shish tugmasi orqali profil yarating</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {barbers.map((b) => (
            <div
              key={b.id}
              className="glass-panel rounded-2xl p-6 border-white/5 flex flex-col justify-between group hover:border-gold-500/30 transition-all"
            >
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={b.image}
                    alt={b.fullName}
                    className="w-16 h-16 rounded-2xl object-cover border border-gold-500/30 shadow-md"
                  />
                  <div className="overflow-hidden">
                    <h3 className="font-serif font-bold text-lg text-white truncate">
                      {b.fullName}
                    </h3>
                    <span className="text-xs text-gold-400 font-semibold block">
                      {b.experience}
                    </span>
                    <span className="text-xs text-gray-400 block font-mono">
                      {b.phone}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                  {b.description}
                </p>

                <div className="flex items-center justify-between text-xs py-2 border-t border-gray-800 text-gray-400">
                  <span>Holati:</span>
                  {b.isActive ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Faol
                    </span>
                  ) : (
                    <span className="text-red-400 font-semibold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Nofaol
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-gray-800 flex items-center justify-between gap-2">
                <Link
                  to={`/admin/schedule?barberId=${b.id}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gold-500/10 border border-gold-500/30 text-gold-400 hover:bg-gold-500 hover:text-black transition-colors flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Jadval</span>
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(b)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
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
                {editingBarber ? "Barberni Tahrirlash" : "Yangi Barber Qo'shish"}
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
                  Ism va Familiya *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Sardor Alimov"
                  className="w-full bg-[#0b0d10] border border-gray-700 text-white px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    className="w-full bg-[#0b0d10] border border-gray-700 text-white px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Tajriba *
                  </label>
                  <input
                    type="text"
                    required
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="6 yil tajriba"
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
                  Tavsif va Mutaxassislik *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Klassik fade va aniq chiziqlar ustasi..."
                  className="w-full bg-[#0b0d10] border border-gray-700 text-white px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-gold-500 focus:ring-gold-500"
                />
                <label htmlFor="activeCheck" className="text-xs text-gray-300 select-none">
                  Barber saytda faol va mijozlar uchun ko'rinadi
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
