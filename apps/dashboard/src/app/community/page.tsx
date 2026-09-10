'use client';
import { useState, useEffect } from 'react';

export default function CommunityFeed() {
  const [reports, setReports] = useState([
    { id: '1', url: 'paypal-secure-auth123.com', type: 'Phishing', user: 'hunter42', status: 'verified', time: '1m ago' },
    { id: '2', url: 'steam-gift-free.net', type: 'Scam', user: 'anon', status: 'pending', time: '5m ago' },
    { id: '3', url: 'github-auth.internal.dev', type: 'False Positive', user: 'devops-lead', status: 'verified', time: '12m ago' },
  ]);

  return (
    <div className="p-10 max-w-7xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
      <header className="mb-6 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-3xl font-bold text-white">Community Feed</h2>
          <p className="text-gray-400 mt-2">Live stream of crowdsourced URL intelligence and reports.</p>
        </div>
      </header>

      <div className="glass rounded-2xl flex-1 overflow-hidden p-1 flex gap-6 bg-transparent border-0 shadow-none">
        
        {/* Live Stream */}
        <div className="w-2/3 glass rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Live Submissions
            </h3>
            <span className="text-xs text-gray-400">142 reports today</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="p-4 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between hover:bg-white/10 transition-colors">
                <div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                      report.type === 'False Positive' ? 'bg-blue-500/20 text-blue-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {report.type}
                    </span>
                    <span className="text-white font-mono text-sm">{report.url}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                    <span>Submitted by <span className="text-indigo-400">@{report.user}</span></span>
                    <span>•</span>
                    <span>{report.time}</span>
                  </div>
                </div>
                <div>
                  {report.status === 'pending' ? (
                    <div className="flex gap-2">
                      <button className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-3 py-1 rounded text-xs font-medium border border-emerald-500/30">Verify</button>
                      <button className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 px-3 py-1 rounded text-xs font-medium border border-rose-500/30">Reject</button>
                    </div>
                  ) : (
                    <span className="text-emerald-400 text-xs font-medium uppercase tracking-wider flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Verified
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Contributors */}
        <div className="w-1/3 glass rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/5 bg-white/5">
            <h3 className="font-semibold text-white">Top Contributors</h3>
          </div>
          <div className="p-4 space-y-4">
            {[
              { rank: 1, user: 'hunter42', score: 1420 },
              { rank: 2, user: 'cyber_sec_bot', score: 950 },
              { rank: 3, user: 'alex_d', score: 720 },
            ].map((user) => (
              <div key={user.rank} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    user.rank === 1 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' : 
                    user.rank === 2 ? 'bg-gray-300/20 text-gray-300 border border-gray-300/50' : 
                    'bg-orange-500/20 text-orange-400 border border-orange-500/50'
                  }`}>
                    {user.rank}
                  </div>
                  <span className="text-gray-200 font-medium text-sm">@{user.user}</span>
                </div>
                <div className="text-xs text-indigo-400 font-mono">{user.score} pts</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
