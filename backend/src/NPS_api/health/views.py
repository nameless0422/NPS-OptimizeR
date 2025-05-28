from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
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
