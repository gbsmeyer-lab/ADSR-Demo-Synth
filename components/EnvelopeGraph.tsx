
import React, { useRef, useEffect } from 'react';
import { ADSRState } from '../types';

interface Props {
  adsr: ADSRState;
  gate: {
    state: 'open' | 'closed';
    lastTriggerTime: number;
    lastReleaseTime: number;
  };
}

const EnvelopeGraph: React.FC<Props> = ({ adsr, gate }) => {
  const { attack, decay, sustain, release } = adsr;
  const dotRef = useRef<SVGCircleElement>(null);
  
  // Dimensions
  const width = 300;
  const height = 150;
  const padding = 10;
  const graphHeight = height - padding * 2;

  // Scaling factors
  const timeScale = 40; // pixels per second roughly
  
  // Coordinates
  const startX = 0;
  const startY = height - padding; // Bottom

  const attackX = startX + (attack * timeScale);
  const attackY = padding; // Top (Peak)

  const decayX = attackX + (decay * timeScale);
  const decayY = padding + ((1 - sustain) * graphHeight); // Sustain Level

  // Visual representation of "Hold" phase
  const holdTime = 1.0; 
  const sustainX = decayX + (holdTime * timeScale);
  const sustainY = decayY;

  const releaseX = sustainX + (release * timeScale);
  const releaseY = height - padding;

  // Generate Path
  const pathData = `
    M ${startX},${startY}
    L ${attackX},${attackY}
    L ${decayX},${decayY}
    L ${sustainX},${sustainY}
    L ${releaseX},${releaseY}
  `;

  // Animation Logic
  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      if (!dotRef.current) return;
      
      const now = Date.now();
      
      let x = startX;
      let y = startY;

      if (gate.state === 'open') {
        const elapsed = (now - gate.lastTriggerTime) / 1000;
        
        if (elapsed < attack) {
            // Attack Phase
            const progress = elapsed / Math.max(0.001, attack);
            x = startX + (attackX - startX) * progress;
            y = startY + (attackY - startY) * progress;
        } else if (elapsed < attack + decay) {
            // Decay Phase
            const decayElapsed = elapsed - attack;
            const progress = decayElapsed / Math.max(0.001, decay);
            x = attackX + (decayX - attackX) * progress;
            y = attackY + (decayY - attackY) * progress;
        } else {
            // Sustain Phase (Holding)
            // For visual clarity, we'll keep the dot at the "knee" of the sustain
            // or we could slowly drift it along the sustain line if we wanted
            x = decayX; 
            y = decayY;
        }
      } else {
        // Release Phase
        const elapsed = (now - gate.lastReleaseTime) / 1000;
        
        if (elapsed < release) {
            const progress = elapsed / Math.max(0.001, release);
            // Visually jumping to the Release segment of the graph
            x = sustainX + (releaseX - sustainX) * progress;
            y = sustainY + (releaseY - sustainY) * progress;
        } else {
            // Ended
            x = startX;
            y = startY;
        }
      }

      dotRef.current.setAttribute('cx', x.toString());
      dotRef.current.setAttribute('cy', y.toString());
      
      // Opacity handling: Fade out if idle for a long time? 
      // Or just stay at 0,0.
      // Let's keep it visible if gate is open or recently released
      const isAnimating = gate.state === 'open' || (gate.state === 'closed' && (now - gate.lastReleaseTime) / 1000 < release);
      dotRef.current.style.opacity = isAnimating ? '1' : '0';

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [gate, attack, decay, sustain, release, attackX, attackY, decayX, decayY, sustainX, sustainY, releaseX, releaseY]);


  // Color palette - Magenta/Fuchsia focus
  const strokeColor = gate.state === 'open' ? "#d946ef" : "#701a75"; 
  const fillColor = gate.state === 'open' ? "rgba(217, 70, 239, 0.2)" : "rgba(112, 26, 117, 0.1)";

  return (
    <div className="bg-slate-900 rounded-lg border border-slate-700 p-4 shadow-inner relative overflow-hidden group h-full min-h-[200px]">
        <div className="absolute top-2 right-4 text-xs text-slate-500 font-mono pointer-events-none select-none">
            ADSR VISUALIZER
        </div>
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-full">
        {/* Grid lines */}
        <line x1={0} y1={height-padding} x2={width} y2={height-padding} stroke="#334155" strokeWidth="1" />
        <line x1={0} y1={padding} x2={width} y2={padding} stroke="#334155" strokeWidth="1" strokeDasharray="4" />
        
        {/* Phases labels */}
        <text x={attackX/2} y={height-2} fontSize="10" fill="#94a3b8" textAnchor="middle" className="select-none">A</text>
        <text x={attackX + (decay * timeScale)/2} y={height-2} fontSize="10" fill="#94a3b8" textAnchor="middle" className="select-none">D</text>
        <text x={decayX + (holdTime * timeScale)/2} y={height-2} fontSize="10" fill="#94a3b8" textAnchor="middle" className="select-none">S</text>
        <text x={sustainX + (release * timeScale)/2} y={height-2} fontSize="10" fill="#94a3b8" textAnchor="middle" className="select-none">R</text>

        {/* The Envelope Line */}
        <path 
          d={pathData} 
          fill="none" 
          stroke={strokeColor} 
          strokeWidth="3" 
          strokeLinejoin="round"
          className="transition-colors duration-200"
        />
        
        {/* Fill under curve */}
        <path 
          d={`${pathData} L ${releaseX},${height-padding} Z`} 
          fill={fillColor} 
          stroke="none"
          className="transition-colors duration-200"
        />

        {/* Realistic Animation Dot */}
        <circle ref={dotRef} r="5" fill="#f0abfc" stroke="white" strokeWidth="2" />
      </svg>
    </div>
  );
};

export default EnvelopeGraph;
