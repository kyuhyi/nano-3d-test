import React from 'react';
import ScrollVideo from './components/ScrollVideo';

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30">
      <main>
        {/* Hero - 이전 영상 프레임 */}
        <ScrollVideo framesPath="/frames-hero" showOverlay={true} />

        {/* Specs Section */}
        <section className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 py-16 md:py-0">
          <div className="max-w-4xl text-center space-y-6 md:space-y-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tighter">
              Engineered for <span className="text-emerald-500 italic">Speed</span>.
            </h2>
            <p className="text-base md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed px-2">
              Every component is meticulously crafted to deliver unparalleled performance.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8 pt-8 md:pt-16">
              <div className="p-6 md:p-8 rounded-2xl md:rounded-3xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm transition-transform hover:scale-[1.02] active:scale-[0.98] duration-300">
                <div className="text-2xl md:text-4xl font-mono text-emerald-500 mb-2 md:mb-4 font-semibold">0-60</div>
                <div className="text-lg md:text-xl font-medium mb-1 md:mb-2">1.9s</div>
                <div className="text-xs md:text-sm text-zinc-500">Acceleration</div>
              </div>
              <div className="p-6 md:p-8 rounded-2xl md:rounded-3xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm transition-transform hover:scale-[1.02] active:scale-[0.98] duration-300">
                <div className="text-2xl md:text-4xl font-mono text-emerald-500 mb-2 md:mb-4 font-semibold">250</div>
                <div className="text-lg md:text-xl font-medium mb-1 md:mb-2">mph</div>
                <div className="text-xs md:text-sm text-zinc-500">Top Speed</div>
              </div>
              <div className="p-6 md:p-8 rounded-2xl md:rounded-3xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm transition-transform hover:scale-[1.02] active:scale-[0.98] duration-300">
                <div className="text-2xl md:text-4xl font-mono text-emerald-500 mb-2 md:mb-4 font-semibold">520</div>
                <div className="text-lg md:text-xl font-medium mb-1 md:mb-2">mi</div>
                <div className="text-xs md:text-sm text-zinc-500">Range</div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom - 새 영상 프레임 */}
        <ScrollVideo framesPath="/frames" showOverlay={false} />
      </main>
    </div>
  );
}
