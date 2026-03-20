import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { VAR_DATA } from '../data/varData';
import type { VarDataPoint } from '../types';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const varValue = payload.find(p => p.name === 'var')?.value;
    const limitValue = payload.find(p => p.name === 'limit')?.value || 45;
    const utilization = varValue ? ((varValue / limitValue) * 100).toFixed(1) : null;
    return (
      <div className="bg-[#141820] border border-[#3a4258] p-2 font-mono text-xs">
        <p className="text-[#5a5f6e] mb-1">{label}</p>
        {varValue !== undefined && (
          <p className="text-[#4a7ab8]">VaR: ${varValue}M</p>
        )}
        <p className="text-[#c9a84c]">Limit: ${limitValue}M</p>
        {utilization && (
          <p className={parseFloat(utilization) >= 93 ? 'text-[#c44536]' : 'text-[#8a8f9e]'}>
            Utilization: {utilization}%
          </p>
        )}
      </div>
    );
  }
  return null;
}

// Show only every nth label to avoid crowding
function tickFormatter(value: string, index: number) {
  if (index % 15 === 0) return value;
  return '';
}

export default function DataChart() {
  // Filter to show only every other data point for readability, but keep all data
  const chartData = VAR_DATA.filter((_, i) => i % 1 === 0);

  return (
    <div className="flex flex-col h-full p-4">
      <div className="mb-3">
        <p className="text-xs font-mono text-[#5a5f6e] uppercase tracking-wider mb-1">
          Atlantic National Bank — Rates Trading Desk
        </p>
        <p className="text-xs font-mono text-[#c9a84c]">
          Daily VaR vs. Limit  |  Jul–Dec 2025  |  $M
        </p>
      </div>

      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 15, left: 0, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="2 4"
              stroke="#1e2535"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={(v: string) => {
                const d = new Date(v);
                return `${d.getMonth()+1}/${d.getDate()}`;
              }}
              tick={{ fill: '#5a5f6e', fontSize: 9, fontFamily: 'IBM Plex Mono' }}
              interval={14}
              axisLine={{ stroke: '#3a4258' }}
              tickLine={false}
            />
            <YAxis
              domain={[20, 50]}
              tick={{ fill: '#5a5f6e', fontSize: 9, fontFamily: 'IBM Plex Mono' }}
              tickFormatter={(v: number) => `$${v}M`}
              axisLine={{ stroke: '#3a4258' }}
              tickLine={false}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={45}
              stroke="#c9a84c"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              label={{
                value: 'LIMIT $45M',
                position: 'insideTopRight',
                fill: '#c9a84c',
                fontSize: 9,
                fontFamily: 'IBM Plex Mono',
              }}
            />
            <Line
              type="monotone"
              dataKey="var"
              stroke="#4a7ab8"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3, fill: '#c9a84c', stroke: 'none' }}
              name="var"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex gap-4 text-xs font-mono">
        <div className="flex items-center gap-1">
          <div className="w-4 h-0.5 bg-[#4a7ab8]"></div>
          <span className="text-[#5a5f6e]">Daily VaR</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-0.5 bg-[#c9a84c] border-dashed" style={{borderTop: '1.5px dashed #c9a84c', height: 0}}></div>
          <span className="text-[#5a5f6e]">VaR Limit</span>
        </div>
      </div>
    </div>
  );
}
