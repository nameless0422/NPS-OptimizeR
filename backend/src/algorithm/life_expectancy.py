import pandas as pd
import numpy as np
from lifelines import CoxPHFitter

# -----------------------------
# 1. WHO: Republic of Korea 기대 수명 로드
# -----------------------------
who_df = pd.read_csv("life_expectancy.csv")
rok_latest = who_df[(who_df['Country'] == 'Republic of Korea') & (~who_df['Life expectancy'].isna())]
rok_baseline = rok_latest.sort_values(by='Year', ascending=False).iloc[0]['Life expectancy']
print(f"[WHO] Republic of Korea 최신 기대 수명: {rok_baseline:.1f}세")

# -----------------------------
# 2. NHANES 데이터 준비 및 Cox 모델 학습
# -----------------------------
demo = pd.read_csv("NHANES_DEMOGRAPHICS_2017_18.csv")
body = pd.read_csv("NHANES_BODY_MEASURES_2017-18.csv")
df = pd.merge(demo, body, on="SEQN")

# 변수 선택
df_nhanes = df[['RIDAGEYR', 'RIAGENDR', 'BMXBMI', 'BMXWT']].copy()
df_nhanes.columns = ['age', 'gender', 'bmi', 'weight']
df_nhanes['gender'] = df_nhanes['gender'].map({1: 'male', 2: 'female'})
df_nhanes.dropna(inplace=True)

# 생존 시뮬레이션
np.random.seed(42)
df_nhanes['follow_up_time'] = np.random.normal(10, 2, len(df_nhanes)).clip(1, 20)
df_nhanes['event'] = np.random.binomial(1, 0.3, len(df_nhanes))
df_nhanes['gender'] = df_nhanes['gender'].map({'male': 0, 'female': 1})

# Cox 모델 학습
cph = CoxPHFitter()
cph.fit(df_nhanes[['age', 'gender', 'bmi', 'weight', 'follow_up_time', 'event']],
        duration_col='follow_up_time', event_col='event')

# -----------------------------
# 3. 건강 습관 및 병력 기반 가중치 조정 함수
# -----------------------------
def habit_disease_adjustment(data):
    adj = 0
    if data.get("smoking") == "yes": adj -= 3.0
    if data.get("alcohol_use", 0) > 14.0: adj -= 2.0
    if data.get("exercise_level", 0) >= 4: adj += 1.5
    if data.get("hypertension") == 1: adj -= 2.0
    if data.get("diabetes") == 1: adj -= 2.5
    if data.get("cholesterol") == 1: adj -= 1.5
    return adj

# -----------------------------
# 4. 최종 기대 수명 예측 함수
# -----------------------------
def predict_life_expectancy_korea(data):
    """
    data: dict
        {
            'age': 45,
            'gender': 'female',
            'bmi': 22.5,
            'weight': 60.0,
            'smoking': 'yes',
            'alcohol_use': 5.0,
            'exercise_level': 3,
            'hypertension': 0,
            'diabetes': 0,
            'cholesterol': 1
        }
    """
    # NHANES 생존 기반 보정
    input_df = pd.DataFrame([data])
    input_df['gender'] = input_df['gender'].map({'male': 0, 'female': 1})
    risk_score = cph.predict_partial_hazard(input_df[['age', 'gender', 'bmi', 'weight']]).values[0]
    expected_years_more = cph.baseline_survival_.index[-1] * risk_score
    nhanes_adjustment = expected_years_more - 10  # 10년 추적 기준에서의 차이

    # 습관 및 병력 기반 가중치
    lifestyle_adjustment = habit_disease_adjustment(data)

    # 최종 수명 예측
    final_life = rok_baseline + nhanes_adjustment + lifestyle_adjustment
    return round(final_life, 1)

# -----------------------------
# 5. 테스트 예시
# -----------------------------
sample_input = {
    'age': 45,
    'gender': 'female',
    'bmi': 22.5,
    'weight': 60.0,
    'smoking': 'yes',
    'alcohol_use': 5.0,
    'exercise_level': 3,
    'hypertension': 0,
    'diabetes': 0,
    'cholesterol': 1
}

predicted_age = predict_life_expectancy_korea(sample_input)
print(f"\n🧬 당신의 조정된 기대 수명은 약 {predicted_age}세입니다.")