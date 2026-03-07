import React, { useState, useRef, useEffect, useCallback } from 'react';
import JSZip from 'jszip';

type ImageFormat = 'jpg' | 'png' | 'webp';

interface ExtractedFrame {
  url: string;
  filename: string;
  timestamp: number;
}

export default function VideoFrameExtractor() {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [manualDuration, setManualDuration] = useState<string>('');
  const [frameCount, setFrameCount] = useState<number>(10);
  const [imageFormat, setImageFormat] = useState<ImageFormat>('jpg');
  const [extractedFrames, setExtractedFrames] = useState<ExtractedFrame[]>([]);
  const [error, setError] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const thumbnailRef = useRef<HTMLDivElement>(null);
  const wheelLock = useRef(false);

  const handleWheel = useCallback((e: WheelEvent) => {
    if (extractedFrames.length === 0 || wheelLock.current) return;
    e.preventDefault();
    e.stopPropagation();
    wheelLock.current = true;
    if (e.deltaY > 0 && currentIndex < extractedFrames.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (e.deltaY < 0 && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
    setTimeout(() => { wheelLock.current = false; }, 200);
  }, [extractedFrames.length, currentIndex]);

  useEffect(() => {
    const el = previewRef.current;
    if (el && extractedFrames.length > 0) {
      el.addEventListener('wheel', handleWheel, { passive: false });
      return () => el.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel, extractedFrames.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (extractedFrames.length === 0) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentIndex(prev => Math.min(extractedFrames.length - 1, prev + 1));
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentIndex(prev => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [extractedFrames.length]);

  useEffect(() => {
    if (thumbnailRef.current && extractedFrames.length > 0) {
      const thumb = thumbnailRef.current.children[currentIndex] as HTMLElement;
      if (thumb) thumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [currentIndex, extractedFrames.length]);

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setExtractedFrames([]);
      setCurrentIndex(0);
      setError('');
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      setVideoUrl(URL.createObjectURL(file));
    }
  };

  const handleVideoLoaded = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
      setManualDuration(videoRef.current.duration.toFixed(2));
    }
  };

  const getDuration = () => {
    const m = parseFloat(manualDuration);
    return isNaN(m) || m <= 0 ? videoDuration : m;
  };

  const captureFrame = (video: HTMLVideoElement, canvas: HTMLCanvasElement, time: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      video.currentTime = time;
      const onSeeked = () => {
        video.removeEventListener('seeked', onSeeked);
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('No context');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        resolve(canvas.toDataURL(imageFormat === 'jpg' ? 'image/jpeg' : `image/${imageFormat}`, 0.92));
      };
      video.addEventListener('seeked', onSeeked);
      setTimeout(() => { video.removeEventListener('seeked', onSeeked); reject('Timeout'); }, 5000);
    });
  };

  const extractFrames = async () => {
    if (!videoRef.current || !canvasRef.current || !videoFile) return;
    setProcessing(true);
    setProgress(0);
    setExtractedFrames([]);
    setCurrentIndex(0);
    setError('');

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const duration = getDuration();
    const frames: ExtractedFrame[] = [];
    const interval = duration / frameCount;

    for (let i = 0; i < frameCount; i++) {
      try {
        const url = await captureFrame(video, canvas, interval * i);
        frames.push({ url, filename: `frame_${String(i + 1).padStart(3, '0')}.${imageFormat}`, timestamp: interval * i });
      } catch {}
      setProgress(Math.round(((i + 1) / frameCount) * 100));
    }

    setExtractedFrames(frames);
    if (frames.length === 0) setError('프레임 추출 실패');
    setProcessing(false);
  };

  const downloadFrame = (f: ExtractedFrame) => {
    const a = document.createElement('a');
    a.href = f.url;
    a.download = f.filename;
    a.click();
  };

  const downloadAll = async () => {
    const zip = new JSZip();
    const folder = zip.folder('frames');
    if (!folder) return;
    for (const f of extractedFrames) {
      const res = await fetch(f.url);
      folder.file(f.filename, await res.blob());
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `frames_${Date.now()}.zip`;
    a.click();
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}.${String(Math.floor((s % 1) * 100)).padStart(2, '0')}`;

  return (
    <section className="min-h-screen bg-zinc-950 px-4 py-16">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter mb-4">
            Video <span className="text-emerald-500 italic">Frame</span> Extractor
          </h2>
          <p className="text-zinc-400">영상을 균등 분할하여 이미지로 추출</p>
        </div>

        {/* 업로드 */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 mb-6 backdrop-blur-sm">
          <h3 className="text-lg font-bold mb-4 text-emerald-500">영상 업로드</h3>
          <input type="file" accept="video/*" onChange={handleVideoUpload} className="w-full bg-zinc-800 rounded-xl p-4 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-emerald-600 file:text-white file:cursor-pointer hover:file:bg-emerald-700" />
          {videoUrl && (
            <div className="mt-4">
              <video ref={videoRef} src={videoUrl} onLoadedMetadata={handleVideoLoaded} className="w-full max-h-64 rounded-xl bg-black" controls crossOrigin="anonymous" />
              <div className="mt-2 p-4 bg-zinc-800/50 rounded-xl text-sm">
                <p><span className="text-zinc-500">파일:</span> {videoFile?.name}</p>
                <p><span className="text-zinc-500">크기:</span> {videoFile ? (videoFile.size / 1024 / 1024).toFixed(2) : 0} MB</p>
                {videoDuration > 0 && <p><span className="text-zinc-500">길이:</span> {formatTime(videoDuration)}</p>}
              </div>
            </div>
          )}
        </div>

        {/* 설정 */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 mb-6 backdrop-blur-sm">
          <h3 className="text-lg font-bold mb-4 text-emerald-500">설정</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-zinc-400 text-sm mb-2">영상 길이 (초)</label>
              <input type="number" min="0.1" step="0.1" value={manualDuration} onChange={(e) => setManualDuration(e.target.value)} className="w-full bg-zinc-800 rounded-xl p-4" />
            </div>
            <div>
              <label className="block text-zinc-400 text-sm mb-2">분할 갯수</label>
              <input type="number" min="1" max="100" value={frameCount} onChange={(e) => setFrameCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))} className="w-full bg-zinc-800 rounded-xl p-4" />
              <p className="text-zinc-600 text-xs mt-1">{getDuration() > 0 && `약 ${formatTime(getDuration() / frameCount)} 간격`}</p>
            </div>
            <div>
              <label className="block text-zinc-400 text-sm mb-2">이미지 포맷</label>
              <div className="flex gap-2">
                {(['jpg', 'png', 'webp'] as ImageFormat[]).map((f) => (
                  <button key={f} onClick={() => setImageFormat(f)} className={`flex-1 py-3 rounded-xl font-bold uppercase text-sm transition-all ${imageFormat === f ? 'bg-emerald-600' : 'bg-zinc-800 hover:bg-zinc-700'}`}>{f}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 추출 버튼 */}
        <button onClick={extractFrames} disabled={!videoFile || processing || videoDuration <= 0} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-zinc-700 disabled:to-zinc-700 py-5 rounded-2xl font-bold text-xl mb-6 transition-all">
          {processing ? `추출 중... ${progress}%` : '프레임 추출하기'}
        </button>

        {error && <div className="bg-red-900/50 border border-red-500/50 rounded-xl p-4 mb-6 text-center text-red-400">{error}</div>}

        {/* 결과 */}
        {extractedFrames.length > 0 && (
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-emerald-500">추출된 프레임 ({extractedFrames.length}개)</h3>
              <button onClick={downloadAll} className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl font-bold text-sm transition-all">전체 ZIP</button>
            </div>

            {/* 미리보기 */}
            <div ref={previewRef} className="relative bg-black rounded-xl overflow-hidden mb-4 cursor-ns-resize" style={{ height: '400px' }}>
              {extractedFrames.map((frame, idx) => (
                <img key={idx} src={frame.url} alt={`Frame ${idx + 1}`} className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300" style={{ opacity: idx === currentIndex ? 1 : 0 }} draggable={false} />
              ))}
              <button onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 disabled:opacity-30 p-3 rounded-full z-10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={() => setCurrentIndex(Math.min(extractedFrames.length - 1, currentIndex + 1))} disabled={currentIndex === extractedFrames.length - 1} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 disabled:opacity-30 p-3 rounded-full z-10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-10">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold">#{currentIndex + 1} / {extractedFrames.length}</p>
                    <p className="text-zinc-400 text-sm">{formatTime(extractedFrames[currentIndex]?.timestamp || 0)}</p>
                  </div>
                  <button onClick={() => downloadFrame(extractedFrames[currentIndex])} className="bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded-lg text-sm font-bold">다운로드</button>
                </div>
              </div>
              <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-xs text-zinc-400 z-10">↑↓ 휠로 탐색</div>
            </div>

            {/* 슬라이더 */}
            <input type="range" min="0" max={extractedFrames.length - 1} value={currentIndex} onChange={(e) => setCurrentIndex(parseInt(e.target.value))} className="w-full mb-4 accent-emerald-500" />

            {/* 썸네일 */}
            <div ref={thumbnailRef} className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
              {extractedFrames.map((frame, idx) => (
                <div key={idx} onClick={() => setCurrentIndex(idx)} className={`flex-shrink-0 relative rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${currentIndex === idx ? 'ring-2 ring-emerald-500 scale-110' : 'opacity-50 hover:opacity-100'}`} style={{ width: '70px' }}>
                  <img src={frame.url} alt={`Thumb ${idx + 1}`} className="w-full aspect-video object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1 text-xs text-center">#{idx + 1}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </section>
  );
}
