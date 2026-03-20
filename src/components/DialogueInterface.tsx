import React from 'react';
import type { ChatMessage } from '../types';

interface ApproachOption {
  id: number;
  text: string;
  quality?: 'good' | 'neutral' | 'poor';
  tooltip?: string;
}

interface DialogueInterfaceProps {
  npcName: string;
  npcTitle?: string;
  history: ChatMessage[];
  approachOptions?: ApproachOption[];
  onSend: (message: string) => void;
  isLoading?: boolean;
  canEnd?: boolean;
  onEnd?: () => void;
}

export default function DialogueInterface({
  npcName,
  npcTitle,
  history,
  approachOptions,
  onSend,
  isLoading = false,
  canEnd = false,
  onEnd,
}: DialogueInterfaceProps) {
  const [freeText, setFreeText] = React.useState('');
  const [mode, setMode] = React.useState<'options' | 'free'>('options');
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isLoading]);

  const handleSendFree = () => {
    if (freeText.trim()) {
      onSend(freeText.trim());
      setFreeText('');
      setMode('options');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSendFree();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* NPC Header */}
      <div className="px-4 py-2 border-b border-[#3a4258] bg-[#141820] flex items-center gap-3">
        <div className="w-8 h-8 bg-[#2a3040] border border-[#3a4258] flex items-center justify-center">
          <span className="text-[#c9a84c] font-mono text-xs font-bold">
            {npcName.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </span>
        </div>
        <div>
          <p className="text-xs font-mono text-[#e8e6e1] font-semibold">{npcName}</p>
          {npcTitle && <p className="text-xs font-mono text-[#5a5f6e]">{npcTitle}</p>}
        </div>
        {canEnd && (
          <button
            onClick={onEnd}
            className="ml-auto text-xs font-mono text-[#5a5f6e] hover:text-[#c9a84c] border border-[#3a4258] px-2 py-1"
          >
            End Interview →
          </button>
        )}
      </div>

      {/* Conversation history */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {history.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-1' : ''}`}>
              <div className={`text-xs font-mono mb-1 ${
                msg.role === 'user' ? 'text-right text-[#4a7ab8]' : 'text-[#c9a84c]'
              }`}>
                {msg.role === 'user' ? 'EXAMINER' : npcName.toUpperCase()}
              </div>
              <div className={`p-3 text-sm font-serif leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#1a2a40] border border-[#4a7ab8] text-[#e8e6e1]'
                  : 'bg-[#1a2030] border border-[#3a4258] text-[#c8c5be]'
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#1a2030] border border-[#3a4258] p-3">
              <span className="text-[#5a5f6e] font-mono text-xs">
                <span className="cursor-blink">█</span>
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-[#3a4258] bg-[#141820]">
        {/* Mode toggle */}
        <div className="flex border-b border-[#252d3d]">
          <button
            onClick={() => setMode('options')}
            className={`px-3 py-1 text-xs font-mono transition-colors ${
              mode === 'options' ? 'text-[#c9a84c] border-b border-[#c9a84c]' : 'text-[#5a5f6e]'
            }`}
          >
            Suggested Questions
          </button>
          <button
            onClick={() => setMode('free')}
            className={`px-3 py-1 text-xs font-mono transition-colors ${
              mode === 'free' ? 'text-[#c9a84c] border-b border-[#c9a84c]' : 'text-[#5a5f6e]'
            }`}
          >
            Custom Question
          </button>
        </div>

        <div className="p-3">
          {mode === 'options' && approachOptions && (
            <div className="space-y-1">
              {approachOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => !isLoading && onSend(opt.text)}
                  disabled={isLoading}
                  className={`w-full text-left p-2 border text-xs font-serif transition-colors ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#c9a84c] hover:text-[#c9a84c]'
                  } ${
                    opt.quality === 'good' ? 'border-[#2a4030] text-[#8a8f9e]' :
                    opt.quality === 'poor' ? 'border-[#2a1510] text-[#5a5f6e]' :
                    'border-[#252d3d] text-[#8a8f9e]'
                  }`}
                  title={opt.tooltip}
                >
                  <span className="font-mono text-[#5a5f6e] mr-2">{opt.id}.</span>
                  "{opt.text}"
                </button>
              ))}
            </div>
          )}

          {mode === 'free' && (
            <div className="flex gap-2">
              <textarea
                value={freeText}
                onChange={e => setFreeText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your question... (Cmd/Ctrl+Enter to send)"
                disabled={isLoading}
                className="flex-1 p-2 bg-[#0f1219] border border-[#3a4258] text-sm font-serif text-[#e8e6e1] resize-none focus:border-[#c9a84c] focus:outline-none placeholder-[#3a4258] disabled:opacity-50"
                rows={2}
              />
              <button
                onClick={handleSendFree}
                disabled={!freeText.trim() || isLoading}
                className={`px-3 text-xs font-mono font-semibold transition-all ${
                  freeText.trim() && !isLoading
                    ? 'bg-[#c9a84c] text-[#0f1219] hover:bg-[#e0c060]'
                    : 'bg-[#252d3d] text-[#5a5f6e] cursor-not-allowed'
                }`}
              >
                ASK
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
