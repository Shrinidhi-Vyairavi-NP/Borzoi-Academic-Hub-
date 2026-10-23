import React, { useState } from 'react';
import { Subject } from '../types';
import { calculatePercentage } from '../utils/attendance';

interface SubjectManagerProps {
  subjects: Subject[];
  minCriteria: number;
  onAddSubject: (newSub: Subject) => void;
  onEditSubject: (updatedSub: Subject) => void;
  onDeleteSubject: (id: string) => void;
  onUpdateAttendance: (id: string, attendedDelta: number, totalDelta: number) => void;
}

export const SubjectManager: React.FC<SubjectManagerProps> = ({
  subjects,
  minCriteria,
  onAddSubject,
  onEditSubject,
  onDeleteSubject,
  onUpdateAttendance,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);

  const [form, setForm] = useState<{
    name: string;
    code: string;
    credits: string | number;
    attended: string | number;
    total: string | number;
  }>({
    name: '',
    code: '',
    credits: '',
    attended: '',
    total: '',
  });

  const openAddModal = () => {
    setEditingSubjectId(null);
    setForm({ name: '', code: '', credits: '', attended: '', total: '' });
    setShowModal(true);
  };

  const openEditModal = (sub: Subject) => {
    setEditingSubjectId(sub.id);
    setForm({
      name: sub.name,
      code: sub.code,
      credits: sub.credits,
      attended: sub.attended,
      total: sub.total,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.code) return;

    const parsedCredits = Math.max(1, Number(form.credits) || 1);
    const parsedAttended = Math.max(0, Number(form.attended) || 0);
    const parsedTotal = Math.max(0, Number(form.total) || 0);

    if (editingSubjectId) {
      onEditSubject({
        id: editingSubjectId,
        name: form.name,
        code: form.code,
        credits: parsedCredits,
        attended: parsedAttended,
        total: parsedTotal,
      });
    } else {
      onAddSubject({
        id: `sub-${Date.now()}`,
        name: form.name,
        code: form.code,
        credits: parsedCredits,
        attended: parsedAttended,
        total: parsedTotal,
      });
    }

    setShowModal(false);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md shadow-xl text-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            📚 Academic Subject Dashboard
          </h2>
          <p className="text-xs text-slate-400">
            Target Threshold: <strong className="text-indigo-400">{minCriteria}%</strong> • Class fraction & attendance status
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs transition shadow-md flex items-center gap-1.5"
        >
          <span>+</span> Add Subject
        </button>
      </div>

      <div className="space-y-3">
        {subjects.map((sub) => {
          const pct = calculatePercentage(sub.attended, sub.total);
          const isSafe = pct >= minCriteria;

          return (
            <div
              key={sub.id}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{sub.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono">
                    {sub.code}
                  </span>
                  <span className="text-xs text-slate-500">• {sub.credits} Credits</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-lg font-black text-white">
                    {sub.attended} / {sub.total}
                  </p>
                  <p className={`text-xs font-bold ${isSafe ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {pct}% Attendance
                  </p>
                </div>

                <div className="flex gap-1.5 items-center">
                  <button
                    onClick={() => onUpdateAttendance(sub.id, 1, 1)}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold border border-emerald-500/30 transition"
                    title="Attended today's class"
                  >
                    +1 Attended
                  </button>
                  <button
                    onClick={() => onUpdateAttendance(sub.id, 0, 1)}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold border border-rose-500/30 transition"
                    title="Bunked/Missed today's class"
                  >
                    +1 Bunked
                  </button>

                  <button
                    onClick={() => openEditModal(sub)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition border border-slate-700"
                    title="Edit Subject"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDeleteSubject(sub.id)}
                    className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-xs transition border border-rose-800/50"
                    title="Remove Subject"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-white">
            <h3 className="text-lg font-bold mb-4">
              {editingSubjectId ? 'Edit Academic Subject' : 'Add New Academic Subject'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Subject Name (e.g. Operating Systems)"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Subject Code (CS305)"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Credits (e.g. 3)"
                  value={form.credits}
                  onChange={(e) => setForm({ ...form, credits: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min="0"
                  placeholder="Attended Classes (e.g. 20)"
                  value={form.attended}
                  onChange={(e) => setForm({ ...form, attended: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Total Classes (e.g. 22)"
                  value={form.total}
                  onChange={(e) => setForm({ ...form, total: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold transition"
                >
                  {editingSubjectId ? 'Update Subject' : 'Save Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};