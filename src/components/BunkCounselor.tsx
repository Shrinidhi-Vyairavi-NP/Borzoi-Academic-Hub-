import React, { useState } from 'react';
import { Subject } from '../types';
import { calculatePercentage, calculateSafeBunks, calculateConsecutiveNeeded } from '../utils/attendance';
import { BorzoiMascot } from './BorzoiMascot';

interface BunkCounselorProps {
  subjects: Subject[];
  minCriteria: number;
}

export const BunkCounselor: React.FC<BunkCounselorProps> = ({ subjects, minCriteria }) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [aiRoast, setAiRoast] = useState<{ roast: string; statusBadge: string; cookedLevel: string } | null>(null);

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  const currentPct = activeSubject ? calculatePercentage(activeSubject.attended, activeSubject.total) : 100;
  const safeBunks = activeSubject ? calculateSafeBunks(activeSubject.attended, activeSubject.total, minCriteria) : 0;
  const consecutiveNeeded = activeSubject ? calculateConsecutiveNeeded(activeSubject.attended, activeSubject.total, minCriteria) : 0;
  const canBunk = safeBunks > 0;
  const isAtOrAboveThreshold = currentPct >= minCriteria;

  const autoSnootLength = canBunk
    ? Math.min(5, 3 + safeBunks)
    : isAtOrAboveThreshold
    ? 2 // Snoot stays alert at Level 2 when on the edge
    : Math.max(1, 2 - consecutiveNeeded);

  const getBorzoiRoast = async () => {
    if (!activeSubject) return;
    setLoading(true);

    try {
      const audio = new Audio('/assets/let-me-do-it-for-you.mp3');
      audio.volume = 0.8;
      audio.play().catch(() => {});
    } catch (e) {
      console.log('Audio playback prevented or missing file', e);
    }

    // Context-aware default roast
    let defaultRoast = {
      roast: '',
      statusBadge: '',
      cookedLevel: '',
    };

    if (canBunk) {
      defaultRoast = {
        roast: `Lord Foog extends his long snoot over ${activeSubject.name}! You have ${safeBunks} buffer class(es) to spare. Didn't I do it for you? Go get rest!`,
        statusBadge: 'SNOOT APPROVED: SAFE TO BUNK',
        cookedLevel: 'Crisp & Untouched (Safe)',
      };
    } else if (isAtOrAboveThreshold) {
      defaultRoast = {
        roast: `Lord Foog warns: You are sitting at ${currentPct}% in ${activeSubject.name}. While you meet your ${minCriteria}% threshold right now, bunking today will instantly drop you below it! Go to class to build a buffer!`,
        statusBadge: 'ON THE EDGE: ATTEND NEXT LECTURE',
        cookedLevel: 'Walking the Wire (Borderline)',
      };
    } else {
      defaultRoast = {
        roast: `BRO YOU ARE DEEP FRIED IN ${activeSubject.name.toUpperCase()}! Current attendance is ${currentPct}% against required ${minCriteria}%. You need ${consecutiveNeeded} consecutive class(es) RIGHT NOW!`,
        statusBadge: 'RED ALERT: DEEPLY COOKED',
        cookedLevel: 'Critically Overcooked',
      };
    }

    try {
      const res = await fetch('/api/borzoi-roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectName: activeSubject.name,
          attended: activeSubject.attended,
          total: activeSubject.total,
          minCriteria,
          canBunk,
          margin: safeBunks,
          consecutiveNeeded,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiRoast({
          roast: data.roast || defaultRoast.roast,
          statusBadge: data.statusBadge || defaultRoast.statusBadge,
          cookedLevel: data.cookedLevel || defaultRoast.cookedLevel,
        });
      } else {
        setAiRoast(defaultRoast);
      }
    } catch {
      setAiRoast(defaultRoast);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md shadow-xl text-white">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🐕</div>
          <div>
            <h2 className="text-xl font-bold">"Can I Bunk?" Counselor</h2>
            <p className="text-xs text-slate-400">Automatic Snoot Safety Indicator & AI Analyzer</p>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            canBunk
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : isAtOrAboveThreshold
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
          }`}
        >
          {canBunk
            ? 'SAFE TO BUNK'
            : isAtOrAboveThreshold
            ? 'ON THE EDGE: ATTEND'
            : 'COOKED: ATTEND LECTURE'}
        </span>
      </div>

      {activeSubject && (
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Select Subject
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => {
              setSelectedSubjectId(e.target.value);
              setAiRoast(null);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-indigo-500 transition"
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.code}: {sub.name} ({calculatePercentage(sub.attended, sub.total)}%)
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 mb-6 text-center">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
            Borzoi Dynamic Snoot Length
          </span>
          <span className="text-xs font-mono text-slate-400">
            Snoot Extension: Level {autoSnootLength} / 5
          </span>
        </div>

        <div className="py-3 flex justify-center items-center">
          <BorzoiMascot size={72} snootLength={autoSnootLength} />
        </div>
      </div>

      {activeSubject && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <p className="text-xs text-slate-400">Current Attendance</p>
            <p
              className={`text-2xl font-black mt-1 ${
                currentPct < minCriteria ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {currentPct}%
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              {activeSubject.attended} of {activeSubject.total} classes
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <p className="text-xs text-slate-400">
              {canBunk ? 'Safe Bunks Remaining' : 'Classes Needed'}
            </p>
            <p
              className={`text-2xl font-black mt-1 ${
                canBunk
                  ? 'text-indigo-400'
                  : isAtOrAboveThreshold
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {canBunk
                ? `${safeBunks} classes`
                : isAtOrAboveThreshold
                ? '0 (Attend next)'
                : `${consecutiveNeeded} in a row`}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              To maintain {minCriteria}% threshold
            </p>
          </div>
        </div>
      )}

      <button
        onClick={getBorzoiRoast}
        disabled={loading || !activeSubject}
        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 font-bold text-sm transition shadow-lg shadow-indigo-600/20 disabled:opacity-50"
      >
        {loading ? 'Consulting Borzoi Mascot...' : 'Ask Borzoi Mascot: Can I Bunk? 🐕'}
      </button>

      {aiRoast && (
        <div className="mt-6 p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-100 animate-fadeIn">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {aiRoast.statusBadge}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              Cooked Level: {aiRoast.cookedLevel}
            </span>
          </div>
          <p className="text-sm font-medium italic leading-relaxed mt-2 text-slate-200">
            "{aiRoast.roast}"
          </p>
        </div>
      )}
    </div>
  );
};