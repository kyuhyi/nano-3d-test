import React from 'react';
import ScrollVideo from './components/ScrollVideo';

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30">
      <main>
        {/* Hero Section */}
        <section className="h-screen flex items-center justify-center bg-gradient-to-b from-black via-zinc-950 to-black relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
          <div className="max-w-5xl text-center space-y-8 px-4 relative z-10">
            <p className="text-emerald-500 text-sm uppercase tracking-[0.3em] font-medium">Introducing</p>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter">
              Aura <span className="text-emerald-500">V1</span>
            </h1>
            <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              The future of electric performance.<br />Redefined.
            </p>
            <div className="flex items-center justify-center gap-6 pt-8">
              <button className="px-8 py-4 bg-emerald-500 text-black font-semibold rounded-full hover:bg-emerald-400 transition-all duration-300 hover:scale-105">
                Pre-order Now
              </button>
              <button className="px-8 py-4 border border-white/20 rounded-full hover:bg-white/10 transition-all duration-300">
                Learn More
              </button>
            </div>
          </div>
          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
              <div className="w-1.5 h-3 bg-white/50 rounded-full" />
            </div>
          </div>
        </section>

        {/* 3D Scroll Video Section */}
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
      </main>
    </div>
  );
}
