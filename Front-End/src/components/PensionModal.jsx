// PensionModal.jsx - 퇴직연금 계산기 리팩토링
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function PensionModal({
  expectedDeathAge,
  retireAge,
  financialScore,
  riskPreference,
  onClose,
  onSave,
}) {
  const { register, handleSubmit, setValue } = useForm();
  const [recommendedAge, setRecommendedAge] = useState(55);

  useEffect(() => {
    let base = 55;
    if (expectedDeathAge >= 85) base += 3;
    if (financialScore >= 80) base += 2;
    if (riskPreference === 'aggressive') base += 2;
    else if (riskPreference === 'conservative') base -= 1;
    setRecommendedAge(Math.max(55, Math.floor(Math.min(base, expectedDeathAge - 5))));
    setValue('startAge', base);
  }, [expectedDeathAge, financialScore, riskPreference, setValue]);

  const onSubmit = (form) => {
    const now = new Date().getFullYear();
    const joinYear = Number(form.joinYear);
    const monthlyIncome = Number(form.monthlyIncome);
    const receiveYears = Number(form.receiveYears);
    const startAge = Number(form.startAge);

    if (joinYear > now) {
      alert("입사연도는 현재보다 미래일 수 없습니다.");
      return;
    }
    if (receiveYears <= 0 || startAge <= 0 || monthlyIncome <= 0) {
      alert("입력값을 다시 확인해주세요.");
      return;
    }

    const yearsWorked = Math.max(0, now - joinYear);
    const annual = monthlyIncome * 12;
    const estimated = Math.floor(annual * yearsWorked * 0.03);
    const monthly = Math.floor(estimated / receiveYears / 12);

    const result = {
      ...form,
      monthlyPension: monthly,
      retirementPay: estimated,
      source: '퇴직연금',
    };

    onSave(result);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
    <button className="modal-close" onClick={onClose}>×</button>
    <h2>퇴직연금 계산기</h2>

    {/* 입사년도 */}
    <div className="form-group">
      <label>입사년도</label>
      <input type="number" {...register("joinYear")} placeholder="예: 2005" className="input" />
      <p className="unit-text">단위: 년</p>
    </div>

    {/* 월평균소득 */}
    <div className="form-group">
      <label>월 평균 근로소득</label>
      <input type="number" {...register("monthlyIncome")} placeholder="예: 300" className="input" />
      <p className="unit-text">단위: 만원</p>
    </div>

    {/* 수령 시작 나이 */}
    <div className="form-group">
      <label>
        수령 시작 나이
        <br />
        <small style={{ color: '#666' }}>(추천: {recommendedAge ?? '계산 중...'}세)</small>
      </label>
      <input type="number" {...register("startAge")} className="input" />
      <p className="unit-text">단위: 세</p>
    </div>

    {/* 수령 기간 */}
    <div className="form-group">
      <label>연금 수령 기간</label>
      <input type="number" {...register("receiveYears")} placeholder="예: 20" className="input" />
      <p className="unit-text">단위: 년</p>
    </div>

    <div style={{ textAlign: 'right', marginTop: '20px' }}>
      <button className="button" type="button" onClick={handleSubmit(onSubmit)}>확인</button>
    </div>
  </div>
</div>
  );
}
