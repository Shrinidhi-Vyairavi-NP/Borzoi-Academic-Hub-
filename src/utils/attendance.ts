import { Subject } from '../types';

export function calculatePercentage(attended: number, total: number): number {
  if (total <= 0) return 100;
  return Math.round((attended / total) * 1000) / 10;
}

export function calculateConsecutiveNeeded(attended: number, total: number, minCriteria: number): number {
  if (total <= 0) return 0;
  const currentPct = (attended / total) * 100;
  if (currentPct >= minCriteria) return 0;

  const M = minCriteria / 100;
  if (M >= 1) return 999;

  const numerator = M * total - attended;
  const denominator = 1 - M;
  return Math.max(0, Math.ceil(numerator / denominator));
}

export function calculateSafeBunks(attended: number, total: number, minCriteria: number): number {
  if (total <= 0) return 5;
  const currentPct = (attended / total) * 100;
  if (currentPct < minCriteria) return 0;

  const M = minCriteria / 100;
  if (M <= 0) return 999;

  const maxTotal = attended / M;
  return Math.max(0, Math.floor(maxTotal - total));
}

export function calculateOverallStats(subjects: Subject[], minCriteria: number) {
  let totalAttended = 0;
  let totalConducted = 0;

  subjects.forEach((s) => {
    totalAttended += s.attended;
    totalConducted += s.total;
  });

  const overallPct = calculatePercentage(totalAttended, totalConducted);
  const consecutiveNeeded = calculateConsecutiveNeeded(totalAttended, totalConducted, minCriteria);
  const safeBunks = calculateSafeBunks(totalAttended, totalConducted, minCriteria);

  return { totalAttended, totalConducted, overallPct, consecutiveNeeded, safeBunks };
}