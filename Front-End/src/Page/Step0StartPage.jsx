// src/Page/Step0StartPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/BasicInfo.css';

export default function Step0StartPage() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Left: Gold gradient with logo */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(to bottom right, #f2d024, #b88900)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <img
  src="/logo.png"
  alt="Golden Timing Logo"
  style={{
    height: '500px',         
    objectFit: 'contain',
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
    transform: 'scale(1.1)',  
    transition: 'transform 0.2s ease'
  }}
/>
      </div>

      {/* Right: Explanation content */}
      <div style={{
        flex: 1.4,
        backgroundColor: '#111',
        color: '#f9f9f9',
        padding: '80px 60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <h1 style={{ fontSize: '70px', color: '#f2d024', marginBottom: '12px' }}>
          Golden Timing 연금 시뮬레이터
        </h1>
        <p style={{ fontSize: '36px', color: '#ccc', marginBottom: '32px' }}>
          당신에게 가장 유리한 연금 수령 시점을 찾아드립니다.
        </p>

        <h2 style={{ fontSize: '30px', color: '#f9f9f9', marginBottom: '12px' }}> 이 프로그램은 어떤가요?</h2>
        <p style={{ fontSize: '25px', lineHeight: '1.8', marginBottom: '28px' }}>
          Golden Timing은 <strong style={{ color: '#f2d024' }}>건강 상태</strong>, <strong style={{ color: '#f2d024' }}>재정 여건</strong>, <strong style={{ color: '#f2d024' }}>연금 정보</strong>를 바탕으로,<br />
          <strong style={{ color: '#f2d024' }}>최적의 연금 수령 전략</strong>을 추천해주는 시뮬레이션 서비스입니다.
        </p>

        <h2 style={{ fontSize: '35px', marginBottom: '12px' }}> 준비해야 할 정보</h2>
        <ul style={{ fontSize: '20px', lineHeight: '2', paddingLeft: '20px', marginBottom: '32px' }}>
          <li>이름, 나이, 성별</li>
          <li>국민연금 / 개인연금 납입 정보</li>
          <li>기본 건강 정보 (키, 몸무게, 운동, 질병 등)</li>
          <li>현재 자산 / 소득 / 지출 및 퇴직금 예상액</li>
        </ul>

        <p style={{ fontSize: '15px', color: '#888' }}>
          * 입력하신 정보는 저장되지 않으며, 결과 제공 후 삭제됩니다.
        </p>

        <button
          onClick={() => navigate('/step1')}
          style={{
            marginTop: '32px',
            padding: '14px 28px',
            fontSize: '16px',
            backgroundColor: '#f2d024',
            color: '#111',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          시작하기 →
        </button>
      </div>
    </div>
  );
}
