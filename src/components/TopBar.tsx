import React from 'react';
import { useExamState } from '../context/ExamStateContext';

const PHASE_LABELS = [
  '01 BRIEFING',
  '02 INTERVIEW',
  '03 DATA',
  '04 SCOPE + EXIT',
  '05 PRESSURE',
];

export default function TopBar() {
  const { state } = useExamState();
  const [elapsed, setElapsed] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const hrs = Math.floor(elapsed / 3600).toString().padStart(2, '0');
  const mins = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
  const secs = (elapsed % 60).toString().padStart(2, '0');

  const mraCount = state.findings.filter(f => f.severity === 'MRA' || f.severity === 'MRIA').length;
  const obsCount = state.findings.filter(f => f.severity === 'observation').length;

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-[#3a4258] bg-[#141820] font-mono text-xs select-none">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <span className="text-[#c9a84c] font-semibold tracking-widest text-sm">THE DOJO</span>
        <span className="text-[#3a4258]">|</span>
        <span className="text-[#5a5f6e]">VaR Examination Simulator</span>
      </div>

      {/* Center: Phase indicator */}
      <div className="flex items-center gap-1">
        {PHASE_LABELS.map((label, i) => {
          const phaseNum = i + 1;
          const isCurrent = state.currentPhase === phaseNum;
          const isCompleted = state.phasesCompleted[phaseNum];
          return (
            <React.Fragment key={phaseNum}>
              <div className={`px-2 py-0.5 text-xs transition-all ${
                isCurrent
                  ? 'bg-[#c9a84c] text-[#0f1219] font-semibold'
                  : isCompleted
                  ? 'text-[#4a8c6f] border border-[#4a8c6f]'
                  : 'text-[#5a5f6e] border border-[#252d3d]'
              }`}>
                {label}
              </div>
              {i < 4 && <span className="text-[#3a4258]">›</span>}
            </React.Fragment>
          );
        })}
      </div>

      {/* Right: Stats + Timer */}
      <div className="flex items-center gap-4">
        {mraCount > 0 && (
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-[#c44536] inline-block"></span>
            <span className="text-[#c44536]">{mraCount} MRA{mraCount !== 1 ? 's' : ''}</span>
          </div>
        )}
        {obsCount > 0 && (
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-[#c9a84c] inline-block"></span>
            <span className="text-[#c9a84c]">{obsCount} OBS</span>
          </div>
        )}
        {state.findings.length === 0 && (
          <span className="text-[#5a5f6e]">No findings yet</span>
        )}
        <span className="text-[#3a4258]">|</span>
        <span className="text-[#5a5f6e] tabular-nums">{hrs}:{mins}:{secs}</span>
      </div>
    </div>
  );
}
