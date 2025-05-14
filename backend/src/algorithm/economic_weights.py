def evaluate_financial_status(data):

    # 입력 변수 설정
    age = data.get("age", 55)
    total_assets = data.get("total_assets", 0)
    expense = data.get("monthly_expense", 0)
    income = data.get("monthly_income", 0)
    is_retired = input("은퇴 여부 (Y/N): ").strip().upper() == 'Y'
    if not is_retired:
        retirement_age = int(input("예상 은퇴 나이: "))
        work_income = int(input("월 근로 소득(원): "))
    cohabiting_family = data.get("cohabiting_family", 0)
    dependents = data.get("dependents", 0)
    has_own_house = data.get("has_own_house", False)
    has_insurance = data.get("has_insurance", False)

    # 지출 요소 가정
    family_cost = 400000  # 가족 1인당 추가 생활비
    dependent_cost = 500000  # 부양 가족 1인당 추가 비용
    rent_cost = 600000  # 주거비
    avg_medical_cost = 420000  # 고령자 월 평균 의료비
    insurance_coverage = 0.7 # 실손보험 보장율 (70%)
    inflation_rate = 0.02  # 물가 상승률 2%

    total_assets = data.get("total_assets", 0)

    # 월 지출 계산 (가족 수, 주거비, 보험 여부 반영)
    base_expense = expense
    additional_family_expense = cohabiting_family * family_cost
    additional_dependent_expense = dependents * dependent_cost

    if not has_own_house:
        housing_expense = rent_cost
    else:
        housing_expense = 0

    if has_insurance:
        medical_expense = avg_medical_cost * (1 - insurance_coverage)
    else:
        medical_expense = avg_medical_cost

    total_expense = base_expense + additional_family_expense + additional_dependent_expense + housing_expense + medical_expense

    # 월 적자 계산
    adjusted_expense = total_expense * (1 + inflation_rate)
    monthly_deficit = adjusted_expense - income

    # 생존 가능 개월 수 계산
    if is_retired:
        # 은퇴 후
        monthly_deficit = total_expense - income
        if monthly_deficit <= 0:
            survival_months = 999  
        else:
            survival_months = int(total_assets / monthly_deficit)
    else:
        # 은퇴 전
        if age < retirement_age:
            monthly_surplus = income - total_expense
            total_assets += monthly_surplus * (retirement_age - age) * 12
            age = retirement_age
            monthly_deficit = total_expense - (income - work_income)
            if monthly_deficit <= 0:
                survival_months = 999  
            else:
                survival_months = int(total_assets / monthly_deficit)

    # 생존 개월 수 기준 점수 환산 (최대 200개월 → 10.0점)
    # 점수 계산 기준: 70세부터 월당 0.05점 부여
    survival_years = survival_months / 12
    # 70세 이전에는 점수 없음
    if age < 70:
        if survival_years <= (70 - age):
            score = 0.0
        else:
            adjusted_months = (survival_years - (70 - age)) * 12
            score = min(adjusted_months, 200) * 0.05
    else:
        score = min(survival_months, 200) * 0.05

    result = {
        'score': round(score, 2),
        'survival_months': survival_years + age,
    }

    # 결과 출력
    return result


if __name__ == "__main__":
    print("생존 기반 경제 점수 계산을 시작합니다.")
    data = {
        'age': int(input("나이: ")), 
        'total_assets': int(input("총 자산(원): ")), 
        'monthly_expense': int(input("월 생활비(원): ")), 
        'monthly_income': int(input("월 소득(원): ")), 
        'cohabiting_family': int(input("동거 가족 수: ")), 
        'dependents': int(input("부양 가족 수: ")), 
        'has_own_house': input("자가 주거 여부 (Y/N): ").strip().upper() == 'Y', 
        'has_insurance': input("보험 가입 여부 (Y/N): ").strip().upper() == 'Y' 
    }

    result = evaluate_financial_status(data)
    print(f"📊 생존 기반 경제 점수: {result['score']}점")
    print(f"📅 생존 가능 개월 수: {result['survival_months']}세")


# 점수 해석 가이드 업데이트
    # 0.0 ~ 3.5점 : 조기 수령 권장 (60세 수령)
    # 3.6 ~ 7.7점 : 통상 수령 권장 (65세 수령)
    # 7.8점 이상 : 연기 수령 가능 (70세 수령)
