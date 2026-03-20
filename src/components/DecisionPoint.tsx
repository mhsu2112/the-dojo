import React from 'react';

interface Option {
  id: number;
  label: string;
  description?: string;
  quality?: 'best' | 'good' | 'neutral' | 'poor';
}

interface DecisionPointProps {
  prompt: string;
  options: Option[];
  onSelect: (optionId: number) => void;
  disabled?: boolean;
}

const QUALITY_STYLES = {
  best: 'border-[#4a8c6f] hover:bg-[#2a5040]',
  good: 'border-[#4a7ab8] hover:bg-[#1a2a40]',
  neutral: 'border-[#3a4258] hover:bg-[#1a2030]',
  poor: 'border-[#7a2a20] hover:bg-[#2a1510]',
};

export default function DecisionPoint({ prompt, options, onSelect, disabled = false }: DecisionPointProps) {
  const [selected, setSelected] = React.useState<number | null>(null);

  const handleConfirm = () => {
    if (selected !== null) {
      onSelect(selected);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 p-3 border border-[#c9a84c]">
        <p className="text-xs font-mono text-[#c9a84c] uppercase tracking-wider mb-1">Decision Required</p>
        <p className="text-sm font-serif text-[#e8e6e1] leading-relaxed">{prompt}</p>
      </div>

      <div className="space-y-2 mb-4">
        {options.map(opt => {
          const qualityStyle = QUALITY_STYLES[opt.quality || 'neutral'];
          const isSelected = selected === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => !disabled && setSelected(opt.id)}
              disabled={disabled}
              className={`w-full text-left p-3 border transition-all ${
                isSelected
                  ? 'bg-[#c9a84c] border-[#c9a84c] text-[#0f1219]'
                  : `border ${qualityStyle} text-[#e8e6e1]`
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-start gap-3">
                <span className={`font-mono text-xs mt-0.5 shrink-0 ${isSelected ? 'text-[#0f1219]' : 'text-[#5a5f6e]'}`}>
                  {opt.id}.
                </span>
                <div>
                  <p className={`text-sm font-serif font-semibold ${isSelected ? 'text-[#0f1219]' : 'text-[#e8e6e1]'}`}>
                    "{opt.label}"
                  </p>
                  {opt.description && (
                    <p className={`text-xs mt-1 font-mono ${isSelected ? 'text-[#1a1000]' : 'text-[#5a5f6e]'}`}>
                      {opt.description}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={handleConfirm}
        disabled={selected === null || disabled}
        className={`w-full py-2 text-xs font-mono font-semibold uppercase tracking-wider transition-all ${
          selected !== null && !disabled
            ? 'bg-[#c9a84c] text-[#0f1219] hover:bg-[#e0c060]'
            : 'bg-[#252d3d] text-[#5a5f6e] cursor-not-allowed'
        }`}
      >
        Confirm Decision →
      </button>
    </div>
  );
}
