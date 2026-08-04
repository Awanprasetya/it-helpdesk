import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Laptop, Trash2, Edit, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AssetManagementPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  
  // State Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Form state
  const [assetCode, setAssetCode] = useState('');
  const [assetName, setAssetName] = useState('');
  const [categoryType, setCategoryType] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('Available');
  const [employees, setEmployees] = useState<any[]>([]);
  const [assignedTo, setAssignedTo] = useState('');

  // State khusus Searchable Employee Dropdown
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const employeeDropdownRef = useRef<HTMLDivElement>(null);

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

  const fetchAssets = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/assets');
      const data = await res.json();
      if (data.status === 'success') setAssets(data.data);
    } catch (err) {
      console.error('Gagal memuat data aset');
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/employees');
      const data = await res.json();
      if (data.status === 'success') setEmployees(data.data);
    } catch (err) {
      console.error('Gagal memuat karyawan');
    }
  };

  useEffect(() => {
    fetchAssets();
    fetchEmployees();
  }, []);

  // Reset halaman ke 1 setiap kali kotak pencarian (searchQuery) berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Filter karyawan berdasarkan input pencarian
  const filteredEmployees = employees.filter((emp: any) => {
    const name = emp.full_name || emp.name || '';
    const dept = emp.department || '';
    const query = employeeSearch.toLowerCase();
    return name.toLowerCase().includes(query) || dept.toLowerCase().includes(query);
  });

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setSelectedAsset(null);
    setAssetCode(`AST-${Math.floor(1000 + Math.random() * 9000)}`);
    setAssetName('');
    setCategoryType('');
    setSerialNumber('');
    setLocation('');
    setStatus('Available');
    setAssignedTo('');
    setEmployeeSearch('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (asset: any) => {
    setIsEditMode(true);
    setSelectedAsset(asset);
    setAssetCode(asset.assetCode);
    setAssetName(asset.assetName);
    setCategoryType(asset.categoryType || '');
    setSerialNumber(asset.serialNumber || '');
    setLocation(asset.location);
    setStatus(asset.status);
    setAssignedTo(asset.assignedTo || '');
    
    if (asset.user?.fullName || asset.user?.full_name) {
      setEmployeeSearch(asset.user.fullName || asset.user.full_name);
    } else {
      setEmployeeSearch('');
    }
    
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = isEditMode 
      ? `http://localhost:5000/api/assets/${selectedAsset.id}` 
      : 'http://localhost:5000/api/assets';
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetCode,
          assetName,
          categoryType,
          serialNumber,
          location,
          status,
          assignedTo: assignedTo ? Number(assignedTo) : null
        })
      });
      const data = await res.json();
      if (res.ok) {
        fetchAssets();
        setIsModalOpen(false);
      } else {
        alert(data.message || 'Gagal menyimpan aset');
      }
    } catch (err) {
      alert('Kesalahan koneksi server');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus aset ini?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/assets/${id}`, { method: 'DELETE' });
      if (res.ok) fetchAssets();
    } catch (err) {
      alert('Gagal menghapus aset');
    }
  };

  // 1. Filter aset berdasarkan Search Query
  const filteredAssets = assets.filter(a => 
    a.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.assetCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 2. Kalkulasi Data untuk Pagination
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAssets = filteredAssets.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Laptop className="text-blue-500" /> Manajemen Aset IT
          </h1>
          <p className="text-slate-400 text-sm mt-1">Kelola inventaris perangkat keras, status, dan penempatannya.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-lg cursor-pointer text-sm"
        >
          <Plus size={18} /> Tambah Aset Baru
        </button>
      </div>

      {/* Search Bar Utama */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 text-slate-500" size={18} />
        <input
          type="text"
          placeholder="Cari berdasarkan nama aset, kode, atau lokasi..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Tabel Aset */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-xs tracking-wider bg-slate-950/50">
                <th className="p-4">Kode & Nama Aset</th>
                <th className="p-4">Kategori / SN</th>
                <th className="p-4">Lokasi</th>
                <th className="p-4">Pemegang (Assigned To)</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {currentAssets.length > 0 ? (
                currentAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-white">{asset.assetName}</div>
                      <div className="text-xs text-blue-400 font-mono">{asset.assetCode}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-white">{asset.categoryType || '-'}</div>
                      <div className="text-xs text-slate-500 font-mono">{asset.serialNumber || 'No S/N'}</div>
                    </td>
                    <td className="p-4">{asset.location}</td>
                    <td className="p-4">
                      {asset.user?.fullName || asset.user?.full_name ? (
                        <span className="text-emerald-400 font-medium">{asset.user.fullName || asset.user.full_name}</span>
                      ) : (
                        <span className="text-slate-500 italic">Belum diserahkan</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        asset.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        asset.status === 'In_Use' || asset.status === 'In Use' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        asset.status === 'In_Maintenance' || asset.status === 'In Maintenance' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button onClick={() => handleOpenEdit(asset)} className="p-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg transition-colors cursor-pointer">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(asset.id)} className="p-2 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-lg transition-colors cursor-pointer">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">Tidak ada data aset ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Kontrol Navigasi Pagination */}
        {filteredAssets.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-slate-800 gap-4 text-xs text-slate-400 bg-slate-950/30">
            <div>
              Menampilkan <span className="text-white font-medium">{indexOfFirstItem + 1}</span> sampai <span className="text-white font-medium">{Math.min(indexOfLastItem, filteredAssets.length)}</span> dari <span className="text-white font-medium">{filteredAssets.length}</span> data aset
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

      {/* Modal Tambah / Edit Aset */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4 pb-3 border-b border-slate-800">
              {isEditMode ? 'Edit Data Aset' : 'Tambah Aset Baru'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Kode Aset</label>
                  <input type="text" required value={assetCode} onChange={e => setAssetCode(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Nama Aset</label>
                  <input type="text" required placeholder="Contoh: Laptop Dell Latitude" value={assetName} onChange={e => setAssetName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Kategori Tipe</label>
                  <input type="text" placeholder="Contoh: Laptop / PC / Monitor" value={categoryType} onChange={e => setCategoryType(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Serial Number (S/N)</label>
                  <input type="text" placeholder="Nomor seri perangkat" value={serialNumber} onChange={e => setSerialNumber(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Lokasi</label>
                <input type="text" required placeholder="Contoh: Lantai 2 - Ruang Server" value={location} onChange={e => setLocation(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Status Aset</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 [&>option]:bg-slate-900">
                    <option value="Available">Available</option>
                    <option value="In Use">In Use</option>
                    <option value="In Maintenance">In Maintenance</option>
                    <option value="Broken">Broken</option>
                  </select>
                </div>

                {/* Searchable Dropdown Pemegang Aset */}
                <div className="relative" ref={employeeDropdownRef}>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Pemegang (Karyawan)</label>
                  <input
                    type="text"
                    placeholder="Ketik untuk cari karyawan..."
                    value={employeeSearch}
                    onChange={(e) => {
                      setEmployeeSearch(e.target.value);
                      setIsEmployeeDropdownOpen(true);
                      if (!e.target.value) setAssignedTo('');
                    }}
                    onFocus={() => setIsEmployeeDropdownOpen(true)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                  />

                  {isEmployeeDropdownOpen && (
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                      <div
                        onClick={() => {
                          setAssignedTo('');
                          setEmployeeSearch('');
                          setIsEmployeeDropdownOpen(false);
                        }}
                        className="px-3 py-2.5 hover:bg-slate-800 cursor-pointer text-slate-400 text-xs border-b border-slate-800 font-medium"
                      >
                        -- Belum Diserahkan (Unassigned) --
                      </div>
                      {filteredEmployees.length > 0 ? (
                        filteredEmployees.map((emp: any) => (
                          <div
                            key={emp.id}
                            onClick={() => {
                              setAssignedTo(emp.id);
                              setEmployeeSearch(emp.full_name || emp.name);
                              setIsEmployeeDropdownOpen(false);
                            }}
                            className="px-3 py-2.5 hover:bg-slate-800 cursor-pointer text-white text-xs border-b border-slate-800/50 last:border-none"
                          >
                            <div className="font-medium">{emp.full_name || emp.name}</div>
                            {emp.department && <div className="text-[10px] text-slate-400">{emp.department}</div>}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-3 text-slate-400 text-xs text-center">Karyawan tidak ditemukan</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl cursor-pointer">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg cursor-pointer">Simpan Aset</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}