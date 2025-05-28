// src/forms/NationalPensionInfo.jsx
import React, { useState } from 'react';
import '../styles/BasicInfo.css';

export default function NationalPensionInfo() {
  const [period, setPeriod] = useState('');
  const [monthlyPremium, setMonthlyPremium] = useState('');
  const [annualIncome, setAnnualIncome] = useState('');
  const [postTaxCalc, setPostTaxCalc] = useState(false);
  const [nonTaxAmount, setNonTaxAmount] = useState('');
  const [taxedAmount, setTaxedAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      period,
      monthlyPremium,
      annualIncome,
      taxInfo: postTaxCalc ? { nonTaxAmount, taxedAmount } : null
    };
    window.opener.postMessage({ type: 'nationalPensionInfo', data: payload }, '*');
    window.close();
  };

  return (
    <div className="container">
      <h1 className="title">국민연금 정보 입력</h1>
      <p className="subtitle">정확한 수령액 계산을 위해 입력해주세요.</p>

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
                  placeholder="예: 20"
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
                  placeholder="예: 35"
                  required
                />
              </td>
            </tr>
            <tr>
              <td>연간 근로소득 (만원)</td>
              <td>
                <input
                  type="number"
                  value={annualIncome}
                  onChange={e => setAnnualIncome(e.target.value)}
                  className="input"
                  placeholder="예: 4200"
                  required
                />
              </td>
            </tr>
            <tr>
              <td colSpan={2}>
                <label>
                  <input
                    type="checkbox"
                    checked={postTaxCalc}
                    onChange={e => setPostTaxCalc(e.target.checked)}
                  />
                  &nbsp;세후 수령액 직접 입력
                </label>
              </td>
            </tr>

            {postTaxCalc && (
              <>
                <tr>
                  <td>비과세 수령액 (만원)</td>
                  <td>
                    <input
                      type="number"
                      value={nonTaxAmount}
                      onChange={e => setNonTaxAmount(e.target.value)}
                      className="input"
                      placeholder="예: 80"
                      required
                    />
                  </td>
                </tr>
                <tr>
                  <td>과세 수령액 (만원)</td>
                  <td>
                    <input
                      type="number"
                      value={taxedAmount}
                      onChange={e => setTaxedAmount(e.target.value)}
                      className="input"
                      placeholder="예: 40"
                      required
                    />
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>

        <div className="button-container">
          <button type="submit" className="button">저장</button>
        </div>
      </form>
    </div>
  );
}
