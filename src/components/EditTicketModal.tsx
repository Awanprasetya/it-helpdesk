import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function EditTicketModal({ ticket, onClose, onSuccess }: any) {
  const [editTitle, setEditTitle] = useState(ticket.title || ticket.subject);
  const [editDesc, setEditDesc] = useState(ticket.description);
  const [editPriority, setEditPriority] = useState(ticket.priority);
  const [editStatus, setEditStatus] = useState(ticket.status);
  
  // State baru untuk penugasan admin/handler
  const [assignedTo, setAssignedTo] = useState(ticket.assignedTo || '');
  const [adminList, setAdminList] = useState<any[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ambil daftar admin / user handler saat modal dibuka
  useEffect(() => {
    fetch('http://localhost:5000/api/tickets/admins')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          setAdminList(data.data);
        }
      })
      .catch((err) => console.error('Gagal memuat daftar admin handler:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`http://localhost:5000/api/tickets/${ticket.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          description: editDesc,
          priority: editPriority,
          status: editStatus,
          assignedTo: assignedTo ? Number(assignedTo) : null, // Mengirim ID admin/handler yang mengerjakan
        }),
      });

      const data = await response.json();
      if (response.ok && data.status === 'success') {
        onSuccess();
        onClose();
      } else {
        alert(data.message || 'Gagal memperbarui tiket');
      }
    } catch (err) {
      alert('Kesalahan koneksi server');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs font-semibold text-blue-400">{ticket.ticketNumber}</span>
            <h3 className="text-lg font-bold text-white">Edit Tiket Kendala</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Subjek Kendala</label>
            <input
              type="text"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Prioritas</label>
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 [&>option]:bg-slate-900 [&>option]:text-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 [&>option]:bg-slate-900 [&>option]:text-white"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending Vendor">Pending Vendor</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Input Dropdown Baru: Petugas / Admin yang Mengerjakan */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Admin / Petugas yang Mengerjakan</label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 [&>option]:bg-slate-900 [&>option]:text-white"
            >
              <option value="">-- Belum Ditugaskan (Unassigned) --</option>
              {adminList.map((admin: any) => (
                <option key={admin.id} value={admin.id}>
                  {admin.name} {admin.department ? `(${admin.department})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Deskripsi Detail</label>
            <textarea
              rows={3}
              required
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 resize-none"
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
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}