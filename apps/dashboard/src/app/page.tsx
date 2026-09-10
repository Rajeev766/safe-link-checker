'use client';
import { useEffect, useState } from 'react';

export default function Overview() {
  const [stats, setStats] = useState({ total: 14205, safe: 12100, blocked: 2105 });

  useEffect(() => {
    // Mock realtime updates
    const interval = setInterval(() => {
      setStats(prev => ({
        total: prev.total + Math.floor(Math.random() * 5),
        safe: prev.safe + Math.floor(Math.random() * 4),
        blocked: prev.blocked + Math.floor(Math.random() * 2),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Overview</h2>
          <p className="text-gray-400 mt-2">Realtime threat intelligence telemetry for your projects.</p>
        </div>
        <div className="flex items-center gap-2 glass px-4 py-2 rounded-full">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-medium text-emerald-400">Cloud Active</span>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="glass p-6 rounded-2xl relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-50"></div>
          <h3 className="text-gray-400 text-sm font-medium mb-2 uppercase tracking-wider">Total Scans</h3>
          <p className="text-4xl font-bold text-white">{stats.total.toLocaleString()}</p>
          <p className="text-xs text-indigo-400 mt-2">+12% from last hour</p>
        </div>

        <div className="glass p-6 rounded-2xl relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-50"></div>
          <h3 className="text-gray-400 text-sm font-medium mb-2 uppercase tracking-wider">Safe URLs</h3>
          <p className="text-4xl font-bold text-white">{stats.safe.toLocaleString()}</p>
          <p className="text-xs text-emerald-400 mt-2">{(stats.safe/stats.total*100).toFixed(1)}% safe rate</p>
        </div>

        <div className="glass p-6 rounded-2xl relative overflow-hidden group hover:border-rose-500/50 transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-red-500 opacity-50"></div>
          <h3 className="text-gray-400 text-sm font-medium mb-2 uppercase tracking-wider">Threats Blocked</h3>
          <p className="text-4xl font-bold text-white">{stats.blocked.toLocaleString()}</p>
          <p className="text-xs text-rose-400 mt-2">{(stats.blocked/stats.total*100).toFixed(1)}% block rate</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mock Chart Area */}
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Traffic Volume (24h)</h3>
          <div className="h-64 flex items-end justify-between gap-2 px-2">
            {[40, 55, 30, 70, 85, 45, 90, 60, 50, 75, 40, 80, 95, 65, 55, 100, 85, 40].map((h, i) => (
              <div key={i} className="w-full relative group">
                <div 
                  className="w-full bg-indigo-500/20 rounded-t-sm group-hover:bg-indigo-500/40 transition-all border-t border-indigo-500/30" 
                  style={{ height: `${h}%` }}
                ></div>
              </div>
            ))}
          </div>
        </div>

        {/* Realtime Feed */}
        <div className="glass rounded-2xl p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            Threat Feed
          </h3>
          
          <div className="flex-1 space-y-4">
            {[
              { url: 'login-apple-support.com', type: 'Phishing', time: 'Just now' },
              { url: 'free-nitro-discord.gg', type: 'Scam', time: '2m ago' },
              { url: 'secure-bank-update.info', type: 'Malware', time: '5m ago' },
              { url: 'paypal-auth-verify.com', type: 'Phishing', time: '12m ago' },
            ].map((threat, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                <div className="overflow-hidden">
                  <p className="text-sm text-gray-200 font-medium truncate w-32">{threat.url}</p>
                  <p className="text-xs text-rose-400 mt-1">{threat.type}</p>
                </div>
                <div className="text-xs text-gray-500">{threat.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
