import React from 'react';
import { useExamState } from '../context/ExamStateContext';
import { loadState } from '../utils/storage';

export default function HomeScreen() {
  const { dispatch } = useExamState();
  const [apiKey, setApiKey] = React.useState('');
  const [hasExisting, setHasExisting] = React.useState(false);
  const [showKeyInput, setShowKeyInput] = React.useState(false);
  const [keyError, setKeyError] = React.useState('');

  React.useEffect(() => {
    const saved = loadState();
    if (saved && saved.currentPhase > 1) {
      setHasExisting(true);
    }
  }, []);

  const handleStart = () => {
    if (!apiKey.trim()) {
      setKeyError('API key is required');
      return;
    }
    if (!apiKey.startsWith('sk-ant-')) {
      setKeyError('Invalid key format — should start with sk-ant-');
      return;
    }
    dispatch({ type: 'RESET_STATE' });
    dispatch({ type: 'SET_API_KEY', key: apiKey.trim() });
  };

  const handleResume = () => {
    if (!apiKey.trim()) {
      setKeyError('API key is required to resume');
      return;
    }
    const saved = loadState();
    if (saved) {
      dispatch({ type: 'LOAD_STATE', state: { ...saved, apiKey: apiKey.trim() } });
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1219] flex items-center justify-center px-4">
      <div className="max-w-xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="font-mono text-xs text-[#c9a84c] uppercase tracking-widest mb-3">
            Training Simulator
          </div>
          <h1 className="font-serif text-4xl font-bold text-[#e8e6e1] mb-2">The Dojo</h1>
          <p className="font-mono text-sm text-[#5a5f6e]">VaR Examination Simulator</p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-[#252d3d]"></div>
          <div className="w-1.5 h-1.5 bg-[#c9a84c]"></div>
          <div className="flex-1 h-px bg-[#252d3d]"></div>
        </div>

        {/* Description */}
        <div className="mb-8 p-4 border border-[#252d3d] bg-[#141820]">
          <p className="font-serif text-sm text-[#c8c5be] leading-relaxed mb-3">
            You are a bank examiner with 1–2 years of supervisory experience. You've been assigned to lead a Value-at-Risk model examination at Atlantic National Bank, a U.S. G-SIB.
          </p>
          <div className="grid grid-cols-5 gap-1 mt-4">
            {[
              ['01', 'The Briefing Room'],
              ['02', 'The Interview'],
              ['03', 'The Deep Dive'],
              ['04', 'Scope + Exit'],
              ['05', 'The Gauntlet'],
            ].map(([num, title]) => (
              <div key={num} className="text-center">
                <div className="font-mono text-xs text-[#c9a84c]">{num}</div>
                <div className="font-mono text-xs text-[#5a5f6e] leading-tight mt-0.5">{title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* API Key input */}
        <div className="mb-5">
          <label className="block text-xs font-mono text-[#5a5f6e] uppercase tracking-wider mb-2">
            Anthropic API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={e => { setApiKey(e.target.value); setKeyError(''); }}
            placeholder="sk-ant-..."
            className="w-full p-3 bg-[#141820] border border-[#3a4258] text-sm font-mono text-[#e8e6e1] focus:border-[#c9a84c] focus:outline-none placeholder-[#3a4258]"
          />
          {keyError && (
            <p className="text-xs font-mono text-[#c44536] mt-1">{keyError}</p>
          )}
          <p className="text-xs font-mono text-[#5a5f6e] mt-1">
            Your key is stored in localStorage and sent directly to Anthropic. It is never transmitted elsewhere.
          </p>
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          <button
            onClick={handleStart}
            className="w-full py-3 bg-[#c9a84c] text-[#0f1219] text-xs font-mono font-semibold uppercase tracking-wider hover:bg-[#e0c060] transition-colors"
          >
            Begin Examination →
          </button>

          {hasExisting && (
            <button
              onClick={handleResume}
              className="w-full py-3 border border-[#3a4258] text-xs font-mono text-[#8a8f9e] hover:border-[#c9a84c] hover:text-[#c9a84c] transition-colors"
            >
              Resume Previous Session
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs font-mono text-[#3a4258]">
            Uses Claude API — Sonnet model — all responses are AI-generated
          </p>
        </div>
      </div>
    </div>
  );
}
