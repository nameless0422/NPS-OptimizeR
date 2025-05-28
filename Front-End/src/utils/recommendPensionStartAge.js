export default function recommendPensionStartAge(expectedDeathAge, financialScore, riskPreference) {
  let base = 55;

  if (expectedDeathAge >= 85) base += 3;
  if (financialScore >= 80) base += 2;
  if (riskPreference === 'aggressive') base += 2;
  else if (riskPreference === 'conservative') base -= 1;

  return Math.max(55, Math.floor(Math.min(base, expectedDeathAge - 5)));
}
