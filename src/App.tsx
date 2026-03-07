import React from 'react';
import ScrollVideo from './components/ScrollVideo';
import VideoFrameExtractor from './components/VideoFrameExtractor';

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30">
      <main>
        {/* Hero - 이전 영상 프레임 */}
        <ScrollVideo framesPath="/frames-hero" showOverlay={true} />

        {/* Video Frame Extractor */}
        <VideoFrameExtractor />

        {/* Bottom - 새 영상 프레임 */}
        <ScrollVideo framesPath="/frames" showOverlay={false} />
      </main>
    </div>
  );
}
