import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BunkCounselor } from './components/BunkCounselor';
import { SubjectManager } from './components/SubjectManager';
import { CommsIntelFeed } from './components/CommsIntelFeed';
import { OdVault } from './components/OdVault';
import { LeaveGenerator } from './components/LeaveGenerator';
import { SettingsModal } from './components/SettingsModal';
import { StudentProfileModal } from './components/StudentProfileModal';
import { Subject, StudentProfile } from './types';

export const App: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showBackground, setShowBackground] = useState(true);

  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem('borzoi_profile');
    return saved
      ? JSON.parse(saved)
      : {
          name: 'Shrinidhi Vyairavi NP',
          regNo: '25011102059',
          semester: 5,
          degree: 'B.Tech AI & Data Science',
          collegeName: 'Shiv Nadar University Chennai',
          minCriteria: 80,
          maxOdAllowed: 5,
          isLoggedIn: true,
        };
  });

  useEffect(() => {
    localStorage.setItem('borzoi_profile', JSON.stringify(profile));
  }, [profile]);

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('borzoi_subjects');
    return saved
      ? JSON.parse(saved)
      : [
          { id: '1', name: 'Data Structures & Algorithms', code: 'CS301', attended: 28, total: 32, credits: 4 },
          { id: '2', name: 'Computer Architecture', code: 'CS302', attended: 20, total: 30, credits: 3 },
          { id: '3', name: 'Database Management Systems', code: 'CS303', attended: 26, total: 28, credits: 4 },
          { id: '4', name: 'Embedded Systems & IoT', code: 'CS304', attended: 18, total: 24, credits: 3 },
        ];
  });

  useEffect(() => {
    localStorage.setItem('borzoi_subjects', JSON.stringify(subjects));
  }, [subjects]);

  const handleAddSubject = (newSub: Subject) => {
    setSubjects((prev) => [...prev, newSub]);
  };

  const handleEditSubject = (updatedSub: Subject) => {
    setSubjects((prev) => prev.map((sub) => (sub.id === updatedSub.id ? updatedSub : sub)));
  };

  const handleDeleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((sub) => sub.id !== id));
  };

  const handleUpdateAttendance = (id: string, attendedDelta: number, totalDelta: number) => {
    setSubjects((prev) =>
      prev.map((sub) =>
        sub.id === id
          ? { ...sub, attended: sub.attended + attendedDelta, total: sub.total + totalDelta }
          : sub
      )
    );
  };

  return (
    <div className="min-h-screen text-slate-100 bg-slate-950 relative overflow-x-hidden">
      {showBackground && (
        <div
          className="fixed inset-0 bg-cover bg-center pointer-events-none z-0 opacity-40 bg-slate-950/60 bg-blend-overlay"
          style={{ backgroundImage: `url('/assets/campus-bg.avif')` }}
        />
      )}

      <Header
        profile={profile}
        onOpenProfile={() => setShowProfile(true)}
        onOpenSettings={() => setShowSettings(true)}
      />

      <main className="relative z-10 max-w-7xl mx-auto p-6 space-y-6">
        <SubjectManager
          subjects={subjects}
          minCriteria={profile.minCriteria}
          onAddSubject={handleAddSubject}
          onEditSubject={handleEditSubject}
          onDeleteSubject={handleDeleteSubject}
          onUpdateAttendance={handleUpdateAttendance}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BunkCounselor subjects={subjects} minCriteria={profile.minCriteria} />
          <CommsIntelFeed />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <OdVault maxOdAllowed={profile.maxOdAllowed} />
          </div>
          <div className="lg:col-span-2">
            <LeaveGenerator profile={profile} />
          </div>
        </div>
      </main>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        showBackground={showBackground}
        setShowBackground={setShowBackground}
      />

      <StudentProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        profile={profile}
        onSaveProfile={setProfile}
      />
    </div>
  );
};

export default App;