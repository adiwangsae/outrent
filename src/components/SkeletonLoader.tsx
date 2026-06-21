import React from 'react';

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="relative liquid-glass-card border border-white/5 rounded-[24px] p-6 flex flex-col group overflow-hidden animate-pulse">
      {/* Visual Icon Header Placeholder */}
      <div className="flex justify-between items-start mb-6">
        <div className="w-14 h-14 bg-white/5 rounded-full" />
        <div className="w-[84px] h-[22px] bg-white/5 rounded-full" />
      </div>
      
      {/* Content Placeholder */}
      <div className="flex-1 flex flex-col">
        {/* Title area (text-[18px] min-h-[46px] mb-2) */}
        <div className="min-h-[46px] mb-2 flex flex-col justify-start gap-1.5 pt-0.5">
          <div className="w-[85%] h-5 bg-white/5 rounded" />
          <div className="w-[60%] h-5 bg-white/5 rounded" />
        </div>
        
        {/* Description area (text-[14px] mb-6) */}
        <div className="flex flex-col gap-1.5 mb-6">
          <div className="w-full h-4 bg-white/5 rounded" />
          <div className="w-[90%] h-4 bg-white/5 rounded" />
        </div>
        
        {/* Price & Stock area */}
        <div className="mt-auto flex items-end justify-between mb-8 pb-6 border-b border-white/5">
          <div className="flex flex-col gap-2">
            <div className="w-24 h-3 bg-white/5 rounded" />
            <div className="w-28 h-5 bg-white/5 rounded" />
          </div>
          <div className="flex flex-col gap-2 items-end">
            <div className="w-24 h-3 bg-white/5 rounded" />
            <div className="w-16 h-[18px] bg-white/5 rounded" />
          </div>
        </div>
      </div>

      {/* Button Placeholder (py-4) */}
      <div className="w-full h-[52px] bg-white/5 rounded-[12px]" />
    </div>
  );
};
