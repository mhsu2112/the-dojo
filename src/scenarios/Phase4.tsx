import React from 'react';
import { useExamState } from '../context/ExamStateContext';
import { callClaude } from '../utils/api';
import { buildOkaforExamPlanReviewPrompt } from '../prompts/okafor';
import { buildChenPrompt } from '../prompts/chenCRO';
import DocumentViewer, { DocTitle, DocMeta, DocSection, DocPara, DocConfidential } from '../components/DocumentViewer';
import WritingInterface from '../components/WritingInterface';
import DialogueInterface from '../components/DialogueInterface';
import DebriefDrawer from '../components/DebriefDrawer';
import PhaseTransition from '../components/PhaseTransition';
import type { ChatMessage } from '../types';

const EXIT_MEETING_OPTIONS = [
  { id: 1, text: "Let's walk through the findings package. I'll start with the most significant item — the structured credit correlation assumptions." },
  { id: 2, text: "I want to discuss the open MRA from the 2024 exam. We're recommending elevation to MRIA based on non-remediation." },
  { id: 3, text: "Before we get into specifics, can you walk me through what actions the bank has taken since our last examination?" },
  { id: 4, text: "I understand you have a supplemental analysis on the correlation finding — let's review that together." },
];

export default function Phase4() {
  const { state, dispatch } = useExamState();
  const [subPhase, setSubPhase] = React.useState<'briefing' | 'exam-plan' | 'plan-review' | 'exit-briefing' | 'exit-meeting' | 'supervisory-letter' | 'complete'>('briefing');
  const [planFeedback, setPlanFeedback] = React.useState('');
  const [exitHistory, setExitHistory] = React.useState<ChatMessage[]>(
    state.conversationHistories['chen'] || []
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [showDebrief, setShowDebrief] = React.useState(false);
  const [showTransition, setShowTransition] = React.useState(false);
  const [letterFeedback, setLetterFeedback] = React.useState('');

  // Initialize Chen opening
  React.useEffect(() => {
    if (subPhase === 'exit-meeting' && exitHistory.length === 0) {
      const opening: ChatMessage = {
        role: 'assistant',
        content: "Thank you for coming in. We've reviewed your draft findings and have some responses we'd like to share. My team takes the examination process seriously, and we've worked hard over the past month to be as transparent as possible. Shall we go through the findings one by one?",
      };
      setExitHistory([opening]);
      dispatch({ type: 'ADD_MESSAGE', npc: 'chen', message: opening });
    }
  }, [subPhase]);

  const handleSubmitExamPlan = async (planText: string) => {
    dispatch({ type: 'SET_PHASE4_EXAM_PLAN_SUBMITTED', value: true });
    setIsLoading(true);
    setShowDebrief(true);

    try {
      const feedback = await callClaude(
        state.apiKey,
        buildOkaforExamPlanReviewPrompt(state, planText),
        `Exam plan: ${planText}`
      );
      setPlanFeedback(feedback);
    } catch (err) {
      setPlanFeedback(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    setIsLoading(false);
    setSubPhase('plan-review');
  };

  const handleContinueToExitBriefing = () => {
    setShowDebrief(false);
    setSubPhase('exit-briefing');
  };

  const handleSendExitMessage = async (message: string) => {
    const userMsg: ChatMessage = { role: 'user', content: message };
    const newHistory = [...exitHistory, userMsg];
    setExitHistory(newHistory);
    dispatch({ type: 'ADD_MESSAGE', npc: 'chen', message: userMsg });
    setIsLoading(true);

    try {
      const response = await callClaude(
        state.apiKey,
        buildChenPrompt(state),
        message,
        exitHistory
      );
      const assistantMsg: ChatMessage = { role: 'assistant', content: response };
      setExitHistory(prev => [...prev, assistantMsg]);
      dispatch({ type: 'ADD_MESSAGE', npc: 'chen', message: assistantMsg });
    } catch (err) {
      const errMsg: ChatMessage = {
        role: 'assistant',
        content: `[API Error: ${err instanceof Error ? err.message : 'Unknown error'}]`,
      };
      setExitHistory(prev => [...prev, errMsg]);
    }
    setIsLoading(false);
  };

  const handleEndExitMeeting = () => {
    dispatch({ type: 'SET_PHASE4_EXIT_MEETING_STARTED', value: true });
    setSubPhase('supervisory-letter');
  };

  const handleSubmitSupervisoryLetter = async (letterText: string) => {
    dispatch({ type: 'SET_PHASE4_SUPERVISORY_LETTER_DRAFTED', value: true });
    setIsLoading(true);
    setShowDebrief(true);

    try {
      const feedback = await callClaude(
        state.apiKey,
        `You are James Okafor reviewing a junior examiner's draft supervisory letter excerpt for the most significant finding.

The finding concerns the structured credit correlation assumptions in Atlantic National Bank's VaR model.

A well-crafted supervisory letter finding should:
- Cite the specific regulatory expectation being cited (SR 11-7, 12 CFR Part 3)
- State the issue with precision — not vague or editorialized
- Reference specific evidence gathered during the examination
- State the required remediation clearly
- Be appropriately calibrated in tone

Review and provide 2-3 paragraphs of feedback as Okafor. Under 250 words.`,
        `Draft supervisory letter excerpt: ${letterText}`
      );
      setLetterFeedback(feedback);
    } catch (err) {
      setLetterFeedback(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    setIsLoading(false);
  };

  const handleContinueToPhase5 = () => {
    setShowDebrief(false);
    dispatch({ type: 'COMPLETE_PHASE', phase: 4 });
    setShowTransition(true);
  };

  if (showTransition) {
    return (
      <PhaseTransition
        phase={5}
        title='"The Gauntlet"'
        subtitle="The Political Pressure"
        onComplete={() => dispatch({ type: 'SET_PHASE', phase: 5 })}
      />
    );
  }

  const priorExamTab = {
    id: 'prior',
    label: 'Prior Exam',
    content: <PriorExamContent />,
  };
  const intelligenceTab = {
    id: 'intel',
    label: 'Market Intelligence',
    content: <IntelligenceContent />,
  };
  const tenKTab = {
    id: '10k',
    label: '10-K Excerpt',
    content: <TenKContent />,
  };
  const findingsTab = {
    id: 'findings',
    label: 'Findings Package',
    content: <FindingsPackageContent state={state} />,
  };

  // ---- BRIEFING ----
  if (subPhase === 'briefing') {
    return (
      <div className="flex h-full">
        <div className="w-[55%] border-r border-[#3a4258] overflow-y-auto px-5 py-4">
          <div className="text-xs font-mono text-[#c9a84c] uppercase tracking-widest mb-1">Phase 4 — The Full Scope</div>
          <h2 className="font-serif text-base font-bold text-[#e8e6e1] mb-4">Scoping & The Exit Meeting</h2>
          <div className="font-serif text-sm text-[#c8c5be] leading-relaxed space-y-3">
            <p>
              You've received the pre-exam materials package. Review the documents on the right: the prior exam summary, market intelligence brief, and 10-K excerpts.
            </p>
            <p className="italic text-[#c9a84c]">
              Okafor: "You've got the pre-exam materials. I want you to draft the exam plan. You have a team of three, including yourself, and four weeks on-site. Tell me: what are the priority workstreams, how are you allocating the team, and what do you expect to find?"
            </p>
          </div>
          <button
            onClick={() => setSubPhase('exam-plan')}
            className="mt-5 w-full py-2.5 bg-[#c9a84c] text-[#0f1219] text-xs font-mono font-semibold uppercase tracking-wider hover:bg-[#e0c060]"
          >
            Draft Exam Plan →
          </button>
        </div>
        <div className="w-[45%] overflow-hidden">
          <DocumentViewer tabs={[priorExamTab, intelligenceTab, tenKTab]} />
        </div>
      </div>
    );
  }

  // ---- EXAM PLAN ----
  if (subPhase === 'exam-plan' || subPhase === 'plan-review') {
    return (
      <>
        <div className="flex h-full">
          <div className="w-[55%] border-r border-[#3a4258] overflow-hidden">
            <WritingInterface
              prompt='Draft your exam plan. Include: priority workstreams, team allocation (3 examiners), expected findings, and your rationale for the scope. Four weeks on-site.'
              placeholder="EXAMINATION PLAN — DRAFT&#10;&#10;Examination: Atlantic National Bank — VaR Model Review&#10;Team: [3 examiners]&#10;Duration: 4 weeks on-site&#10;&#10;I. Priority Workstreams&#10;...&#10;&#10;II. Team Allocation&#10;...&#10;&#10;III. Expected Findings&#10;..."
              submitLabel="Submit Exam Plan to Okafor"
              onSubmit={handleSubmitExamPlan}
              isLoading={isLoading}
              disabled={state.phase4ExamPlanSubmitted}
              minWords={60}
            />
          </div>
          <div className="w-[45%] overflow-hidden">
            <DocumentViewer tabs={[priorExamTab, intelligenceTab, tenKTab]} />
          </div>
        </div>
        <DebriefDrawer
          isOpen={showDebrief || subPhase === 'plan-review'}
          title="Exam Plan Review"
          mentor="James Okafor, EIC"
          content={planFeedback}
          isLoading={isLoading}
          onContinue={handleContinueToExitBriefing}
          continueLabel="Continue to Exit Meeting →"
        />
      </>
    );
  }

  // ---- EXIT BRIEFING ----
  if (subPhase === 'exit-briefing') {
    return (
      <div className="flex h-full">
        <div className="w-[55%] border-r border-[#3a4258] overflow-y-auto px-5 py-4">
          <div className="text-xs font-mono text-[#c9a84c] uppercase tracking-widest mb-1">Phase 4B — The Exit Meeting</div>
          <h2 className="font-serif text-base font-bold text-[#e8e6e1] mb-4">Presenting Your Findings</h2>
          <div className="font-serif text-sm text-[#c8c5be] leading-relaxed space-y-3">
            <p>
              It's the final week. Your team has completed the fieldwork. You're bringing a findings package to the exit meeting with Atlantic National Bank's senior management.
            </p>
            <p>
              Across the table: <strong className="text-[#e8e6e1]">Richard Chen, Chief Risk Officer</strong>, and Dr. Vasquez. Chen is senior, strategic, and knows how to pick his battles. He'll concede minor points to build credibility for pushing back on the ones that matter to him.
            </p>
            <p className="italic text-[#c9a84c]">
              Your job is to present the findings clearly, defend the significant ones against pushback, and hold the line where the evidence is solid.
            </p>
          </div>
          <button
            onClick={() => {
              dispatch({ type: 'SET_PHASE4_EXIT_MEETING_STARTED', value: true });
              setSubPhase('exit-meeting');
            }}
            className="mt-5 w-full py-2.5 bg-[#c9a84c] text-[#0f1219] text-xs font-mono font-semibold uppercase tracking-wider hover:bg-[#e0c060]"
          >
            Begin Exit Meeting →
          </button>
        </div>
        <div className="w-[45%] overflow-hidden">
          <DocumentViewer tabs={[findingsTab]} />
        </div>
      </div>
    );
  }

  // ---- EXIT MEETING ----
  if (subPhase === 'exit-meeting') {
    const turnCount = exitHistory.filter(m => m.role === 'user').length;
    const canEnd = turnCount >= 4;
    return (
      <div className="flex h-full">
        <div className="w-[55%] border-r border-[#3a4258] overflow-hidden">
          <DialogueInterface
            npcName="Richard Chen"
            npcTitle="Chief Risk Officer, Atlantic National Bank"
            history={exitHistory}
            approachOptions={EXIT_MEETING_OPTIONS}
            onSend={handleSendExitMessage}
            isLoading={isLoading}
            canEnd={canEnd}
            onEnd={handleEndExitMeeting}
          />
        </div>
        <div className="w-[45%] overflow-hidden">
          <DocumentViewer tabs={[findingsTab]} />
        </div>
      </div>
    );
  }

  // ---- SUPERVISORY LETTER ----
  if (subPhase === 'supervisory-letter') {
    return (
      <>
        <div className="flex h-full">
          <div className="w-[55%] border-r border-[#3a4258] overflow-hidden">
            <WritingInterface
              prompt="Draft the supervisory letter excerpt for the most significant finding — the structured credit correlation assumptions. Include: the issue, the regulatory citation, the evidence, and the required remediation."
              placeholder="[Agency Letterhead]&#10;&#10;SUPERVISORY LETTER&#10;&#10;Atlantic National Bank&#10;&#10;Finding: Structured Credit Correlation Assumptions — VaR Model&#10;Severity: MRA&#10;&#10;We identified the following finding during our examination of Atlantic National Bank's Value-at-Risk model framework...&#10;&#10;Regulatory Basis:&#10;...&#10;&#10;Evidence:&#10;...&#10;&#10;Required Action:&#10;..."
              submitLabel="Finalize Supervisory Letter"
              onSubmit={handleSubmitSupervisoryLetter}
              isLoading={isLoading}
              disabled={state.phase4SupervisoryLetterDrafted}
              minWords={60}
            />
          </div>
          <div className="w-[45%] overflow-hidden">
            <DocumentViewer tabs={[findingsTab]} />
          </div>
        </div>
        <DebriefDrawer
          isOpen={showDebrief}
          title="Supervisory Letter Review"
          mentor="James Okafor, EIC"
          content={letterFeedback}
          isLoading={isLoading}
          onContinue={handleContinueToPhase5}
          continueLabel="Continue to Phase 5 →"
        />
      </>
    );
  }

  return null;
}

function PriorExamContent() {
  return (
    <div className="p-5">
      <DocConfidential />
      <DocTitle>Atlantic National Bank — Prior VaR Examination Summary (2024)</DocTitle>
      <DocMeta>Supervisory Assessment — Market Risk / VaR Model Review — Prior Cycle</DocMeta>
      <div className="space-y-3">
        <div className="border border-[#c44536] p-3">
          <p className="font-mono text-xs text-[#c44536] mb-1">MRA 2024-MR-01 — OPEN</p>
          <p className="font-serif text-sm text-[#c8c5be]">
            <strong className="text-[#e8e6e1]">Inadequate documentation of VaR model parameter selection process.</strong> The bank's documentation does not adequately explain the rationale for key model parameters including the lookback window, confidence level selection, and stress testing assumptions. Bank's response cited planned documentation enhancements; no evidence of completion at time of follow-up.
          </p>
        </div>
        <div className="border border-[#4a8c6f] p-3">
          <p className="font-mono text-xs text-[#4a8c6f] mb-1">MRA 2024-MR-02 — CLOSED</p>
          <p className="font-serif text-sm text-[#c8c5be]">
            <strong className="text-[#e8e6e1]">Backtesting framework does not incorporate desk-level analysis for all covered desks.</strong> Bank implemented desk-level backtesting in Q1 2024. Satisfactorily remediated.
          </p>
        </div>
        <div className="border border-[#c9a84c] p-3">
          <p className="font-mono text-xs text-[#c9a84c] mb-1">OBSERVATION — Noted</p>
          <p className="font-serif text-sm text-[#c8c5be]">
            <strong className="text-[#e8e6e1]">VaR limit governance — limits had not been reviewed by the Market Risk Committee in 18 months.</strong> Bank committed to semi-annual review cycle. Verification deferred to subsequent examination.
          </p>
        </div>
      </div>
    </div>
  );
}

function IntelligenceContent() {
  return (
    <div className="p-5">
      <DocConfidential />
      <DocTitle>Atlantic National Bank — Supervisory Intelligence Brief</DocTitle>
      <DocMeta>Confidential — Pre-Examination Briefing Materials</DocMeta>
      <DocSection num="1" title="Business Developments">
        <DocPara>
          Atlantic National Bank significantly expanded its structured credit trading desk in 2024, hiring 12 traders from a competitor. Notional exposure in structured credit products has grown approximately 300% year-over-year, representing a material increase in model scope complexity.
        </DocPara>
      </DocSection>
      <DocSection num="2" title="Peer Analysis">
        <DocPara>
          Industry peer analysis indicates ANB's VaR-to-trading-revenue ratio is notably low relative to peers with similar business mix, potentially suggesting model conservatism has declined or that risk capture has not kept pace with business growth.
        </DocPara>
      </DocSection>
      <DocSection num="3" title="Strategic Activity">
        <DocPara>
          Media reports suggest ANB is in advanced discussions for a major acquisition of a European asset manager. If consummated, this would significantly increase the complexity of their consolidated risk framework and may trigger regulatory review of the combined entity's market risk infrastructure.
        </DocPara>
      </DocSection>
    </div>
  );
}

function TenKContent() {
  return (
    <div className="p-5">
      <DocTitle>Atlantic National Bank — Annual Report (Excerpts)</DocTitle>
      <DocMeta>Market Risk Disclosures — 10-K Filing</DocMeta>
      <DocSection num="" title="Market Risk Management">
        <DocPara>
          Atlantic National Bank employs a Value-at-Risk framework as the primary tool for measuring and managing market risk in its trading book. VaR is estimated at the 99th percentile confidence interval using a 10-day holding period, consistent with regulatory requirements under the Market Risk Rule. For the twelve months ended December 31, 2025, average firm-wide VaR was $38.2 million, compared to $29.6 million for the prior year period. The increase reflects organic growth in the structured credit business line.
        </DocPara>
        <DocPara>
          The Company's VaR model is subject to daily backtesting against realized trading revenues. During the twelve-month backtesting period, the Company experienced three firm-wide VaR exceptions, all of which were reviewed and determined to be attributable to large, unanticipated market movements rather than model deficiency. Management considers the model's backtesting performance to be satisfactory.
        </DocPara>
        <DocPara>
          The Company's Market Risk Committee, comprised of senior representatives from risk management, trading, and finance, reviews VaR model performance and limit utilization on a monthly basis. The Committee has authority to approve model changes and limit adjustments, subject to notification requirements under applicable regulatory guidance.
        </DocPara>
      </DocSection>
    </div>
  );
}

function FindingsPackageContent({ state }: { state: ReturnType<typeof useExamState>['state'] }) {
  return (
    <div className="p-5 space-y-3">
      <DocTitle>Examination Findings Package</DocTitle>
      <DocMeta>Atlantic National Bank — VaR Model Review — Draft for Exit Meeting</DocMeta>

      {/* Pre-populated team findings */}
      <div className="space-y-3">
        <div className="border border-[#c44536] p-3">
          <p className="font-mono text-xs text-[#c44536] mb-1">FINDING: Structured Credit Correlation Assumptions — MRA</p>
          <p className="font-serif text-xs text-[#c8c5be] leading-relaxed">
            The VaR model's Gaussian copula correlation parameters for structured credit positions are calibrated to only 6 months of CDS spread data, which is insufficient to capture a full credit cycle. Furthermore, no stressed correlation assumptions are applied — the same quarterly-refreshed matrix is used for both normal and stress scenarios. This is inconsistent with SR 11-7 expectations for effective model validation and supervisory guidance on stress testing.
          </p>
          <p className="font-mono text-xs text-[#5a5f6e] mt-2">Regulatory basis: SR 11-7 (Model Risk Management); 12 CFR Part 3, Subpart F</p>
        </div>

        <div className="border border-[#c44536] p-3">
          <p className="font-mono text-xs text-[#c44536] mb-1">FINDING: Model Validation Deficiency — MRA</p>
          <p className="font-serif text-xs text-[#c8c5be] leading-relaxed">
            The September 2025 annual validation did not perform a comprehensive assessment of the structured credit module. The validation scope was characterized as "preliminary," which does not meet SR 11-7 expectations for effective challenge of model assumptions, data, and methodology. A model component representing material business risk requires rigorous, independent validation.
          </p>
          <p className="font-mono text-xs text-[#5a5f6e] mt-2">Regulatory basis: SR 11-7; OCC Bulletin 2011-12</p>
        </div>

        <div className="border border-[#c44536] p-3">
          <p className="font-mono text-xs text-[#c44536] mb-1">FINDING: Open MRA Elevation — Parameter Documentation — MRIA</p>
          <p className="font-serif text-xs text-[#c8c5be] leading-relaxed">
            The bank has not remediated MRA 2024-MR-01 regarding VaR model parameter documentation. The documentation reviewed during this examination remains materially unchanged from the prior exam period. Non-remediation of an MRA, without demonstrated good-faith progress, warrants elevation to MRIA status.
          </p>
          <p className="font-mono text-xs text-[#5a5f6e] mt-2">Regulatory basis: SR 11-7; Prior MRA 2024-MR-01</p>
        </div>

        {/* Learner-developed findings */}
        {state.findings.map(f => (
          <div key={f.id} className="border border-[#c9a84c] p-3">
            <p className="font-mono text-xs text-[#c9a84c] mb-1">
              FINDING: {f.title} — {f.severity || 'PENDING CALIBRATION'}
            </p>
            <p className="font-serif text-xs text-[#c8c5be] leading-relaxed">{f.description}</p>
            {f.regulatoryBasis && (
              <p className="font-mono text-xs text-[#5a5f6e] mt-2">Regulatory basis: {f.regulatoryBasis}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
