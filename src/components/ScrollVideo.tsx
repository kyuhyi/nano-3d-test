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
              <img 
                src="https://cdn.imweb.me/thumbnail/20260305/249b4e4bde696.png" 
                alt="BSD Class" 
                className="h-20 md:h-32 lg:h-40 mx-auto drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]"
              />
              {/* 스크롤 마우스 애니메이션 */}
              <div className="mt-8 md:mt-12 flex flex-col items-center">
                <div className="w-6 h-10 md:w-8 md:h-12 border-2 border-emerald-500 rounded-full flex justify-center p-2">
                  <motion.div 
                    className="w-1.5 h-3 md:w-2 md:h-4 bg-emerald-500 rounded-full"
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
                <motion.svg 
                  className="w-4 h-4 md:w-5 md:h-5 text-emerald-500 mt-2"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </motion.svg>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
