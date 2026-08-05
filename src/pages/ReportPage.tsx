import { useState, useEffect } from 'react';
import { Calendar, Download, FileText, CheckCircle2, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ReportPage() {
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // State Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Ambil URL Backend dari environment variable Vite
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/reports/${reportType}`);
      const data = await res.json();
      if (data.status === 'success') {
        setReportData(data);
        setCurrentPage(1); // Reset ke halaman 1 saat jenis laporan diganti
      }
    } catch (err) {
      console.error('Gagal mengambil data laporan', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const handleDownloadPDF = () => {
    window.print();
  };

  // Kalkulasi Pagination untuk data laporan
  const ticketsList = reportData?.data || [];
  const totalPages = Math.ceil(ticketsList.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTickets = ticketsList.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6">
      {/* Header & Filter (Tersembunyi saat dicetak ke PDF) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Laporan Performa IT</h1>
          <p className="text-slate-400 text-sm mt-1">Analisis dan rekapitulasi penanganan tiket berdasarkan periode.</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center space-x-2 bg-slate-950 p-1.5 border border-slate-800 rounded-xl">
            <button
              onClick={() => setReportType('daily')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${reportType === 'daily' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Harian
            </button>
            <button
              onClick={() => setReportType('weekly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${reportType === 'weekly' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Mingguan
            </button>
            <button
              onClick={() => setReportType('monthly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${reportType === 'monthly' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Bulanan
            </button>
          </div>

          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-lg cursor-pointer text-sm"
          >
            <Download size={18} /> Unduh PDF / Cetak
          </button>
        </div>
      </div>

      {/* Kop Laporan Resmi (Hanya tampil saat dicetak ke PDF) */}
      <div className="hidden print:block text-black mb-6">
        <h1 className="text-2xl font-bold uppercase">Laporan Rekapitulasi Performa IT - HelpDesk Pro</h1>
        <p className="text-sm">Periode Laporan: <span className="capitalize font-semibold">{reportType}</span></p>
        <p className="text-xs text-slate-600">Dicetak pada: {new Date().toLocaleString()}</p>
        <hr className="my-3 border-slate-400" />
      </div>

      {/* Loading & Content */}
      {loading ? (
        <div className="text-center py-20 text-slate-500">Memuat laporan...</div>
      ) : reportData ? (
        <div className="space-y-6 print:space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center space-x-4 print:bg-white print:border-slate-300 print:p-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold print:hidden">
                <FileText size={24} />
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider print:text-slate-600">Total Tiket Masuk</p>
                <h3 className="text-2xl font-bold text-white mt-1 print:text-black">{reportData.summary?.totalCreated || 0}</h3>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center space-x-4 print:bg-white print:border-slate-300 print:p-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold print:hidden">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider print:text-slate-600">Total Selesai</p>
                <h3 className="text-2xl font-bold text-white mt-1 print:text-black">
                  {reportData.summary?.totalResolved ?? reportData.summary?.totalClosed ?? 0}
                </h3>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center space-x-4 print:bg-white print:border-slate-300 print:p-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold print:hidden">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider print:text-slate-600">
                  {reportData.summary?.slaComplianceRate ? 'Kepatuhan SLA' : 'Tiket Pending'}
                </p>
                <h3 className="text-2xl font-bold text-white mt-1 print:text-black">
                  {reportData.summary?.slaComplianceRate || reportData.summary?.pendingTickets || 0}
                </h3>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center space-x-4 print:bg-white print:border-slate-300 print:p-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold print:hidden">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider print:text-slate-600">Rentang Waktu</p>
                <h3 className="text-xl font-bold text-white mt-1 capitalize print:text-black">{reportType}</h3>
              </div>
            </div>
          </div>

          {/* Tabel Detail Rekapitulasi Tiket dengan Pagination */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl print:bg-white print:border-none print:shadow-none">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center print:border-slate-300 print:px-0">
              <h3 className="font-semibold text-white print:text-black">Rincian Laporan & Penyelesaian Tiket ({reportType.toUpperCase()})</h3>
              <span className="text-xs text-slate-400 print:text-slate-600">Total Keseluruhan: {ticketsList.length}</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm print:text-black">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/50 print:bg-slate-200 print:border-slate-400">
                    <th className="py-3 px-4">No. Tiket</th>
                    <th className="py-3 px-4">Subjek Kendala</th>
                    <th className="py-3 px-4">Prioritas</th>
                    <th className="py-3 px-4">Status Penyelesaian</th>
                    <th className="py-3 px-4">Tanggal Masuk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 print:divide-slate-300 print:text-black">
                  {currentTickets.length > 0 ? (
                    currentTickets.map((item: any) => (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition-colors print:hover:bg-transparent">
                        <td className="py-3.5 px-4 font-medium text-blue-400 print:text-blue-800">{item.ticketNumber}</td>
                        <td className="py-3.5 px-4">{item.subject}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            item.priority === 'Urgent' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            item.priority === 'High' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                            'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {item.priority}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            item.status === 'Resolved' || item.status === 'Closed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 print:text-slate-600">
                          {new Date(item.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        Tidak ada data rekapitulasi tiket pada periode ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Kontrol Navigasi Pagination (Tersembunyi otomatis saat dicetak ke PDF) */}
            {ticketsList.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-t border-slate-800 gap-4 text-xs text-slate-400 bg-slate-950/40 rounded-b-2xl print:hidden">
                <div>
                  Menampilkan <span className="text-white font-medium">{indexOfFirstItem + 1}</span> sampai <span className="text-white font-medium">{Math.min(indexOfLastItem, ticketsList.length)}</span> dari <span className="text-white font-medium">{ticketsList.length}</span> data laporan
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={16} /> Sebelumnya
                  </button>
                  <span className="px-3 py-1.5 bg-slate-800/50 text-white rounded-lg font-medium">
                    Hal. {currentPage} dari {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors cursor-pointer"
                  >
                    Berikutnya <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}