import React, { useState } from 'react';
import { StudentProfile } from '../types';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onSaveProfile: (updated: StudentProfile) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [form, setForm] = useState<StudentProfile>(profile);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({ ...form, isLoggedIn: true });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-white">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold flex items-center gap-2">
            🎓 Student Profile & Rules Configuration
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Full Student Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">College / University Name</label>
            <input
              type="text"
              value={form.collegeName}
              onChange={(e) => setForm({ ...form, collegeName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Registration / Roll Number</label>
            <input
              type="text"
              value={form.regNo}
              onChange={(e) => setForm({ ...form, regNo: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Current Semester</label>
              <input
                type="number"
                min="1"
                max="8"
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Degree / Department</label>
              <input
                type="text"
                value={form.degree}
                onChange={(e) => setForm({ ...form, degree: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white"
                required
              />
            </div>
          </div>

          {/* Academic Rules & Threshold Settings */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-bold text-indigo-400 mb-1">Min Attendance % Threshold</label>
              <input
                type="number"
                min="50"
                max="100"
                value={form.minCriteria}
                onChange={(e) => setForm({ ...form, minCriteria: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-indigo-500/40 rounded-xl px-4 py-2 text-sm text-white font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-400 mb-1">Max ODs Allowed / Sem</label>
              <input
                type="number"
                min="1"
                max="30"
                value={form.maxOdAllowed}
                onChange={(e) => setForm({ ...form, maxOdAllowed: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-4 py-2 text-sm text-white font-mono"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-4 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm transition shadow-lg"
          >
            Save Credentials & Rules
          </button>
        </form>
      </div>
    </div>
  );
};