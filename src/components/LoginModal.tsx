import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { loginUser } from '../api';
import { Shield, KeyRound, Check, X, UserCheck, AlertCircle } from 'lucide-react';

interface LoginModalProps {
  onSuccess: (user: User) => void;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onSuccess, onClose }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('juri_1');
  const [pin, setPin] = useState<string>('1111');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const roles = [
    {
      role: 'admin' as UserRole,
      title: 'Admin Panitia',
      desc: 'Kelola peserta, konfigurasi bobot, dan unduh rekap',
      defaultPin: 'admin123',
      color: 'border-red-400 bg-red-50/40 text-red-900',
    },
    {
      role: 'juri_1' as UserRole,
      title: 'Dewan Juri 1',
      desc: 'Penilaian Musikalitas, Aransemen & Harmoni',
      defaultPin: '1111',
      color: 'border-blue-400 bg-blue-50/40 text-blue-900',
    },
    {
      role: 'juri_2' as UserRole,
      title: 'Dewan Juri 2',
      desc: 'Penilaian Teknik, Skill & Keterampilan Instrumen',
      defaultPin: '2222',
      color: 'border-indigo-400 bg-indigo-50/40 text-indigo-900',
    },
    {
      role: 'juri_3' as UserRole,
      title: 'Dewan Juri 3',
      desc: 'Penilaian Performance, Aksi Panggung & Vokal',
      defaultPin: '3333',
      color: 'border-purple-400 bg-purple-50/40 text-purple-900',
    },
  ];

  const handleSelectRole = (r: (typeof roles)[0]) => {
    setSelectedRole(r.role);
    setPin(r.defaultPin);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await loginUser(selectedRole, pin);
      if (res.success && res.user) {
        onSuccess(res.user);
      } else {
        setError(res.error || 'PIN yang dimasukkan salah.');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Autentikasi Pengguna</h3>
              <p className="text-xs text-slate-400">Pilih hak akses untuk memulai penjurian</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Role Cards */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Pilih Hak Akses:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {roles.map((r) => {
              const isSelected = selectedRole === r.role;
              return (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => handleSelectRole(r)}
                  className={`p-3 rounded-xl text-left border transition ${
                    isSelected
                      ? `${r.color} ring-2 ring-indigo-500 font-semibold shadow-xs`
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{r.title}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{r.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* PIN Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Masukkan PIN Keamanan:
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Masukkan PIN"
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none tracking-widest font-mono"
              />
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
              <span>PIN bawaan:</span>
              <button
                type="button"
                onClick={() => {
                  const r = roles.find((x) => x.role === selectedRole);
                  if (r) setPin(r.defaultPin);
                }}
                className="text-indigo-600 hover:underline font-mono"
              >
                Gunakan PIN: {roles.find((x) => x.role === selectedRole)?.defaultPin}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-sm transition"
            >
              {isLoading ? 'Memverifikasi...' : 'Masuk Sekarang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
