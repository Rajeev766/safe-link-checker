'use client';
import { useState } from 'react';

export default function ApiKeys() {
  const [keys, setKeys] = useState([
    { id: 'key-1', name: 'Production', scopes: 'verify,analytics:read', created: '2023-10-01', lastUsed: 'Just now' },
    { id: 'key-2', name: 'Staging', scopes: 'verify', created: '2023-11-15', lastUsed: '2 hours ago' },
  ]);

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">API Keys</h2>
          <p className="text-gray-400 mt-2">Manage programmatic access to the Safe Link Cloud Platform.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-[0_0_15px_rgba(79,70,229,0.5)]">
          + Generate Key
        </button>
      </header>

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/5">
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Scopes</th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Created</th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Last Used</th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {keys.map((key) => (
              <tr key={key.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4">
                  <div className="font-medium text-white">{key.name}</div>
                  <div className="text-xs text-gray-500 mt-1 font-mono">sk_live_...{key.id.slice(-4)}</div>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    {key.scopes.split(',').map(scope => (
                      <span key={scope} className="px-2 py-1 rounded text-[10px] uppercase font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {scope}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-400">{key.created}</td>
                <td className="p-4 text-sm text-gray-400">{key.lastUsed}</td>
                <td className="p-4 text-right">
                  <button className="text-gray-400 hover:text-white transition-colors text-sm font-medium mr-4">Edit</button>
                  <button className="text-rose-400 hover:text-rose-300 transition-colors text-sm font-medium">Revoke</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
