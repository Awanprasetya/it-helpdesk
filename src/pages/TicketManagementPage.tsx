import { useState, useEffect } from 'react';
import { Plus, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function TicketManagementPage({ tickets: propTickets, refreshTickets, openCreateModal, openEditModal }: any) {
  const [tickets, setTickets] = useState<any[]>(propTickets || []);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // State Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sinkronisasi data jika props berubah dari App.tsx
  useEffect(() => {
    if (propTickets) {
      setTickets(propTickets);
    }
  }, [propTickets]);

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus tiket ini?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/tickets/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (refreshTickets) refreshTickets();
      }
    } catch (err) {
      alert('Kesalahan koneksi server');
    }
  };

  const handleViewDetail = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:5000/api/tickets/${id}`);
      const data = await res.json();
      if (data.status === 'success') {
        setSelectedTicket(data.data);
        setIsDetailOpen(true);
      }
    } catch (err) {
      alert('Gagal mengambil detail');
    }
  };

  // 1. Filter tiket berdasarkan Search Query
  const filteredTickets = tickets.filter((t: any) => {
    const ticketNo = t.ticketNumber || '';
    const subject = t.title || t.subject || '';
    const category = t.category?.name || '';
    const reporter = t.user?.name || '';
    const query = searchQuery.toLowerCase();

    return (
      ticketNo.toLowerCase().includes(query) ||
      subject.toLowerCase().includes(query) ||
      category.toLowerCase().includes(query) ||
      reporter.toLowerCase().includes(query)
    );
  });

  // 2. Kalkulasi Data untuk Pagination berdasarkan hasil filter
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTickets = filteredTickets.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white">Manajemen Tiket Kendala</h2>
          <p className="text-slate-400 text-sm mt-1">Daftar seluruh laporan kendala IT yang masuk dari karyawan.</p>
        </div>
        <button onClick={openCreateModal} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm shadow-lg cursor-pointer flex items-center space-x-2">
          <Plus size={18} />
          <span>Buat Tiket Baru</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 text-slate-500" size={18} />
        <input
          type="text"
          placeholder="Cari berdasarkan nomor tiket, subjek, kategori, atau pelapor..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1); // Reset ke halaman pertama saat mengetik pencarian
          }}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg flex flex-col">
        <div className="overflow-x-auto p-6 pb-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                <th className="pb-3 font-semibold">Nomor Tiket</th>
                <th className="pb-3 font-semibold">Subjek Kendala</th>
                <th className="pb-3 font-semibold">Kategori</th>
                <th className="pb-3 font-semibold">Pelapor</th>
                <th className="pb-3 font-semibold">Prioritas</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
              {currentTickets.length > 0 ? (
                currentTickets.map((t: any) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 font-medium text-white">{t.ticketNumber}</td>
                    <td className="py-4 font-medium text-white">{t.title || t.subject}</td>
                    <td className="py-4 text-slate-400">{t.category?.name || '-'}</td>
                    <td className="py-4">{t.user?.name || 'Karyawan'}</td>
                    <td className="py-4"><span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">{t.priority}</span></td>
                    <td className="py-4"><span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700 text-slate-300">{t.status}</span></td>
                    <td className="py-4 text-center space-x-2">
                      <button onClick={() => handleViewDetail(t.id)} className="px-2.5 py-1 bg-slate-800 text-blue-400 rounded-lg text-xs font-medium cursor-pointer">Detail</button>
                      <button onClick={() => openEditModal && openEditModal(t)} className="px-2.5 py-1 bg-slate-800 text-amber-400 rounded-lg text-xs font-medium cursor-pointer">Edit</button>
                      <button onClick={() => handleDelete(t.id)} className="px-2.5 py-1 bg-slate-800 text-rose-400 rounded-lg text-xs font-medium cursor-pointer">Hapus</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">Tidak ada data tiket ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Kontrol Navigasi Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-t border-slate-800 gap-4 text-xs text-slate-400 bg-slate-950/40 rounded-b-2xl">
          <div>
            Menampilkan <span className="text-white font-medium">{filteredTickets.length > 0 ? indexOfFirstItem + 1 : 0}</span> sampai <span className="text-white font-medium">{Math.min(indexOfLastItem, filteredTickets.length)}</span> dari <span className="text-white font-medium">{filteredTickets.length}</span> data tiket
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || filteredTickets.length === 0}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} /> Sebelumnya
            </button>
            <span className="px-3 py-1.5 bg-slate-800/50 text-white rounded-lg font-medium">
              Hal. {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || filteredTickets.length === 0}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors cursor-pointer"
            >
              Berikutnya <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Detail Tiket */}
      {isDetailOpen && selectedTicket && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-semibold text-blue-400">{selectedTicket.ticketNumber}</span>
                <h3 className="text-lg font-bold text-white">{selectedTicket.subject}</h3>
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={20} /></button>
            </div>
            <div className="space-y-4 py-4 text-sm">
              <div className="grid grid-cols-2 gap-4 bg-slate-800/50 p-4 rounded-xl">
                <div><span className="text-slate-400 block text-xs">Pelapor</span> <span className="font-semibold text-white">{selectedTicket.user?.name}</span></div>
                <div><span className="text-slate-400 block text-xs">Kategori</span> <span className="font-semibold text-white">{selectedTicket.category?.name}</span></div>
                <div><span className="text-slate-400 block text-xs">Prioritas</span> <span className="font-semibold text-white">{selectedTicket.priority}</span></div>
                <div><span className="text-slate-400 block text-xs">Status</span> <span className="font-semibold text-white">{selectedTicket.status}</span></div>
                <div><span className="text-slate-400 block text-xs">Batas Waktu (Due Date)</span> <span className="font-semibold text-amber-400">{selectedTicket.due_date ? new Date(selectedTicket.due_date).toLocaleString() : '-'}</span></div>
                <div><span className="text-slate-400 block text-xs">Waktu Selesai</span> <span className="font-semibold text-emerald-400">{selectedTicket.resolved_at ? new Date(selectedTicket.resolved_at).toLocaleString() : 'Belum Selesai'}</span></div>
              </div>
              <div>
                <span className="text-slate-400 block text-xs mb-1">Deskripsi Kendala</span>
                <p className="p-3 bg-slate-800/80 rounded-xl text-slate-200">{selectedTicket.description}</p>
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