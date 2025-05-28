export function simulatePensionScenarios(
basePublic = 65,           // 국민연금 월 수령액
basePrivate = 35,          // 개인연금 월 수령액
ignoredBaseAge = 65,      // baseAge는 무시하고 60\~70 전체를 돌림
expectedDeathAge = 85,     // 기대수명
monthlyRetirePension = 0   // 퇴직연금 월 수령액
) {
const results = [];

const estimateTax = (publicAnnual, privateAnnual) => {
const total = publicAnnual + privateAnnual;
if (total <= 1200) return total * 0.033;
if (total <= 4500) return total * 0.06;
if (total <= 8800) return total * 0.15;
return total * 0.24;
};

const retirementPay = window.retirementPayAmount ?? 0; // ✅ 퇴직금: 전략과 무관하게 고정

for (let startAge = 60; startAge <= 70; startAge++) {
let type = 'normal';
if (startAge < 65) type = 'early';
else if (startAge > 65) type = 'deferred';


let publicMonthly = basePublic;
if (type === 'early') {
  publicMonthly *= (1 - 0.05 * (65 - startAge));
} else if (type === 'deferred') {
  publicMonthly *= (1 + 0.072 * (startAge - 65));
}

publicMonthly = Math.round(publicMonthly);
const privateMonthly = Math.round(basePrivate);
const retireMonthly = Math.round(monthlyRetirePension);

const totalMonthly = publicMonthly + privateMonthly + retireMonthly;
const annualTotal = totalMonthly * 12;
const tax = estimateTax(publicMonthly * 12, privateMonthly * 12);
const netMonthly = Math.round((annualTotal - tax) / 12);

const monthsToReceive = Math.max(0, Math.round((expectedDeathAge - startAge) * 12));
const total = netMonthly * monthsToReceive;

results.push({
  type,
  startAge,
  publicMonthly,
  privateMonthly,
  retireMonthly,
  netMonthly,
  monthly: netMonthly,
  total,
  lumpSum: retirementPay
    + publicMonthly * 12 * (expectedDeathAge - startAge)
    + privateMonthly * 12 * (expectedDeathAge - startAge),
  totalWithLumpSum: total
    + retirementPay
    + publicMonthly * 12 * (expectedDeathAge - startAge)
    + privateMonthly * 12 * (expectedDeathAge - startAge)
});


}

return {
results: results.sort((a, b) => b.totalWithLumpSum - a.totalWithLumpSum)
};
}
