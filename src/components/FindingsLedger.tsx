import { useExamState } from '../context/ExamStateContext';

const SEVERITY_COLORS: Record<string, string> = {
  'MRIA': 'text-[#c44536] border-[#c44536]',
  'MRA': 'text-[#c9a84c] border-[#c9a84c]',
  'observation': 'text-[#4a8c6f] border-[#4a8c6f]',
  'none': 'text-[#5a5f6e] border-[#3a4258]',
};

export default function FindingsLedger() {
  const { state } = useExamState();

  if (state.findings.length === 0) {
    return (
      <div className="p-4">
        <div className="text-xs font-mono text-[#5a5f6e] uppercase tracking-wider mb-3">
          Findings Ledger
        </div>
        <div className="text-xs text-[#5a5f6e] italic">
          No findings logged yet.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="text-xs font-mono text-[#5a5f6e] uppercase tracking-wider mb-3">
        Findings Ledger — {state.findings.length} item{state.findings.length !== 1 ? 's' : ''}
      </div>
      <div className="space-y-2">
        {state.findings.map(finding => {
          const severityKey = (finding.severity || 'none') as keyof typeof SEVERITY_COLORS;
          const colorClass = SEVERITY_COLORS[severityKey] || 'text-[#5a5f6e] border-[#3a4258]';
          return (
            <div key={finding.id} className="border border-[#252d3d] p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono text-[#e8e6e1] font-semibold">
                  {finding.title}
                </span>
                <span className={`text-xs font-mono border px-1 ${colorClass}`}>
                  {finding.severity || 'PENDING'}
                </span>
              </div>
              <p className="text-xs text-[#8a8f9e] font-serif leading-relaxed">
                {finding.description.length > 120
                  ? finding.description.slice(0, 120) + '...'
                  : finding.description}
              </p>
              {finding.regulatoryBasis && (
                <div className="text-xs text-[#5a5f6e] mt-1 font-mono">
                  ↳ {finding.regulatoryBasis}
                </div>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs ${finding.supported ? 'text-[#4a8c6f]' : 'text-[#5a5f6e]'}`}>
                  {finding.supported ? '● documented' : '○ needs documentation'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
