// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';

import Step0StartPage from './Page/Step0StartPage';
import Step1BasicInfo from './Page/Step1BasicInfo';
import Step2Health from './Page/Step2Health';
import Step3Finance from './Page/Step3Finance';
import Step4Result from './Page/Step4Result';

import NationalPensionInfo from './forms/NationalPensionInfo';
import PrivatePensionInfo from './forms/PrivatePensionInfo';

function StepRouterWrapper() {
  const navigate = useNavigate();
  const [userInput, setUserInput] = useState({});
  const methods = useForm();

  return (
    <FormProvider {...methods}>
      <Routes>
        <Route
          path="/"
          element={
            <Step0StartPage />
          }
        />

        <Route
          path="/step1"
          element={
            <Step1BasicInfo
              onNext={(data) => {
                setUserInput(prev => ({ ...prev, ...data }));
                navigate('/step2');
              }}
            />
          }
        />

        <Route
          path="/step2"
          element={
            <Step2Health
              userInput={userInput}
              onNext={(data) => {
                setUserInput(prev => ({ ...prev, ...data }));
                navigate('/step3');
              }}
            />
          }
        />

        <Route
          path="/step3"
          element={
            <Step3Finance
              userInput={userInput}
              onNext={(data) => {
                setUserInput(prev => ({ ...prev, ...data }));
                navigate('/step4');
              }}
              onBack={() => navigate('/step2')}
            />
          }
        />

        <Route
          path="/step4"
          element={<Step4Result userInput={userInput} />}
        />

        {/* 팝업용 */}
        <Route path="/national-pension-info" element={<NationalPensionInfo />} />
        <Route path="/private-pension-info" element={<PrivatePensionInfo />} />

        {/* 예외 처리 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </FormProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <StepRouterWrapper />
    </BrowserRouter>
  );
}
