// src/forms/PrivatePensionInfo.jsx
import React, { useState } from 'react';
import '../styles/BasicInfo.css';

export default function PrivatePensionInfo() {
  const [period, setPeriod] = useState('');
  const [monthlyPremium, setMonthlyPremium] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      period,
      monthlyPremium
    };
    window.opener.postMessage({ type: 'privatePensionInfo', data: payload }, '*');
    window.close();
  };

  return (
    <div className="container">
      <h1 className="title">개인연금 정보 입력</h1>
      <p className="subtitle">개인연금 수령 시뮬레이션을 위한 정보를 입력해주세요.</p>

      <form onSubmit={handleSubmit} className="section-box">
        <table className="table">
          <tbody>
            <tr>
              <td>가입기간 (년)</td>
              <td>
                <input
                  type="number"
                  value={period}
                  onChange={e => setPeriod(e.target.value)}
                  className="input"
                  placeholder="예: 15"
                  required
                />
              </td>
            </tr>
            <tr>
              <td>월 납입 보험료 (만원)</td>
              <td>
                <input
                  type="number"
                  value={monthlyPremium}
                  onChange={e => setMonthlyPremium(e.target.value)}
                  className="input"
                  placeholder="예: 20"
                  required
                />
              </td>
            </tr>
          </tbody>
        </table>

        <div className="button-container">
          <button type="submit" className="button">저장</button>
        </div>
      </form>
    </div>
  );
}
