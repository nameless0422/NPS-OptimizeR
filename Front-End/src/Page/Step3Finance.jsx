// Step3Finance.jsx - 리팩토링 버전 (단위 정렬 및 버튼 시각 오류 수정)
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Stepper from '../components/Stepper';
import PensionModal from '../components/PensionModal';
import RetireModal from '../components/RetireModal';
import '../styles/BasicInfo.css';
import  recommendCompositeStrategy  from '../utils/recommendPensionStartAge';

function evaluateFinancialStatus({
  age, totalAssets, monthlyExpense, monthlyIncome,
  cohabitingFamily, dependents, hasOwnHouse, hasInsurance
}) {
  let baseScore = 0;
  const netAsset = totalAssets - (monthlyExpense * 6);
  const monthsSurvivable = netAsset / monthlyExpense;

  if (monthsSurvivable >= 360) baseScore += 3;
  else if (monthsSurvivable >= 240) baseScore += 2.5;
  else if (monthsSurvivable >= 120) baseScore += 2;
  else if (monthsSurvivable >= 60) baseScore += 1;
  else baseScore += 0.5;

  if (monthlyIncome >= 200) baseScore += 2;
  else if (monthlyIncome >= 100) baseScore += 1;

  if (dependents >= 2) baseScore -= 1;
  else if (dependents === 1) baseScore -= 0.5;

  if (cohabitingFamily > 2) baseScore -= 0.5;

  if (hasOwnHouse) baseScore += 1;
  if (hasInsurance) baseScore += 0.5;

  const finalScore = Math.min(Math.max(baseScore, 0), 10);
  return { score: finalScore };
}

export default function Step3Finance({ userInput, onNext, onBack }) {
  const [showPensionModal, setShowPensionModal] = useState(false);
  const [showRetireModal, setShowRetireModal] = useState(false);
  const [retireInfo, setRetireInfo] = useState(null);
  const { register, handleSubmit, watch, setValue } = useForm();

  if (!userInput || !userInput.age || !userInput.expectedDeathAge) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '40px' }}>
        <p>잘못된 접근입니다. 이전 단계부터 다시 진행해주세요.</p>
        <button className="button" onClick={() => window.location.href = '/'} style={{ marginTop: '20px' }}>
          처음으로 돌아가기
        </button>
      </div>
    );
  }

  const dependents = Number(userInput.children ?? 0) + Number(userInput.parents ?? 0);
  const totalAssets = Number(watch('assets') ?? 0) + Number(watch('retirementFund') ?? 0);
  const financialScore = evaluateFinancialStatus({
    age: userInput.age,
    totalAssets,
    monthlyExpense: Number(watch('monthlySpending') ?? 0),
    monthlyIncome: Number(watch('monthlyIncome') ?? 0),
    cohabitingFamily: 1,
    dependents,
    hasOwnHouse: watch('hasOwnHouse') ?? false,
    hasInsurance: watch('hasInsurance') ?? false,
  }).score;

  const onSubmit = (data) => {
    const strategy = recommendCompositeStrategy({
      expectedDeathAge: userInput.expectedDeathAge,
      financialScore,
      riskPreference: userInput.riskPreference
    });

    const nextData = {
      ...userInput,
      ...data,
      financialScore,
      pensionStrategy: strategy,
      retireInfo
    };
    onNext(nextData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="container">
      <Stepper currentStep={2} />
      <h1 className="title">재정 정보 입력</h1>

      <div className="section-box">
        <h2>기본 재정 조건</h2>
        <div className="row"><label>현재 나이</label><input value={userInput.age} disabled className="input" /></div>
        <div className="row"><label>희망 은퇴 나이</label><input {...register('retireAge')} className="input" placeholder="예: 60" /></div>
        <div className="row"><label>예상 기대수명</label><input value={userInput.expectedDeathAge} disabled className="input" /></div>
      </div>

    <div className="section-box">
  <h2>노후 생활비</h2>
  <div className="form-row">
    <label htmlFor="monthlySpending">은퇴 후 월 필요 생활비</label>
    <div className="input-with-unit-top">
      <input
        type="number"
        id="monthlySpending"
        {...register('monthlySpending')}
        className="input"
        placeholder="예: 300"
      />
      <span className="unit-float">(단위: 만원)</span>
    </div>
  </div>
</div>

<div className="section-box">
  <h2>자산 및 부채</h2>

  <div className="form-row">
    <label htmlFor="assets">현재 자산 (주택 제외)</label>
    <div className="input-with-unit-top">
      <input
        type="number"
        id="assets"
        {...register('assets')}
        className="input"
        placeholder="예: 50000"
      />
      <span className="unit-float">(단위: 만원)</span>
    </div>
  </div>

  <div className="form-row">
    <label htmlFor="debt">총 부채</label>
    <div className="input-with-unit-top">
      <input
        type="number"
        id="debt"
        {...register('debt')}
        className="input"
        placeholder="예: 20000"
      />
      <span className="unit-float">(단위: 만원)</span>
    </div>
  </div>
</div>

<div className="section-box">
  <h2>소득 및 생활 상황</h2>

  <div className="form-row">
    <label htmlFor="monthlyIncome">월 평균 소득</label>
    <div className="input-with-unit-top">
      <input
        type="number"
        id="monthlyIncome"
        {...register('monthlyIncome')}
        className="input"
        placeholder="예: 350"
      />
      <span className="unit-float">(단위: 만원)</span>
    </div>
  </div>

  <div className="form-row">
    <label>
      <input type="checkbox" {...register('hasInsurance')} />
      &nbsp;보험 가입 여부
    </label>
  </div>

  <div className="form-row">
    <label>
      <input type="checkbox" {...register('hasOwnHouse')} />
      &nbsp;자가 주택 보유 여부
    </label>
  </div>
</div>

      <div className="section-box">
        <h2>퇴직금 / 퇴직연금</h2>
        <div className="row">
          <label>예상 수령액</label>
          <input type="number" {...register('retirementFund')} className="input" readOnly />
          <button type="button" className="small-button" onClick={() => setShowRetireModal(true)}>퇴직금 계산기</button>
          <button type="button" className="small-button" onClick={() => setShowPensionModal(true)}>퇴직연금 계산기</button>
        </div>
        {retireInfo && (
          <div className="row">
            {retireInfo.source === '퇴직연금'
              ? <p>퇴직연금 월 수령액: <strong>{retireInfo.monthlyPension?.toLocaleString()}만원</strong></p>
              : <p>예상 퇴직금: <strong>{retireInfo.retirementPay?.toLocaleString()}만원</strong></p>}
          </div>
        )}
      </div>

      <div className="button-container">
  <button type="button" className="button gray" style={{ marginRight: '16px' }}>
    뒤로가기
  </button>
  <button type="submit" className="button">
    다음
  </button>
</div>

      {showRetireModal && (
        <RetireModal
          onClose={() => setShowRetireModal(false)}
          onSave={(result) => {
            setRetireInfo({ ...result, source: '퇴직금' });
            setValue('retirementFund', result.retirementPay);
          }}
        />
      )}

      {showPensionModal && (
        <PensionModal
          expectedDeathAge={userInput.expectedDeathAge}
          retireAge={userInput.retireAge}
          financialScore={financialScore}
          riskPreference={userInput.riskPreference}
          onClose={() => setShowPensionModal(false)}
          onSave={(result) => {
            setRetireInfo({ ...result, source: '퇴직연금' });
            setValue('retirementFund', result.retirementPay);
          }}
        />
      )}
    </form>
  );
}