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

      // Step4Result 전략 요약 섹션 최종 리팩토링
<div className="section-box">
  <h2>추천 전략 요약</h2>
  {best && (
    <div style={{ fontSize: '15px', lineHeight: '1.8', color: '#333' }}>
      <p>
        <strong>✅ {typeLabelShort[best.type]} 전략</strong>이 가장 유리합니다.
        <br />
        → {getStrategyReason(best.type, userInput.healthScore, userInput.financialScore)}
      </p>

      {/* 합계 요약 */}
      <div style={{
        background: '#f9f9f9',
        padding: '10px 14px',
        border: '1px solid #eee',
        borderRadius: '6px',
        marginTop: '10px'
      }}>
        <strong>💰 총 수령 요약</strong>
        <ul style={{ marginTop: '6px', paddingLeft: '20px', listStyleType: 'disc' }}>
          <li><strong>월 협회 수령액:</strong> {formatAmount(best.monthly)}</li>
          <li><strong>모든 세후 수령 합계:</strong> {best.total.toLocaleString()}만원</li>
          <li><strong>퇴직금 포함 일시금 합계:</strong> {formatAmount(lumpSumTotal)}</li>
        </ul>
      </div>

      {/* 선정 방향 반영 배경 */}
      <div style={{
        background: '#f6f8fa',
        padding: '12px 16px',
        borderRadius: '6px',
        fontSize: '14px',
        lineHeight: '1.6',
        marginTop: '24px'
      }}>
        <strong>📘 전략 선정 배경 설명:</strong><br />
        사용자의 건강 점수는 <strong>{userInput.healthScore}</strong>점, 재정 점수는 <strong>{userInput.financialScore}</strong>점으로 <strong>{userInput.monthlySpending?.toLocaleString() ?? '-'}원</strong> 범위의 살생비 충족이 필요한 상황입니다.
        <br /><br />
        이를 고발해 <strong>{typeLabelShort[best.type]}</strong> 전략을 통해 반복 수집이 보다 빠른 협금 후매를 가진하고, 국민연금 <strong>{formatAmount(best.publicMonthly)}</strong>, 개인연금 <strong>{formatAmount(best.privateMonthly)}</strong>을 중심으로 관리합니다.
        <br />
        퇴직연금은 수령하지 않고 <strong>퇴직금 일시금으로 별도 수령</strong>됩니다.
      </div>

      {/* 연금 범위 요약 */}
      <div style={{
        background: '#ffffff',
        padding: '12px 16px',
        marginTop: '20px',
        border: '1px solid #e1e4e8',
        borderRadius: '6px',
        fontSize: '14px',
        lineHeight: '1.6'
      }}>
        <strong>✔️ 연금별 수령 시점 및 수령액</strong>
        <ul style={{ marginTop: '8px', paddingLeft: '20px', listStyleType: 'square' }}>
          <li>
            <strong>국민연금:</strong> {
              (() => {
                const birthYear = new Date().getFullYear() - userInput.age;
                let startAge = 60;
                if (birthYear >= 1953 && birthYear <= 1956) startAge = 61;
                else if (birthYear >= 1957 && birthYear <= 1960) startAge = 62;
                else if (birthYear >= 1961 && birthYear <= 1964) startAge = 63;
                else if (birthYear >= 1965 && birthYear <= 1968) startAge = 64;
                else if (birthYear >= 1969) startAge = 65;
                return (
                  <>
                    {' '}{startAge}세 시작 → {formatAmount(best.publicMonthly)} / 월<br />
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      ⓘ {birthYear}년생은 국민연금 시작나이가 {startAge}세입니다.
                    </span>
                  </>
                );
              })()
            }
          </li>

          {userInput.hasPrivatePension && (
            <li>
              <strong>개인연금:</strong> 55세 시작 → {formatAmount(best.privateMonthly)} / 월<br />
              <span style={{ fontSize: '12px', color: '#666' }}>
                ⓘ 일반적으로 55세부터 수령가능합니다.
              </span>
            </li>
          )}

          {best.retireMonthly > 0 ? (
            <li>
              <strong>퇴직연금:</strong> {best.startAge}세 시작 → {formatAmount(best.retireMonthly)} / 월
            </li>
          ) : (
            <li>
              <strong>퇴직연금:</strong> 수령하지 않음<br />
              <span style={{ fontSize: '12px', color: '#666' }}>
                ⓘ 퇴직금 일시금 별도 수령: <strong>{formatAmount(userInput.retireInfo?.retirementPay ?? 0)}</strong>
              </span>
            </li>
          )}
        </ul>
      </div>
    </div>
  )}
</div>


<div className="section-box">
  <h2>📘 수령 전략 해설</h2>
  <p style={{ fontSize: '14px', color: '#333', marginBottom: '12px' }}>
    사용자의 입력정보 및 기대수명을 바탕으로 다음과 같이 수령 전략이 구성되었습니다.
  </p>

  <ul style={{ fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px' }}>
    <li>
      <strong>국민연금</strong>: {userInput.nationalPeriod}년 동안 월 {userInput.nationalPremium}만원 납입<br />
      → 이를 기준으로 <strong>{typeLabelShort[best.type]}</strong> 전략에 따라 월 <strong>{formatAmount(best.publicMonthly)}</strong> 수령으로 조정되었습니다.
      <br />
      <span style={{ color: '#666' }}>
        ※ 조기 수령 시 최대 -30%, 연기 수령 시 최대 +36% 조정률이 반영됩니다.
      </span>
    </li>

    {userInput.hasPrivatePension && (
      <li style={{ marginTop: '10px' }}>
        <strong>개인연금</strong>: {userInput.privatePeriod}년 동안 월 {userInput.privatePremium}만원 납입<br />
        → 평균 수령액으로 월 <strong>{formatAmount(best.privateMonthly)}</strong> 설정되었습니다.
        <br />
        <span style={{ color: '#666' }}>
          ※ 일정 수익률 기반의 고정 수령으로 가정하고 계산되었습니다.
        </span>
      </li>
    )}

    {userInput.retireInfo && (
      <li style={{ marginTop: '10px' }}>
        <strong>퇴직연금</strong>: 총 퇴직금 <strong>{formatAmount(userInput.retireInfo.retirementPay)}</strong> 추정<br />
        → <strong>{userInput.retireInfo.receiveYears}</strong>년간 월 <strong>{formatAmount(userInput.retireInfo.monthlyPension)}</strong>씩 분할 수령
        <br />
        <span style={{ color: '#666' }}>
          ※ 퇴직금 일시금 대신 연금화하여 전체 월 수령액 안정성 확보
        </span>
      </li>
    )}
  </ul>

  <hr style={{ margin: '20px 0' }} />

  <p style={{ fontSize: '14px', color: '#444' }}>
    ✔️ <strong>{typeLabelShort[best.type]}</strong> 전략은 <strong>{userInput.healthScore}점</strong>의 건강 점수와 <strong>{userInput.financialScore}점</strong>의 재정 점수,
    그리고 <strong>{userInput.expectedDeathAge}세</strong>의 기대수명을 고려할 때 가장 효율적인 선택으로 판단됩니다.
  </p>
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
