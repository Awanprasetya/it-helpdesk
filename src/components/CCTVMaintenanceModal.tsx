import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface CCTVChecklistItem {
  id: number;
  title: string;
  status: 'Normal' | 'Masalah';
  detail: string;
}

export default function CCTVMaintenanceModal({ onClose, onSuccess, areaTitle = 'Plastic' }: any) {
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [checklist, setChecklist] = useState<CCTVChecklistItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State untuk Searchable Dropdown User (Teknisi)
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    // Generate item checklist CCTV dengan ID yang sinkron persis dengan master database (101 - 136)
    const generatedItems: CCTVChecklistItem[] = [
      { id: 101, title: 'Harddisk Storage (Recording)', status: 'Normal', detail: '' },
      { id: 102, title: 'Adaptor / Power Supply DVR/NVR', status: 'Normal', detail: '' },
      { id: 103, title: 'Koneksi Jaringan / Online CCTV', status: 'Normal', detail: '' },
      { id: 104, title: 'Kebersihan Perangkat DVR/NVR', status: 'Normal', detail: '' },
    ];

    for (let i = 1; i <= 32; i++) {
      generatedItems.push({
        id: 104 + i, // ID berurutan dari 105 hingga 136 untuk Kamera Channel 01 - 32
        title: `Kamera Channel ${i < 10 ? '0' + i : i}`,
        status: 'Normal',
        detail: ''
      });
    }
    setChecklist(generatedItems);

    // Ambil data users untuk teknisi
    fetch(`${API_URL}/api/maintenance/users`)
      .then((res) => res.json())
      .then((data) => {
        const userList = Array.isArray(data) ? data : data.data || [];
        setUsers(userList);
      })
      .catch(() => console.error('Gagal memuat data teknisi'));

    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [API_URL]);

  const filteredUsers = users.filter((usr: any) => {
    const name = usr.name || usr.username || '';
    const email = usr.email || '';
    const query = userSearch.toLowerCase();
    return name.toLowerCase().includes(query) || email.toLowerCase().includes(query);
  });

  const handleStatusChange = (id: number, status: 'Normal' | 'Masalah') => {
    setChecklist(
      checklist.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  const handleDetailChange = (id: number, detail: string) => {
    setChecklist(
      checklist.map((item) => (item.id === id ? { ...item, detail } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userId) {
      alert('Mohon isi Penanggung Jawab dan pilih Teknisi dari daftar!');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/maintenance/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Menambahkan penanda CCTV dan Area agar terfilter dengan benar di halaman CCTV
          userName: `${userName} (CCTV ${areaTitle})`, 
          userId: Number(userId),
          date,
          items: checklist.map((item) => ({
            checklistId: item.id,
            status: item.status,
            detail: item.detail,
          })),
        }),
      });

      const data = await response.json();
      if (response.ok && (data.status === 'success' || response.status === 201)) {
        onSuccess();
        onClose();
      } else {
        alert(data.message || 'Gagal menyimpan checklist maintenance CCTV');
      }
    } catch {
      alert('Terjadi kesalahan koneksi ke server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl p-6 shadow-2xl relative my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Form Ceklist Maintenance CCTV ({areaTitle})</h3>
            <p className="text-xs text-slate-400 mt-0.5">Pemeriksaan Kapasitas Penyimpanan & 32 Channel Kamera</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Penanggung Jawab / Area</label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Nama penanggung jawab..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Searchable Dropdown Teknisi */}
            <div className="relative" ref={userDropdownRef}>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Dikerjakan Oleh (Teknisi)</label>
              <input
                type="text"
                placeholder="Ketik untuk cari teknisi..."
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setIsUserDropdownOpen(true);
                  if (!e.target.value) setUserId('');
                }}
                onFocus={() => setIsUserDropdownOpen(true)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />

              {isUserDropdownOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((usr: any) => (
                      <div
                        key={usr.id}
                        onClick={() => {
                          setUserId(usr.id);
                          setUserSearch(usr.name || usr.username || usr.email);
                          setIsUserDropdownOpen(false);
                        }}
                        className="px-4 py-3 hover:bg-slate-700 cursor-pointer text-white text-sm border-b border-slate-700/50 last:border-none"
                      >
                        <div className="font-medium">{usr.name || usr.username}</div>
                        {usr.email && <div className="text-xs text-slate-400">{usr.email}</div>}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-slate-400 text-sm text-center">Teknisi tidak ditemukan</div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Tanggal</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Tabel Ceklist (Scrollable ke bawah karena total baris item CCTV) */}
          <div className="overflow-x-auto max-h-[450px] border border-slate-800 rounded-xl">
            <table className="w-full text-left border-collapse relative">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800 text-center">
                  <th className="p-3 border-r border-slate-800 w-16">No</th>
                  <th className="p-3 border-r border-slate-800 w-1/3">Subject</th>
                  <th className="p-3 border-r border-slate-800" colSpan={2}>Keterangan</th>
                  <th className="p-3 w-1/3">Detail Keterangan</th>
                </tr>
                <tr className="bg-slate-950/90 text-slate-400 text-xs border-b border-slate-800 text-center">
                  <th className="border-r border-slate-800"></th>
                  <th className="border-r border-slate-800"></th>
                  <th className="p-2 border-r border-slate-800 text-emerald-400 font-medium w-28">Berfungsi Normal</th>
                  <th className="p-2 border-r border-slate-800 text-red-400 font-medium w-28">Ada Masalah</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {checklist.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 text-center border-r border-slate-800 font-medium text-slate-400">{index + 1}</td>
                    <td className="p-3 border-r border-slate-800 font-medium text-white">{item.title}</td>
                    <td className="p-3 text-center border-r border-slate-800">
                      <input
                        type="radio"
                        name={`cctv-status-${item.id}`}
                        checked={item.status === 'Normal'}
                        onChange={() => handleStatusChange(item.id, 'Normal')}
                        className="w-4 h-4 text-blue-600 cursor-pointer"
                      />
                    </td>
                    <td className="p-3 text-center border-r border-slate-800">
                      <input
                        type="radio"
                        name={`cctv-status-${item.id}`}
                        checked={item.status === 'Masalah'}
                        onChange={() => handleStatusChange(item.id, 'Masalah')}
                        className="w-4 h-4 text-red-600 cursor-pointer"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.detail}
                        onChange={(e) => handleDetailChange(item.id, e.target.value)}
                        placeholder="Keterangan jika ada masalah..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Ceklist CCTV'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}