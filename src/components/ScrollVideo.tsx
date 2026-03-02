import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'motion/react';

interface ScrollVideoProps {
  framesPath?: string;
  showOverlay?: boolean;
}

export default function ScrollVideo({ framesPath = '/frames', showOverlay = true }: ScrollVideoProps) {
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
    fetch(`${framesPath}/metadata.json`)
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
  }, [framesPath]);

  // Preload frames
  useEffect(() => {
    if (frameCount === 0) return;

    let loadedCount = 0;
    const pad = (num: number) => String(num).padStart(4, '0');

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      img.src = `${framesPath}/frame_${pad(i)}.webp`;
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
          setIsLoaded(true);
        }
      }
    }
  }, [frameCount, imagesMap, framesPath]);

  // Draw frame on canvas with proper scaling
  const drawFrame = (img: HTMLImageElement) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to viewport size for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Calculate cover fit
    const imgRatio = img.width / img.height;
    const canvasRatio = rect.width / rect.height;
    
    let drawWidth, drawHeight, offsetX, offsetY;
    
    if (imgRatio > canvasRatio) {
      // Image is wider - fit by height
      drawHeight = rect.height;
      drawWidth = drawHeight * imgRatio;
      offsetX = (rect.width - drawWidth) / 2;
      offsetY = 0;
    } else {
      // Image is taller - fit by width
      drawWidth = rect.width;
      drawHeight = drawWidth / imgRatio;
      offsetX = 0;
      offsetY = (rect.height - drawHeight) / 2;
    }

    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  };

  // Initial draw
  useEffect(() => {
    if (isLoaded && imagesMap.has(1)) {
      drawFrame(imagesMap.get(1)!);
    }
  }, [isLoaded, imagesMap]);

  // Redraw on resize
  useEffect(() => {
    const handleResize = () => {
      if (isLoaded && imagesMap.size > 0) {
        const currentProgress = scrollYProgress.get();
        let frameIndex = Math.floor(currentProgress * frameCount);
        if (frameIndex < 1) frameIndex = 1;
        if (frameIndex > frameCount) frameIndex = frameCount;
        const img = imagesMap.get(frameIndex);
        if (img) drawFrame(img);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isLoaded, imagesMap, frameCount, scrollYProgress]);

  // Handle Scroll updates
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (!isLoaded || frameCount === 0) return;
    
    let frameIndex = Math.floor(latest * frameCount);
    if (frameIndex < 1) frameIndex = 1;
    if (frameIndex > frameCount) frameIndex = frameCount;

    const img = imagesMap.get(frameIndex);
    if (img) drawFrame(img);
  });

  return (
    <div ref={containerRef} className="relative h-[300vh] md:h-[400vh] w-full bg-black">
      <div className="sticky top-0 flex h-[100dvh] w-full items-center justify-center overflow-hidden">
        {error ? (
          <div className="absolute z-50 text-red-500 bg-black/80 p-4 md:p-8 rounded-xl font-mono text-center max-w-sm md:max-w-lg shadow-2xl border border-red-500/30 mx-4">
            <h3 className="text-lg md:text-xl mb-4 text-red-400">Missing Video Frames</h3>
            <p className="text-sm md:text-base">{error}</p>
          </div>
        ) : !isLoaded ? (
          <div className="flex flex-col h-full w-full items-center justify-center bg-zinc-900 border border-zinc-800">
            <div className="h-10 w-10 md:h-14 md:w-14 animate-spin rounded-full border-4 border-zinc-700 border-t-emerald-500 mb-4 md:mb-6 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
            <p className="text-zinc-400 animate-pulse tracking-widest text-xs md:text-sm font-medium">LOADING...</p>
          </div>
        ) : null}

        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ opacity: 0.85 }}
        />

        {showOverlay && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4">
            <motion.div
              style={{ opacity: useTransform(scrollYProgress, [0, 0.2, 0.4], [1, 1, 0]) }}
              className="text-center"
            >
              <h1 className="font-sans text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-white drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]">
                AURA <span className="text-emerald-500">V1</span>
              </h1>
              <p className="mt-2 md:mt-4 font-mono text-xs md:text-sm tracking-widest text-zinc-300 uppercase drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">
                Scroll to discover
              </p>
            </motion.div>

            <motion.div
              style={{ opacity: useTransform(scrollYProgress, [0.4, 0.6, 0.8], [0, 1, 0]) }}
              className="absolute text-center px-4"
            >
              <h2 className="font-sans text-2xl sm:text-4xl md:text-6xl font-medium tracking-tight text-white drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                Precision in Every Part
              </h2>
              <p className="mt-2 md:mt-4 max-w-xs md:max-w-md font-sans text-sm md:text-lg text-zinc-300 mx-auto drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">
                Thousands of components in harmony.
              </p>
            </motion.div>

            <motion.div
              style={{ opacity: useTransform(scrollYProgress, [0.8, 0.9, 1], [0, 1, 1]) }}
              className="absolute text-center px-4"
            >
              <h2 className="font-sans text-2xl sm:text-4xl md:text-6xl font-medium tracking-tight text-white drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                The Future of Mobility
              </h2>
              <button className="pointer-events-auto mt-4 md:mt-8 rounded-full border border-white/20 bg-white/10 px-6 py-2 md:px-8 md:py-3 font-sans text-xs md:text-sm font-medium text-white backdrop-blur-md transition-colors active:bg-white active:text-black hover:bg-white hover:text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                Reserve Yours
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
