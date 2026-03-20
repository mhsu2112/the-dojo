export interface Finding {
  id: string;
  phase: number;
  title: string;
  description: string;
  severity: 'observation' | 'MRA' | 'MRIA' | null;
  regulatoryBasis: string;
  supported: boolean;
}

export interface Decision {
  id: string;
  phase: number;
  scenario: string;
  description: string;
  choice: string;
  timestamp: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type RelationshipState = {
  eic: 'neutral' | 'trusting' | 'concerned';
  bankCRO: 'cooperative' | 'resistant' | 'hostile';
  drVasquez: 'guarded' | 'respectful' | 'dismissive';
  teamMorale: 'high' | 'steady' | 'strained';
};

export interface ExamState {
  currentPhase: 1 | 2 | 3 | 4 | 5;
  currentScenario: string;
  scenarioStep: number;

  findings: Finding[];
  decisions: Decision[];

  relationships: RelationshipState;

  documentsReviewed: string[];

  conversationHistories: Record<string, ChatMessage[]>;

  phasesCompleted: Record<number, boolean>;

  // Phase 1 specific
  phase1Selections: number[];
  phase1FeedbackReceived: boolean;

  // Phase 2 specific
  phase2MemoSubmitted: boolean;
  phase2MemoFeedback: string;
  phase2InterviewComplete: boolean;

  // Phase 3 specific
  phase3ObservationSubmitted: boolean;
  phase3DataRequestMade: boolean;
  phase3DataRequestChoice: number | null;
  phase3FindingDrafted: boolean;

  // Phase 4 specific
  phase4ExamPlanSubmitted: boolean;
  phase4ExitMeetingStarted: boolean;
  phase4SupervisoryLetterDrafted: boolean;

  // Phase 5 specific
  phase5LiuCallHad: boolean;
  phase5Decision: number | null;
  phase5DebriefReceived: boolean;

  apiKey: string;
}

export type ExamAction =
  | { type: 'SET_API_KEY'; key: string }
  | { type: 'SET_PHASE'; phase: 1 | 2 | 3 | 4 | 5 }
  | { type: 'SET_STEP'; step: number }
  | { type: 'SET_SCENARIO'; scenario: string }
  | { type: 'ADD_FINDING'; finding: Finding }
  | { type: 'UPDATE_FINDING'; id: string; updates: Partial<Finding> }
  | { type: 'ADD_DECISION'; decision: Decision }
  | { type: 'ADD_MESSAGE'; npc: string; message: ChatMessage }
  | { type: 'SET_PHASE1_SELECTIONS'; selections: number[] }
  | { type: 'SET_PHASE1_FEEDBACK_RECEIVED'; value: boolean }
  | { type: 'SET_PHASE2_INTERVIEW_COMPLETE'; value: boolean }
  | { type: 'SET_PHASE2_MEMO_SUBMITTED'; value: boolean }
  | { type: 'SET_PHASE2_MEMO_FEEDBACK'; feedback: string }
  | { type: 'SET_PHASE3_OBSERVATION_SUBMITTED'; value: boolean }
  | { type: 'SET_PHASE3_DATA_REQUEST_MADE'; value: boolean }
  | { type: 'SET_PHASE3_DATA_REQUEST_CHOICE'; choice: number }
  | { type: 'SET_PHASE3_FINDING_DRAFTED'; value: boolean }
  | { type: 'SET_PHASE4_EXAM_PLAN_SUBMITTED'; value: boolean }
  | { type: 'SET_PHASE4_EXIT_MEETING_STARTED'; value: boolean }
  | { type: 'SET_PHASE4_SUPERVISORY_LETTER_DRAFTED'; value: boolean }
  | { type: 'SET_PHASE5_LIU_CALL_HAD'; value: boolean }
  | { type: 'SET_PHASE5_DECISION'; choice: number }
  | { type: 'SET_PHASE5_DEBRIEF_RECEIVED'; value: boolean }
  | { type: 'COMPLETE_PHASE'; phase: number }
  | { type: 'LOAD_STATE'; state: ExamState }
  | { type: 'RESET_STATE' };

export interface VarDataPoint {
  date: string;
  var: number;
  limit: number;
  dayIndex: number;
}
