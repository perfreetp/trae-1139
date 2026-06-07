import { useRef, useEffect } from 'react';

interface RadarChartProps {
  data: { label: string; value: number; max?: number }[];
  size?: number;
}

export default function RadarChart({ data, size = 240 }: RadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.35;
    const count = data.length;
    const angleStep = (Math.PI * 2) / count;

    ctx.clearRect(0, 0, size, size);

    for (let ring = 1; ring <= 4; ring++) {
      const r = (radius * ring) / 4;
      ctx.beginPath();
      for (let i = 0; i <= count; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(42, 42, 69, 0.8)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    for (let i = 0; i < count; i++) {
      const angle = i * angleStep - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
      ctx.strokeStyle = 'rgba(42, 42, 69, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.beginPath();
    for (let i = 0; i <= count; i++) {
      const idx = i % count;
      const angle = idx * angleStep - Math.PI / 2;
      const max = data[idx].max || 100;
      const val = Math.min(data[idx].value / max, 1);
      const x = cx + radius * val * Math.cos(angle);
      const y = cy + radius * val * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    for (let i = 0; i < count; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const max = data[i].max || 100;
      const val = Math.min(data[i].value / max, 1);
      const x = cx + radius * val * Math.cos(angle);
      const y = cy + radius * val * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
    }

    for (let i = 0; i < count; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const lx = cx + (radius + 24) * Math.cos(angle);
      const ly = cy + (radius + 24) * Math.sin(angle);
      ctx.font = '12px "Noto Sans SC", sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(data[i].label, lx, ly);
    }
  }, [data, size]);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
}
