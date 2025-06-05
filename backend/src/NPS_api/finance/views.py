from rest_framework import generics, status
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from .models import FinanceRecord
from .serializers import FinanceInputSerializer, FinanceOutputSerializer, FinanceSimulationSerializer
from .services import calculate_economic_score_financial

class FinanceCreateView(generics.CreateAPIView):
    serializer_class = FinanceInputSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        record = serializer.save(user=self.request.user)
        # 서비스 로직 호출
        data_dict = {
            'age': record.age,
            'assets': record.assets,
            'debt': record.debt,
            'monthly_living_expense': record.monthly_living_expense,
            'monthly_income': record.monthly_income,
            'dependents': record.dependents,
            'has_own_house': record.has_own_house,
            'has_insurance': record.has_insurance,
        }
        result = calculate_economic_score_financial(data_dict)
        record.score = result.get('score')
        record.living_months = result.get('living_months')
        record.save()
        self._output = {
            'id': str(record.id),
            'score': record.score,
            'living_months': record.living_months
        }

    def create(self, request, *args, **kwargs):
        self.perform_create(self.get_serializer(data=request.data))
        return Response(self._output, status=status.HTTP_201_CREATED)

class FinanceListView(generics.ListAPIView):
    serializer_class = FinanceOutputSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return FinanceRecord.objects.filter(user=self.request.user).order_by('-created_at')
    
class FinanceSimulationView(GenericAPIView):
    """
    POST /api/v1/finance/simulate
    → 입력된 재무 지표로만 score, living_months 계산 후 반환
    """
    serializer_class = FinanceSimulationSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        # 1) 입력 검증
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # 2) 서비스 함수 호출
        result = calculate_economic_score_financial(data)
        # result 예시: {'score': 45.23, 'living_months': 310.5}

        # 3) 결과 리턴
        return Response(result, status=200)