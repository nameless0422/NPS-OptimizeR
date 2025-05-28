import React from 'react';
import { useForm } from 'react-hook-form';

export default function RetireModal({ onClose, onSave }) {
const { register, handleSubmit } = useForm();

const onSubmit = (form) => {
const currentAge = Number(form.currentAge);
const retireAge = Number(form.retireAge);
const joinYear = Number(form.joinYear);
const monthlyIncome = Number(form.monthlyIncome);
const growthRate = Number(form.annualGrowthRate ?? 0) / 100;


const now = new Date().getFullYear();
const estimatedRetireYear = now + (retireAge - currentAge);

if (!currentAge || !retireAge || !joinYear || !monthlyIncome) {
  alert('모든 항목을 입력해주세요.');
  return;
}

if (joinYear > estimatedRetireYear || currentAge >= retireAge) {
  alert("입사연도 또는 은퇴 나이를 다시 확인해주세요.");
  return;
}

const yearsWorked = Math.max(0, estimatedRetireYear - joinYear);

// ✅ 연소득 증가율을 반영한 퇴직금 공식
let totalSalary = 0;
for (let i = 0; i < yearsWorked; i++) {
  totalSalary += monthlyIncome * 12 * Math.pow(1 + growthRate, i);
}
const dailyWage = (totalSalary * 10000) / (yearsWorked * 365);
const estimated = Math.floor(dailyWage * 30 * yearsWorked);

const result = {
  ...form,
  retirementPay: Math.floor(estimated / 10000), // 만원 단위로 변환
  source: '퇴직금',
};

onSave(result);
onClose();


};

return ( <div className="modal-overlay" onClick={onClose}>
\<div className="modal-content" onClick={(e) => e.stopPropagation()}> <button className="modal-close" onClick={onClose}>×</button> <h2>퇴직금 계산기</h2>

    <div className="form-group">
      <label>현재 나이</label>
      <input type="number" {...register("currentAge")} className="input" />
      <p className="unit-text">단위: 세</p>
    </div>

    <div className="form-group">
      <label>예상 은퇴 나이</label>
      <input type="number" {...register("retireAge")} className="input" />
      <p className="unit-text">단위: 세</p>
    </div>

    <div className="form-group">
      <label>입사년도</label>
      <input type="number" {...register("joinYear")} className="input" />
      <p className="unit-text">단위: 년</p>
    </div>

    <div className="form-group">
      <label>월 평균 근로소득</label>
      <input type="number" {...register("monthlyIncome")} className="input" />
      <p className="unit-text">단위: 만원</p>
    </div>

    <div className="form-group">
      <label>예상 연소득 증가율</label>
      <input type="number" {...register("annualGrowthRate")} className="input" />
      <p className="unit-text">단위: %</p>
    </div>

    <div style={{ textAlign: 'right' }}>
      <button type="button" className="button" onClick={handleSubmit(onSubmit)}>확인</button>
    </div>
  </div>
</div>

);
}
