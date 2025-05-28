// src/Page/Step4Result.jsx
import React, { useEffect, useState } from 'react';
import Stepper from '../components/Stepper';
import Plot from 'react-plotly.js';
import { simulatePensionScenarios } from '../utils/simulator';
import { recommendCompositeStrategy } from '../utils/recommendCompositeStrategy';

const typeLabelShort = {
  early: '조기수령',
  normal: '정상수령',
  deferred: '연기수령',
};

const colorMap = {
  early: '#ff7f0e',
  normal: '#1f77b4',
  deferred: '#2ca02c',
};

const formatAmount = (amount) =>
  typeof amount === 'number' ? Math.round(amount).toLocaleString() + '만원' : 'x';

const getStrategyReason = (type, healthScore, financeScore) => {
  if (type === 'early') {
    if (healthScore < 70 || financeScore < 60) return '건강이 좋지 않거나 재정 여력이 부족한 경우 빠르게 수령하는 것이 유리합니다.';
    return '수령을 앞당겨 빠른 현금 흐름을 확보할 수 있습니다.';
  }
  if (type === 'normal') return '일반적인 기대수명과 평균 재정 상태를 고려한 균형 전략입니다.';
  if (type === 'deferred') {
    if (healthScore >= 80 && financeScore >= 80) return '건강하고 재정적으로 여유가 있다면 수령을 늦춰 총 수령액을 극대화할 수 있습니다.';
    return '수령 시기를 늦추면 월 수령액이 증가합니다.';
  }
  return '';
};

export default function Step4Result({ userInput }) {
  const [result, setResult] = useState(null);
  const [best, setBest] = useState(null);
  const [sensitivity, setSensitivity] = useState([]);
  const [includeSeverance, setIncludeSeverance] = useState(true);

  useEffect(() => {
    function determineBaseAge(expectedDeathAge, financialScore) {
      if (expectedDeathAge < 78 || financialScore < 60) return 60;
      else if (expectedDeathAge >= 85 && financialScore >= 80) return 66;
      else return 65;
    }
    if (userInput) {
      const { nationalPremium, privatePremium, retireAge, expectedDeathAge, retireInfo, monthlySpending } = userInput;
      const monthlyRetirePension = Number(retireInfo?.monthlyPension || 0);
      const minMonthly = Number(monthlySpending || 0);
      const retirementPay = includeSeverance ? Number(retireInfo?.retirementPay || 0) : 0;

      const dynamicBaseAge = determineBaseAge(Number(expectedDeathAge), userInput.financialScore);
      const variations = [-5, 0, 5].map(offset => {
        const eda = Number(expectedDeathAge) + offset;
        const sim = simulatePensionScenarios(
          Number(nationalPremium),
          Number(privatePremium),
          dynamicBaseAge,
          eda,
          monthlyRetirePension,
          retirementPay // ✅ 전체 전략 비교에 퇴직금 포함 반영
        );

        const best = recommendCompositeStrategy({
          nationalPremium: Number(nationalPremium),
          privatePremium: Number(privatePremium),
          retireAge: dynamicBaseAge,
          expectedDeathAge: eda,
          monthlyRetirePension,
          minMonthly,
          retirementPay
        });

        return {
          label: `${eda}세 기대수명`,
          sim,
          best
        };
      });

      setResult(variations[1].sim);
      setBest(variations[1].best);
      setSensitivity(variations.sort((a, b) => parseInt(a.label) - parseInt(b.label)));
    }
  }, [userInput, includeSeverance]);

  if (!result || !Array.isArray(result.results)) {
    return (
      <div className="container" style={{ padding: '40px', textAlign: 'center' }}>
        <p>결과를 불러오는 중입니다. 잠시만 기다려주세요...</p>
      </div>
    );
  }

  const uniqueResults = Array.from(
    new Map(result.results.map(r => [`${r.type}-${r.startAge}`, r])).values()
  );
  const validResults = uniqueResults;
  const top3 = validResults.slice(0, 3);
  const fulfilledCount = sensitivity.filter(s => s.best?.status === '충족').length;
  const totalScenarios = sensitivity.length;

  const totalYears = userInput.expectedDeathAge - best.startAge;
  const lumpSumPublic = best.publicMonthly ? best.publicMonthly * 12 * totalYears : 0;
  const lumpSumPrivate = best.privateMonthly ? best.privateMonthly * 12 * totalYears : 0;
  const lumpSumRetire = best.retireMonthly ? best.retireMonthly * 12 * totalYears : 0;
  const lumpSumSeverance = includeSeverance ? Number(userInput?.retireInfo?.retirementPay || 0) : 0;
  const lumpSumTotal = lumpSumPublic + lumpSumPrivate + lumpSumRetire + lumpSumSeverance;

  const summaryInfo = (
    <div className="section-box" style={{ marginBottom: '20px', padding: '10px', background: '#f3f6fa', borderRadius: '8px' }}>
      <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>📋 입력 요약</h3>
      <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
        건강 점수: <strong>{userInput.healthScore ?? 'N/A'}</strong>, 기대수명: <strong>{userInput.expectedDeathAge ?? '-'}세</strong><br />
        재정 점수: <strong>{userInput.financialScore ?? 'N/A'}</strong>, 최소 월지출: <strong>{userInput.monthlySpending?.toLocaleString() ?? '-'}원</strong><br />
        총자산: <strong>{userInput.totalAssets?.toLocaleString() ?? '-'}원</strong>, 월소득: <strong>{userInput.monthlyIncome?.toLocaleString() ?? '-'}원</strong>
      </div>
    </div>
  );

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Stepper currentStep={3} />
      <h1 className="title">최적 연금 수급 전략 결과</h1>

      <div className="section-box">
        <label>
          <input
            type="checkbox"
            checked={includeSeverance}
            onChange={() => setIncludeSeverance(prev => !prev)}
            style={{ marginRight: '8px' }}
          />
          퇴직금 포함하여 전략 전체에 반영
        </label>
      </div>

      {summaryInfo}

      <div className="section-box">
        <h2>추천 전략 요약</h2>
        {best && (
          <div style={{ fontSize: '16px', lineHeight: '1.8' }}>
            <strong>{typeLabelShort[best.type]}</strong> 전략이 가장 유리합니다.<br />
            → {getStrategyReason(best.type, userInput.healthScore, userInput.financialScore)}<br />
            <strong>{best.startAge}세</strong>부터 수령 시작 → <strong>{formatAmount(best.monthly)}</strong>/월 수령<br />
            총 세후 수령액: <strong>{best.total.toLocaleString()}만원</strong><br />
            👉 연금 구성: 국민연금 <strong>{formatAmount(best.publicMonthly)}</strong>, 개인연금 <strong>{formatAmount(best.privateMonthly)}</strong>, 퇴직연금 <strong>{formatAmount(best.retireMonthly)}</strong><br />
            💰 일시금 기준 합산 총액({includeSeverance ? '퇴직금 포함' : '퇴직금 제외'}): <strong>{formatAmount(lumpSumTotal)}</strong>
          </div>
        )}
      </div>

      <div className="section-box">
        <h2>전략별 총 수령액 비교 (TOP 3)</h2>
        <Plot
          data={[{
            x: top3.map((r) => `${typeLabelShort[r.type]}(${r.startAge}세)`),
            y: top3.map(r => r.total),
            type: 'bar',
            marker: { color: top3.map(r => colorMap[r.type]) },
            hovertemplate: '<b>%{x}</b><br>총 수령액: %{y:,}만원<extra></extra>',
          }]}
          layout={{
            height: 300,
            margin: { t: 20, b: 60, l: 40, r: 20 },
            bargap: 0.4,
            yaxis: { title: '총 수령액 (만원)', tickformat: ',d' },
            xaxis: { title: '전략 유형 및 시작 나이' }
          }}
          config={{ responsive: true }}
          useResizeHandler={true}
          style={{ width: '100%' }}
        />
      </div>

      <div className="section-box">
        <h2>전략 상세 비교</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="result-table" style={{ minWidth: '800px', textAlign: 'center' }}>
            <thead style={{ backgroundColor: '#f9f9f9' }}>
              <tr>
                <th>전략</th>
                <th>수령 시작 나이</th>
                <th>총 수령액 (세후)</th>
                <th>월 평균 수령액</th>
                <th>수령 기간</th>
                <th>일시금 총액 ({includeSeverance ? '퇴직금 포함' : '제외'})</th>
              </tr>
            </thead>
            <tbody>
              {validResults.map((r, idx) => {
                const years = (userInput.expectedDeathAge - r.startAge).toFixed(1);
                const lumpSum = (r.publicMonthly + r.privateMonthly + r.retireMonthly) * 12 * (userInput.expectedDeathAge - r.startAge) + (includeSeverance ? lumpSumSeverance : 0);
                const isBest = r === best;
                return (
                  <tr key={idx} style={{ backgroundColor: isBest ? '#e6f7ff' : 'transparent' }}>
                    <td>{typeLabelShort[r.type]}</td>
                    <td>{r.startAge}세</td>
                    <td>{r.total.toLocaleString()}만원</td>
                    <td>{r.monthly.toLocaleString()}만원</td>
                    <td>{years}년</td>
                    <td>{formatAmount(lumpSum)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
