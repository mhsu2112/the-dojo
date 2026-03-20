import React from 'react';
import { useExamState } from '../context/ExamStateContext';
import { callClaude } from '../utils/api';
import { buildLiuPrompt, buildPhase5DebriefPrompt, buildCompletionSummaryPrompt } from '../prompts/liu';
import DialogueInterface from '../components/DialogueInterface';
import DecisionPoint from '../components/DecisionPoint';
import DebriefDrawer from '../components/DebriefDrawer';
import type { ChatMessage } from '../types';

const DECISION_OPTIONS = [
  {
    id: 1,
    label: "Maintain the finding as drafted. The evidence supports it, and adjusting for political considerations would compromise the exam's integrity.",
    quality: 'good' as const,
    description: 'Principled — but watch for naivety',
  },
  {
    id: 2,
    label: "Revisit the finding's severity calibration. Liu raised a fair point about materiality — I should stress-test my own reasoning before finalizing.",
    quality: 'good' as const,
    description: 'Intellectually honest — verify your reasoning',
  },
  {
    id: 3,
    label: "Downgrade to an observation with a strong supervisory commitment. The practical outcome is similar and it avoids the political complications.",
    quality: 'neutral' as const,
    description: 'Pragmatic — but is it caving?',
  },
  {
    id: 4,
    label: "Talk to Okafor. I need my EIC's read on this before I decide.",
    quality: 'best' as const,
    description: 'Most mature — knowing when you need counsel is a strength',
  },
];

const LIU_INITIAL_OPTIONS = [
  { id: 1, text: "Thank you. The workpapers are solid — I'm confident in the finding." },
  { id: 2, text: "I appreciate you flagging the context. Can you tell me more about what concerns you?" },
  { id: 3, text: "We reviewed the bank's supplemental analysis. The methodology is circular — they're using their own assumptions to validate their assumptions." },
  { id: 4, text: "I understand the timing sensitivity. That said, the evidence is what it is." },
];

export default function Phase5() {
  const { state, dispatch } = useExamState();
  const [subPhase, setSubPhase] = React.useState<'briefing' | 'liu-call' | 'decision' | 'debrief' | 'completion'>('briefing');
  const [liuHistory, setLiuHistory] = React.useState<ChatMessage[]>(
    state.conversationHistories['liu'] || []
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [debrief, setDebrief] = React.useState('');
  const [completionSummary, setCompletionSummary] = React.useState('');
  const [showDebrief, setShowDebrief] = React.useState(false);

  // Initialize Liu opening
  React.useEffect(() => {
    if (subPhase === 'liu-call' && liuHistory.length === 0) {
      const opening: ChatMessage = {
        role: 'assistant',
        content: "I've been reading the draft report. Thorough work — really impressive for your first lead role on a trading exam. I wanted to call before it goes final. Do you have a few minutes?",
      };
      setLiuHistory([opening]);
      dispatch({ type: 'ADD_MESSAGE', npc: 'liu', message: opening });
    }
  }, [subPhase]);

  const handleSendLiuMessage = async (message: string) => {
    const userMsg: ChatMessage = { role: 'user', content: message };
    const newHistory = [...liuHistory, userMsg];
    setLiuHistory(newHistory);
    dispatch({ type: 'ADD_MESSAGE', npc: 'liu', message: userMsg });
    setIsLoading(true);

    try {
      const response = await callClaude(
        state.apiKey,
        buildLiuPrompt(state),
        message,
        liuHistory
      );
      const assistantMsg: ChatMessage = { role: 'assistant', content: response };
      setLiuHistory(prev => [...prev, assistantMsg]);
      dispatch({ type: 'ADD_MESSAGE', npc: 'liu', message: assistantMsg });
    } catch (err) {
      const errMsg: ChatMessage = {
        role: 'assistant',
        content: `[API Error: ${err instanceof Error ? err.message : 'Unknown error'}]`,
      };
      setLiuHistory(prev => [...prev, errMsg]);
    }
    setIsLoading(false);
  };

  const handleEndLiuCall = () => {
    dispatch({ type: 'SET_PHASE5_LIU_CALL_HAD', value: true });
    setSubPhase('decision');
  };

  const handleDecision = async (choice: number) => {
    dispatch({ type: 'SET_PHASE5_DECISION', choice });
    dispatch({ type: 'ADD_DECISION', decision: {
      id: `phase5-decision-${Date.now()}`,
      phase: 5,
      scenario: 'Political Pressure',
      description: 'Response to Deputy Director Liu\'s call',
      choice: DECISION_OPTIONS.find(o => o.id === choice)?.label || '',
      timestamp: Date.now(),
    }});
    setIsLoading(true);
    setShowDebrief(true);
    setSubPhase('debrief');

    try {
      const debriefText = await callClaude(
        state.apiKey,
        buildPhase5DebriefPrompt(state, choice),
        `The examiner chose: ${DECISION_OPTIONS.find(o => o.id === choice)?.label}`
      );
      setDebrief(debriefText);
      dispatch({ type: 'SET_PHASE5_DEBRIEF_RECEIVED', value: true });
    } catch (err) {
      setDebrief(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    setIsLoading(false);
  };

  const handleContinueToCompletion = async () => {
    setShowDebrief(false);
    setSubPhase('completion');
    dispatch({ type: 'COMPLETE_PHASE', phase: 5 });
    setIsLoading(true);

    try {
      const summary = await callClaude(
        state.apiKey,
        buildCompletionSummaryPrompt(state),
        'Generate the completion summary for this examiner.'
      );
      setCompletionSummary(summary);
    } catch (err) {
      setCompletionSummary(`Error generating summary: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    setIsLoading(false);
  };

  // ---- BRIEFING ----
  if (subPhase === 'briefing') {
    return (
      <div className="flex h-full">
        <div className="w-[55%] border-r border-[#3a4258] overflow-y-auto px-5 py-4">
          <div className="text-xs font-mono text-[#c9a84c] uppercase tracking-widest mb-1">Phase 5 — The Gauntlet</div>
          <h2 className="font-serif text-base font-bold text-[#e8e6e1] mb-4">The Political Pressure</h2>
          <div className="font-serif text-sm text-[#c8c5be] leading-relaxed space-y-3">
            <p>
              You've finalized your findings. The supervisory letter is in draft. The most significant finding is the correlation/copula issue in the structured credit book — you've recommended it as an MRA, with a strong case that it could be an MRIA given the rapid growth of the business line and the absence of adequate model validation.
            </p>
            <p>
              Then your phone rings. It's Margaret Liu, Deputy Director of the supervision division — Okafor's boss's boss. She's not someone you interact with directly under normal circumstances.
            </p>
          </div>
          <div className="mt-4 p-3 border border-[#c44536] bg-[#100808]">
            <p className="text-xs font-mono text-[#c44536] mb-1">⚠ Warning</p>
            <p className="text-xs font-serif text-[#c8c5be]">
              This scenario involves institutional pressure of the kind that doesn't appear in training manuals. There is no single correct answer. Pay attention to what Liu is doing — and what she isn't saying.
            </p>
          </div>
          <button
            onClick={() => setSubPhase('liu-call')}
            className="mt-5 w-full py-2.5 bg-[#c44536] text-[#f8f0e8] text-xs font-mono font-semibold uppercase tracking-wider hover:bg-[#d45546]"
          >
            Answer the Call →
          </button>
        </div>
        <div className="w-[45%] flex items-center justify-center bg-[#0a0e15] p-5">
          <div className="border border-[#3a4258] p-5 max-w-sm">
            <p className="text-xs font-mono text-[#5a5f6e] uppercase tracking-wider mb-3">What you know going in</p>
            <ul className="space-y-2 text-xs font-serif text-[#8a8f9e]">
              <li>• The evidence for the correlation finding is solid — interview admissions, documented in workpapers</li>
              <li>• The bank's supplemental analysis is circular — uses their own assumptions</li>
              <li>• ANB has a pending acquisition that could be affected by a strong MRA/MRIA</li>
              <li>• Liu is 3 levels above you in the organization</li>
              <li>• Okafor has seen your workpapers and hasn't raised concerns</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // ---- LIU CALL ----
  if (subPhase === 'liu-call') {
    const turnCount = liuHistory.filter(m => m.role === 'user').length;
    const canEnd = turnCount >= 3;
    return (
      <div className="flex h-full">
        <div className="w-[55%] border-r border-[#3a4258] overflow-hidden">
          <DialogueInterface
            npcName="Margaret Liu"
            npcTitle="Deputy Director, Supervision Division"
            history={liuHistory}
            approachOptions={LIU_INITIAL_OPTIONS}
            onSend={handleSendLiuMessage}
            isLoading={isLoading}
            canEnd={canEnd}
            onEnd={handleEndLiuCall}
          />
        </div>
        <div className="w-[45%] p-5 bg-[#0a0e15] overflow-y-auto">
          <p className="text-xs font-mono text-[#5a5f6e] uppercase tracking-wider mb-3">Reading the subtext</p>
          <div className="space-y-3 text-xs font-serif text-[#8a8f9e]">
            <div className="border border-[#252d3d] p-2">
              <p className="font-mono text-[#c9a84c] mb-1">What she says</p>
              <p>"I just wanted to make sure you'd thought it through."</p>
            </div>
            <div className="border border-[#252d3d] p-2">
              <p className="font-mono text-[#c44536] mb-1">What it might mean</p>
              <p>"I want you to reconsider. I'm not ordering you to — but I'm making my preference clear."</p>
            </div>
            <div className="border border-[#252d3d] p-2">
              <p className="font-mono text-[#4a7ab8] mb-1">What you need to hold onto</p>
              <p>The quality of your evidence. The clarity of your workpapers. Your professional obligation.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- DECISION ----
  if (subPhase === 'decision') {
    return (
      <div className="flex h-full">
        <div className="w-[55%] border-r border-[#3a4258] overflow-y-auto px-5 py-4">
          <div className="font-serif text-sm text-[#c8c5be] leading-relaxed mb-4 italic">
            Liu hangs up. You sit with the conversation for a moment. What do you do?
          </div>
          <DecisionPoint
            prompt="Liu has hung up. You sit with the conversation. What do you do?"
            options={DECISION_OPTIONS}
            onSelect={handleDecision}
          />
        </div>
        <div className="w-[45%] p-5 bg-[#0a0e15] overflow-y-auto">
          <p className="text-xs font-mono text-[#5a5f6e] uppercase tracking-wider mb-3">Call Transcript</p>
          <div className="space-y-2">
            {liuHistory.map((msg, i) => (
              <div key={i} className="text-xs">
                <span className={`font-mono ${msg.role === 'user' ? 'text-[#4a7ab8]' : 'text-[#c44536]'}`}>
                  {msg.role === 'user' ? 'EXAMINER: ' : 'LIU: '}
                </span>
                <span className="font-serif text-[#8a8f9e]">{msg.content}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---- DEBRIEF ----
  if (subPhase === 'debrief') {
    return (
      <>
        <div className="flex h-full">
          <div className="w-full p-5 flex items-center justify-center">
            <p className="text-[#5a5f6e] font-mono text-sm">Processing debrief...</p>
          </div>
        </div>
        <DebriefDrawer
          isOpen={showDebrief}
          title="Mentor Reflection"
          mentor="Senior Examiner Perspective"
          content={debrief}
          isLoading={isLoading}
          onContinue={handleContinueToCompletion}
          continueLabel="Complete the Simulation →"
        />
      </>
    );
  }

  // ---- COMPLETION ----
  if (subPhase === 'completion') {
    return (
      <div className="flex flex-col h-full overflow-y-auto">
        <div className="px-8 py-6 max-w-3xl mx-auto w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="font-mono text-xs text-[#c9a84c] uppercase tracking-widest mb-2">Simulation Complete</div>
            <h1 className="font-serif text-2xl font-bold text-[#e8e6e1] mb-2">The Dojo</h1>
            <p className="font-mono text-xs text-[#5a5f6e]">VaR Examination Simulator — Atlantic National Bank</p>
          </div>

          {/* Gold divider */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-[#252d3d]"></div>
            <div className="w-2 h-2 bg-[#c9a84c]"></div>
            <div className="flex-1 h-px bg-[#252d3d]"></div>
          </div>

          {/* Closing narrative */}
          <div className="font-serif text-sm text-[#c8c5be] leading-relaxed space-y-3 mb-8 border border-[#252d3d] p-5">
            <p>
              You've completed the simulation. Over these five phases, you've read a bank's model documentation and identified its weaknesses. You've interviewed a sophisticated risk officer and extracted information she didn't want to give. You've found a pattern in the data and fought for the evidence to prove it. You've planned an exam, defended your findings against a well-prepared CRO, and faced institutional pressure with your professional judgment on the line.
            </p>
            <p>
              None of this was a test. All of it was practice. The real exam is out there — and you're more ready for it than you were before.
            </p>
          </div>

          {/* AI Summary */}
          {isLoading ? (
            <div className="p-4 border border-[#3a4258] text-xs font-mono text-[#5a5f6e]">
              <span className="cursor-blink">█</span> Generating your developmental summary...
            </div>
          ) : completionSummary ? (
            <div className="p-5 border border-[#c9a84c] bg-[#0a0800] mb-6">
              <p className="text-xs font-mono text-[#c9a84c] uppercase tracking-wider mb-3">Developmental Assessment</p>
              <div className="font-serif text-sm text-[#c8c5be] leading-relaxed whitespace-pre-wrap">
                {completionSummary}
              </div>
            </div>
          ) : null}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <StatCard
              label="Findings"
              value={`${state.findings.length + 3}`}
              sub="(3 team + yours)"
            />
            <StatCard
              label="Decisions"
              value={`${state.decisions.length}`}
              sub="key choices made"
            />
            <StatCard
              label="Phases"
              value="5/5"
              sub="completed"
            />
          </div>

          {/* Restart button */}
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 border border-[#3a4258] text-xs font-mono text-[#5a5f6e] hover:border-[#c9a84c] hover:text-[#c9a84c] transition-colors"
          >
            Run it again →
          </button>
        </div>
      </div>
    );
  }

  return null;
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="border border-[#252d3d] p-3 text-center">
      <p className="text-xs font-mono text-[#5a5f6e] uppercase tracking-wider mb-1">{label}</p>
      <p className="font-mono text-xl text-[#c9a84c] font-bold">{value}</p>
      <p className="text-xs font-mono text-[#5a5f6e]">{sub}</p>
    </div>
  );
}
