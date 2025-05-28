import streamlit as st
from datetime import datetime
import pandas as pd
import plotly.express as px

EARLY = 'early'
NORMAL = 'normal'
DEFERRED = 'deferred'

KOR_LABELS = {
    'early': '조기수급',
    'normal': '정상수급',
    'deferred': '연기수급'
}


def Health(): return 80
def Finance(): return 80


def validate_birth_date(ssn):
    if len(ssn) != 6 or not ssn.isdigit(): return False
    month, day = int(ssn[2:4]), int(ssn[4:6])
    return 1 <= month <= 12 and 1 <= day <= 31


def recommend_pension_plan(health_score, finance_score):
    if health_score >= 80 and finance_score >= 80:
        return {"Pension_type": "연기수급", "Private_pension_type": "종신형"}
    elif health_score <= 40 or finance_score <= 40:
        return {"Pension_type": "조기수급", "Private_pension_type": "확정형"}
    else:
        return {"Pension_type": "정상수급", "Private_pension_type": "확정형"}

def decide_private_lump_sum(health_score, finance_score):
    return health_score <= 40 or finance_score <= 60

def decide_private_payment_period(health_score, finance_score):
    if health_score >= 80 and finance_score >= 80: return 20
    elif health_score <= 40 or finance_score <= 40: return 10
    return 15

def calculate_public_pension(user_info, years=0, t=NORMAL):
    if not user_info.get("Public_pension", False) or user_info["Subscription_period"] < 10:
        return 0

    total_avg_income = 2756000
    personal_avg_income = user_info.get("Annual_income", 0) / 12 or total_avg_income

    A = total_avg_income
    B = personal_avg_income
    가입기간 = user_info["Subscription_period"]

    base_pension = ((A + B) / 2) * 가입기간 * 0.015

    extra = 0
    if user_info["Spouse"] == 'Y':
        extra += 269360
    extra += user_info["Dependent_parent_count"] * 179580
    extra += user_info["Child_count"] * 179580

    total_pension = base_pension + extra

    if t == EARLY and 1 <= years <= 5:
        total_pension *= (1 - 0.06 * years)
    elif t == DEFERRED and 1 <= years <= 5:
        total_pension *= (1 + 0.072 * years)

    return total_pension


def calculate_private_pension(user_info):
    if not user_info.get("Private_pension"): return 0

    total = user_info["Private_monthly_premium"] * 12 * user_info["Private_subscription_period"]

    if user_info["Private_lump_sum"]:
        return total  

    if user_info["Private_pension_type"] == "확정형":
        return total / (user_info["Private_payment_period"] * 12)
    elif user_info["Private_pension_type"] == "종신형":
        return (total * 0.008) / 12

    return 0

def calculate_private_tax(user_info, private_y, is_lump=False):
    if private_y <= 0: return 0
    if is_lump: return private_y * 0.165
    age = user_info["Current_age"]
    rate = 0.055 if age < 70 else 0.044 if age < 80 else 0.033
    return private_y * rate

def calculate_tax(user_info, public_y, private_y):
    total = public_y + private_y
    if total <= 12000000:
        pension = public_y
        if pension <= 3500000: deduction = pension
        elif pension <= 7000000: deduction = 3500000 + (pension - 3500000) * 0.4
        elif pension <= 14000000: deduction = 4900000 + (pension - 7000000) * 0.2
        else: deduction = 6300000 + (pension - 14000000) * 0.1
        deduction += (500000 if user_info["Spouse"] == 'Y' else 0)
        deduction += (user_info["Dependent_parent_count"] + user_info["Child_count"]) * 500000
        income = max(pension - deduction, 0)
    else:
        base = 1500000 + (1500000 if user_info["Spouse"] == 'Y' else 0)
        base += (user_info["Dependent_parent_count"] + user_info["Child_count"]) * 1500000
        income = max(total - base, 0)
    if income <= 12000000: tax = income * 0.06
    elif income <= 46000000: tax = income * 0.15 - 1080000
    elif income <= 88000000: tax = income * 0.24 - 5220000
    elif income <= 150000000: tax = income * 0.35 - 14900000
    elif income <= 300000000: tax = income * 0.38 - 19400000
    elif income <= 500000000: tax = income * 0.4 - 25400000
    elif income <= 1000000000: tax = income * 0.42 - 33400000
    else: tax = income * 0.45 - 45400000
    return max(int(tax), 0)

def calculate_total_tax(user_info, public_y, private_y, is_lump):
    total = public_y + private_y
    if total <= 12000000:  # 분리과세 조건
        public_tax = calculate_tax(user_info, public_y, 0)
        private_tax = calculate_private_tax(user_info, private_y, is_lump)
        return public_tax + private_tax
    else:  # 종합과세
        return calculate_tax(user_info, public_y, private_y)

def calculate_scenarios(user_info):
    results = []
    lump_sum = user_info.get("Private_lump_sum", False)

    for years in range(0, 6):
        for t in [EARLY, NORMAL, DEFERRED]:
            pub = calculate_public_pension(user_info, years, t)
            priv = calculate_private_pension(user_info)

            pub_y = pub * 12
            priv_y = priv if lump_sum else priv * 12

            tax = calculate_total_tax(user_info, pub_y, priv_y, lump_sum)
            net_y = pub_y + priv_y - tax
            net_month = net_y / 12 if not lump_sum else (pub_y - tax) / 12

            base_age = user_info["Pension_start_age"]
            start_age = base_age + years if t == DEFERRED else base_age - years if t == EARLY else base_age

            results.append({
                "수급 유형": KOR_LABELS[t],
                "조정 년수": years,
                "공적연금 월수령액": int(pub),
                "개인연금 월수령액" if not lump_sum else "개인연금 연간수령액": int(priv),
                "총 월수령액(세후)": int(net_month),
                "연금 수령 시작 나이": start_age
            })

    return results

def simulate_pension(user_info, health_score: float, finance_score: float):
    """
    user_info: dict, 아래 keys를 포함해야 함
      - Dependent_parent_count, Child_count, Spouse,
      - Public_pension, Subscription_period, Monthly_insurance_premium,
      - Annual_income, Non_taxable_payment, Taxable_payment,
      - Private_pension, Private_subscription_period,
      - Private_monthly_premium, Private_lump_sum,
      - Current_age, Pension_start_age
    health_score: float (예: calculate_life_expectancy)
    finance_score: float (예: evaluate_financial_status(data)['score'])
    """
    # Streamlit용 get_user_info_streamlit() 대신, 인자로 받은 값을 사용
    ui = user_info.copy()
    ui["Health_score"] = health_score
    ui["Finance_score"] = finance_score
    # 앞서 정의한 calculate_scenarios()를 호출
    return calculate_scenarios(ui)

def run_simulation(user_info):
    scenarios = calculate_scenarios(user_info)
    rec_type = user_info["Pension_type"]
    filtered = [s for s in scenarios if s["수급 유형"] == rec_type]
    best = max(filtered, key=lambda x: x["총 월수령액(세후)"])
    df = pd.DataFrame(filtered)

    st.subheader("📋 추천 수급 시나리오 요약")
    st.dataframe(df, use_container_width=True)

    st.subheader("🏆 최적 시나리오")
    best_df = pd.DataFrame([best])
    st.dataframe(best_df, use_container_width=True)

    st.subheader("📈 조정년수별 월 수령액 시각화")
    fig = px.bar(
        df,
        x="조정 년수",
        y="총 월수령액(세후)",
        color="조정 년수",
        text="총 월수령액(세후)",
        title="📊 조정 년수에 따른 세후 월수령액 비교",
        labels={"조정 년수": "조정 년수 (년)", "총 월수령액(세후)": "세후 월 수령액 (원)"},
        color_continuous_scale=px.colors.sequential.Blues
    )
    fig.update_traces(
        texttemplate="%{text:,}원",
        textposition="outside",
        marker_line_color="black",
        marker_line_width=1.5
    )
    fig.update_layout(
        yaxis=dict(title="세후 월 수령액 (원)", tickformat=","),
        xaxis=dict(title="조정 년수 (년)"),
        font=dict(size=14),
        height=500,
        uniformtext_minsize=10,
        uniformtext_mode='hide'
    )
    st.plotly_chart(fig, use_container_width=True)

def run_app():
    st.set_page_config(page_title="연금 시나리오 시뮬레이터", layout="wide")
    st.title("📊 연금 수령 최적 시나리오 시뮬레이터")
    st.markdown("""
        이 시뮬레이터는 사용자 건강/재정 점수 및 연금 가입 내역을 기반으로
        **공적연금과 개인연금의 수령액과 세후 수령액을 비교 분석**하여
        가장 유리한 연금 수급 전략을 자동으로 추천합니다.
    """)
    user_info = get_user_info_streamlit()
    if st.sidebar.button("📊 시뮬레이션 실행"):
        run_simulation(user_info)

def get_user_info_streamlit():
    user_info = {}
    st.sidebar.header("👤 사용자 정보 입력")
    user_info["Name"] = st.sidebar.text_input("이름", "")
    ssn = st.sidebar.text_input("주민번호 앞 6자리", "")
    if not ssn or not validate_birth_date(ssn):
        st.warning("이름과 유효한 주민번호 앞 6자리를 입력하세요.")
        st.stop()

    user_info["Identification_number"] = ssn
    user_info["Dependent_parent_count"] = st.sidebar.number_input("부양 부모 수", 0, 10, step=1)
    user_info["Child_count"] = st.sidebar.number_input("부양 자녀 수", 0, 10, step=1)
    user_info["Spouse"] = 'Y' if st.sidebar.checkbox("배우자 있음") else 'N'
    user_info["Health_score"] = Health()
    user_info["Finance_score"] = Finance()

    user_info["Public_pension"] = st.sidebar.checkbox("공적연금 가입")
    if user_info["Public_pension"]:
        user_info["Subscription_period"] = st.sidebar.slider("가입기간 (년)", 0, 40, 20)
        user_info["Monthly_insurance_premium"] = st.sidebar.number_input("월 납입 보험료", 0, 30000000)
        user_info["Annual_income"] = st.sidebar.number_input("연간 근로소득", 0, 100000000)
        user_info["Non_taxable_payment"] = st.sidebar.number_input("비과세 납입액 (2001년 이전)", 0, 50000000)
        user_info["Taxable_payment"] = st.sidebar.number_input("과세 납입액 (2002년 이후)", 0, 50000000)

    user_info["Private_pension"] = st.sidebar.checkbox("개인연금 가입")
    if user_info["Private_pension"]:
        user_info["Private_subscription_period"] = st.sidebar.slider("개인연금 가입기간", 1, 50, 20)
        user_info["Private_monthly_premium"] = st.sidebar.number_input("개인연금 월 납입액", 0, 30000000)
        user_info["Private_payment_period"] = decide_private_payment_period(user_info["Health_score"], user_info["Finance_score"])
        user_info["Private_lump_sum"] = decide_private_lump_sum(user_info["Health_score"], user_info["Finance_score"])

    birth_year = 1900 + int(ssn[:2]) if int(ssn[:2]) > 24 else 2000 + int(ssn[:2])
    birth_month, birth_day = int(ssn[2:4]), int(ssn[4:6])
    today = datetime.today()
    age = today.year - birth_year - ((today.month, today.day) < (birth_month, birth_day))
    user_info["Birth_year"] = birth_year
    user_info["Current_age"] = age
    user_info["Pension_start_age"] = 60 if birth_year <= 1956 else 62 if birth_year <= 1960 else 63 if birth_year <= 1964 else 64 if birth_year <= 1968 else 65

    user_info.update(recommend_pension_plan(user_info["Health_score"], user_info["Finance_score"]))
    return user_info

if __name__ == '__main__':
    run_app()