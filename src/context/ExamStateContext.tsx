import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ExamState, ExamAction } from '../types';
import { saveState, loadState } from '../utils/storage';

const initialState: ExamState = {
  currentPhase: 1,
  currentScenario: 'phase1-briefing',
  scenarioStep: 0,
  findings: [],
  decisions: [],
  relationships: {
    eic: 'neutral',
    bankCRO: 'cooperative',
    drVasquez: 'guarded',
    teamMorale: 'high',
  },
  documentsReviewed: [],
  conversationHistories: {},
  phasesCompleted: {},
  phase1Selections: [],
  phase1FeedbackReceived: false,
  phase2MemoSubmitted: false,
  phase2MemoFeedback: '',
  phase2InterviewComplete: false,
  phase3ObservationSubmitted: false,
  phase3DataRequestMade: false,
  phase3DataRequestChoice: null,
  phase3FindingDrafted: false,
  phase4ExamPlanSubmitted: false,
  phase4ExitMeetingStarted: false,
  phase4SupervisoryLetterDrafted: false,
  phase5LiuCallHad: false,
  phase5Decision: null,
  phase5DebriefReceived: false,
  apiKey: '',
};

function examReducer(state: ExamState, action: ExamAction): ExamState {
  let newState: ExamState;

  switch (action.type) {
    case 'SET_API_KEY':
      newState = { ...state, apiKey: action.key };
      break;
    case 'SET_PHASE':
      newState = { ...state, currentPhase: action.phase, scenarioStep: 0 };
      break;
    case 'SET_STEP':
      newState = { ...state, scenarioStep: action.step };
      break;
    case 'SET_SCENARIO':
      newState = { ...state, currentScenario: action.scenario };
      break;
    case 'ADD_FINDING':
      newState = { ...state, findings: [...state.findings, action.finding] };
      break;
    case 'UPDATE_FINDING':
      newState = {
        ...state,
        findings: state.findings.map(f =>
          f.id === action.id ? { ...f, ...action.updates } : f
        ),
      };
      break;
    case 'ADD_DECISION':
      newState = { ...state, decisions: [...state.decisions, action.decision] };
      break;
    case 'ADD_MESSAGE': {
      const existing = state.conversationHistories[action.npc] || [];
      newState = {
        ...state,
        conversationHistories: {
          ...state.conversationHistories,
          [action.npc]: [...existing, action.message],
        },
      };
      break;
    }
    case 'SET_PHASE1_SELECTIONS':
      newState = { ...state, phase1Selections: action.selections };
      break;
    case 'SET_PHASE1_FEEDBACK_RECEIVED':
      newState = { ...state, phase1FeedbackReceived: action.value };
      break;
    case 'SET_PHASE2_INTERVIEW_COMPLETE':
      newState = { ...state, phase2InterviewComplete: action.value };
      break;
    case 'SET_PHASE2_MEMO_SUBMITTED':
      newState = { ...state, phase2MemoSubmitted: action.value };
      break;
    case 'SET_PHASE2_MEMO_FEEDBACK':
      newState = { ...state, phase2MemoFeedback: action.feedback };
      break;
    case 'SET_PHASE3_OBSERVATION_SUBMITTED':
      newState = { ...state, phase3ObservationSubmitted: action.value };
      break;
    case 'SET_PHASE3_DATA_REQUEST_MADE':
      newState = { ...state, phase3DataRequestMade: action.value };
      break;
    case 'SET_PHASE3_DATA_REQUEST_CHOICE':
      newState = { ...state, phase3DataRequestChoice: action.choice };
      break;
    case 'SET_PHASE3_FINDING_DRAFTED':
      newState = { ...state, phase3FindingDrafted: action.value };
      break;
    case 'SET_PHASE4_EXAM_PLAN_SUBMITTED':
      newState = { ...state, phase4ExamPlanSubmitted: action.value };
      break;
    case 'SET_PHASE4_EXIT_MEETING_STARTED':
      newState = { ...state, phase4ExitMeetingStarted: action.value };
      break;
    case 'SET_PHASE4_SUPERVISORY_LETTER_DRAFTED':
      newState = { ...state, phase4SupervisoryLetterDrafted: action.value };
      break;
    case 'SET_PHASE5_LIU_CALL_HAD':
      newState = { ...state, phase5LiuCallHad: action.value };
      break;
    case 'SET_PHASE5_DECISION':
      newState = { ...state, phase5Decision: action.choice };
      break;
    case 'SET_PHASE5_DEBRIEF_RECEIVED':
      newState = { ...state, phase5DebriefReceived: action.value };
      break;
    case 'COMPLETE_PHASE':
      newState = {
        ...state,
        phasesCompleted: { ...state.phasesCompleted, [action.phase]: true },
      };
      break;
    case 'LOAD_STATE':
      return action.state;
    case 'RESET_STATE':
      return { ...initialState };
    default:
      return state;
  }

  saveState(newState);
  return newState;
}

interface ExamContextValue {
  state: ExamState;
  dispatch: React.Dispatch<ExamAction>;
}

const ExamStateContext = createContext<ExamContextValue | null>(null);

export function ExamStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(examReducer, initialState);

  // Don't auto-load — handled by HomeScreen
  return (
    <ExamStateContext.Provider value={{ state, dispatch }}>
      {children}
    </ExamStateContext.Provider>
  );
}

export function useExamState() {
  const ctx = useContext(ExamStateContext);
  if (!ctx) throw new Error('useExamState must be used within ExamStateProvider');
  return ctx;
}
