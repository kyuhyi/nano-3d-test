import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'motion/react';

export default function ScrollVideo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frameCount, setFrameCount] = useState(0);
  const [imagesMap] = useState<Map<number, HTMLImageElement>>(new Map());
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Fetch metadata to get frame count
  useEffect(() => {
    fetch('/frames/metadata.json')
      .then(res => {
        if (!res.ok) throw new Error('metadata.json not found');
        return res.json();
      })
      .then(data => {
        if (data.frameCount) {
          setFrameCount(data.frameCount);
        } else {
          setError('No frames found. Did you run "npm run extract-frames"?');
        }
      })
      .catch(err => {
        setError('Error loading frames. Did you run the extraction script? ' + err.message);
      });
  }, []);

  // Preload frames
  useEffect(() => {
    if (frameCount === 0) return;

    let loadedCount = 0;
    
    // Helper to pad the frame index (e.g., 1 -> 0001)
    const pad = (num: number) => String(num).padStart(4, '0');

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      img.src = `/frames/frame_${pad(i)}.webp`;
      img.onload = () => {
        imagesMap.set(i, img);
        loadedCount++;
        if (loadedCount === frameCount) {
          setIsLoaded(true);
        }
      };
      img.onerror = () => {
        console.error(`Failed to load frame_${pad(i)}.webp`);
        loadedCount++;
        if (loadedCount === frameCount) {
          setIsLoaded(true); // Proceed anyway to prevent indefinite loading
        }
      }
    }
  }, [frameCount, imagesMap]);

  // Initial draw
  useEffect(() => {
    if (isLoaded && imagesMap.has(1) && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      const img = imagesMap.get(1)!;
      // Set canvas size to image size
      canvasRef.current.width = img.width;
      canvasRef.current.height = img.height;
      
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(img, 0, 0);
      }
    }
  }, [isLoaded, imagesMap]);

  // Handle Scroll updates
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (!isLoaded || frameCount === 0 || !canvasRef.current) return;
    
    // Determine the frame index (1 to frameCount) based on scroll progress
    let frameIndex = Math.floor(latest * frameCount);
    // Ensure index is within boundaries
    if (frameIndex < 1) frameIndex = 1;
    if (frameIndex > frameCount) frameIndex = frameCount;

    const img = imagesMap.get(frameIndex);
    const ctx = canvasRef.current.getContext('2d');
    
    if (img && ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(img, 0, 0);
    }
  });

  return (
    <div ref={containerRef} className="relative h-[400vh] w-full bg-black">
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
        {error ? (
          <div className="absolute z-50 text-red-500 bg-black/80 p-8 rounded-xl font-mono text-center max-w-lg shadow-2xl border border-red-500/30">
            <h3 className="text-xl mb-4 text-red-400">Missing Video Frames</h3>
            <p>{error}</p>
            <div className="mt-4 text-sm text-zinc-400 leading-relaxed text-left">
              1. Place a <code className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-300 shadow-inner">video.mp4</code> file inside the <code className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-300 shadow-inner">public</code> folder.<br/>
              2. Run <code className="bg-emerald-900 px-1.5 py-1 rounded text-emerald-300 font-bold block mt-2 text-base shadow-inner">npm run extract-frames</code>
            </div>
          </div>
        ) : !isLoaded ? (
          <div className="flex flex-col h-full w-full items-center justify-center bg-zinc-900 border border-zinc-800">
            <div className="h-14 w-14 animate-spin rounded-full border-4 border-zinc-700 border-t-emerald-500 mb-6 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
            <p className="text-zinc-400 animate-pulse tracking-widest text-sm font-medium">LOADING HIGH-RES ASSETS...</p>
          </div>
        ) : null}

        <canvas
          ref={canvasRef}
          className="h-full w-full object-cover opacity-80 mix-blend-screen"
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <motion.div
            style={{ opacity: useTransform(scrollYProgress, [0, 0.2, 0.4], [1, 1, 0]) }}
            className="text-center"
          >
            <h1 className="font-sans text-6xl font-bold tracking-tighter text-white sm:text-8xl md:text-9xl drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]">
              AURA <span className="text-emerald-500">V1</span>
            </h1>
            <p className="mt-4 font-mono text-sm tracking-widest text-zinc-300 uppercase drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">
              Scroll to discover the engineering
            </p>
          </motion.div>

          <motion.div
            style={{ opacity: useTransform(scrollYProgress, [0.4, 0.6, 0.8], [0, 1, 0]) }}
            className="absolute text-center"
          >
            <h2 className="font-sans text-4xl font-medium tracking-tight text-white sm:text-6xl drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
              Precision in Every Part
            </h2>
            <p className="mt-4 max-w-md font-sans text-lg text-zinc-300 mx-auto drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">
              Thousands of components working in perfect harmony.
            </p>
          </motion.div>

          <motion.div
            style={{ opacity: useTransform(scrollYProgress, [0.8, 0.9, 1], [0, 1, 1]) }}
            className="absolute text-center"
          >
            <h2 className="font-sans text-4xl font-medium tracking-tight text-white sm:text-6xl drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
              The Future of Mobility
            </h2>
            <button className="pointer-events-auto mt-8 rounded-full border border-white/20 bg-white/10 px-8 py-3 font-sans text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-white hover:text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
              Reserve Yours
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
