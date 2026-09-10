import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Safe Link Cloud',
  description: 'Enterprise URL Intelligence Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-black text-gray-100 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-white/5 bg-black/50 glass z-10 flex flex-col">
          <div className="p-6">
            <h1 className="text-xl font-bold tracking-wider glow-text text-white">Safe Link</h1>
            <p className="text-xs text-indigo-400 mt-1 uppercase tracking-widest font-semibold">Cloud Platform</p>
          </div>
          
          <nav className="flex-1 px-4 space-y-2 mt-4">
            <Link href="/" className="block px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/10 hover:text-white text-gray-400">
              Overview
            </Link>
            <Link href="/threat-graph" className="block px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/10 hover:text-white text-gray-400">
              Threat Graph
            </Link>
            <Link href="/community" className="block px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/10 hover:text-white text-gray-400">
              Community Feed
            </Link>
            <Link href="/apikeys" className="block px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/10 hover:text-white text-gray-400">
              API Keys
            </Link>
            <Link href="#" className="block px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/10 hover:text-white text-gray-400 opacity-50 cursor-not-allowed">
              Rules Engine
            </Link>
            <Link href="#" className="block px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/10 hover:text-white text-gray-400 opacity-50 cursor-not-allowed">
              Webhooks
            </Link>
          </nav>
          
          <div className="p-4 mt-auto">
            <div className="glass rounded-xl p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">R</div>
              <div>
                <p className="text-sm font-medium">Rajeev</p>
                <p className="text-xs text-gray-500">Acme Corp</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 relative overflow-y-auto">
          <div className="glow-bg top-0 left-1/4"></div>
          <div className="glow-bg bottom-0 right-1/4" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, rgba(0,0,0,0) 70%)'}}></div>
          
          <div className="relative z-10 min-h-full">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
