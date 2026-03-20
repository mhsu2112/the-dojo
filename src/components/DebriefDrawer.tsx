import React from 'react';

interface DebriefDrawerProps {
  isOpen: boolean;
  title?: string;
  mentor?: string;
  content: string;
  isLoading?: boolean;
  onContinue: () => void;
  continueLabel?: string;
}

export default function DebriefDrawer({
  isOpen,
  title = 'Mentor Insight',
  mentor = 'James Okafor, EIC',
  content,
  isLoading = false,
  onContinue,
  continueLabel = 'Continue →',
}: DebriefDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 fade-in">
      <div className="border-t-2 border-[#c9a84c] bg-[#141820] shadow-2xl">
        <div className="max-w-6xl mx-auto p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-mono text-[#c9a84c] uppercase tracking-widest">
                ◆ {title}
              </span>
              <span className="text-xs font-mono text-[#5a5f6e] ml-3">— {mentor}</span>
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm font-mono text-[#5a5f6e]">
              <span className="cursor-blink">█</span>
              <span>Processing feedback...</span>
            </div>
          ) : (
            <div className="font-serif text-sm text-[#c8c5be] leading-relaxed max-h-48 overflow-y-auto mb-4 whitespace-pre-wrap">
              {content}
            </div>
          )}

          {/* Continue button */}
          {!isLoading && content && (
            <div className="flex justify-end">
              <button
                onClick={onContinue}
                className="px-5 py-2 bg-[#c9a84c] text-[#0f1219] text-xs font-mono font-semibold uppercase tracking-wider hover:bg-[#e0c060] transition-colors"
              >
                {continueLabel}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
