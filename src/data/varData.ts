import type { VarDataPoint } from '../types';

export function generateVarData(days: number = 125): VarDataPoint[] {
  const limit = 45;
  const data: VarDataPoint[] = [];
  const suspiciousDays = new Set<number>();

  const suspiciousIndices = [8, 15, 24, 31, 40, 48, 55, 63, 72, 78, 87, 95, 102, 110, 118];
  suspiciousIndices.forEach(i => suspiciousDays.add(i));

  // Use a seeded pseudo-random to keep data consistent
  let seed = 42;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 0xffffffff;
  };

  for (let i = 0; i < days; i++) {
    const date = new Date(2025, 6, 1);
    date.setDate(date.getDate() + i);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    let varValue: number;

    if (suspiciousDays.has(i)) {
      varValue = limit * (0.93 + rand() * 0.05);
    } else if (suspiciousDays.has(i - 1)) {
      varValue = limit * (0.62 + rand() * 0.11);
    } else {
      varValue = limit * (0.67 + rand() * 0.22);
    }

    data.push({
      date: date.toISOString().split('T')[0],
      var: Math.round(varValue * 100) / 100,
      limit: limit,
      dayIndex: i,
    });
  }

  return data;
}

export const VAR_DATA = generateVarData(125);
