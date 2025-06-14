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

const getStrategyReason = (type, healthScore, financeScore, expectedDeathAge) => {
  if (type === 'early') {
    if (expectedDeathAge < 75 || financeScore < 3.0) return '기대수명이 짧거나 재정 여유가 부족한 경우 조기 수령이 유리합니다.';
    return '빠른 현금 흐름 확보가 필요한 경우 조기 수령 전략이 유효합니다.';
  }
  if (type === 'normal') {
    return '기대수명과 재정 상태가 평균 수준일 때 균형 잡힌 전략입니다.';
  }
  if (type === 'deferred') {
    if (expectedDeathAge >= 85 && financeScore >= 6.0) return '기대수명이 길고 재정 여유가 있는 경우 수령을 늦춰 총 수령액을 극대화할 수 있습니다.';
    return '수령을 늦출수록 월 수령액이 증가하여 장기적인 수입 보전에 유리합니다.';
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
    if (expectedDeathAge < 78 || financialScore < 3.0) return 60;
    else if (expectedDeathAge >= 85 && financialScore >= 6.0) return 66;
    else return 65;
  }

  if (userInput) {
    const {
      nationalPremium,
      privatePremium,
      retireAge,
      expectedDeathAge,
      retireInfo,
      monthlySpending
    } = userInput;

    const monthlyRetirePension = Number(retireInfo?.monthlyPension || 0);
    const minMonthly = Number(monthlySpending || 0);
    const retirementPay = includeSeverance ? Number(retireInfo?.retirementPay || 0) : 0;

    const dynamicBaseAge = determineBaseAge(Number(expectedDeathAge), userInput.financialScore);

    // 기대수명 ±5 variation
    const variations = [-5, 0, 5].map(offset => {
      const eda = Number(expectedDeathAge) + offset;

      const sim = simulatePensionScenarios(
        Number(nationalPremium),
        Number(privatePremium),
        dynamicBaseAge,
        eda,
        monthlyRetirePension,
        retirementPay
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

      return { label: `${eda}세 기대수명`, sim, best };
    });


    const filtered = variations.filter(v => v.best?.status === '충족');
    const selected = (filtered.length > 0
      ? filtered
      : variations 
    ).reduce((prev, curr) =>
      curr.best?.total > prev.best?.total ? curr : prev
    );

    setResult(selected.sim);
    setBest(selected.best);
    setSensitivity(variations.sort((a, b) => parseInt(a.label) - parseInt(b.label)));
  }
}, [userInput, includeSeverance]);

  if (!result || !Array.isArray(result.results)) {
    return <div className="container" style={{ padding: '40px', textAlign: 'center' }}>결과를 불러오는 중입니다...</div>;
  }

  const uniqueResults = Array.from(
    new Map(result.results.map(r => [`${r.type}-${r.startAge}`, r])).values()
  );
  const validResults = uniqueResults;
  const sortedResults = [...uniqueResults].sort((a, b) => b.total - a.total);
  const top3 = sortedResults.slice(0, 3);
  const lumpSumSeverance = includeSeverance ? Number(userInput?.retireInfo?.retirementPay || 0) : 0;
  const lumpSumTotal = (best.publicMonthly + best.privateMonthly + best.retireMonthly) * 12 * (userInput.expectedDeathAge - best.startAge) + lumpSumSeverance;

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

      <div className="section-box" style={{ marginBottom: '20px', padding: '10px', background: '#f3f6fa', borderRadius: '8px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '8px' }}> 입력 요약</h3>
        <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
          기대수명: <strong>{userInput.expectedDeathAge ? `${userInput.expectedDeathAge}세` : '정보 없음'}</strong><br />
          재정 점수: <strong>{userInput.financialScore != null ? `${userInput.financialScore}점` : '정보 없음'}</strong>,
          월 필요 생활비: <strong>{userInput.monthlySpending ? `${userInput.monthlySpending.toLocaleString()}만원` : '정보 없음'}</strong><br />
          월 소득: <strong>{userInput.monthlyIncome ? `${userInput.monthlyIncome.toLocaleString()}만원` : '정보 없음'}</strong>
        </div>
      </div>

      <div className="section-box">
        <h2>📊 추천 전략 요약 및 해설</h2>
        <p><strong>🎯 추천 수령 시작 나이: 노령연금 </strong> {typeLabelShort[best.type]} ({best.startAge}세) <strong> 개인연금 </strong> {userInput.privateFixedTerm === '종신' ? ' 종신형' : ` ${userInput.privateFixedTerm} 확정형 (55세)`} </p><br />
        <p style={{ fontSize: '15px', lineHeight: '1.8' }}>
          <strong>✅ 국민연금은 {typeLabelShort[best.type]}({best.startAge}세) 전략</strong>, 개인연금은 <strong>{userInput.privateFixedTerm === '종신' ? ' 종신형' : ` ${userInput.privateFixedTerm} 확정형`}</strong> 전략이 유리합니다.<br />
          → 국민연금은 건강·재정 조건에 따라 수령 시점을 조정하면 수령 총액 최적화가 가능하며,<br />
          → 이는 기대수명이 {userInput.expectedDeathAge}세이고, 개인연금 수령 시작 시점인 55세 기준으로 남은 기대 수령 기간이 약 {Math.max(1, Math.round(userInput.expectedDeathAge - 55))}년이므로,<br />해당 기간에 가장 근접한 확정형 옵션으로 <strong> {userInput.privateFixedTerm === '종신' ? ' 종신형' : ` ${userInput.privateFixedTerm} 확정형`}</strong>이 선택되었습니다.
        </p>

        <p style={{ fontSize: '14px', marginTop: '8px' }}>
  전략 해설: {getStrategyReason(best.type, userInput.healthScore, userInput.financialScore, userInput.expectedDeathAge)}
  </p>

        <p style={{ fontSize: '14px', marginTop: '12px', color: '#888' }}>
  ※ 현재 추천 전략은 <strong>기대수명과 재정점수</strong>를 기준으로 설계된 수급 시작 나이({best.startAge}세)를 따릅니다.<br />
  → 단, 총 수령액만을 기준으로 더 유리한 전략이 있을 수 있으므로 <strong>아래 비교 그래프</strong>를 함께 참고하세요.
</p>
        <div style={{
          background: '#f9f9f9',
          padding: '12px 16px',
          border: '1px solid #eee',
          borderRadius: '6px',
          fontSize: '14px',
          lineHeight: '1.8',
          marginTop: '12px'
        }}>
          <strong>💰 연금 수령 요약</strong>
          <ul style={{ paddingLeft: '20px', marginTop: '8px', listStyleType: 'disc' }}>
            <li><strong>월 총 수령액:</strong> {formatAmount(best.monthly)} (모든 연금 합산)</li>
            <li><strong>총 수령액 (세후):</strong> {best.total.toLocaleString()}만원</li>
            <li><strong>일시금 합계:</strong> {formatAmount(lumpSumTotal)}
              <span style={{ fontSize: '13px', color: '#666' }}> (퇴직금: {formatAmount(userInput.retireInfo?.retirementPay ?? 0)}, 기타: {(lumpSumTotal - (userInput.retireInfo?.retirementPay ?? 0)).toLocaleString()}만원)</span>
            </li>
          </ul>

          <div style={{ marginTop: '16px' }}>
            <strong>📌 연금별 상세 수령 내역</strong>
            <ul style={{ paddingLeft: '1.4rem', marginTop: '10px', fontSize: '14px', lineHeight: '1.7' }}>
              <li><strong>국민연금:</strong> {userInput.nationalPeriod}년 납입, 전략: <strong>{typeLabelShort[best.type]}</strong>, 수령액: <strong>{formatAmount(best.publicMonthly)}</strong> /월<br /><span style={{ fontSize: '12px', color: '#777' }}>ⓘ 조기수령은 60~64세 적용 (최대 -30% 감액)</span></li>
              {userInput.hasPrivatePension && (
                <li><strong>개인연금:</strong> {userInput.privatePeriod}년 납입, 유형: <strong>확정형</strong>, 수령액: <strong>{formatAmount(best.privateMonthly)}</strong> /월<br /><span style={{ fontSize: '12px', color: '#777' }}>ⓘ 전략과 무관하게 55세부터 고정 수령 가정</span></li>
              )}
              <li><strong>퇴직:</strong> {best.retireMonthly > 0 ? `${best.startAge}세부터 월 ${formatAmount(best.retireMonthly)} 수령` : `퇴직금 일시금 수령: ${formatAmount(userInput.retireInfo?.retirementPay ?? 0)}`}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="section-box">
        <h2>전략별 총 수령액 비교 (TOP 3)</h2>
  <Plot
  data={[{
    x: top3.map((r) => `${typeLabelShort[r.type]}(${r.startAge}세)`),
    y: top3.map(r => r.total),
    type: 'bar',
    marker: { color: top3.map(r => colorMap[r.type]) },
    hovertemplate: '<b>%{x}</b><br><b>총 수령액:</b> %{y:,}만원<extra></extra>',
  }]}
  layout={{
    height: 300,
    margin: { t: 5, b: 30, l: 50, r: 10 },
    bargap: 0.4,
    yaxis: { title: '총 수령액 (만원)', tickformat: ',d' },
    xaxis: { title: '전략 유형 및 시작 나이' },
    annotations: top3.map((r, i) => ({
      x: `${typeLabelShort[r.type]}(${r.startAge}세)`,
      y: 0,
      text: `${r.total.toLocaleString()}만원`,
      showarrow: false,
      yshift: -20,
      font: {
        size: 13,
        color: '#444'
      },
      xanchor: 'center'
    }))
  }}
  config={{ responsive: true }}
  useResizeHandler
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
