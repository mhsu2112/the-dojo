import React from 'react';
import { useExamState } from '../context/ExamStateContext';
import { callClaude } from '../utils/api';
import { buildOkaforPhase3ReviewPrompt, buildOkaforFindingReviewPrompt } from '../prompts/okafor';
import { buildBankDataResponsePrompt } from '../prompts/bankResponse';
import DataChart from '../components/DataChart';
import WritingInterface from '../components/WritingInterface';
import DecisionPoint from '../components/DecisionPoint';
import DebriefDrawer from '../components/DebriefDrawer';
import PhaseTransition from '../components/PhaseTransition';

const ANALYSIS_DECISION_OPTIONS = [
  {
    id: 1,
    label: "Request intraday position data from the bank — I want to see what's happening in the hours before the VaR snapshot.",
    quality: 'best' as const,
    description: 'Best option — direct, evidence-seeking',
  },
  {
    id: 2,
    label: "Flag this to Okafor and recommend expanding the scope to include intraday trading activity analysis.",
    quality: 'good' as const,
    description: 'Good but incomplete — what specific data do you need?',
  },
  {
    id: 3,
    label: "The pattern is concerning but could be coincidental. I'll note it and continue with the backtesting analysis.",
    quality: 'neutral' as const,
    description: 'Too passive',
  },
  {
    id: 4,
    label: "Confront the desk head directly about the pattern.",
    quality: 'poor' as const,
    description: 'Premature — insufficient evidence, tips them off',
  },
];

const DATA_REQUEST_DECISION_OPTIONS = [
  {
    id: 1,
    label: "Accept the substitute data — trade blotters and EOD position changes may be sufficient to identify the pattern.",
    quality: 'good' as const,
    description: 'Pragmatic but may not be conclusive',
  },
  {
    id: 2,
    label: "Push back firmly — intraday data exists in their systems and I need it. Escalate through Okafor if necessary.",
    quality: 'best' as const,
    description: 'Strong, and the correct call if the pattern is real',
  },
  {
    id: 3,
    label: "Accept the limitation and note the data gap in my workpaper. The pattern alone isn't enough for a finding without supporting evidence.",
    quality: 'neutral' as const,
    description: 'Defensible but misses an opportunity',
  },
];

export default function Phase3() {
  const { state, dispatch } = useExamState();
  const [subPhase, setSubPhase] = React.useState<'data' | 'write-analysis' | 'decision' | 'request' | 'bank-response' | 'finding' | 'finding-review' | 'complete'>('data');
  const [analysisText, setAnalysisText] = React.useState('');
  const [dataRequestText, setDataRequestText] = React.useState('');
  const [bankResponse, setBankResponse] = React.useState('');
  const [findingText, setFindingText] = React.useState('');
  const [debrief, setDebrief] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [showDebrief, setShowDebrief] = React.useState(false);
  const [showTransition, setShowTransition] = React.useState(false);
  const [analysisDecisionChoice, setAnalysisDecisionChoice] = React.useState<number | null>(null);
  const [dataDecisionChoice, setDataDecisionChoice] = React.useState<number | null>(null);

  const handleSubmitAnalysis = (text: string) => {
    setAnalysisText(text);
    dispatch({ type: 'SET_PHASE3_OBSERVATION_SUBMITTED', value: true });
    setSubPhase('decision');
  };

  const handleAnalysisDecision = async (choice: number) => {
    setAnalysisDecisionChoice(choice);
    setIsLoading(true);
    setShowDebrief(true);

    try {
      const feedback = await callClaude(
        state.apiKey,
        buildOkaforPhase3ReviewPrompt(state, analysisText, choice),
        `The examiner observed: "${analysisText}" and chose to: ${ANALYSIS_DECISION_OPTIONS.find(o => o.id === choice)?.label}`
      );
      setDebrief(feedback);
    } catch (err) {
      setDebrief(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    setIsLoading(false);
  };

  const handleContinueFromAnalysisDebrief = () => {
    setShowDebrief(false);
    if (analysisDecisionChoice === 1 || analysisDecisionChoice === 2) {
      setSubPhase('request');
    } else {
      setSubPhase('finding');
    }
  };

  const handleSubmitDataRequest = async (text: string) => {
    setDataRequestText(text);
    dispatch({ type: 'SET_PHASE3_DATA_REQUEST_MADE', value: true });
    setIsLoading(true);

    try {
      const response = await callClaude(
        state.apiKey,
        buildBankDataResponsePrompt(state, text),
        `Examiner's data request: ${text}`
      );
      setBankResponse(response);
    } catch (err) {
      setBankResponse(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    setIsLoading(false);
    setSubPhase('bank-response');
  };

  const handleDataDecision = async (choice: number) => {
    setDataDecisionChoice(choice);
    dispatch({ type: 'SET_PHASE3_DATA_REQUEST_CHOICE', choice });
    setSubPhase('finding');
  };

  const handleSubmitFinding = async (text: string) => {
    setFindingText(text);
    dispatch({ type: 'SET_PHASE3_FINDING_DRAFTED', value: true });
    setIsLoading(true);
    setShowDebrief(true);
    setSubPhase('finding-review');

    try {
      const feedback = await callClaude(
        state.apiKey,
        buildOkaforFindingReviewPrompt(state, text),
        `Examiner's draft finding: ${text}`
      );
      setDebrief(feedback);
    } catch (err) {
      setDebrief(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    setIsLoading(false);
  };

  const handleContinueToPhase4 = () => {
    setShowDebrief(false);
    dispatch({ type: 'COMPLETE_PHASE', phase: 3 });
    setShowTransition(true);
  };

  if (showTransition) {
    return (
      <PhaseTransition
        phase={4}
        title='"The Full Scope"'
        subtitle="Scoping & The Exit Meeting"
        onComplete={() => dispatch({ type: 'SET_PHASE', phase: 4 })}
      />
    );
  }

  // Left panel varies by sub-phase
  const renderLeft = () => {
    if (subPhase === 'data') {
      return (
        <div className="px-5 py-4 overflow-y-auto">
          <div className="text-xs font-mono text-[#c9a84c] uppercase tracking-widest mb-1">Phase 3 — The Deep Dive</div>
          <h2 className="font-serif text-base font-bold text-[#e8e6e1] mb-4">The Limit Breach Pattern</h2>
          <div className="font-serif text-sm text-[#c8c5be] leading-relaxed space-y-3">
            <p>
              Week three of the exam. You've been assigned to do a deep dive on the rates trading desk — the one with 5 backtesting exceptions. Okafor wants you to look at the desk's VaR utilization patterns.
            </p>
            <p>
              You pull 6 months of daily data: the desk's end-of-day VaR versus its VaR limit. Something catches your eye.
            </p>
          </div>
          <div className="mt-4 p-3 border border-[#c9a84c] bg-[#0a0800]">
            <p className="text-xs font-mono text-[#c9a84c] mb-1">Instructions</p>
            <p className="text-xs font-serif text-[#8a8f9e]">
              Review the time-series chart on the right. Look for patterns in the data. When you're ready, document your observations and hypothesis in the writing interface.
            </p>
          </div>
          <button
            onClick={() => setSubPhase('write-analysis')}
            className="mt-4 w-full py-2.5 bg-[#c9a84c] text-[#0f1219] text-xs font-mono font-semibold uppercase tracking-wider hover:bg-[#e0c060]"
          >
            I've reviewed the data → Document Analysis
          </button>
        </div>
      );
    }

    if (subPhase === 'write-analysis') {
      return (
        <WritingInterface
          prompt="What do you see in this data? Document your observations and hypothesis. Be specific — describe the pattern, when it occurs, what it might indicate."
          placeholder="I observe a pattern in the rates desk VaR utilization data..."
          submitLabel="Submit Analysis"
          onSubmit={handleSubmitAnalysis}
          minWords={30}
        />
      );
    }

    if (subPhase === 'decision') {
      return (
        <DecisionPoint
          prompt="Based on your analysis, what's your next step?"
          options={ANALYSIS_DECISION_OPTIONS}
          onSelect={handleAnalysisDecision}
        />
      );
    }

    if (subPhase === 'request') {
      return (
        <WritingInterface
          prompt="Draft a formal data request to the bank for the additional information you need. Be specific about what data, what format, and what time period."
          placeholder="To: Office of Regulatory Affairs, Atlantic National Bank&#10;From: [Examiner Name], Examination Team&#10;Re: Data Request — Rates Trading Desk&#10;&#10;Pursuant to our on-site examination, we are requesting..."
          submitLabel="Submit Data Request"
          onSubmit={handleSubmitDataRequest}
          isLoading={isLoading}
          minWords={40}
        />
      );
    }

    if (subPhase === 'bank-response') {
      return (
        <div className="px-5 py-4 overflow-y-auto">
          <p className="text-xs font-mono text-[#c9a84c] uppercase tracking-wider mb-3">Bank Response</p>
          <div className="border border-[#252d3d] p-4 mb-4">
            <p className="font-mono text-xs text-[#5a5f6e] mb-2">
              From: Office of Regulatory Affairs, Atlantic National Bank
            </p>
            <p className="font-serif text-sm text-[#c8c5be] leading-relaxed whitespace-pre-wrap">
              {bankResponse || 'Loading...'}
            </p>
          </div>
          <DecisionPoint
            prompt="The bank is pushing back on your data request. How do you proceed?"
            options={DATA_REQUEST_DECISION_OPTIONS}
            onSelect={handleDataDecision}
          />
        </div>
      );
    }

    if (subPhase === 'finding' || subPhase === 'finding-review') {
      return (
        <WritingInterface
          prompt="Draft the examination finding, if you believe one is warranted. Include: the issue, the supporting evidence, the regulatory basis (what standard or expectation is violated), and your recommended severity (observation, MRA, or MRIA). If you don't believe a finding is warranted, explain why."
          placeholder="EXAMINATION FINDING — DRAFT&#10;&#10;Issue: [State the issue]&#10;&#10;Evidence: [What you observed...]&#10;&#10;Regulatory Basis: [SR 11-7, Market Risk Rule...]&#10;&#10;Recommended Severity: [Observation / MRA / MRIA]&#10;&#10;Rationale: ..."
          submitLabel="Submit Finding Draft"
          onSubmit={handleSubmitFinding}
          isLoading={isLoading}
          disabled={state.phase3FindingDrafted}
          minWords={50}
        />
      );
    }

    return null;
  };

  return (
    <>
      <div className="flex h-full">
        <div className="w-[55%] border-r border-[#3a4258] overflow-hidden">
          {renderLeft()}
        </div>
        <div className="w-[45%] overflow-hidden">
          <DataChart />
        </div>
      </div>

      <DebriefDrawer
        isOpen={showDebrief}
        title={subPhase === 'finding-review' ? 'EIC Finding Review' : 'EIC Feedback'}
        mentor="James Okafor, EIC"
        content={debrief}
        isLoading={isLoading}
        onContinue={
          subPhase === 'finding-review'
            ? handleContinueToPhase4
            : handleContinueFromAnalysisDebrief
        }
        continueLabel={
          subPhase === 'finding-review'
            ? 'Continue to Phase 4 →'
            : 'Continue →'
        }
      />
    </>
  );
}
