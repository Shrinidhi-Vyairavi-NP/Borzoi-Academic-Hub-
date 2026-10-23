import React, { useEffect, useState } from 'react';
import { ChatMessage } from '../types';

interface CommsIntelFeedProps {
  onClassCancelledDetected?: (subjectHint: string) => void;
  onExtraClassDetected?: (subjectHint: string) => void;
}

export const CommsIntelFeed: React.FC<CommsIntelFeedProps> = ({
  onClassCancelledDetected,
  onExtraClassDetected,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showWebhookModal, setShowWebhookModal] = useState(false);

  const fetchLiveMessages = async () => {
    try {
      const res = await fetch('/api/live-bot-feed');
      const data = await res.json();
      if (data.messages) {
        const processed = data.messages.map((m: any) => {
          const text = m.message.toLowerCase();
          const isQuestion = text.endsWith('?') || text.includes('is the') || text.includes('did the');
          
          // Strict detection avoiding questions
          const isCancelled = !isQuestion && (
            text.includes('cancelled') || text.includes('canceled') || text.includes('class is off') || text.includes('no class')
          );

          const isExtra = !isQuestion && (
            text.includes('extra class') || text.includes('rescheduled') || text.includes('special class')
          );

          return {
            ...m,
            senderRole: m.senderRole || 'Student',
            isCancelledEvent: isCancelled,
            isExtraClassEvent: isExtra,
          };
        });
        setMessages(processed);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLiveMessages();
    const interval = setInterval(fetchLiveMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md shadow-xl text-white">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">📡 Comms Intel Feed</h2>
          <p className="text-xs text-slate-400">Live Discord / Telegram Webhook Ingestion</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowWebhookModal(true)}
            className="text-xs bg-indigo-950 hover:bg-indigo-900 text-indigo-300 font-bold px-3 py-1.5 rounded-lg border border-indigo-500/40 transition"
          >
            🔗 Connect Webhook
          </button>
          <button
            onClick={fetchLiveMessages}
            className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/40 text-slate-400 text-sm">
          No live chat messages received yet.
        </div>
      ) : (
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {messages.slice().reverse().map((msg) => (
            <div
              key={msg.id}
              className={`p-4 rounded-xl bg-slate-950/60 border ${
                msg.isCancelledEvent
                  ? 'border-amber-500/50 bg-amber-950/10'
                  : msg.isExtraClassEvent
                  ? 'border-indigo-500/50 bg-indigo-950/10'
                  : 'border-slate-800/80'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-indigo-400">
                  {msg.sender} <span className="text-slate-400 font-normal">({msg.senderRole})</span>
                </span>
                <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
              </div>
              <p className="text-xs text-slate-400 mb-1.5">{msg.channelName}</p>
              <p className="text-sm text-slate-200">{msg.message}</p>

              {msg.isCancelledEvent && (
                <div className="mt-3 pt-2 border-t border-amber-500/20 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                    ⚡ CLASS CANCELLATION DETECTED
                  </span>
                  {onClassCancelledDetected && (
                    <button
                      onClick={() => onClassCancelledDetected(msg.message)}
                      className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold border border-amber-500/30"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              )}

              {msg.isExtraClassEvent && (
                <div className="mt-3 pt-2 border-t border-indigo-500/20 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1">
                    📅 EXTRA CLASS SCHEDULED
                  </span>
                  {onExtraClassDetected && (
                    <button
                      onClick={() => onExtraClassDetected(msg.message)}
                      className="px-2.5 py-1 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-[11px] font-bold border border-indigo-500/30"
                    >
                      +1 Total Class Count
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Webhook Linking Modal */}
      {showWebhookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-white">
            <h3 className="text-lg font-bold mb-2">🔗 Link Custom Webhook Channel</h3>
            <p className="text-xs text-slate-400 mb-4">
              Connect your Discord, Telegram, or WhatsApp class group by pointing webhooks to your server endpoint:
            </p>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-indigo-300 select-all mb-4">
              http://localhost:3000/api/discord-webhook
            </div>
            <button
              onClick={() => setShowWebhookModal(false)}
              className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};