import React, { useEffect, useRef } from 'react';

// Pixel/retro style progress bar with glowing ring
export default function RetroTimer({ seconds, maxSeconds, running }) {
  const percent = Math.min(100, (seconds / maxSeconds) * 100);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Draw glowing ring
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = 120;
    const center = size / 2;
    const radius = 48;
    ctx.clearRect(0, 0, size, size);
    // Outer glow
    ctx.save();
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.restore();
    // Progress arc
    ctx.beginPath();
    ctx.arc(center, center, radius, -Math.PI/2, (2 * Math.PI) * (percent/100) - Math.PI/2);
    ctx.strokeStyle = running ? '#fff' : '#888';
    ctx.lineWidth = 8;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [seconds, maxSeconds, running, percent]);

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} width={120} height={120} className="mb-2" style={{imageRendering:'pixelated'}} />
      <div className="font-mono text-3xl text-pink-400 drop-shadow-[0_2px_4px_rgba(168,85,247,0.7)] select-none">
        {String(Math.floor(seconds/60)).padStart(2,'0')}:{String(seconds%60).padStart(2,'0')}
      </div>
    </div>
  );
}
