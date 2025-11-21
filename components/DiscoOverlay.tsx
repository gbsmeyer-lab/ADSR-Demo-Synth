import React from 'react';

interface Props {
  active: boolean;
}

const DiscoOverlay: React.FC<Props> = ({ active }) => {
  if (!active) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 animate-[strobe_0.2s_infinite]" />
      
      {/* Multiple Lasers */}
      {[...Array(12)].map((_, i) => (
        <div 
            key={i}
            className="disco-laser"
            style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDuration: `${1 + Math.random() * 2}s`,
                animationDelay: `${Math.random()}s`,
                transform: `rotate(${Math.random() * 360}deg)`
            }}
        />
      ))}
      
      <div className="absolute inset-0 mix-blend-overlay opacity-30 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 animate-pulse" />
    </div>
  );
};

export default DiscoOverlay;
