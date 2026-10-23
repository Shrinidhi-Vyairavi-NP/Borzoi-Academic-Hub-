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