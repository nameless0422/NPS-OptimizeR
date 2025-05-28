// src/pages/Step1BasicInfo.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import Stepper from '../components/Stepper';
import '../styles/BasicInfo.css';

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

  const watchPrivate = watch('hasPrivatePension');

  const onSubmit = (data) => {
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="container">
      <Stepper currentStep={0} />
      <h1 className="title" style={{ color: '#f9c233' }}>Golden Timing</h1>
      <p className="subtitle">연금수급을 도와드립니다.</p>

      {/* 🔶 기본정보 */}
      <div className="section-box">
        <h2>기본정보 입력</h2>
        <div className="row">
          <label>이름</label>
          <input
            {...register('name', { required: '이름을 입력해주세요' })}
            className="input"
            placeholder="예: 홍길동"
          />
          {errors.name && <p className="error">{errors.name.message}</p>}
        </div>
        <div className="row">
          <label>나이 <span className="unit">(세)</span></label>
          <input
            type="number"
            {...register('age', { required: true, min: 0 })}
            className="input"
            placeholder="예: 45"
          />
        </div>
      <div className="row">
        <label>성별</label>
          <div className="radio-group">
        <label>
          <input type="radio" value="남성" {...register("gender", { required: true })} />
          남성
        </label>
        <label>
          <input type="radio" value="여성" {...register("gender")} />
          여성
        </label>
      </div>
</div>
      </div>

      {/* 🔶 국민연금 */}
      <div className="section-box">
        <h2>국민연금 정보 입력</h2>
        <div className="row">
          <label>가입기간 <span className="unit">(년)</span></label>
          <input
            type="number"
            {...register('nationalPeriod', { min: 0 })}
            className="input"
            placeholder="예: 20"
          />
        </div>
        <div className="row">
          <label>월 납입 보험료 <span className="unit">(만원)</span></label>
          <input
            type="number"
            {...register('nationalPremium', { min: 0 })}
            className="input"
            placeholder="예: 10"
          />
        </div>
      </div>

      {/* 🔶 개인연금 */}
      <div className="section-box">
        <h2>개인연금 여부 및 입력</h2>
        <div className="checkbox-group">
          <label>
            <input type="checkbox" {...register('hasPrivatePension')} />
            개인연금에 가입하셨나요?
          </label>
        </div>

        {watchPrivate && (
          <>
            <div className="row">
              <label>월 납입 보험료 <span className="unit">(만원)</span></label>
              <input
                type="number"
                {...register('privatePremium', { min: 0 })}
                className="input"
                placeholder="예: 20"
              />
            </div>
            <div className="row">
              <label>가입기간 <span className="unit">(년)</span></label>
              <input
                type="number"
                {...register('privatePeriod', { min: 0 })}
                className="input"
                placeholder="예: 15"
              />
            </div>
          </>
        )}
      </div>

      {/* 🔶 부양가족 */}
      <div className="section-box">
        <h2>부양가족 정보 입력</h2>
        <div className="row">
          <label>배우자</label>
          <div className="radio-group">
            <label>
              <input type="radio" value="있음" {...register('spouse')} />
              있음
            </label>
            <label>
              <input type="radio" value="없음" {...register('spouse')} />
              없음
            </label>
          </div>
        </div>
        <div className="row">
          <label>부모 수</label>
          <input
            type="number"
            {...register('parents', { min: 0 })}
            className="input"
          />
          <p className="hint">※ 수급 시 60세 이상 또는 장애 2급 이상인 경우만 해당</p>
        </div>
        <div className="row">
          <label>자녀 수</label>
          <input
            type="number"
            {...register('children', { min: 0 })}
            className="input"
          />
          <p className="hint">※ 수급 시 19세 미만 또는 장애 2급 이상인 경우만 해당</p>
        </div>
      </div>

      <div className="button-container">
        <button type="submit" className="button">다음</button>
      </div>
    </form>
  );
}
