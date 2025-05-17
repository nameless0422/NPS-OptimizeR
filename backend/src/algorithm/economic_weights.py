def evaluate_financial_status(data):

    # 입력 변수 설정
    age = data.get("age", 55)
    total_assets = data.get("assets", 0) - data.get("debt", 0)
    living_expense = data.get("monthly_expense", 0)
    income = data.get("monthly_income", 0)
    is_retired = input("은퇴 여부 (Y/N): ").strip().upper() == 'Y'
    if not is_retired:
        retirement_age = int(input("예상 은퇴 나이: "))
        work_income = int(input("월 근로 소득(원): "))
    dependents = data.get("dependents", 0)
    has_own_house = data.get("has_own_house", False)
    has_insurance = data.get("has_insurance", False)

    # 지출 요소 가정
    dependent_cost = 430000  # 부양 가족 1인당 추가 비용
    resident_cost = 150000  # 주거비
    avg_medical_cost = 104000  # 고령자 월 평균 의료비
    insurance_coverage = 0.7 # 실손보험 보장율 (70%)
    inflation_rate = 0.02  # 물가 상승률 2%

    # 월 지출 계산 (가족 수, 주거비, 보험 여부 반영)
    dependent_expense = dependents * dependent_cost
    housing_expense = 0 if has_own_house else resident_cost
    medical_expense = avg_medical_cost * (1 - insurance_coverage) if has_insurance else avg_medical_cost
    monthly_expense = living_expense + dependent_expense + housing_expense + medical_expense

    # 은퇴 여부에 따른 자산 변화 및 생존 계산
    if not is_retired and age < retirement_age:
        monthly_surplus = income - monthly_expense
        total_assets += monthly_surplus * (retirement_age - age) * 12
        age = retirement_age
        income -= work_income

    # 생존 가능 개월 수 계산 (누적 인플레이션 반영)
    remaining_assets = total_assets
    months = 0

    while remaining_assets > 0:
        year = months // 12
        total_expense = monthly_expense * ((1 + inflation_rate) ** year)
        monthly_deficit = total_expense - income

        if monthly_deficit <= 0:
            break

        remaining_assets -= monthly_deficit
        if remaining_assets < 0:
            break
        months += 1

    # 점수 계산 (70세 이후 생존 기간 기반)
    living_years = months / 12
    if age < 70:
        if living_years <= (70 - age):
            score = 0.0
        else:
            living_months_after70 = (living_years - (70 - age)) * 12
            score = min(living_months_after70, 200) * 0.05
    else:
    # 70세 이상일 때 
        living_months_after70 = months + (age - 70) * 12
        score = min(living_months_after70, 200) * 0.05
    
    result = {
        'score': round(score, 2),
        'living_months': round(living_years + age, 1),
    }

    return result


if __name__ == "__main__":
    print("생존 기반 경제 점수 계산을 시작합니다.")
    data = {
        'age': int(input("나이: ")), 
        'assets': int(input("자산(원): ")),
        'debt': int(input("부채(원): ")),
        'monthly_expense': int(input("월 생활비(원): ")), 
        'monthly_income': int(input("월 소득(원): ")), 
        'dependents': int(input("부양 가족 수: ")), 
        'has_own_house': input("자가 주거 여부 (Y/N): ").strip().upper() == 'Y', 
        'has_insurance': input("보험 가입 여부 (Y/N): ").strip().upper() == 'Y' 
    }

    result = evaluate_financial_status(data)
    print(f"📊 생활 경제 점수: {result['score']}점")
    print(f"📅 생활 가능 기간: {result['living_months']}세")
