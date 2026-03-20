import React from 'react';

interface WritingInterfaceProps {
  prompt: string;
  placeholder?: string;
  submitLabel?: string;
  onSubmit: (text: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  minWords?: number;
}

export default function WritingInterface({
  prompt,
  placeholder = 'Begin writing here...',
  submitLabel = 'Submit',
  onSubmit,
  isLoading = false,
  disabled = false,
  minWords = 30,
}: WritingInterfaceProps) {
  const [text, setText] = React.useState('');

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const canSubmit = wordCount >= minWords && !isLoading && !disabled;

  const handleSubmit = () => {
    if (canSubmit) {
      onSubmit(text);
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      {/* Prompt */}
      <div className="mb-3 p-3 border border-[#252d3d] bg-[#141820]">
        <p className="text-xs font-mono text-[#c9a84c] uppercase tracking-wider mb-1">Assignment</p>
        <p className="text-sm font-serif text-[#c8c5be] leading-relaxed italic">{prompt}</p>
      </div>

      {/* Editor */}
      <div className="flex-1 relative mb-3">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full h-full p-3 bg-[#141820] border border-[#3a4258] text-sm font-serif text-[#e8e6e1] leading-relaxed resize-none focus:border-[#c9a84c] focus:outline-none placeholder-[#3a4258] disabled:opacity-50"
          style={{ minHeight: '200px' }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`text-xs font-mono ${wordCount >= minWords ? 'text-[#4a8c6f]' : 'text-[#5a5f6e]'}`}>
            {wordCount} words {wordCount < minWords && `(min ${minWords})`}
          </span>
        </div>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`px-4 py-2 text-xs font-mono font-semibold uppercase tracking-wider transition-all ${
            canSubmit
              ? 'bg-[#c9a84c] text-[#0f1219] hover:bg-[#e0c060] cursor-pointer'
              : 'bg-[#252d3d] text-[#5a5f6e] cursor-not-allowed'
          }`}
        >
          {isLoading ? '⏳ Processing...' : submitLabel}
        </button>
      </div>
    </div>
  );
}
