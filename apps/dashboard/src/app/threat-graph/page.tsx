'use client';
import { useState } from 'react';

export default function ThreatGraph() {
  const [nodes, setNodes] = useState([
    { id: '1', type: 'url', value: 'https://login-apple-support.com', risk: 'HIGH' },
    { id: '2', type: 'domain', value: 'login-apple-support.com', risk: 'HIGH' },
    { id: '3', type: 'ip', value: '192.168.1.100', risk: 'CRITICAL' },
    { id: '4', type: 'campaign', value: 'Apple_Phish_2026', risk: 'CRITICAL' },
  ]);

  const [edges, setEdges] = useState([
    { source: '1', target: '2', type: 'HOSTED_ON' },
    { source: '2', target: '3', type: 'RESOLVES_TO' },
    { source: '3', target: '4', type: 'ASSOCIATED_WITH' },
  ]);

  return (
    <div className="p-10 max-w-7xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
      <header className="mb-6 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-3xl font-bold text-white">Threat Graph</h2>
          <p className="text-gray-400 mt-2">Correlate phishing infrastructure and detect campaigns automatically.</p>
        </div>
        <div className="flex gap-2">
          <input type="text" placeholder="Search IOC (Domain, IP, Hash)..." className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 w-80" />
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Search
          </button>
        </div>
      </header>

      {/* Mock Graph Visualizer Area */}
      <div className="glass rounded-2xl flex-1 relative overflow-hidden flex flex-col">
        {/* Controls Overlay */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <div className="bg-black/80 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white">Scale: 1.0x</div>
          <div className="bg-black/80 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-emerald-400 flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
             AI Correlation Active
          </div>
        </div>

        {/* Graph Canvas (Mocked visually) */}
        <div className="flex-1 w-full h-full relative bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px]">
          
          <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-2 border-rose-500 bg-rose-500/20 flex items-center justify-center text-xs font-bold shadow-[0_0_20px_rgba(244,63,94,0.4)]">URL</div>
            <div className="mt-2 text-xs text-white font-mono bg-black/80 px-2 py-1 rounded">{nodes[0].value}</div>
          </div>

          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <line x1="25%" y1="25%" x2="50%" y2="25%" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="4 4" />
            <line x1="50%" y1="25%" x2="70%" y2="50%" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
            <line x1="50%" y1="25%" x2="30%" y2="60%" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="4 4" />
          </svg>

          <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full border-2 border-rose-600 bg-rose-600/20 flex items-center justify-center text-xs font-bold shadow-[0_0_30px_rgba(225,29,72,0.4)]">DOMAIN</div>
            <div className="mt-2 text-xs text-white font-mono bg-black/80 px-2 py-1 rounded">{nodes[1].value}</div>
            <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-rose-500 text-black text-[10px] font-bold px-1 rounded">HOSTED_ON</div>
          </div>

          <div className="absolute top-1/2 left-[70%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="w-24 h-24 rounded-lg border-2 border-purple-500 bg-purple-500/20 flex items-center justify-center text-xs font-bold shadow-[0_0_30px_rgba(168,85,247,0.4)]">IP</div>
            <div className="mt-2 text-xs text-white font-mono bg-black/80 px-2 py-1 rounded">{nodes[2].value}</div>
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-purple-500 text-black text-[10px] font-bold px-1 rounded">RESOLVES_TO</div>
          </div>

          <div className="absolute top-[60%] left-[30%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="w-32 h-32 rounded-full border-2 border-red-500 bg-red-500/10 flex items-center justify-center text-sm font-bold shadow-[0_0_50px_rgba(239,68,68,0.3)]">CAMPAIGN</div>
            <div className="mt-2 text-xs text-white font-mono bg-black/80 px-2 py-1 rounded">{nodes[3].value}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
