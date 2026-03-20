import React from 'react';
import { useExamState } from '../context/ExamStateContext';
import { callClaude } from '../utils/api';
import { buildVasquezPrompt } from '../prompts/vasquez';
import { buildOkaforMemoReviewPrompt } from '../prompts/okafor';
import DialogueInterface from '../components/DialogueInterface';
import WritingInterface from '../components/WritingInterface';
import DebriefDrawer from '../components/DebriefDrawer';
import PhaseTransition from '../components/PhaseTransition';
import type { ChatMessage } from '../types';

const FIRST_TURN_OPTIONS = [
  {
    id: 1,
    text: "Let's start with the lookback window. Walk me through the rationale for 12 months.",
    quality: 'good' as const,
    tooltip: 'Direct and focused — good examiner technique',
  },
  {
    id: 2,
    text: "Tell me about the overall VaR framework and recent changes.",
    quality: 'neutral' as const,
    tooltip: 'Too broad — she\'ll give a rehearsed overview and eat up time',
  },
  {
    id: 3,
    text: "I'd like to understand the backtesting process. What P&L measure do you use for the daily comparison?",
    quality: 'good' as const,
    tooltip: 'Precise and targets the key issue directly',
  },
  {
    id: 4,
    text: "You mentioned structured credit enhancements — let's start there.",
    quality: 'poor' as const,
    tooltip: 'Following her lead — lets her control the narrative',
  },
];

const SUBSEQUENT_OPTIONS = [
  {
    id: 1,
    text: "How does the correlation matrix perform under stressed market conditions? Is there a separate stressed correlation treatment?",
    quality: 'good' as const,
  },
  {
    id: 2,
    text: "The September 2025 validation — how comprehensive was the review of the structured credit module specifically?",
    quality: 'good' as const,
  },
  {
    id: 3,
    text: "Walk me through the backtesting methodology in detail.",
    quality: 'good' as const,
  },
  {
    id: 4,
    text: "What's the bank's plan for the structured credit book going forward?",
    quality: 'neutral' as const,
  },
];

export default function Phase2() {
  const { state, dispatch } = useExamState();
  const [subPhase, setSubPhase] = React.useState<'briefing' | 'interview' | 'memo' | 'feedback'>('briefing');
  const [history, setHistory] = React.useState<ChatMessage[]>(
    state.conversationHistories['vasquez'] || []
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [memoFeedback, setMemoFeedback] = React.useState(state.phase2MemoFeedback || '');
  const [showDebrief, setShowDebrief] = React.useState(false);
  const [showTransition, setShowTransition] = React.useState(false);

  // Initialize with Vasquez opening
  React.useEffect(() => {
    if (subPhase === 'interview' && history.length === 0) {
      const opening: ChatMessage = {
        role: 'assistant',
        content: "Good morning. I understand you're looking at our VaR framework — happy to walk you through anything you need. We're quite proud of the enhancements we've made over the past two years, particularly the structured credit integration. Where would you like to start?",
      };
      setHistory([opening]);
      dispatch({ type: 'ADD_MESSAGE', npc: 'vasquez', message: opening });
    }
  }, [subPhase]);

  const handleSendMessage = async (message: string) => {
    const userMsg: ChatMessage = { role: 'user', content: message };
    const newHistory = [...history, userMsg];
    setHistory(newHistory);
    dispatch({ type: 'ADD_MESSAGE', npc: 'vasquez', message: userMsg });
    setIsLoading(true);

    try {
      const response = await callClaude(
        state.apiKey,
        buildVasquezPrompt(state),
        message,
        history
      );
      const assistantMsg: ChatMessage = { role: 'assistant', content: response };
      setHistory(prev => [...prev, assistantMsg]);
      dispatch({ type: 'ADD_MESSAGE', npc: 'vasquez', message: assistantMsg });
    } catch (err) {
      const errMsg: ChatMessage = {
        role: 'assistant',
        content: `[API Error: ${err instanceof Error ? err.message : 'Unknown error'}]`,
      };
      setHistory(prev => [...prev, errMsg]);
    }
    setIsLoading(false);
  };

  const handleEndInterview = () => {
    dispatch({ type: 'SET_PHASE2_INTERVIEW_COMPLETE', value: true });
    setSubPhase('memo');
  };

  const handleSubmitMemo = async (memoText: string) => {
    dispatch({ type: 'SET_PHASE2_MEMO_SUBMITTED', value: true });
    setIsLoading(true);
    setShowDebrief(true);

    try {
      const feedback = await callClaude(
        state.apiKey,
        buildOkaforMemoReviewPrompt(state, memoText),
        `Please review this post-interview memo: ${memoText}`
      );
      setMemoFeedback(feedback);
      dispatch({ type: 'SET_PHASE2_MEMO_FEEDBACK', feedback });
    } catch (err) {
      const errText = `Error getting feedback: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setMemoFeedback(errText);
      dispatch({ type: 'SET_PHASE2_MEMO_FEEDBACK', feedback: errText });
    }
    setIsLoading(false);
    setSubPhase('feedback');
  };

  const handleContinueToPhase3 = () => {
    setShowDebrief(false);
    dispatch({ type: 'COMPLETE_PHASE', phase: 2 });
    setShowTransition(true);
  };

  if (showTransition) {
    return (
      <PhaseTransition
        phase={3}
        title='"The Deep Dive"'
        subtitle="The Limit Breach Pattern"
        onComplete={() => dispatch({ type: 'SET_PHASE', phase: 3 })}
      />
    );
  }

  const isFirstTurn = history.filter(m => m.role === 'user').length === 0;
  const turnCount = history.filter(m => m.role === 'user').length;
  const canEnd = turnCount >= 4;

  // ---- BRIEFING ----
  if (subPhase === 'briefing') {
    return (
      <div className="flex h-full">
        <div className="w-[55%] border-r border-[#3a4258] overflow-y-auto px-5 py-4">
          <div className="text-xs font-mono text-[#c9a84c] uppercase tracking-widest mb-1">Phase 2 — Riding Shotgun</div>
          <h2 className="font-serif text-base font-bold text-[#e8e6e1] mb-4">The Interview</h2>
          <div className="font-serif text-sm text-[#c8c5be] leading-relaxed space-y-3">
            <p>
              Two weeks into the exam. Your team has been on-site at Atlantic National's trading floor offices. Okafor has you sitting in on — and leading portions of — the key interviews.
            </p>
            <p>
              Today you're meeting Dr. Elena Vasquez, the bank's Head of Market Risk. She's been in the role for 8 years, has a PhD in financial mathematics from Columbia, and is known for being technically rigorous and politically savvy. She's been through a dozen exams and knows how to manage the conversation.
            </p>
            <p className="text-[#c9a84c] italic">
              Okafor pulls you aside: "Vasquez is smart and she'll be professional. But remember — her job is to make the bank look good. She won't lie to you, but she'll answer exactly the question you ask and not one word more. If you ask vague questions, you'll get vague answers. Be precise. And watch for what she redirects away from."
            </p>
          </div>

          <div className="mt-5 p-3 border border-[#252d3d] bg-[#141820]">
            <p className="text-xs font-mono text-[#5a5f6e] uppercase tracking-wider mb-2">Your Objectives</p>
            <ul className="space-y-1 text-xs font-serif text-[#8a8f9e]">
              <li>• Probe the lookback window decision and whether any extension has been considered</li>
              <li>• Understand the backtesting methodology — specifically, what P&L measure they use</li>
              <li>• Explore the structured credit integration and correlation approach</li>
              <li>• Assess the independence and rigor of the model validation</li>
            </ul>
          </div>

          <button
            onClick={() => setSubPhase('interview')}
            className="mt-5 w-full py-2.5 bg-[#c9a84c] text-[#0f1219] text-xs font-mono font-semibold uppercase tracking-wider hover:bg-[#e0c060]"
          >
            Begin Interview →
          </button>
        </div>
        <div className="w-[45%] flex items-center justify-center bg-[#0a0e15]">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-[#1a2030] border border-[#3a4258] flex items-center justify-center mx-auto mb-3">
              <span className="text-[#c9a84c] font-mono text-xl font-bold">EV</span>
            </div>
            <p className="font-mono text-sm text-[#e8e6e1] font-semibold">Dr. Elena Vasquez</p>
            <p className="font-mono text-xs text-[#5a5f6e] mt-1">Head of Market Risk</p>
            <p className="font-mono text-xs text-[#5a5f6e]">Atlantic National Bank</p>
            <p className="font-mono text-xs text-[#5a5f6e] mt-2">PhD, Columbia University</p>
          </div>
        </div>
      </div>
    );
  }

  // ---- INTERVIEW ----
  if (subPhase === 'interview') {
    return (
      <div className="flex h-full">
        <div className="w-[55%] border-r border-[#3a4258] overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Progress bar */}
            <div className="px-4 py-2 border-b border-[#252d3d] bg-[#141820] flex items-center gap-3">
              <span className="text-xs font-mono text-[#5a5f6e]">Exchange {turnCount} of ~10</span>
              <div className="flex-1 h-0.5 bg-[#252d3d]">
                <div className="h-full bg-[#c9a84c] transition-all" style={{ width: `${Math.min(100, (turnCount / 10) * 100)}%` }}></div>
              </div>
              {canEnd && <span className="text-xs font-mono text-[#4a8c6f]">Can end interview</span>}
            </div>
            <div className="flex-1 overflow-hidden">
              <DialogueInterface
                npcName="Dr. Elena Vasquez"
                npcTitle="Head of Market Risk, Atlantic National Bank"
                history={history}
                approachOptions={isFirstTurn ? FIRST_TURN_OPTIONS : SUBSEQUENT_OPTIONS}
                onSend={handleSendMessage}
                isLoading={isLoading}
                canEnd={canEnd}
                onEnd={handleEndInterview}
              />
            </div>
          </div>
        </div>
        <div className="w-[45%] flex flex-col bg-[#0a0e15] p-4 overflow-y-auto">
          <p className="text-xs font-mono text-[#5a5f6e] uppercase tracking-wider mb-3">Interview Notes</p>
          <div className="space-y-1 text-xs font-serif text-[#8a8f9e]">
            {['Backtesting P&L methodology', 'Stress correlation treatment', 'Structured credit validation status', 'Lookback window rationale'].map(topic => {
              const mentioned = history.some(m =>
                m.content.toLowerCase().includes(topic.split(' ')[0].toLowerCase())
              );
              return (
                <div key={topic} className={`flex items-center gap-2 ${mentioned ? 'text-[#4a8c6f]' : ''}`}>
                  <span>{mentioned ? '●' : '○'}</span>
                  <span>{topic}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 p-2 border border-[#252d3d] text-xs font-mono text-[#5a5f6e]">
            <p className="text-[#c9a84c] mb-1">Okafor's reminder:</p>
            <p>"Watch for what she redirects away from."</p>
          </div>
        </div>
      </div>
    );
  }

  // ---- MEMO ----
  if (subPhase === 'memo' || subPhase === 'feedback') {
    return (
      <>
        <div className="flex h-full">
          <div className="w-[55%] border-r border-[#3a4258] overflow-hidden">
            <WritingInterface
              prompt='Okafor: "Good. Now write me a one-page memo — key takeaways from the interview, open items that need follow-up, and any new concerns that came out of the conversation. I want it by end of day."'
              placeholder="MEMORANDUM&#10;&#10;TO: James Okafor, EIC&#10;FROM: [Your Name]&#10;RE: Post-Interview Summary — Dr. Elena Vasquez, Head of Market Risk&#10;DATE: [Date]&#10;&#10;..."
              submitLabel="Submit Memo to Okafor"
              onSubmit={handleSubmitMemo}
              isLoading={isLoading}
              disabled={state.phase2MemoSubmitted}
              minWords={50}
            />
          </div>
          <div className="w-[45%] overflow-y-auto p-4 bg-[#0a0e15]">
            <p className="text-xs font-mono text-[#5a5f6e] uppercase tracking-wider mb-3">Interview Transcript Reference</p>
            <div className="space-y-2">
              {history.map((msg, i) => (
                <div key={i} className="text-xs">
                  <span className={`font-mono ${msg.role === 'user' ? 'text-[#4a7ab8]' : 'text-[#c9a84c]'}`}>
                    {msg.role === 'user' ? 'EXAMINER: ' : 'VASQUEZ: '}
                  </span>
                  <span className="font-serif text-[#8a8f9e]">{msg.content}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DebriefDrawer
          isOpen={showDebrief || subPhase === 'feedback'}
          title="EIC Memo Review"
          mentor="James Okafor, EIC"
          content={memoFeedback}
          isLoading={isLoading}
          onContinue={handleContinueToPhase3}
          continueLabel="Continue to Phase 3 →"
        />
      </>
    );
  }

  return null;
}
