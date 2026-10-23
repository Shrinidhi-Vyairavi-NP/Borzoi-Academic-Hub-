import React, { useState, useEffect } from 'react';
import { StudentProfile } from '../types';

interface LeaveGeneratorProps {
  profile: StudentProfile;
}

export const LeaveGenerator: React.FC<LeaveGeneratorProps> = ({ profile }) => {
  const [form, setForm] = useState({
    studentName: profile.name,
    regNo: profile.regNo,
    degree: profile.degree,
    collegeName: profile.collegeName,
    semester: profile.semester,
    reason: 'Attending Hackathon / Medical',
    leaveType: 'od' as 'od' | 'leave',
    dates: '24th Oct 2026 - 26th Oct 2026',
    facultyRecipient: 'Head of Department',
  });

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      studentName: profile.name,
      regNo: profile.regNo,
      degree: profile.degree,
      collegeName: profile.collegeName,
      semester: profile.semester,
    }));
  }, [profile]);

  const [loading, setLoading] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState<string>('');

  const generateLocalDraft = () => {
    return `To,\nThe ${form.facultyRecipient},\nDepartment of ${form.degree},\n${form.collegeName}.\n\nRespected Sir/Madam,\n\nSubject: Request for ${
      form.leaveType === 'od' ? 'On-Duty (OD) Sanction' : 'Leave of Absence'
    } - ${form.studentName} (${form.regNo})\n\nI am writing to request ${
      form.leaveType === 'od' ? 'On-Duty sanction' : 'a leave of absence'
    } for the duration of ${form.dates} due to ${form.reason}.\n\nKindly grant permission for the aforementioned period so my academic attendance record remains updated.\n\nThanking you.\n\nYours sincerely,\n${
      form.studentName
    }\nRegister No: ${form.regNo}\nBranch: ${form.degree} (Semester ${form.semester})`;
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/generate-leave-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedLetter(data.letter || generateLocalDraft());
      } else {
        setGeneratedLetter(generateLocalDraft());
      }
    } catch {
      setGeneratedLetter(generateLocalDraft());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md shadow-xl text-white">
      <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
        📄 AI Leave & OD Application Draft Writer
      </h2>
      <p className="text-xs text-slate-400 mb-6">Generates formal academic sanction drafts</p>

      <form onSubmit={handleGenerate} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Student Name"
            value={form.studentName}
            onChange={(e) => setForm({ ...form, studentName: e.target.value })}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm"
            required
          />
          <input
            type="text"
            placeholder="Registration / Roll No"
            value={form.regNo}
            onChange={(e) => setForm({ ...form, regNo: e.target.value })}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={form.leaveType}
            onChange={(e) => setForm({ ...form, leaveType: e.target.value as any })}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm"
          >
            <option value="od">On-Duty (OD) Sanction Request</option>
            <option value="leave">Medical / Personal Leave</option>
          </select>
          <input
            type="text"
            placeholder="Target Dates (e.g. Oct 24 - Oct 26)"
            value={form.dates}
            onChange={(e) => setForm({ ...form, dates: e.target.value })}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm"
            required
          />
        </div>

        <textarea
          placeholder="Reason & Details"
          value={form.reason}
          onChange={(e) => setForm({ ...form, reason: e.target.value })}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm h-24"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-sm transition shadow-lg"
        >
          {loading ? 'Drafting Application...' : 'Generate Official Application Draft'}
        </button>
      </form>

      {generatedLetter && (
        <div className="mt-6 p-4 rounded-xl bg-slate-950 border border-slate-800">
          <h3 className="text-xs font-bold text-slate-400 mb-2">GENERATED OFFICIAL DRAFT:</h3>
          <pre className="text-xs text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
            {generatedLetter}
          </pre>
        </div>
      )}
    </div>
  );
};