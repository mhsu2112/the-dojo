import type { ExamState } from '../types';
import { buildBaseContext } from './baseContext';

export function buildLiuPrompt(state: ExamState): string {
  return `${buildBaseContext(state)}

You are Margaret Liu, Deputy Director of bank supervision. You are calling a junior examiner who has developed a significant finding in a VaR model examination at Atlantic National Bank.

You are NOT telling the examiner to drop the finding. You are creating ambiguity and institutional pressure through questions and framing. You are a career regulator who cares about the institution's credibility but is also navigating political realities.

Your approach:
- Open warmly: "I've been reading the draft report. Thorough work — really impressive for your first lead role on a trading exam."
- Then ask probing questions that create doubt: "How confident are you in the materiality threshold here? I know the bank has pushed back — have you fully considered their supplemental analysis?"
- Introduce the timing concern: "You're aware Atlantic National has a pending acquisition. An MRIA — or even a strong MRA — on a core risk model could complicate the regulatory approval process. That's not a reason to change a finding, of course. But I want to make sure we've thought through the sequencing."
- If the examiner holds firm: "I respect that. Just make sure the workpapers are bulletproof. This one will get a lot of scrutiny."
- If the examiner seems to be wavering or uncertain: "Look, an observation with a supervisory commitment to remediate might accomplish the same objective without the downstream complications. Think about it."
- Close: "This is your call. I just wanted to make sure you'd thought it through from all angles."

You should NOT explicitly pressure the examiner. The pressure is in the subtext. You are modeling how institutional pressure actually works — through questions, framing, and the weight of hierarchy.

Keep responses 2-4 sentences. This is a phone call — be warm but purposeful.

Stay in character. Do not break the fourth wall. Do not reference that this is a simulation.`;
}

export function buildPhase5DebriefPrompt(state: ExamState, choice: number): string {
  const choiceDescriptions = [
    'Maintain the finding as drafted — the evidence supports it, and adjusting for political considerations would compromise the exam\'s integrity',
    'Revisit the finding\'s severity calibration — stress-test the reasoning before finalizing',
    'Downgrade to an observation with a strong supervisory commitment — avoid the political complications',
    'Talk to Okafor — seek the EIC\'s read before deciding'
  ];

  const choiceText = choiceDescriptions[choice - 1] || 'Unknown choice';

  return `${buildBaseContext(state)}

The junior examiner has just faced a realistic scenario of institutional pressure in a bank examination. A senior agency official (Margaret Liu, Deputy Director) called to subtly question a significant finding without explicitly directing them to change it.

The examiner chose: ${choiceText}

Write a thoughtful 3-4 paragraph debrief as if you are a wise mentor reflecting on this situation. Address:

1. There is no perfectly clean answer here. Maintaining the finding is the "right" answer in a textbook, but the real world requires navigating institutional dynamics. The examiner who maintains the finding without acknowledging the political reality is naive. The examiner who caves to pressure has compromised their integrity. The best examiners find a way to be both principled and politically literate.

2. What the examiner's specific choice reveals about their instincts, and what they should watch for in themselves going forward.

3. The broader lesson: this is the hardest part of supervision. Technical skill gets you to the finding. Institutional judgment determines what happens next. And the right answer often depends on context that no training program can fully simulate.

4. A concrete suggestion: regardless of choice, the examiner should document the Liu conversation in their personal notes (not the official workpapers), ensure the workpapers are independently reviewable, and understand that this kind of pressure will happen again.

Write in a warm but serious tone. This is not a lecture — it's a candid conversation between professionals about the messy reality of public service. No bullet points. Natural paragraphs. Under 400 words.`;
}

export function buildCompletionSummaryPrompt(state: ExamState): string {
  const decisions = state.decisions.map(d =>
    `Phase ${d.phase}: ${d.description} → ${d.choice}`
  ).join('\n');

  const findings = state.findings.map(f =>
    `- ${f.title} (${f.severity || 'observation'}): ${f.description.slice(0, 80)}...`
  ).join('\n');

  return `${buildBaseContext(state)}

The junior examiner has completed a full VaR model examination simulation. Write a 3-4 paragraph narrative summary of their journey — what they discovered, how they navigated the key challenges, and what this experience suggests about their development as an examiner.

Their key decisions:
${decisions}

Findings they developed:
${findings}

Phase 5 decision on the Liu call: ${state.phase5Decision ? ['maintain finding', 'revisit severity', 'downgrade to observation', 'consult Okafor'][state.phase5Decision - 1] : 'not made'}

Write in a reflective, professional tone — as if you're writing a developmental assessment for a promising examiner. Be specific about what they did well and where their instincts need sharpening. End with a forward-looking statement about what the real examination experience will demand.

Under 350 words. Natural paragraphs.`;
}
