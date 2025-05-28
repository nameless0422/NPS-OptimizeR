// src/pages/Step2Health.jsx
import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import Stepper from '../components/Stepper';
import '../styles/BasicInfo.css';

export default function Step2Health({ userInput, onNext }) {
  const { register, handleSubmit, watch, setValue } = useFormContext();
  const [bmi, setBmi] = useState(null);
  const [loading, setLoading] = useState(false);

  const height = watch("height");
  const weight = watch("weight");

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

  const onSubmit = async (formData) => {
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
      setLoading(true);
      const response = await fetch("http://127.0.0.1:8000/predict-lifespan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

      const result = await response.json();
      const expectedDeathAge = result.expectedDeathAge;

      setValue('expectedDeathAge', expectedDeathAge); // 폼 상태 업데이트

      onNext({
        ...userInput,
        ...formData,
          bmi: bmiVal,
          expectedDeathAge: expectedDeathAge  // ✅ 명시적으로 넘겨야 Step3에서 읽을 수 있음
      });
    } catch (error) {
      alert("기대수명 예측 실패: 서버에 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="container">
      <Stepper currentStep={1} />
      <h1 className="title">건강 정보 입력</h1>

      {/* 생활 습관 */}
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
          <option value="Stage 2 Hypertension (SBP ≥140)">고혈압(130 &lt; SBP) </option>
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
       
      {/* 제출 */}
      <div className="button-container">
        <button type="submit" className="button" disabled={loading}>
          {loading ? "계산 중..." : "다음"}
        </button>
      </div>
    </form>
  );
}
