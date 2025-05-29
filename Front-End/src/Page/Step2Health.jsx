// src/pages/Step2Health.jsx
import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import Stepper from '../components/Stepper';
import Plot from 'react-plotly.js';
import '../styles/BasicInfo.css';

export default function Step2Health({ userInput, onNext }) {
  const { register, watch, setValue } = useFormContext();
  const [bmi, setBmi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expectedDeathAge, setExpectedDeathAge] = useState(null);

  const height = watch("height");
  const weight = watch("weight");
  const age = Number(userInput.age);

  let nationalType = '정상수령';
  let privateType = '정상수령';
  if (expectedDeathAge && expectedDeathAge < 75) {
    nationalType = '조기수령';
    privateType = '조기수령';
  } else if (expectedDeathAge && expectedDeathAge > 85) {
    nationalType = '연기수령';
    privateType = '연기수령';
  }

  const nationalMultiplier = nationalType === '조기수령' ? 0.8 : nationalType === '연기수령' ? 1.2 : 1.0;
  const privateMultiplier = privateType === '조기수령' ? 0.8 : privateType === '연기수령' ? 1.2 : 1.0;

  const nationalMonthly = Math.round(Number(userInput.nationalPremium || 0) * nationalMultiplier);
  const privateMonthly = userInput.hasPrivatePension
    ? Math.round(Number(userInput.privatePremium || 0) * privateMultiplier)
    : 0;

  useEffect(() => {
    if (height && weight) {
      const h = Number(height) / 100;
      const b = Number(weight) / (h * h);
      setBmi(b.toFixed(1));
    }
  }, [height, weight]);

  const getBmiStatus = (bmi) => {
    if (bmi < 18.5) return '저체중';
    if (bmi < 25) return '정상';
    if (bmi < 30) return '과체중';
    return '비만';
  };

  const getBmiColor = (bmi) => {
    if (bmi < 18.5) return '#999';
    if (bmi < 25) return '#2e8b57';
    if (bmi < 30) return '#f4a261';
    return '#e63946';
  };

  const getLifeExpectancyComment = () => {
    const avgLife = 83;
    const diff = (expectedDeathAge - avgLife).toFixed(1);
    if (diff > 1) return `✅ 평균보다 ${diff}년 더 오래 살 것으로 예상됩니다.`;
    if (diff < -1) return `⚠️ 평균보다 ${Math.abs(diff)}년 더 짧을 수 있습니다.`;
    return `📊 평균 기대수명과 비슷한 수준입니다.`;
  };

  const handlePredict = async (formData) => {
    const bmiVal = Number(bmi);
    const payload = {
      cage: Number(userInput.age),
      sex: userInput.gender === '남성' ? 'Male' : 'Female',
      race: 'Asian',
      wbr: 'East Asia & Pacific',
      drk: Number(formData.drinkingPerWeek ?? 0),
      smk: Number(formData.smokingPerDay ?? 0),
      mpa: Number(formData.mpa ?? 0),
      hpa: Number(formData.hpa ?? 0),
      hsd: Number(formData.hsd ?? 0),
      bmi: bmiVal >= 30 ? "Obese (≥30)" : bmiVal < 18.5 ? "Underweight (<18.5)" : "Normal (18.5–24.9)",
      sys: formData.sys,
      hbc: formData.hepb ? "Yes" : "No",
      cvd: formData.cvd ? "Yes" : "No",
      dia: formData.dm ? "Yes" : "No",
      dep: formData.depression ? "Yes" : "No",
      can: formData.cancer ? "Yes" : "No",
      alz: formData.dementia ? "Yes" : "No",
      fcvd: "No", fcan: "No", fdia: "No", fdep: "No", falz: "No", fcopd: "No"
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/predict-lifespan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      const expected = result.expectedDeathAge;
      setValue('expectedDeathAge', expected);
      setExpectedDeathAge(expected);
    } catch (error) {
      console.error("예측 실패:", error);
    }
  };

  useEffect(() => {
    const formValues = watch();
    const required = ['height', 'weight', 'hsd', 'mpa', 'hpa', 'drinkingPerWeek', 'smokingPerDay', 'sys'];
    const isValid = required.every((key) => formValues[key] !== undefined && formValues[key] !== '');
    if (isValid) {
      const timeout = setTimeout(() => {
        handlePredict(formValues);
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [watch()]);

  const renderSummary = () => {
    if (!expectedDeathAge) return null;
    const years = expectedDeathAge - age;
    const nationalTotal = nationalMonthly * 12 * years;
    const privateTotal = privateMonthly * 12 * years;
    const total = nationalTotal + privateTotal;

    return (
      <div className="section-box">
        <h2 style={{ fontSize: '18px' }}>실시간 요약</h2>
        <ul style={{ fontSize: '16px', lineHeight: '1.8', paddingLeft: '1.2rem', listStyle: 'disc', marginBottom: '1rem' }}>
          <li>예상 기대수명: <strong>{expectedDeathAge}세</strong></li>
          <li>국민연금 총 수령 예상: <strong>{nationalTotal.toLocaleString()} 만원</strong></li>
          <li>개인연금 총 수령 예상: <strong>{privateTotal.toLocaleString()} 만원</strong></li>
          <li>총합 예상 수령액: <strong>{total.toLocaleString()} 만원</strong></li>
          <li>{getLifeExpectancyComment()}</li>
          <li>※ 기대수명을 기준으로 국민연금은 <strong>{nationalType}</strong>, 개인연금은 <strong>{privateType}</strong> 기준으로 계산되었습니다.</li>
        </ul>
        <div style={{ display: 'flex', gap: '32px' }}>
          <Plot
            data={[{
              type: 'bar',
              x: ['국민연금', '개인연금'],
              y: [nationalTotal, privateTotal],
              text: [`${nationalTotal.toLocaleString()} 만원`, `${privateTotal.toLocaleString()} 만원`],
              textposition: 'auto',
              marker: { color: ['#1f77b4', '#2ca02c'] }
            }]}
            layout={{
              height: 280,
              margin: { t: 40, l: 40, r: 10, b: 40 },
              title: { text: '연금 수령액 비교', font: { size: 18 } },
              font: { size: 14 },
              yaxis: { title: '총 수령액 (만원)' }
            }}
            config={{ displayModeBar: false }}
          />
          <Plot
            data={[{
              type: 'bar',
              x: ['예상 수명', '평균 수명'],
              y: [expectedDeathAge, 83],
              text: [`${expectedDeathAge}세`, `83세`],
              textposition: 'auto',
              marker: { color: ['#ff7f0e', '#d3d3d3'] }
            }]}
            layout={{
              height: 280,
              margin: { t: 40, l: 40, r: 10, b: 40 },
              title: { text: '기대수명 비교', font: { size: 18 } },
              font: { size: 14 },
              yaxis: { title: '수명 (세)', range: [60, 100] }
            }}
            config={{ displayModeBar: false }}
          />
        </div>
      </div>
    );
  };

  const handleNext = () => {
    onNext({
      ...userInput,
      ...watch(),
      bmi: Number(bmi),
      expectedDeathAge
    });
  };

  return (
    <form className="container" style={{ maxWidth: '100%' }}>
      <Stepper currentStep={1} />
      <h1 className="title">건강 정보 입력</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
        <div>
          {/* 생활 습관 입력 폼 */}
          <div className="section-box">
            <h2>생활 습관</h2>
            <div className="row">
              <label>하루 평균 흡연량 (개피)</label>
              <input type="number" {...register("smokingPerDay")} className="input" placeholder="예: 10" />
            </div>
            <div className="row">
              <label>일주일 평균 음주 횟수 (회)</label>
              <input type="number" {...register("drinkingPerWeek")} className="input" placeholder="예: 2" />
            </div>
            <div className="row">
              <label>주간 운동 (중강도, 분/주)</label>
              <input type="number" {...register("mpa")} className="input" placeholder="예: 150" />
            </div>
            <div className="row">
              <label>주간 운동 (고강도, 분/주)</label>
              <input type="number" {...register("hpa")} className="input" placeholder="예: 60" />
            </div>
            <div className="row">
              <label>평균 수면 시간 (시간/일)</label>
              <input type="number" {...register("hsd")} className="input" placeholder="예: 7" />
            </div>
            <div className="row">
              <label>혈압 상태</label>
              <select {...register("sys")} className="input">
                <option value="Normal (SBP <120)">저혈압(SBP &lt;120 )</option>
                <option value="Elevated (SBP 120–129)">정상(120 &lt; SBP &lt; 130)</option>
                <option value="Stage 2 Hypertension (SBP ≥140)">고혈압(130 &lt; SBP)</option>
              </select>
            </div>
          </div>

          {/* 건강 상태 */}
          <div className="section-box">
            <h2>건강 상태</h2>
            <div className="row">
              <label>신장 (cm)</label>
              <input type="number" {...register("height")} className="input" />
            </div>
            <div className="row">
              <label>체중 (kg)</label>
              <input type="number" {...register("weight")} className="input" />
            </div>
            {bmi && (
              <div className="row">
                <strong style={{ color: getBmiColor(bmi) }}>
                  계산된 BMI: {bmi} ({getBmiStatus(bmi)})
                </strong>
              </div>
            )}
          </div>

          {/* 질병 이력 */}
          <div className="section-box">
            <h2>질병 이력</h2>
            <p className="hint">※ 아래 항목 중 해당되는 항목을 체크하세요</p>
            <div className="checkbox-group">
              <label><input type="checkbox" {...register("dm")} /> 당뇨병</label>
              <label><input type="checkbox" {...register("cancer")} /> 암</label>
              <label><input type="checkbox" {...register("dementia")} /> 치매</label>
              <label><input type="checkbox" {...register("cvd")} /> 심혈관 질환</label>
              <label><input type="checkbox" {...register("depression")} /> 우울증</label>
              <label><input type="checkbox" {...register("hepb")} /> B형 간염</label>
            </div>
          </div>
        </div>

        <div>{renderSummary()}</div>
      </div>

      <div className="button-container">
        <button type="button" className="button" onClick={handleNext} disabled={!expectedDeathAge || loading}>
          다음
        </button>
      </div>
    </form>
  );
}
