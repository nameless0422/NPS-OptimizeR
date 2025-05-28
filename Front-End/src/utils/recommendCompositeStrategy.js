// utils/recommendCompositeStrategy.js
export function recommendCompositeStrategy({
  nationalPremium,
  privatePremium,
  retireAge,
  expectedDeathAge,
  monthlyRetirePension,
  minMonthly,
  retirementPay = 0 // ✅ 퇴직금 추가
}) {
  const results = [];

  const types = ['early', 'normal', 'deferred'];
  types.forEach(type => {
    for (let adjustYears = 0; adjustYears <= 5; adjustYears++) {
      let startAge, publicMonthly;
      if (type === 'early') {
        startAge = retireAge - adjustYears;
        if (startAge < 60 || startAge > 64) continue;
        publicMonthly = nationalPremium * (1 - 0.05 * (retireAge - startAge));
      } else if (type === 'deferred') {
        startAge = retireAge + adjustYears;
        if (startAge < 66 || startAge > 70) continue;
        publicMonthly = nationalPremium * (1 + 0.072 * (startAge - retireAge));
      } else {
        startAge = retireAge;
        if (startAge !== 65) continue;
        publicMonthly = nationalPremium;
      }

      publicMonthly = Math.round(publicMonthly);
      const privateMonthly = Math.round(privatePremium);
      const totalMonthly = publicMonthly + privateMonthly + monthlyRetirePension;

      const monthsToReceive = Math.max(0, Math.round((expectedDeathAge - startAge) * 12));
      const totalPension = totalMonthly * monthsToReceive;
      const totalWithSeverance = totalPension + retirementPay; // ✅ 퇴직금 포함

      results.push({
        type,
        startAge,
        total: totalWithSeverance,
        monthly: totalMonthly,
        status: totalMonthly >= minMonthly ? '충족' : '부족',
        publicMonthly,
        privateMonthly,
        retireMonthly: monthlyRetirePension,
        reason:
          type === 'early'
            ? '건강이 우려되거나 재정 부담이 있는 경우 유리합니다.'
            : type === 'deferred'
            ? '장수 위험 대비나 자산 여유가 있는 경우 유리합니다.'
            : '균형 잡힌 일반적인 수령 전략입니다.',
      });
    }
  });

  return results.sort((a, b) => b.total - a.total)[0];
}
