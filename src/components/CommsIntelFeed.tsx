import React, { useState, useEffect } from 'react';

interface FeedMessage {
  id: string;
  sender: string;
  senderRole: string;
  channelName: string;
  message: string;
  policy?: string;
  timestamp: string;
}

export const CommsIntelFeed: React.FC = () => {
  const [messages, setMessages] = useState<FeedMessage[]>([]);

  const fetchFeed = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/live-bot-feed');
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      // Offline mode fallback
    }
  };

  useEffect(() => {
    fetchFeed();
    const interval = setInterval(fetchFeed, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  }, []);

  const getPolicyBadge = (policy?: string) => {
    switch (policy) {
      case 'CLASS_CANCELLED':
        return (
          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
            🚫 CLASS CANCELLED
          </span>
        );
      case 'EXTRA_CLASS':
        return (
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
            📅 EXTRA CLASS SCHEDULED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-bold">
            💬 GENERAL CHAT
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md shadow-xl text-white flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📡</span>
            <div>
              <h2 className="text-xl font-bold">Comms Intel Feed</h2>
              <p className="text-xs text-slate-400">Live Discord / Telegram Webhook Ingestion</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            LIVE AGENT
          </span>
        </div>

        <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
          {messages.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl">
              <p className="text-sm text-slate-400 font-medium">No live announcements received yet</p>
              <p className="text-xs text-slate-600 mt-1">
                Send a webhook payload to test real-time classification
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5 transition hover:border-slate-700"
              >
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-300">{msg.sender}</span>
                    <span className="text-slate-500">• {msg.channelName}</span>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px]">{msg.timestamp}</span>
                </div>

                <p className="text-sm text-slate-200">{msg.message}</p>

                <div className="pt-1">{getPolicyBadge(msg.policy)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};