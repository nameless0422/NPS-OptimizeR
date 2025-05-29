// src/pages/Step1BasicInfo.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import Stepper from '../components/Stepper';
import '../styles/BasicInfo.css';
import Plot from 'react-plotly.js';

export default function Step1BasicInfo({ onNext }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      age: '',
      gender: '',
      nationalPeriod: '',
      nationalPremium: '',
      hasPrivatePension: false,
      privatePremium: '',
      privatePeriod: '',
      spouse: '없음',
      parents: 0,
      children: 0,
    },
  });

  const watchAll = watch();
  const nationalEstimate = Math.round(Number(watchAll.nationalPremium || 0) * 0.9);
  const privateEstimate = watchAll.hasPrivatePension
    ? Math.round(Number(watchAll.privatePremium || 0) * 1.2)
    : 0;
  const spouseCount = watchAll.spouse === '있음' ? 1 : 0;
  const dependentCount = spouseCount + Number(watchAll.parents || 0) + Number(watchAll.children || 0);
  const bonusPension = dependentCount * 10;
  const taxRelief = dependentCount * 5;
  const totalWithBonus = nationalEstimate + privateEstimate + bonusPension;

  const onSubmit = (data) => {
    onNext(data);
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px' }}>
        <Stepper currentStep={0} />
        <h1 className="title" style={{ color: '#f9c233', marginTop: '8px' }}>Golden Timing</h1>
        <p className="subtitle">연금수급을 도와드립니다.</p>
      </div>

      <div className="form-grid-responsive">
        <form onSubmit={handleSubmit(onSubmit)} className="form-left">
          <div className="section-box">
            <h2>기본정보 입력</h2>
            <div className="row">
              <label>이름</label>
              <input {...register('name', { required: '이름을 입력해주세요' })} className="input" />
              {errors.name && <p className="error">{errors.name.message}</p>}
            </div>
            <div className="row">
              <label>나이 <span className="unit">(세)</span></label>
              <input type="number" {...register('age', { required: true, min: 0 })} className="input" />
            </div>
            <div className="row">
              <label>성별</label>
              <div className="radio-group">
                <label><input type="radio" value="남성" {...register("gender", { required: true })} /> 남성</label>
                <label><input type="radio" value="여성" {...register("gender")} /> 여성</label>
              </div>
            </div>
          </div>

          <div className="section-box">
            <h2>국민연금 정보 입력</h2>
            <div className="row">
              <label>가입기간 <span className="unit">(년)</span></label>
              <input type="number" {...register('nationalPeriod', { min: 0 })} className="input" />
            </div>
            <div className="row">
              <label>월 납입 보험료 <span className="unit">(만원)</span></label>
              <input type="number" {...register('nationalPremium', { min: 0 })} className="input" />
            </div>
          </div>

          <div className="section-box">
            <h2>개인연금 여부 및 입력</h2>
            <div className="checkbox-group">
              <label>
                <input type="checkbox" {...register('hasPrivatePension')} /> 개인연금에 가입하셨나요?
              </label>
            </div>
            {watchAll.hasPrivatePension && (
              <>
                <div className="row">
                  <label>월 납입 보험료 <span className="unit">(만원)</span></label>
                  <input type="number" {...register('privatePremium', { min: 0 })} className="input" />
                </div>
                <div className="row">
                  <label>가입기간 <span className="unit">(년)</span></label>
                  <input type="number" {...register('privatePeriod', { min: 0 })} className="input" />
                </div>
              </>
            )}
          </div>

          <div className="section-box">
            <h2>부양가족 정보 입력</h2>
            <div className="row">
              <label>배우자</label>
              <div className="radio-group">
                <label><input type="radio" value="있음" {...register('spouse')} /> 있음</label>
                <label><input type="radio" value="없음" {...register('spouse')} /> 없음</label>
              </div>
            </div>
            <div className="row">
              <label>부모 수</label>
              <input type="number" {...register('parents', { min: 0 })} className="input" />
            </div>
            <div className="row">
              <label>자녀 수</label>
              <input type="number" {...register('children', { min: 0 })} className="input" />
            </div>
          </div>

          <div style={{ textAlign: 'right', marginTop: '24px' }}>
            <button type="submit" className="button">다음</button>
          </div>
        </form>

        <div className="form-right">
          <div className="section-box">
            <h2 style={{ fontSize: '18px' }}>실시간 요약</h2>
            <ul style={{ fontSize: '16px', lineHeight: '1.8', paddingLeft: '1.2rem', listStyle: 'disc', marginBottom: '1rem' }}>
              <li>예상 국민연금 수령액: <strong>{nationalEstimate} 만원/월</strong></li>
              <li>예상 개인연금 수령액: <strong>{privateEstimate} 만원/월</strong></li>
              <li>부양가족 수: <strong>{dependentCount} 명</strong></li>
              <li> 추가 연금 예상: <strong>{bonusPension} 만원/월</strong></li>
              <li> 세금 감면 혜택: <strong>{taxRelief} 만원/년</strong></li>
            </ul>

            <div className="section-box" style={{ marginTop: '20px' }}>
              <h2 style={{ fontSize: '16px' }}>연금 수령액 비교</h2>
              <Plot
                data={[{
                  type: 'bar',
                  x: ['국민연금', '개인연금'],
                  y: [nationalEstimate, privateEstimate],
                  marker: { color: ['#0073e6', '#2ca02c'] }
                }]}
                layout={{ height: 200, margin: { t: 20, b: 40 }, yaxis: { range: [0, Math.max(nationalEstimate, privateEstimate, 1) * 1.2] } }}
                config={{ displayModeBar: false }}
              />
              <p style={{ fontSize: '14px', marginTop: '16px', paddingLeft: '4px' }}>
                <span> 원연금 합계: <strong>{nationalEstimate + privateEstimate} 만원/월</strong></span><br />
                <span> 부양가족 포함 시 총 예상 수령액: <strong>{totalWithBonus} 만원/월</strong></span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
