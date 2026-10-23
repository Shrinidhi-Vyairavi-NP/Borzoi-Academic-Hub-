import React from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  showBackground: boolean;
  setShowBackground: (val: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  showBackground,
  setShowBackground,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-white">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">⚙️ Visual Settings</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div>
              <p className="font-semibold text-sm">Greyish Campus Background Layer</p>
              <p className="text-xs text-slate-400">Toggle campus backdrop photo overlay</p>
            </div>
            <input
              type="checkbox"
              checked={showBackground}
              onChange={(e) => setShowBackground(e.target.checked)}
              className="w-5 h-5 accent-indigo-500 rounded cursor-pointer"
            />
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm transition shadow-lg"
        >
          Save & Close
        </button>
      </div>
    </div>
  );
};