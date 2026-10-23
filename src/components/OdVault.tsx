import React, { useState, useEffect } from 'react';

interface OdVaultProps {
  maxOdAllowed: number;
}

export const OdVault: React.FC<OdVaultProps> = ({ maxOdAllowed }) => {
  const [usedBones, setUsedBones] = useState<number>(() => {
    const saved = localStorage.getItem('borzoi_used_bones');
    return saved ? JSON.parse(saved) : 2;
  });

  useEffect(() => {
    localStorage.setItem('borzoi_used_bones', JSON.stringify(usedBones));
  }, [usedBones]);

  const availableBones = Math.max(0, maxOdAllowed - usedBones);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md shadow-xl text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            🏛️ OD Vault & Bone Tokens
          </h2>
          <p className="text-xs text-slate-400">Semester OD Allowance: {maxOdAllowed} Bones</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          {availableBones} Bones Remaining
        </span>
      </div>

      {/* Interactive Bone Token Grid */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 mb-4 text-center">
        <p className="text-[11px] font-bold text-indigo-400 mb-3 uppercase tracking-wider">
          Click a bone token to mark it used or restore it
        </p>
        <div className="flex flex-wrap justify-center gap-2.5">
          {Array.from({ length: maxOdAllowed }).map((_, idx) => {
            const isUsed = idx < usedBones;
            return (
              <button
                key={idx}
                onClick={() => {
                  if (isUsed) {
                    setUsedBones((prev) => Math.max(0, prev - 1));
                  } else {
                    setUsedBones((prev) => Math.min(maxOdAllowed, prev + 1));
                  }
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border cursor-pointer select-none ${
                  isUsed
                    ? 'bg-slate-900/90 border-slate-800 text-slate-600 line-through opacity-40'
                    : 'bg-amber-950/50 border-amber-500/60 text-amber-300 shadow-md shadow-amber-500/10 hover:scale-105 hover:bg-amber-900/60'
                }`}
                title={isUsed ? 'Click to restore bone token' : 'Click to use bone token for OD'}
              >
                🦴 <span className="font-mono">Bone #{idx + 1}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs text-slate-400">
        <span>Used ODs: <strong className="text-rose-400">{usedBones}</strong></span>
        <span>Configured in Profile: <strong className="text-amber-400">{maxOdAllowed} Max</strong></span>
      </div>
    </div>
  );
};