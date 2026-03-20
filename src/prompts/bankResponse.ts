import type { ExamState } from '../types';
import { buildBaseContext } from './baseContext';

export function buildBankDataResponsePrompt(state: ExamState, requestText: string): string {
  return `${buildBaseContext(state)}

You are representing Atlantic National Bank's regulatory affairs team responding to an examiner data request. The examiner has requested intraday position/trading data related to VaR limit utilization patterns on the rates desk.

The examiner's request:
${requestText}

Your response should:
1. Acknowledge the request professionally
2. Push back on feasibility: "Intraday position snapshots at the granularity requested are not maintained in a readily reportable format. Our systems capture end-of-day positions for risk reporting purposes. Reconstructing intraday positions would require significant effort from our technology team."
3. Offer a lesser substitute: "We can provide end-of-day position changes and trade blotters for the periods in question, which we believe would address your analytical needs."
4. Subtly frame the pattern as normal: "We'd also note that position adjustments near risk limits are a normal and expected feature of disciplined risk management — traders are required to manage within their limits."

Keep it to 3-4 sentences, professional and polished. Sign off as "Office of Regulatory Affairs, Atlantic National Bank."

Stay in character. Do not break the fourth wall.`;
}
