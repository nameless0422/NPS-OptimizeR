export function evaluateFinancialStatus({
  age,
  totalAssets,         // 총 자산 (만원)
  monthlyExpense,      // 월 지출 (만원)
  monthlyIncome,       // 월 소득 (만원)
  cohabitingFamily,    // 함께 사는 가족 수
  dependents,          // 부양가족 수
  hasOwnHouse,         // 자가 여부 (true/false)
  hasInsurance         // 보험가입 여부 (true/false)
}) {
  let baseScore = 0;

  // 생존 가능 개월 수 (순자산 ÷ 지출)
  const netAsset = totalAssets - (monthlyExpense * 12 * 0.5);  // 약식 고정지출 제외
  const monthsSurvivable = (netAsset * 10000) / (monthlyExpense * 10000); // 월 기준 생존 가능 개월 수

  if (monthsSurvivable >= 360) baseScore += 3;
  else if (monthsSurvivable >= 240) baseScore += 2.5;
  else if (monthsSurvivable >= 120) baseScore += 2;
  else if (monthsSurvivable >= 60) baseScore += 1;
  else baseScore += 0.5;

  if (monthlyIncome >= 200) baseScore += 2;
  else if (monthlyIncome >= 100) baseScore += 1;
  else baseScore += 0;

  if (dependents >= 2) baseScore -= 1;
  else if (dependents === 1) baseScore -= 0.5;

  if (cohabitingFamily > 2) baseScore -= 0.5;

  if (hasOwnHouse) baseScore += 1;
  if (hasInsurance) baseScore += 0.5;

  const finalScore = Math.min(Math.max(baseScore, 0), 10); // 0~10 사이 클램핑
  let recommendation = "정상수령(65세)";
  if (finalScore < 3.6) recommendation = "조기수령(60세)";
  else if (finalScore > 7.7) recommendation = "연기수령(70세)";

  return { score: finalScore, recommendation };
}
