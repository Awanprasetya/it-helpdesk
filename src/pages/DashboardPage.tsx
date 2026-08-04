
import { Ticket, Clock, CheckCircle2, AlertTriangle, ArrowUpRight, Plus } from 'lucide-react';

export default function DashboardPage({ currentUser, tickets, setActiveTab, openCreateModal }: any) {
  const activeCount = tickets.length;
  const openCount = tickets.filter((t: any) => t.status === 'Open' || t.status === 'OPEN').length;
  const resolvedCount = tickets.filter((t: any) => t.status === 'Resolved' || t.status === 'RESOLVED').length;
  const urgentCount = tickets.filter((t: any) => t.priority === 'Urgent' || t.priority === 'URGENT').length;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Selamat Datang Kembali, {currentUser?.name || 'Kurniawan'}! 👋</h1>
          <p className="text-blue-100 text-sm mt-1">Berikut adalah ringkasan performa penanganan tiket IT hari ini.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-white text-blue-600 font-semibold rounded-xl text-sm shadow-md hover:bg-blue-50 transition-colors cursor-pointer flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>Buat Tiket Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Tiket Aktif', value: activeCount.toString(), change: 'Data dari Database', icon: Ticket, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { title: 'Menunggu Respon', value: openCount.toString(), change: 'Perlu tindakan segera', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { title: 'Selesai Bulan Ini', value: resolvedCount.toString(), change: 'Tuntas ditangani', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { title: 'Tiket Urgent', value: urgentCount.toString(), change: 'Prioritas tinggi', icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className={`p-3 rounded-xl ${item.bg} ${item.color}`}>
                  <Icon size={24} />
                </span>
                <span className="text-xs text-slate-400 font-medium">{item.change}</span>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-white">{item.value}</h3>
                <p className="text-sm text-slate-400 mt-1">{item.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Tiket Masuk Terbaru</h2>
          <button 
            onClick={() => setActiveTab('tickets')}
            className="text-sm text-blue-400 hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <span>Lihat Semua</span>
            <ArrowUpRight size={16} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                <th className="pb-3 font-semibold">Nomor Tiket</th>
                <th className="pb-3 font-semibold">Subjek Kendala</th>
                <th className="pb-3 font-semibold">Kategori</th>
                <th className="pb-3 font-semibold">Pelapor</th>
                <th className="pb-3 font-semibold">Prioritas</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
              {tickets.slice(0, 5).map((t: any) => (
                <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 font-medium text-white">{t.ticketNumber}</td>
                  <td className="py-4 font-medium text-white">{t.title || t.subject}</td>
                  <td className="py-4 text-slate-400">{t.category?.name || '-'}</td>
                  <td className="py-4">{t.user?.name || 'Karyawan'}</td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      t.priority === 'Urgent' || t.priority === 'URGENT' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      t.status === 'Resolved' || t.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">Belum ada tiket tercatat di database.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}