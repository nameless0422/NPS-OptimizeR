# src/NPS_api/pension/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from health.services import calculate_life_expectancy  # HealthRecord instance → death age
from finance.services import calculate_economic_score_financial
from algorithm.pension_app import simulate_pension

from .serializers import PensionSimulationSerializer


class PensionSimulationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # 1) 입력 검증
        ser = PensionSimulationSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        # 2) Health 계산 (새로 계산)
        #    HealthRecord 저장 없이, 바로 life expectancy 계산
        life_exp = calculate_life_expectancy_mock(data)  
        # 실제로는 HealthRecord 인스턴스 생성 + calculate_life_expectancy(record)
        # 여기서는 data dict에서 Health 인자 꺼내서 바로 사용

        # 3) Finance 계산
        fin = calculate_economic_score_financial({
            "age": data["age"],
            "assets": data["assets"],
            "debt": data["debt"],
            "monthly_living_expense": data["monthly_living_expense"],
            "monthly_income": data["monthly_income"],
            "dependents": data["dependents"],
            "has_own_house": data["has_own_house"],
            "has_insurance": data["has_insurance"],
        })
        finance_score = fin['score']

        # 4) Pension 시뮬레이션
        user_info = {
            "Dependent_parent_count": data["Dependent_parent_count"],
            "Child_count": data["Child_count"],
            "Spouse": data["Spouse"],
            "Public_pension": data["Public_pension"],
            "Subscription_period": data.get("Subscription_period", 0),
            "Monthly_insurance_premium": data.get("Monthly_insurance_premium", 0),
            "Annual_income": data.get("Annual_income", 0),
            "Non_taxable_payment": data.get("Non_taxable_payment", 0),
            "Taxable_payment": data.get("Taxable_payment", 0),
            "Private_pension": data["Private_pension"],
            "Private_subscription_period": data.get("Private_subscription_period", 0),
            "Private_monthly_premium": data.get("Private_monthly_premium", 0),
            "Private_lump_sum": data["Private_lump_sum"],
            "Current_age": data["Current_age"],
            "Pension_start_age": data["Pension_start_age"],
        }

        scenarios = simulate_pension(user_info, life_exp, finance_score)

        return Response(scenarios, status=status.HTTP_200_OK)
