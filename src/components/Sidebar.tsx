import { useState } from 'react';
import { LayoutDashboard, Ticket, HardDrive, Users, Settings, LogOut, BarChart3, CheckSquare, ChevronDown, ChevronUp, Monitor, Video, Eye } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onLogout }: any) {
  // State untuk mengontrol apakah dropdown maintenance terbuka atau tertutup
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(
    activeTab === 'maintenance-pc' || activeTab === 'maintenance-cctv' || activeTab === 'maintenance'
  );

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-20">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg">IT</div>
          <span className="text-white font-bold text-lg tracking-wide">HelpDesk Pro</span>
        </div>
      </div>

      <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Menu Utama</p>
        
        {/* Dashboard */}
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </button>

        {/* Manajemen Tiket */}
        <button 
          onClick={() => setActiveTab('tickets')} 
          className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'tickets' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <Ticket size={20} />
          <span>Manajemen Tiket</span>
        </button>

        {/* Inventaris Aset */}
        <button 
          onClick={() => setActiveTab('assets')} 
          className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'assets' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <HardDrive size={20} />
          <span>Inventaris Aset</span>
        </button>

        {/* ================= DROPDOWN CHECKLIST MAINTENANCE ================= */}
        <div>
          <button 
            onClick={() => setIsMaintenanceOpen(!isMaintenanceOpen)}
            className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'maintenance-pc' || activeTab === 'maintenance-cctv' || activeTab === 'maintenance' || activeTab === 'cctv-monitor'
                ? 'text-white bg-slate-800/40'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <CheckSquare size={20} />
              <span>Checklist Maintenance</span>
            </div>
            {isMaintenanceOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {/* Sub-menu Dropdown */}
          {isMaintenanceOpen && (
            <div className="ml-4 mt-1 pl-4 border-l border-slate-800 space-y-1">
              <button
                onClick={() => setActiveTab('maintenance-pc')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'maintenance-pc' || activeTab === 'maintenance' 
                    ? 'bg-blue-600 text-white shadow-md font-semibold' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Monitor size={16} />
                <span>Maintenance Komputer</span>
              </button>

              <button
                onClick={() => setActiveTab('maintenance-cctv')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'maintenance-cctv' 
                    ? 'bg-blue-600 text-white shadow-md font-semibold' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Video size={16} />
                <span>Maintenance CCTV</span>
              </button>

              {/* Menu Baru: Monitoring IP CCTV */}
              <button
                onClick={() => setActiveTab('cctv-monitor')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'cctv-monitor' 
                    ? 'bg-blue-600 text-white shadow-md font-semibold' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Eye size={16} />
                <span>Monitoring IP CCTV</span>
              </button>
            </div>
          )}
        </div>
        {/* ================================================================= */}

        {/* Laporan Performa */}
        <button 
          onClick={() => setActiveTab('reports')} 
          className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'reports' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <BarChart3 size={20} />
          <span>Laporan Performa</span>
        </button>

        {/* Pengguna */}
        <button 
          onClick={() => setActiveTab('users')} 
          className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <Users size={20} />
          <span>Pengguna</span>
        </button>

        {/* Pengaturan */}
        <button 
          onClick={() => setActiveTab('settings')} 
          className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'settings' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <Settings size={20} />
          <span>Pengaturan</span>
        </button>
      </div>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={onLogout} 
          className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 cursor-pointer"
        >
          <LogOut size={20} />
          <span>Keluar Sistem</span>
        </button>
      </div>
    </aside>
  );
}