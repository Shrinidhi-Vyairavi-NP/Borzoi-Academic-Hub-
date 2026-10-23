import React from 'react';
import { BorzoiMascot } from './BorzoiMascot';
import { StudentProfile } from '../types';

interface HeaderProps {
  profile: StudentProfile;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ profile, onOpenProfile, onOpenSettings }) => {
  return (
    <header className="relative z-20 border-b border-slate-800/80 backdrop-greyish px-6 py-4 flex justify-between items-center shadow-lg">
      <div className="flex items-center gap-3.5">
        <div className="relative group cursor-pointer" onClick={onOpenProfile}>
          <BorzoiMascot size={52} className="drop-shadow-[0_0_10px_rgba(99,102,241,0.4)]" />
          <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-slate-950">
            Sem {profile.semester}
          </div>
        </div>

        <div>
          <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
            Borzoi Academic Hub
          </h1>
          <p className="text-xs text-indigo-400 font-semibold mt-0.5">
            {profile.name} • {profile.regNo} ({profile.degree})
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onOpenProfile}
          className="px-3.5 py-2 rounded-xl bg-indigo-950/80 hover:bg-indigo-900/80 border border-indigo-500/40 text-xs font-bold text-indigo-300 transition flex items-center gap-2"
        >
          👤 {profile.isLoggedIn ? `Sem ${profile.semester} Profile` : 'Login / Profile'}
        </button>

        <button
          onClick={onOpenSettings}
          className="px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-xs font-semibold border border-slate-700/80 transition flex items-center gap-2 shadow-sm"
        >
          ⚙️ Settings
        </button>
      </div>
    </header>
  );
};