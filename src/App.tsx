import React, { useState, useEffect, useRef } from 'react';
import LoginPage from './pages/LoginPage';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import TicketManagementPage from './pages/TicketManagementPage';
import AssetManagementPage from './pages/AssetManagementPage';
import ReportPage from './pages/ReportPage';
import TicketModal from './components/TicketModal';
import EditTicketModal from './components/EditTicketModal';
import MaintenancePage from './pages/MaintenancePage';
import CCTVMaintenancePage from './pages/CCTVMaintenancePage'; // <-- Import Halaman CCTV

export default function App() {
  // Mode tampilan awal: 'user-form' (untuk publik/pelapor) atau 'admin' (setelah login)
  const [appMode, setAppMode] = useState<'user-form' | 'admin'>('user-form');
  
  // State khusus Admin
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  
  // State Modal Admin
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  // State untuk Form Publik User
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCatId, setFormCatId] = useState('');
  const [formPriority, setFormPriority] = useState('Medium');
  const [formUserId, setFormUserId] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // State khusus Searchable Employee Dropdown
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const employeeDropdownRef = useRef<HTMLDivElement>(null);

  // Ambil URL Backend dari environment variable Vite
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Tutup dropdown jika klik di luar area
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target as Node)) {
        setIsEmployeeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/api/categories`);
      const data = await res.json();
      if (data.status === 'success') setCategories(data.data);
    } catch (err) {
      setCategories([
        { id: 1, name: 'Hardware' },
        { id: 2, name: 'Software' },
        { id: 3, name: 'Network & Internet' },
        { id: 4, name: 'Access & Account' },
      ]);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_URL}/api/employees`);
      const data = await res.json();
      if (data.status === 'success') setEmployees(data.data);
    } catch (err) {
      console.error('Gagal memuat data karyawan');
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tickets`);
      const data = await res.json();
      if (data.status === 'success') setTickets(data.data);
    } catch (err) {
      console.error('Gagal memuat tiket');
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchEmployees();
    if (isLoggedIn) {
      fetchTickets();
    }
  }, [isLoggedIn]);

  // Filter karyawan berdasarkan input pencarian
  const filteredEmployees = employees.filter((emp: any) => {
    const name = emp.name || emp.full_name || '';
    const dept = emp.department || '';
    const query = employeeSearch.toLowerCase();
    return name.toLowerCase().includes(query) || dept.toLowerCase().includes(query);
  });

  // Handle Submit Form User (Publik)
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formCatId || !formUserId) {
      alert('Mohon lengkapi Judul, Kategori, dan Nama Karyawan!');
      return;
    }

    setFormLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          description: formDesc,
          categoryId: Number(formCatId),
          priority: formPriority,
          userId: Number(formUserId),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Tiket berhasil dikirim! Nomor Tiket Anda: ${data.data.ticketNumber}`);
        setFormTitle('');
        setFormDesc('');
        setFormCatId('');
        setFormPriority('Medium');
        setFormUserId('');
        setEmployeeSearch('');
      } else {
        alert(data.message || 'Gagal membuat tiket');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  // ================= TAMPILAN 1: FORM PUBLIK UNTUK USER =================
  if (appMode === 'user-form') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6">
        <div className="w-full max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl mt-10">
          <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide">Portal Bantuan IT</h1>
              <p className="text-slate-400 text-sm mt-1">Formulir pengajuan tiket kendala IT perusahaan.</p>
            </div>
            {/* Tombol peralihan ke Login Admin */}
            <button
              onClick={() => setAppMode('admin')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              Login Admin
            </button>
          </div>

          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-medium">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleUserSubmit} className="space-y-5">
            {/* Searchable Dropdown Karyawan */}
            <div className="relative" ref={employeeDropdownRef}>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Nama Karyawan</label>
              <input
                type="text"
                placeholder="Ketik untuk mencari nama karyawan..."
                value={employeeSearch}
                onChange={(e) => {
                  setEmployeeSearch(e.target.value);
                  setIsEmployeeDropdownOpen(true);
                  if (!e.target.value) setFormUserId('');
                }}
                onFocus={() => setIsEmployeeDropdownOpen(true)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              />
              
              {isEmployeeDropdownOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((emp: any) => (
                      <div
                        key={emp.id}
                        onClick={() => {
                          setFormUserId(emp.id);
                          setEmployeeSearch(emp.name || emp.full_name);
                          setIsEmployeeDropdownOpen(false);
                        }}
                        className="px-4 py-3 hover:bg-slate-800 cursor-pointer text-white text-sm border-b border-slate-800/50 last:border-none"
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
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Judul Kendala / Subjek</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Contoh: Koneksi Wi-Fi lantai 2 terputus"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Kategori</label>
                <select
                  value={formCatId}
                  onChange={(e) => setFormCatId(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 [&>option]:bg-slate-900 [&>option]:text-white"
                >
                  <option value="" className="bg-slate-900 text-slate-400">-- Pilih Kategori --</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id} className="bg-slate-900 text-white">{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Prioritas</label>
                <select
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 [&>option]:bg-slate-900 [&>option]:text-white"
                >
                  <option value="Low" className="bg-slate-900 text-white">Low</option>
                  <option value="Medium" className="bg-slate-900 text-white">Medium</option>
                  <option value="High" className="bg-slate-900 text-white">High</option>
                  <option value="Urgent" className="bg-slate-900 text-white">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Deskripsi Detail Kendala</label>
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                rows={4}
                placeholder="Jelaskan kendala secara rinci..."
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={formLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3.5 rounded-xl transition-all shadow-lg cursor-pointer disabled:opacity-50"
            >
              {formLoading ? 'Mengirim...' : 'Kirim Tiket Bantuan'}
            </button>
          </form>
        </div>
        <footer className="text-center text-xs text-slate-500 py-4">
          HelpDesk IT System &copy; 2026
        </footer>
      </div>
    );
  }

  // ================= TAMPILAN 2: AREA ADMIN =================
  if (!isLoggedIn) {
    return (
      <LoginPage 
        onLoginSuccess={(user: any) => { setCurrentUser(user); setIsLoggedIn(true); }} 
        onBackToUserForm={() => setAppMode('user-form')} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex relative">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={() => { setIsLoggedIn(false); setCurrentUser(null); setAppMode('user-form'); }} 
      />

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Navbar currentUser={currentUser} />

        <main className="flex-1 p-8 mt-16 bg-slate-950 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardPage 
              currentUser={currentUser} 
              tickets={tickets} 
              setActiveTab={setActiveTab} 
              openCreateModal={() => setIsModalOpen(true)} 
            />
          )}

          {activeTab === 'tickets' && (
            <TicketManagementPage 
              tickets={tickets} 
              refreshTickets={fetchTickets}
              openCreateModal={() => setIsModalOpen(true)}
              openEditModal={(ticket: any) => { setSelectedTicket(ticket); setIsEditOpen(true); }}
            />
          )}

          {activeTab === 'assets' && (
            <AssetManagementPage />
          )}

          {/* Maintenance Komputer */}
          {(activeTab === 'maintenance-pc' || activeTab === 'maintenance') && (
            <MaintenancePage />
          )}

          {/* Maintenance CCTV */}
          {activeTab === 'maintenance-cctv' && (
            <CCTVMaintenancePage />
          )}

          {activeTab === 'reports' && (
            <ReportPage />
          )}

          {/* Fallback jika ada tab lain yang belum terdaftar */}
          {activeTab !== 'dashboard' && 
           activeTab !== 'tickets' && 
           activeTab !== 'assets' && 
           activeTab !== 'maintenance-pc' && 
           activeTab !== 'maintenance' && 
           activeTab !== 'maintenance-cctv' && 
           activeTab !== 'reports' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-2 capitalize">{activeTab}</h2>
              <p className="text-slate-400 text-sm">Modul dan fungsionalitas untuk halaman {activeTab} sedang dipersiapkan.</p>
            </div>
          )}
        </main>
      </div>

      {isModalOpen && (
        <TicketModal 
          categories={categories} 
          currentUser={currentUser} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={fetchTickets} 
        />
      )}

      {isEditOpen && selectedTicket && (
        <EditTicketModal 
          ticket={selectedTicket} 
          onClose={() => setIsEditOpen(false)} 
          onSuccess={fetchTickets} 
        />
      )}
    </div>
  );
}