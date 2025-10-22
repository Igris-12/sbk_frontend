import React from 'react';

const AnimatedBackground = () => (
  <>
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-blue-950/50 to-slate-900" />
      {[...Array(60)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-cyan-400/30"
          style={{
            width: Math.random() * 4 + 1 + 'px',
            height: Math.random() * 4 + 1 + 'px',
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
            animation: `float ${Math.random() * 10 + 10}s infinite ease-in-out ${Math.random() * 5}s`,
            opacity: Math.random() * 0.5 + 0.2
          }}
        />
      ))}
    </div>
    <style>{`
      @keyframes float {
        0%, 100% { transform: translateY(0px) translateX(0px); }
        33% { transform: translateY(-20px) translateX(10px); }
        66% { transform: translateY(-10px) translateX(-10px); }
      }
    `}</style>
  </>
);

export default AnimatedBackground;