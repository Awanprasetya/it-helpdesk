import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Plus, ShieldCheck, Loader2 } from 'lucide-react';

export default function CCTVMonitorPage() {
  const [devices, setDevices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // State modal tambah CCTV
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [location, setLocation] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchDevices = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/cctv-monitor`);
      const json = await res.json();
      if (json.status === 'success') {
        setDevices(json.data);
      }
    } catch (err) {
      console.error('Gagal memuat data CCTV');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/cctv-monitor/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, ipAddress, location }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setName('');
        setIpAddress('');
        setLocation('');
        fetchDevices();
      } else {
        alert('Gagal menambah perangkat.');
      }
    } catch (err) {
      alert('Kesalahan koneksi.');
    }
  };

  useEffect(() => {
    // 1. Ambil data awal saat halaman dibuka
    fetchDevices();

    // 2. Refresh data secara berkala setiap 30 detik untuk melihat hasil update dari agent lokal
    const interval = setInterval(() => {
      fetchDevices();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 text-white space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="text-blue-500" /> Monitoring Status IP CCTV
          </h1>
          <p className="text-xs text-slate-400 mt-1">Pantau kondisi nyala/mati perangkat CCTV berdasarkan jaringan IP secara *live*</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchDevices(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Memperbarui...' : 'Refresh Data'}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition cursor-pointer shadow-lg shadow-blue-600/25"
          >
            <Plus size={16} /> Tambah CCTV
          </button>
        </div>
      </div>

      {/* Kondisi Loading / Data Kosong */}
      {isLoading && devices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-2">
          <Loader2 className="animate-spin text-blue-500" size={32} />
          <p className="text-sm">Memuat perangkat CCTV...</p>
        </div>
      ) : devices.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-2xl">
          <p className="text-slate-400 text-sm">Belum ada perangkat CCTV yang terdaftar.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-blue-300"
          >
            <Plus size={14} /> Tambah perangkat pertama sekarang
          </button>
        </div>
      ) : (
        /* Grid Status CCTV */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {devices.map((device) => {
            const isOnline = device.status === 'ONLINE';
            return (
              <div 
                key={device.id} 
                className={`p-4 rounded-2xl border transition-all bg-slate-900 ${
                  isOnline ? 'border-emerald-500/30 shadow-emerald-500/5' : 'border-red-500/30 shadow-red-500/5'
                } shadow-xl`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white text-sm line-clamp-1">{device.name}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{device.ipAddress}</p>
                  </div>
                  <span className={`p-2 rounded-xl flex items-center justify-center ${
                    isOnline ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {isOnline ? <Wifi size={18} /> : <WifiOff size={18} />}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
                  <span className="text-slate-400 line-clamp-1">Area: {device.location || 'Umum'}</span>
                  <span className={`font-bold px-2 py-0.5 rounded-md uppercase text-[10px] ${
                    isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {device.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Tambah CCTV */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Tambah Perangkat CCTV Baru</h3>
            <form onSubmit={handleAddDevice} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Nama Kamera / Perangkat</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Kamera 01 - Main Gate"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Alamat IP (IP Address)</label>
                <input
                  type="text"
                  required
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  placeholder="Contoh: 192.168.1.100"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Lokasi / Area</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Contoh: Gedung A"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 cursor-pointer font-semibold shadow-lg shadow-blue-600/30"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}