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

  useEffect(() => {
  const h = Number(height) / 100;
  if (height && weight && h > 0) {
    const b = Number(weight) / (h * h);
    setBmi(b.toFixed(1));
  } else {
    setBmi(null);  // 또는 0으로 초기화
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

  const nationalType =
  expectedDeathAge != null
    ? expectedDeathAge < 75
      ? '조기수령'
      : expectedDeathAge > 80
      ? '연기수령'
      : '정상수령'
    : '정상수령';
  const privateType = nationalType;
  const nationalMultiplier = nationalType === '조기수령' ? 0.8 : nationalType === '연기수령' ? 1.2 : 1.0;
  const privateMultiplier = privateType === '조기수령' ? 0.8 : privateType === '연기수령' ? 1.2 : 1.0;

  const nationalMonthly = Math.round(Number(userInput.nationalPremium || 0) * nationalMultiplier);
  const privateMonthly = userInput.hasPrivatePension ? Math.round(Number(userInput.privatePremium || 0) * privateMultiplier) : 0;

  
  const handlePredict = async (formData) => {
    const h = Number(formData.height) / 100;
    const bmiVal = Number(formData.weight) / (h * h);

      let bmiCategory = "";
      if (bmiVal < 18.5) bmiCategory = "Underweight (<18.5)";
      else if (bmiVal < 25) bmiCategory = "Normal (18.5-24.9)";
      else if (bmiVal < 30) bmiCategory = "Overweight (25-29.9)";
      else bmiCategory = "Obese (>30)";
      const payload = {
      cage: age,
      sex: userInput.gender === '남성' ? 'Male' : 'Female',
      race: 'Asian',
      wbr: 'East Asia & Pacific',
      drk: Number(formData.drinkingPerWeek ?? 0),
      smk: Number(formData.smokingPerDay ?? 0),
      mpa: Number(formData.mpa ?? 0),
      hpa: Number(formData.hpa ?? 0),
      hsd: Number(formData.hsd ?? 0),
      bmi: bmiCategory,
      sys: formData.sys,
      hbc: formData.hbc ? "Yes" : "No",
      cvd: formData.cvd ? "Yes" : "No",
      dia: formData.dia ? "Yes" : "No",
      dep: formData.dep ? "Yes" : "No",
      can: formData.can ? "Yes" : "No",
      alz: formData.alz ? "Yes" : "No",
      fcvd: "No", fcan: "No", fdia: "No", fdep: "No", falz: "No", fcopd: "No"
    };

  console.log("payload to send:", payload);
    
    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:8000/predict-lifespan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      let expected = result.expectedDeathAge;

      const diseasePenalty = [
        formData.dia ? 1 : 0,
        formData.can ? 2 : 0,
        formData.cvd ? 1.5 : 0,
        formData.dep ? 0.5 : 0,
        formData.alz ? 1.5 : 0,
        formData.hbc ? 0.5 : 0
      ].reduce((a, b) => a + b, 0);

      const sysBonus = formData.sys === "Elevated (SBP 120–129)" ? 1 : formData.sys === "Normal (SBP <120)" ? -0.5 : -1;
        expected = Math.max(expected - diseasePenalty + sysBonus, age + 5);

      setExpectedDeathAge(expected);
    } catch (error) {
      console.error("예측 실패:", error);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  const formValues = watch();
  const required = [
    'height', 'weight', 'hsd', 'mpa', 'hpa',
    'drinkingPerWeek', 'smokingPerDay', 'sys'
  ];
  const isValid = required.every(k => formValues[k] !== '' && formValues[k] !== undefined);
  if (isValid) {
    const timeout = setTimeout(() => handlePredict(formValues), 600);
    return () => clearTimeout(timeout);
  }
}, [
  watch('height'), watch('weight'), watch('hsd'),
  watch('mpa'), watch('hpa'), watch('drinkingPerWeek'),
  watch('smokingPerDay'), watch('sys'),


  watch('dia'), watch('can'), watch('cvd'),
  watch('dep'), watch('alz'), watch('hbc')
]);


const renderSummary = () => {
  if (!expectedDeathAge || isNaN(expectedDeathAge)) return null;

  const birthYear = new Date().getFullYear() - age;
  let nationalStartAge = 65;
  if (birthYear >= 1953 && birthYear <= 1956) nationalStartAge = 61;
  else if (birthYear >= 1957 && birthYear <= 1960) nationalStartAge = 62;
  else if (birthYear >= 1961 && birthYear <= 1964) nationalStartAge = 63;
  else if (birthYear >= 1965 && birthYear <= 1968) nationalStartAge = 64;

  const privateStartAge = 55;
  const nationalYears = Math.max(1, Math.round(expectedDeathAge - nationalStartAge));
  const privateYears = Math.max(1, Math.round(expectedDeathAge - privateStartAge));
  const nationalTotal = nationalMonthly * 12 * nationalYears;

  const fixedTerms = [5, 10, 15];
  const nearest = expectedDeathAge >= 85 ? null : (fixedTerms.find(term => privateYears <= term) || 15);
  const privateFixedTerm = expectedDeathAge >= 85 ? '종신' : `${nearest}년`;
  const privateFixedMonthly = privateMonthly;
  const privateFixedTotal = privateFixedMonthly * 12 * (nearest || privateYears);
  const privateLifeMonthly = Math.round(privateFixedTotal / (privateYears * 12));
  const privateTotal = privateFixedTotal;
  const privateLifeTotal = privateLifeMonthly * 12 * privateYears;
  const total = nationalTotal + privateTotal;

  let privatePlanRecommendation = '';
  if (expectedDeathAge >= 85) {
    privatePlanRecommendation = '수명이 길어 종신형을 추천드립니다.';
  } else {
    privatePlanRecommendation = `예상 수령기간이 ${privateYears}년이므로 ${nearest}년 확정형을 고려할 수 있습니다.`;
  }

  const diseaseCount = ["dia", "can", "cvd", "dep", "alz", "hdc"]
    .filter(key => watch(key)).length;

  const nationalColor = nationalType === '조기수령' ? '#e67e22' : nationalType === '연기수령' ? '#2e86de' : '#27ae60';

  return (
    <div className="section-box">
      <h2 style={{ fontSize: '18px' }}>실시간 요약</h2>
      <ul style={{ fontSize: '16px', lineHeight: '1.8', paddingLeft: '1.2rem', listStyle: 'disc', marginBottom: '1rem' }}>
        <li>예상 기대수명: <strong>{expectedDeathAge}세</strong></li>
        <li>
          국민연금 총 수령 예상: <strong>{nationalTotal.toLocaleString()} 만원</strong>{' '}
          <span style={{ fontSize: '14px', color: '#666' }}>({nationalStartAge}세 시작, {nationalMonthly.toLocaleString()} 만원/월 × {nationalYears}년)</span>
        </li>
        <li>
          개인연금 총 수령 예상: <strong>{privateFixedTotal.toLocaleString()} 만원</strong>{' '}
          <span style={{ fontSize: '14px', color: '#666' }}>({privateStartAge}세 시작, {privateFixedMonthly.toLocaleString()} 만원/월 × {nearest}년 확정형 기준)</span>
        </li>
        <li>
          개인연금 종신형 수령 예상: <strong>{privateLifeTotal.toLocaleString()} 만원</strong>{' '}
          <span style={{ fontSize: '14px', color: '#666' }}>({privateLifeMonthly.toLocaleString()} 만원/월 × {privateYears}년 생존 기준)</span>
        </li>
        <li>총합 예상 수령액: <strong>{total.toLocaleString()} 만원</strong></li>
        <li style={{ color: '#ff7f0e' }}>{getLifeExpectancyComment()}</li>
        <li>※ {privatePlanRecommendation}</li>
        {diseaseCount > 0 && (
          <li style={{ color: '#d9534f' }}>※ 질병 이력 {diseaseCount}건으로 인해 기대수명이 보정되었습니다.</li>
        )}
        <li>
          ※ 기대수명을 기준으로 국민연금은{' '}
          <strong style={{ color: nationalColor }}>{nationalType}</strong> 기준으로 계산되었습니다.
        </li>
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
  const values = watch();
  const h = Number(values.height) / 100;
  const bmiVal = h > 0 ? Number(values.weight) / (h * h) : 0;

  const privateStartAge = 55;
  const privateYears = Math.max(1, Math.round(expectedDeathAge - privateStartAge));
  const fixedTerms = [5, 10, 15];
  const nearest = expectedDeathAge >= 85 ? null : (fixedTerms.find(term => privateYears <= term) || 15);
  const privateFixedTerm = expectedDeathAge >= 85 ? '종신' : `${nearest}년`;


  onNext({
    ...userInput,
    ...values,
    bmi: Number(bmiVal.toFixed(1)),
    expectedDeathAge,
    privateFixedTerm,
  });
};

  return (
    <form className="container" style={{ maxWidth: '100%' }}>
      <Stepper currentStep={1} />
      <h1 className="title">건강 정보 입력</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
        <div>
          <div className="section-box">
            <h2>생활 습관</h2>
            <div className="row"><label>하루 평균 흡연량 (개피)</label><input type="number" {...register("smokingPerDay")} className="input" placeholder="예: 10" /></div>
            <div className="row"><label>일주일 평균 음주 횟수 (회)</label><input type="number" {...register("drinkingPerWeek")} className="input" placeholder="예: 2" /></div>
            <div className="row"><label>주간 운동 (중강도, 분/주)</label><input type="number" {...register("mpa")} className="input" placeholder="예: 150" /></div>
            <div className="row"><label>주간 운동 (고강도, 분/주)</label><input type="number" {...register("hpa")} className="input" placeholder="예: 60" /></div>
            <div className="row"><label>평균 수면 시간 (시간/일)</label><input type="number" {...register("hsd")} className="input" placeholder="예: 7" /></div>
            <div className="row"><label>혈압 상태</label><select {...register("sys")} className="input">
              <option value="Normal (SBP <120)">저혈압(SBP &lt;120)</option>
              <option value="Elevated (SBP 120–129)">정상(120~129)</option>
              <option value="Stage 2 Hypertension (SBP ≥140)">고혈압(≥130)</option>
            </select></div>
          </div>

          <div className="section-box">
            <h2>건강 상태</h2>
            <div className="row"><label>신장 (cm)</label><input type="number" {...register("height")} className="input" /></div>
            <div className="row"><label>체중 (kg)</label><input type="number" {...register("weight")} className="input" /></div>
            {bmi && (
              <div className="bmi-box" style={{ backgroundColor: getBmiColor(bmi), padding: '10px', borderRadius: '6px', color: '#fff', fontWeight: 'bold', marginTop: '10px' }}>
                BMI: {bmi} ({getBmiStatus(bmi)})
              </div>
            )}
          </div>

          <div className="section-box">
            <h2>질병 이력</h2>
            <p className="hint">※ 아래 항목 중 해당되는 항목을 체크하세요</p>
            <div className="checkbox-group">
              <label><input type="checkbox" {...register("dia")} /> 당뇨병</label>
              <label><input type="checkbox" {...register("can")} /> 암</label>
              <label><input type="checkbox" {...register("alz")} /> 치매</label>
              <label><input type="checkbox" {...register("cvd")} /> 심혈관 질환</label>
              <label><input type="checkbox" {...register("dep")} /> 우울증</label>
              <label><input type="checkbox" {...register("hbc")} /> B형 간염</label>
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
