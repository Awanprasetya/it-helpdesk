import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function TicketModal({ categories, onClose, onSuccess }: any) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [userId, setUserId] = useState('');
  
  // State untuk pencarian karyawan
  const [employees, setEmployees] = useState<any[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const employeeDropdownRef = useRef<HTMLDivElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ambil URL Backend secara aman
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Ambil data karyawan saat modal dibuka
  useEffect(() => {
    fetch(`${API_URL}/api/employees`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') setEmployees(data.data);
      })
      .catch((err) => console.error('Gagal memuat data karyawan'));

    // Tutup dropdown jika klik di luar area
    const handleClickOutside = (event: MouseEvent) => {
      if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target as Node)) {
        setIsEmployeeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [API_URL]);

  // Filter karyawan berdasarkan pencarian
  const filteredEmployees = employees.filter((emp: any) => {
    const name = emp.name || emp.full_name || '';
    const dept = emp.department || '';
    const query = employeeSearch.toLowerCase();
    return name.toLowerCase().includes(query) || dept.toLowerCase().includes(query);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !categoryId || !userId) {
      alert('Mohon lengkapi Subjek, Kategori, dan Nama Karyawan!');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          categoryId: Number(categoryId),
          priority,
          userId: Number(userId),
        }),
      });

      const data = await response.json();
      if (response.ok && data.status === 'success') {
        onSuccess();
        onClose();
      } else {
        alert(data.message || 'Gagal membuat tiket');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi ke server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white">Buat Laporan Kendala IT</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-sm">
          {/* Searchable Dropdown Karyawan */}
          <div className="relative" ref={employeeDropdownRef}>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Nama Karyawan</label>
            <input
              type="text"
              placeholder="Ketik untuk mencari nama karyawan..."
              value={employeeSearch}
              onChange={(e) => {
                setEmployeeSearch(e.target.value);
                setIsEmployeeDropdownOpen(true);
                if (!e.target.value) setUserId('');
              }}
              onFocus={() => setIsEmployeeDropdownOpen(true)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
            />
            
            {isEmployeeDropdownOpen && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp: any) => (
                    <div
                      key={emp.id}
                      onClick={() => {
                        setUserId(emp.id);
                        setEmployeeSearch(emp.name || emp.full_name);
                        setIsEmployeeDropdownOpen(false);
                      }}
                      className="px-4 py-3 hover:bg-slate-700 cursor-pointer text-white text-sm border-b border-slate-700/50 last:border-none"
                    >
                      <div className="font-medium">{emp.name || emp.full_name}</div>
                      {emp.department && <div className="text-xs text-slate-400">{emp.department}</div>}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-slate-400 text-sm text-center">Karyawan tidak ditemukan</div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Subjek Kendala</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Koneksi internet lantai 2 lambat"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Kategori</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 [&>option]:bg-slate-900"
              >
                <option value="">Pilih Kategori</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Prioritas</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 [&>option]:bg-slate-900"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Deskripsi Detail Kendala</label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan kendala secara rinci beserta lokasi perangkat..."
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
            ></textarea>
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
              {isSubmitting ? 'Menyimpan...' : 'Kirim Tiket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}