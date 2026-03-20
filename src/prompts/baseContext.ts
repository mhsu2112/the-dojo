import type { ExamState } from '../types';

export function buildBaseContext(state: ExamState): string {
  const findingsSummary = state.findings.length > 0
    ? state.findings.map(f => `- ${f.title} (${f.severity || 'uncalibrated'}): ${f.description.slice(0, 100)}...`).join('\n')
    : 'None identified yet.';

  const decisionsSummary = state.decisions.length > 0
    ? state.decisions.map(d => `- Phase ${d.phase}: ${d.description} → Chose: ${d.choice}`).join('\n')
    : 'None made yet.';

  return `You are part of a training simulator called "The Dojo" that teaches bank examiners how to conduct Value-at-Risk model examinations at large banks. The simulated bank is "Atlantic National Bank," a fictional U.S. G-SIB.

The learner is an examiner with 1-2 years of general supervisory experience who has not previously led a VaR exam. They understand basic regulatory concepts (MRA, MRIA, SR 11-7) but are building expertise in market risk.

Maintain absolute technical accuracy in all financial and regulatory content. Do not simplify to the point of inaccuracy. The learner is a professional and should be treated as one.

Current exam state:
- Phase: ${state.currentPhase} of 5
- Scenario step: ${state.scenarioStep}

Findings identified:
${findingsSummary}

Key decisions made:
${decisionsSummary}

Relationships:
- EIC Okafor: ${state.relationships.eic}
- Bank CRO: ${state.relationships.bankCRO}
- Dr. Vasquez: ${state.relationships.drVasquez}
- Team morale: ${state.relationships.teamMorale}`;
}
