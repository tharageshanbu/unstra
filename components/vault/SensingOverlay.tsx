"use client";
import React, { useState, useEffect } from 'react';
import { Shield, Search, Zap, CheckCircle2, Loader2 } from 'lucide-react';

const SENSING_POINTS = [
  "Initializing Unstra Risk Engine...",
  "Extracting Vital Stats & Entities...",
  "Identifying Governing Law (Jurisdiction)...",
  "Sensing Liability Caps & Carve-outs...",
  "Auditing IP Ownership (Background vs. Foreground)...",
  "Checking Moral Rights (Canada/Global)...",
  "Finalizing Risk Score (Scale 1-10)..."
];

export default function SensingOverlay({ fileName, onComplete }: { fileName: string, onComplete: () => void }) {
  const [currentPoint, setCurrentPoint] = useState(0);

  useEffect(() => {
    if (currentPoint < SENSING_POINTS.length) {
      const timer = setTimeout(() => setCurrentPoint(prev => prev + 1), 1200);
      return () => clearTimeout(timer);
    } else {
      setTimeout(onComplete, 1000);
    }
  }, [currentPoint, onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl">
      <div className="max-w-md w-full p-8 text-center">
        <div className="relative inline-block mb-10">
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
          <div className="relative w-24 h-24 bg-zinc-900 border border-white/10 rounded-[32px] flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          </div>
        </div>

        <h2 className="text-2xl font-bold tracking-tight mb-2 uppercase">Sensing Document</h2>
        <p className="text-zinc-500 text-sm mb-12 truncate px-4">{fileName}</p>

        <div className="space-y-4 text-left border-l border-white/5 ml-4">
          {SENSING_POINTS.map((point, index) => (
            <div 
              key={index} 
              className={`flex items-center gap-4 transition-all duration-500 ml-[-9px] ${
                index === currentPoint ? 'opacity-100 scale-105' : 
                index < currentPoint ? 'opacity-40' : 'opacity-0'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                index < currentPoint ? 'bg-blue-500 border-blue-500' : 
                index === currentPoint ? 'border-blue-500 animate-ping' : 'border-zinc-800'
              }`}>
                {index < currentPoint && <CheckCircle2 size={10} className="text-black" />}
              </div>
              <span className={`text-xs font-medium tracking-wide ${index === currentPoint ? 'text-blue-500' : 'text-zinc-400'}`}>
                {point}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}