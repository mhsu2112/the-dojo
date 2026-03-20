import React from 'react';
import { useExamState } from '../context/ExamStateContext';
import { callClaude } from '../utils/api';
import { buildOkaforPhase1Prompt } from '../prompts/okafor';
import DocumentViewer, { DocTitle, DocMeta, DocSection, DocPara, DocConfidential } from '../components/DocumentViewer';
import DebriefDrawer from '../components/DebriefDrawer';
import PhaseTransition from '../components/PhaseTransition';

const ISSUES = [
  {
    id: 1,
    text: '"The 12-month lookback window excludes major stress periods (COVID March 2020, the 2023 regional banking stress, the 2022 rates shock)"',
    type: 'real' as const,
  },
  {
    id: 2,
    text: '"The model uses historical simulation rather than Monte Carlo — this seems outdated"',
    type: 'herring' as const,
  },
  {
    id: 3,
    text: '"Backtesting uses actual P&L rather than hypothetical P&L, which could mask model deficiencies"',
    type: 'real' as const,
  },
  {
    id: 4,
    text: '"The structured credit book was only added in Q3 2024 with a 6-month minimum correlation history — this is extremely thin"',
    type: 'real' as const,
  },
  {
    id: 5,
    text: '"The Gaussian copula framework for structured credit is the same approach that failed catastrophically in 2008"',
    type: 'partial' as const,
  },
  {
    id: 6,
    text: '"The document doesn\'t specify how stressed correlations are handled — are they using the same quarterly-refreshed matrix for stress scenarios?"',
    type: 'real' as const,
  },
  {
    id: 7,
    text: '"Delta-gamma approximation for linear products seems unnecessary — you could just use full revaluation"',
    type: 'herring' as const,
  },
  {
    id: 8,
    text: '"The model governance section mentions annual validation, but the structured credit component has only been in the model for ~18 months — has it ever been independently validated as part of the VaR model?"',
    type: 'real' as const,
  },
  {
    id: 9,
    text: '"23 currency pairs seems like a lot — do they really need that many FX risk factors?"',
    type: 'herring' as const,
  },
  {
    id: 10,
    text: '"5 exceptions at the rates desk level is right at the edge — this warrants closer examination of that desk specifically"',
    type: 'real' as const,
  },
];

export default function Phase1() {
  const { state, dispatch } = useExamState();
  const [step, setStep] = React.useState(state.scenarioStep);
  const [selections, setSelections] = React.useState<number[]>(state.phase1Selections);
  const [feedback, setFeedback] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [showDebrief, setShowDebrief] = React.useState(false);
  const [showTransition, setShowTransition] = React.useState(false);

  const toggleSelection = (id: number) => {
    setSelections(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSubmitSelections = async () => {
    if (selections.length === 0) return;
    dispatch({ type: 'SET_PHASE1_SELECTIONS', selections });
    setIsLoading(true);
    setShowDebrief(true);

    const selectedTexts = selections.map(id => ISSUES.find(i => i.id === id)?.text || '');
    try {
      const result = await callClaude(
        state.apiKey,
        buildOkaforPhase1Prompt(state, selectedTexts),
        `The junior examiner has selected the following issues from the VaR methodology document: ${selectedTexts.join('; ')}`
      );
      setFeedback(result);
      dispatch({ type: 'SET_PHASE1_FEEDBACK_RECEIVED', value: true });
    } catch (err) {
      setFeedback(`Error getting feedback: ${err instanceof Error ? err.message : 'Unknown error'}. Please check your API key and try again.`);
    }
    setIsLoading(false);
  };

  const handleContinueToPhase2 = () => {
    setShowDebrief(false);
    dispatch({ type: 'COMPLETE_PHASE', phase: 1 });
    setShowTransition(true);
  };

  if (showTransition) {
    return (
      <PhaseTransition
        phase={2}
        title='"Riding Shotgun"'
        subtitle="The Interview"
        onComplete={() => {
          dispatch({ type: 'SET_PHASE', phase: 2 });
        }}
      />
    );
  }

  // Left panel content
  const leftPanel = (
    <div className="flex flex-col h-full">
      {/* Briefing header */}
      <div className="px-5 py-4 border-b border-[#252d3d]">
        <div className="text-xs font-mono text-[#c9a84c] uppercase tracking-widest mb-1">Phase 1 — The Briefing Room</div>
        <h2 className="font-serif text-base font-bold text-[#e8e6e1]">The Red Flag Memo</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* Scene narrative */}
        <div className="font-serif text-sm text-[#c8c5be] leading-relaxed space-y-3">
          <p>
            You've been assigned to the upcoming VaR model examination at Atlantic National Bank, one of the eight U.S. G-SIBs. Your Examiner-in-Charge is James Okafor, a 15-year veteran of the trading and markets supervision team. He's known for being demanding but fair — he won't hand you answers, but he'll make sure you learn.
          </p>
          <p>
            Okafor drops a document on your desk — Atlantic National's VaR Model Methodology Summary, submitted as part of the pre-exam materials package.
          </p>
          <p className="italic text-[#c9a84c]">
            "Read this. Tell me what jumps out. I want your questions before we draft the exam plan."
          </p>
        </div>

        <div className="border-t border-[#252d3d] pt-4">
          <p className="text-xs font-mono text-[#5a5f6e] uppercase tracking-wider mb-3">
            Review the document → then select the issues you'd flag
          </p>

          <div className="space-y-2">
            {ISSUES.map(issue => {
              const isSelected = selections.includes(issue.id);
              return (
                <button
                  key={issue.id}
                  onClick={() => toggleSelection(issue.id)}
                  className={`w-full text-left p-3 border transition-all text-sm font-serif ${
                    isSelected
                      ? 'bg-[#1a2a3a] border-[#c9a84c] text-[#e8e6e1]'
                      : 'border-[#252d3d] text-[#8a8f9e] hover:border-[#3a4258] hover:text-[#c8c5be]'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`font-mono text-xs mt-0.5 shrink-0 w-4 h-4 border flex items-center justify-center ${
                      isSelected ? 'border-[#c9a84c] bg-[#c9a84c] text-[#0f1219]' : 'border-[#3a4258] text-[#5a5f6e]'
                    }`}>
                      {isSelected ? '✓' : ''}
                    </span>
                    <span>{issue.text}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleSubmitSelections}
            disabled={selections.length === 0 || isLoading || state.phase1FeedbackReceived}
            className={`w-full py-2.5 text-xs font-mono font-semibold uppercase tracking-wider transition-all ${
              selections.length > 0 && !isLoading && !state.phase1FeedbackReceived
                ? 'bg-[#c9a84c] text-[#0f1219] hover:bg-[#e0c060]'
                : 'bg-[#252d3d] text-[#5a5f6e] cursor-not-allowed'
            }`}
          >
            {state.phase1FeedbackReceived
              ? '✓ Submitted — See Okafor\'s feedback below'
              : isLoading
              ? '⏳ Getting feedback...'
              : `Submit ${selections.length} selection${selections.length !== 1 ? 's' : ''} to Okafor`}
          </button>
        </div>

        {/* Debrief key takeaway */}
        {state.phase1FeedbackReceived && (
          <div className="border border-[#4a8c6f] p-3 bg-[#0a1a12]">
            <p className="text-xs font-mono text-[#4a8c6f] uppercase tracking-wider mb-2">Key Takeaway</p>
            <p className="text-xs font-serif text-[#8aaf9e] leading-relaxed italic">
              Reading model documentation is pattern recognition. The obvious issues (short lookback) will be flagged by any competent examiner. What separates good examiners is catching what's NOT in the document — the missing disclosures, the unstated assumptions, the areas where brevity is doing the work of evasion.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // Right panel: document
  const rightPanel = <ANBMethodologyDocument />;

  return (
    <>
      <div className="flex h-full">
        {/* Left panel */}
        <div className="w-[55%] border-r border-[#3a4258] overflow-hidden">
          {leftPanel}
        </div>
        {/* Right panel */}
        <div className="w-[45%] overflow-hidden">
          <DocumentViewer content={rightPanel} title="ANB VaR Methodology Summary" />
        </div>
      </div>

      {/* Debrief drawer */}
      <DebriefDrawer
        isOpen={showDebrief}
        title="EIC Feedback"
        mentor="James Okafor, Examiner-in-Charge"
        content={feedback}
        isLoading={isLoading}
        onContinue={handleContinueToPhase2}
        continueLabel="Continue to Phase 2 →"
      />
    </>
  );
}

function ANBMethodologyDocument() {
  return (
    <div className="p-5 space-y-1">
      <DocConfidential />
      <DocTitle>Atlantic National Bank — Market Risk VaR Model Methodology Summary</DocTitle>
      <DocMeta>
        Confidential — Submitted to [Agency] Examination Team{'\n'}
        Document Reference: ANB-MR-2025-003{'\n'}
        Prepared by: Market Risk Quantitative Analytics Group{'\n'}
        Date: January 15, 2026
      </DocMeta>

      <DocSection num="1" title="Model Scope and Coverage">
        <DocPara>
          The Value-at-Risk model covers all positions held in the trading book of Atlantic National Bank and its consolidated subsidiaries, including the London and Singapore branches. The model produces a daily VaR estimate at the 99th percentile confidence level with a 10-day holding period, consistent with the requirements of the Market Risk Rule (12 CFR Part 3, Subpart F). Asset classes covered include interest rate products, equity products, foreign exchange, and commodity derivatives. Credit trading positions in the structured credit book are included effective Q3 2024 following the desk's reclassification from banking book to trading book.
        </DocPara>
      </DocSection>

      <DocSection num="2" title="Methodology">
        <DocPara>
          The model employs a historical simulation approach. Daily profit-and-loss scenarios are generated by applying historical changes in risk factors to the current portfolio. The scenario set is constructed from a rolling 12-month lookback window of daily observations, yielding approximately 250 scenarios. Risk factors include benchmark interest rates (Treasury and swap curves), equity index levels and single-name equity prices, FX spot rates for 23 currency pairs, commodity futures curves (energy and metals), and credit spreads (CDS-implied) for the structured credit book.
        </DocPara>
      </DocSection>

      <DocSection num="3" title="Volatility and Correlation Treatment">
        <DocPara>
          Volatility estimates are derived directly from the historical scenario set — no parametric scaling or weighting is applied. The correlation structure is implicitly captured by the joint historical movements of risk factors within each scenario. The correlation matrix is refreshed on a quarterly basis using the most recent 12 months of data. For the structured credit book, which was added to the model in Q3 2024, correlation estimates rely on CDS spread movements with a minimum history requirement of 6 months.
        </DocPara>
      </DocSection>

      <DocSection num="4" title="Valuation and Pricing">
        <DocPara>
          Positions are repriced under each scenario using full revaluation for options and non-linear instruments, and sensitivity-based (delta-gamma) approximations for linear products where full revaluation would be computationally prohibitive. Pricing models used for scenario revaluation are consistent with those used for front-office risk management and daily P&L reporting. Structured credit positions are valued using a Gaussian copula framework calibrated to market-implied default correlations.
        </DocPara>
      </DocSection>

      <DocSection num="5" title="Backtesting">
        <DocPara>
          The model is backtested daily at the firm-wide and business-line level. Backtesting compares the 1-day, 99th percentile VaR estimate against the trading desk's actual daily profit and loss. Over the most recent 250-day observation period, the model recorded 3 firm-wide exceptions and 5 exceptions at the rates trading desk level, within the Basel "green zone" threshold of fewer than 5 (firm-wide) exceptions.
        </DocPara>
      </DocSection>

      <DocSection num="6" title="Model Governance">
        <DocPara>
          The VaR model is subject to independent validation by the Model Risk Management group on an annual cycle, most recently completed in September 2025. The model is approved by the Market Risk Committee, which meets monthly. Any material changes to model methodology require committee approval and notification to the regulator.
        </DocPara>
      </DocSection>

      <DocSection num="7" title="Limitations and Known Issues">
        <DocPara>
          The model's primary limitations include: (a) the assumption of constant position composition over the holding period, (b) potential underrepresentation of tail risk events given the 12-month lookback window, and (c) limited history for structured credit risk factors. The bank is actively developing an expected shortfall model in anticipation of FRTB implementation.
        </DocPara>
      </DocSection>
    </div>
  );
}
