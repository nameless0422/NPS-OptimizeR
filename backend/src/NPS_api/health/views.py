from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from .models import HealthRecord
from .serializers import HealthInputSerializer, HealthOutputSerializer
from .services import calculate_life_expectancy


class HealthCreateView(generics.CreateAPIView):
    serializer_class = HealthInputSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        record = serializer.save(user=self.request.user)
        result = calculate_life_expectancy(record)
        record.estimated_death_age = result
        record.save()
        self._output = {'id': str(record.id), 'estimated_death_age': result}

    def create(self, request, *args, **kwargs):
        self.perform_create(self.get_serializer(data=request.data))
        return Response(self._output, status=status.HTTP_201_CREATED)

class HealthListView(generics.ListAPIView):
    serializer_class = HealthOutputSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return HealthRecord.objects.filter(user=self.request.user).order_by('-created_at')


class HealthSimulationView(APIView):
    """
    POST /api/v1/health/simulate
    DB에 저장 없이, 서비스 calculate_life_expectancy(record) 호출만으로
    estimated_death_age 결과를 반환합니다.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        # 1) 입력 검증
        serializer = HealthInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # 2) 모델 인스턴스(미저장) 생성
        record = HealthRecord(**data)

        # 3) service 함수로 계산
        estimated_age = calculate_life_expectancy(record)

        # 4) 결과 리턴
        return Response({'estimated_death_age': estimated_age})