import React from 'react';

interface PhaseTransitionProps {
  phase: number;
  title: string;
  subtitle?: string;
  onComplete: () => void;
}

const PHASE_DESCRIPTIONS = [
  'Read the room before you walk into it.',
  'Every answer reveals something. Every non-answer reveals more.',
  'The data tells a story. Your job is to read it accurately.',
  'Scope defines success. The exit is where it counts.',
  'The hardest findings aren\'t the technical ones.',
];

export default function PhaseTransition({ phase, title, subtitle, onComplete }: PhaseTransitionProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f1219] fade-in">
      <div className="text-center max-w-lg px-8">
        {/* Phase number */}
        <div className="font-mono text-7xl font-bold text-[#1a2030] mb-2 select-none">
          {String(phase).padStart(2, '0')}
        </div>

        {/* Title */}
        <div className="font-mono text-xs text-[#c9a84c] uppercase tracking-widest mb-2">
          Phase {phase}
        </div>
        <h1 className="font-serif text-2xl font-bold text-[#e8e6e1] mb-3">
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="font-serif text-sm text-[#8a8f9e] italic mb-2">{subtitle}</p>
        )}

        {/* Phase motto */}
        <p className="font-mono text-xs text-[#5a5f6e] mb-8 tracking-wide">
          "{PHASE_DESCRIPTIONS[phase - 1]}"
        </p>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-[#252d3d]"></div>
          <div className="w-2 h-2 bg-[#c9a84c]"></div>
          <div className="flex-1 h-px bg-[#252d3d]"></div>
        </div>

        <button
          onClick={onComplete}
          className="px-8 py-3 bg-[#c9a84c] text-[#0f1219] font-mono font-semibold uppercase tracking-widest text-sm hover:bg-[#e0c060] transition-colors"
        >
          Enter Phase {phase} →
        </button>
      </div>
    </div>
  );
}
