import { Search, Bell, User } from 'lucide-react';

export default function Navbar({ currentUser }: any) {
  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 fixed top-0 right-0 left-64 z-10 flex items-center justify-between px-8">
      <div className="relative w-96">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><Search size={18} /></span>
        <input type="text" placeholder="Cari nomor tiket, kendala, atau perangkat..." className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500" />
      </div>
      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl cursor-pointer"><Bell size={20} /><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full"></span></button>
        <div className="h-6 w-[1px] bg-slate-800"></div>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold"><User size={20} /></div>
          <div className="text-left">
            <p className="text-sm font-semibold text-white leading-none">{currentUser?.name || 'Administrator'}</p>
            <p className="text-xs text-blue-400 font-medium mt-1">{currentUser?.role || 'Admin'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}