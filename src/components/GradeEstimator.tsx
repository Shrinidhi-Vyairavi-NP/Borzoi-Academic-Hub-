import React, { useState } from 'react';
import { Subject } from '../types';

interface GradeEstimatorProps {
  subjects: Subject[];
}

export const GradeEstimator: React.FC<GradeEstimatorProps> = ({ subjects }) => {
  const [grades, setGrades] = useState<Record<string, number>>({});

  const gradePoints: Record<string, number> = {
    'O (10)': 10,
    'A+ (9)': 9,
    'A (8)': 8,
    'B+ (7)': 7,
    'B (6)': 6,
  };

  let totalCredits = 0;
  let weightedPoints = 0;

  subjects.forEach((s) => {
    const pt = grades[s.id] || 9; // Default A+ (9)
    totalCredits += s.credits;
    weightedPoints += pt * s.credits;
  });

  const estimatedSgpa = totalCredits > 0 ? (weightedPoints / totalCredits).toFixed(2) : '10.00';

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md shadow-xl text-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">📊 SGPA & Grade Estimator</h2>
          <p className="text-xs text-slate-400">Credit-weighted academic projection</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Projected SGPA</p>
          <p className="text-2xl font-black text-indigo-400">{estimatedSgpa}</p>
        </div>
      </div>

      <div className="space-y-3">
        {subjects.map((sub) => (
          <div key={sub.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <p className="text-sm font-semibold">{sub.name}</p>
              <p className="text-xs text-slate-500">{sub.code} • {sub.credits} Credits</p>
            </div>
            <select
              value={grades[sub.id] || 9}
              onChange={(e) => setGrades({ ...grades, [sub.id]: Number(e.target.value) })}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-xs text-indigo-300 font-bold"
            >
              {Object.entries(gradePoints).map(([label, val]) => (
                <option key={label} value={val}>{label}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};