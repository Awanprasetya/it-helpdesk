import { useState } from 'react';
import { Mail, Lock, ArrowRight, ArrowLeft } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
  onBackToUserForm: () => void;
}

export default function LoginPage({ onLoginSuccess, onBackToUserForm }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        onLoginSuccess(data.data);
      } else {
        setErrorMsg(data.message || 'Login gagal.');
      }
    } catch (err) {
      setErrorMsg('Gagal terhubung ke server backend.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative">
      {/* Tombol Kembali ke Portal User di Pojok Atas */}
      <button
        onClick={onBackToUserForm}
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white text-xs font-medium bg-slate-800/80 border border-slate-700 px-4 py-2 rounded-xl transition-all cursor-pointer"
      >
        <ArrowLeft size={16} /> Kembali ke Form Publik
      </button>

      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-blue-600 text-white font-bold text-2xl mb-4 shadow-lg shadow-blue-500/30">IT</div>
          <h2 className="text-2xl font-bold text-white">IT Ticketing System</h2>
          <p className="text-slate-400 text-sm mt-1">Masuk untuk mengelola dan melaporkan kendala</p>
        </div>
        {errorMsg && <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium text-center">{errorMsg}</div>}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email Perusahaan</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><Mail size={18} /></span>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@perusahaan.com" className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Kata Sandi</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><Lock size={18} /></span>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm" />
            </div>
          </div>
          <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg transition-all text-sm cursor-pointer disabled:opacity-50">
            <span>{isLoading ? 'Memproses...' : 'Masuk ke Dashboard'}</span>
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}