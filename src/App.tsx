import React from 'react';
import ScrollVideo from './components/ScrollVideo';

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30">
      <main>
        {/* Hero - Scroll Video (원래대로) */}
        <ScrollVideo />

        {/* Specs Section */}
        <section className="h-screen flex items-center justify-center bg-zinc-950 px-4 scroll-smooth">
          <div className="max-w-4xl text-center space-y-8">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter">
              Engineered for <span className="text-emerald-500 italic">Speed</span>.
            </h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Every component of the Aura V1 is meticulously crafted to deliver unparalleled performance and efficiency. Experience the pinnacle of automotive engineering.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
              <div className="p-8 rounded-3xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm transition-transform hover:scale-[1.02] hover:bg-zinc-800/50 duration-500 cursor-default">
                <div className="text-4xl font-mono text-emerald-500 mb-4 font-semibold">0-60</div>
                <div className="text-xl font-medium mb-2">1.9s</div>
                <div className="text-sm text-zinc-500">Acceleration</div>
              </div>
              <div className="p-8 rounded-3xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm transition-transform hover:scale-[1.02] hover:bg-zinc-800/50 duration-500 cursor-default">
                <div className="text-4xl font-mono text-emerald-500 mb-4 font-semibold">Top Speed</div>
                <div className="text-xl font-medium mb-2">250 mph</div>
                <div className="text-sm text-zinc-500">Track Mode</div>
              </div>
              <div className="p-8 rounded-3xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm transition-transform hover:scale-[1.02] hover:bg-zinc-800/50 duration-500 cursor-default">
                <div className="text-4xl font-mono text-emerald-500 mb-4 font-semibold">Range</div>
                <div className="text-xl font-medium mb-2">520 mi</div>
                <div className="text-sm text-zinc-500">EPA Estimated</div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom 3D Scroll Video */}
        <ScrollVideo />
      </main>
    </div>
  );
}
