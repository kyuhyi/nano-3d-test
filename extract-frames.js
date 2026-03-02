import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const inputVideo = path.join(process.cwd(), 'public', 'video.mp4');
const outputDir = path.join(process.cwd(), 'public', 'frames');

if (!fs.existsSync(inputVideo)) {
  console.error('❌ Error: public/video.mp4 not found.');
  console.error('Please place your video file at: ' + inputVideo);
  process.exit(1);
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
} else {
  console.log('Cleaning up existing frames...');
  fs.readdirSync(outputDir).forEach(file => {
    if (file.endsWith('.webp') || file === 'metadata.json') {
      fs.unlinkSync(path.join(outputDir, file));
    }
  });
}

console.log('🎬 Extracting frames using FFmpeg...');
console.log('This might take a moment depending on the video length.');

try {
  // Extract frames at 30 FPS, scaled to 1920px width (maintaining aspect ratio), saved as WEBP
  const command = `ffmpeg -i "${inputVideo}" -vf "fps=30,scale=1920:-1" -c:v libwebp -lossless 0 -q:v 80 "${path.join(outputDir, 'frame_%04d.webp')}"`;
  execSync(command, { stdio: 'inherit' });
  
  const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.webp'));
  const metadata = { frameCount: files.length };
  
  // Save metadata so the frontend knows how many frames to load
  fs.writeFileSync(path.join(outputDir, 'metadata.json'), JSON.stringify(metadata, null, 2));
  
  console.log(`✅ Successfully extracted ${files.length} frames.`);
  console.log(`Frames and metadata.json saved in: ${outputDir}`);
} catch (err) {
  console.error('❌ Error running FFmpeg. Please ensure FFmpeg is installed and added to your system PATH.');
  console.error(err.message);
  process.exit(1);
}
