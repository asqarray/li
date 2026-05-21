import React from 'react';
import { motion } from 'motion/react';

export default function GenomeHelix() {
  const strands = Array.from({ length: 12 });

  return (
    <div className="relative w-full h-24 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm rounded-xl border border-slate-800 mask-image-[linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]" />
      
      <div className="flex gap-4 relative z-10">
        {strands.map((_, i) => (
          <div key={i} className="flex flex-col items-center justify-between h-16 w-1 translate-y-[-4px]">
            <motion.div 
              animate={{ 
                y: [0, 40, 0],
                backgroundColor: ["#06b6d4", "#10b981", "#06b6d4"],
                scale: [1, 1.5, 1]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                delay: i * 0.2,
                ease: "easeInOut"
              }}
              className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]"
            />
            <motion.div 
              animate={{ 
                height: [40, 0, 40],
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                delay: i * 0.2,
                ease: "easeInOut"
              }}
              className="w-[1px] bg-slate-700"
            />
            <motion.div 
              animate={{ 
                y: [0, -40, 0],
                backgroundColor: ["#10b981", "#06b6d4", "#10b981"],
                scale: [1, 1.5, 1]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                delay: i * 0.2,
                ease: "easeInOut"
              }}
              className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]"
            />
          </div>
        ))}
      </div>
      
      <div className="absolute top-2 left-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">
        Sequence Integrity
      </div>
    </div>
  );
}
