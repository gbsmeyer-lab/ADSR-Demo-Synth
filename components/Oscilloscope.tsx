
import React, { useEffect, useRef } from 'react';

interface Props {
  analyser: AnalyserNode | null;
  color?: string;
}

const Oscilloscope: React.FC<Props> = ({ analyser, color = "#22d3ee" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.4)'; // Slightly stronger fade for trail effect
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 3;
      ctx.strokeStyle = color;
      ctx.beginPath();

      const sliceWidth = canvas.width * 1.0 / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, color]);

  return (
    <div className="w-full h-full min-h-[200px] bg-slate-950 rounded-lg border border-slate-800 overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.5)] relative">
      <div className="absolute top-2 right-2 text-[10px] text-slate-600 font-mono uppercase">Output Signal</div>
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={300} 
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default Oscilloscope;
