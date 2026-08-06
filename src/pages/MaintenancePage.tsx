import  { useState, useEffect } from 'react';
import { Plus, X, Search, ChevronLeft, ChevronRight, Monitor } from 'lucide-react';
import MaintenanceModal from '../components/MaintenanceModal';

interface MaintenanceReport {
  id: number;
  userName: string;
  date: string;
  user?: { id?: number; name?: string; email?: string };
  items?: any[];
}

export default function MaintenancePage() {
  const [reports, setReports] = useState<MaintenanceReport[]>([]);
  
  // State Modal & Pencarian
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // State Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Ambil Data Laporan Maintenance khusus Komputer
  const fetchMaintenanceData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/maintenance`);
      const data = await res.json();
      if (data.status === 'success') {
        // Filter agar HANYA menampilkan data komputer (mengabaikan data yang mengandung kata cctv, plastic, atau alkes)
        const pcOnly = data.data.filter((item: any) => {
          const name = (item.userName || '').toLowerCase();
          return !name.includes('cctv') && !name.includes('plastic') && !name.includes('alkes');
        });
        setReports(pcOnly);
      }
    } catch (err) {
      // Data dummy jika backend belum siap
      setReports([
        {
          id: 1,
          userName: 'Budi Santoso',
          date: '2026-04-10',
          user: { name: 'Kurniawan Saepudin' },
        },
      ]);
    }
  };

  useEffect(() => {
    fetchMaintenanceData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus laporan maintenance komputer ini?')) return;
    try {
      const res = await fetch(`${API_URL}/api/maintenance/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchMaintenanceData();
      } else {
        alert('Gagal menghapus laporan');
      }
    } catch (err) {
      alert('Kesalahan koneksi server');
    }
  };

  const handleViewDetail = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/maintenance/${id}`);
      const data = await res.json();
      if (data.status === 'success') {
        setSelectedReport(data.data);
        setIsDetailOpen(true);
      }
    } catch (err) {
      const found = reports.find((r) => r.id === id);
      setSelectedReport(found);
      setIsDetailOpen(true);
    }
  };

  // 1. Filter Berdasarkan Pencarian
  const filteredReports = reports.filter((r: any) => {
    const user = r.userName || '';
    const tech = r.user?.name || r.technician?.name || '';
    const dateStr = r.date ? new Date(r.date).toISOString().split('T')[0] : '';
    const query = searchQuery.toLowerCase();

    return (
      user.toLowerCase().includes(query) ||
      tech.toLowerCase().includes(query) ||
      dateStr.toLowerCase().includes(query)
    );
  });

  // 2. Kalkulasi Pagination
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Halaman Indeks */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <Monitor className="text-blue-500" size={24} />
            <h2 className="text-xl font-bold text-white">Checklist Maintenance Komputer</h2>
          </div>
          <p className="text-slate-400 text-sm">Daftar riwayat pemeriksaan rutin perangkat komputer oleh teknisi.</p>
        </div>
        <button 
          onClick={() => setIsCreateOpen(true)} 
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm shadow-lg cursor-pointer flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>Buat Ceklist Baru</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 text-slate-500" size={18} />
        <input
          type="text"
          placeholder="Cari berdasarkan nama pengguna, teknisi, atau tanggal..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Tabel Data Riwayat */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg flex flex-col">
        <div className="overflow-x-auto p-6 pb-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                <th className="pb-3 font-semibold">No</th>
                <th className="pb-3 font-semibold">Nama Pengguna</th>
                <th className="pb-3 font-semibold">Teknisi (Dikerjakan Oleh)</th>
                <th className="pb-3 font-semibold">Tanggal Pengecekan</th>
                <th className="pb-3 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
              {currentReports.length > 0 ? (
                currentReports.map((r: any, idx: number) => (
                  <tr key={r.id || idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 font-medium text-white">{indexOfFirstItem + idx + 1}</td>
                    <td className="py-4 font-medium text-white">{r.userName}</td>
                    <td className="py-4 text-slate-300">{r.user?.name || r.technician?.name || '-'}</td>
                    <td className="py-4 text-slate-400">{r.date ? r.date.split('T')[0] : '-'}</td>
                    <td className="py-4 text-center space-x-2">
                      <button onClick={() => handleViewDetail(r.id)} className="px-2.5 py-1 bg-slate-800 text-blue-400 rounded-lg text-xs font-medium cursor-pointer">Detail</button>
                      <button onClick={() => handleDelete(r.id)} className="px-2.5 py-1 bg-slate-800 text-rose-400 rounded-lg text-xs font-medium cursor-pointer">Hapus</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">Tidak ada data laporan maintenance komputer ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-t border-slate-800 gap-4 text-xs text-slate-400 bg-slate-950/40 rounded-b-2xl">
          <div>
            Menampilkan <span className="text-white font-medium">{filteredReports.length > 0 ? indexOfFirstItem + 1 : 0}</span> sampai <span className="text-white font-medium">{Math.min(indexOfLastItem, filteredReports.length)}</span> dari <span className="text-white font-medium">{filteredReports.length}</span> data
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || filteredReports.length === 0}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} /> Sebelumnya
            </button>
            <span className="px-3 py-1.5 bg-slate-800/50 text-white rounded-lg font-medium">
              Hal. {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || filteredReports.length === 0}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors cursor-pointer"
            >
              Berikutnya <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ================= MODAL: BUAT CEKLIST BARU (Komputer) ================= */}
      {isCreateOpen && (
        <MaintenanceModal 
          onClose={() => setIsCreateOpen(false)} 
          onSuccess={fetchMaintenanceData} 
        />
      )}

      {/* ================= MODAL: DETAIL LAPORAN ================= */}
      {isDetailOpen && selectedReport && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-semibold text-blue-400">Detail Laporan Maintenance Komputer</span>
                <h3 className="text-lg font-bold text-white">Pengguna: {selectedReport.userName}</h3>
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={20} /></button>
            </div>
            <div className="space-y-4 py-4 text-sm">
              <div className="grid grid-cols-2 gap-4 bg-slate-800/50 p-4 rounded-xl">
                <div><span className="text-slate-400 block text-xs">Teknisi</span> <span className="font-semibold text-white">{selectedReport.user?.name || selectedReport.technician?.name || '-'}</span></div>
                <div><span className="text-slate-400 block text-xs">Tanggal Pengecekan</span> <span className="font-semibold text-amber-400">{selectedReport.date ? selectedReport.date.split('T')[0] : '-'}</span></div>
              </div>
              <div>
                <span className="text-slate-400 block text-xs mb-1">Catatan / Status Komponen</span>
                <div className="p-3 bg-slate-800/80 rounded-xl text-slate-200 text-xs space-y-2 max-h-60 overflow-y-auto">
                  {selectedReport.items && selectedReport.items.length > 0 ? (
                    selectedReport.items.map((it: any, i: number) => (
                      <div key={i} className="flex justify-between items-center border-b border-slate-700/50 pb-1">
                        <span>{it.checklist?.title || it.title || `Item #${i+1}`}: <strong className={it.status === 'Normal' ? 'text-emerald-400' : 'text-red-400'}>{it.status}</strong></span>
                        <span className="text-slate-400 text-right max-w-[200px] truncate">{it.detail || '-'}</span>
                      </div>
                    ))
                  ) : (
                    <p>Semua komponen berfungsi dengan normal tanpa kendala.</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button onClick={() => setIsDetailOpen(false)} className="px-5 py-2 bg-slate-800 text-white rounded-xl text-sm font-semibold cursor-pointer">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}