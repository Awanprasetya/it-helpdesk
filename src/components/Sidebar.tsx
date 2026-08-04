import { LayoutDashboard, Ticket, HardDrive, Users, Settings, LogOut, BarChart3 } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onLogout }: any) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tickets', label: 'Manajemen Tiket', icon: Ticket },
    { id: 'assets', label: 'Inventaris Aset', icon: HardDrive },
    { id: 'reports', label: 'Laporan Performa', icon: BarChart3 },
    { id: 'users', label: 'Pengguna', icon: Users },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

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
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)} 
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
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