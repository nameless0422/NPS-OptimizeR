from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import PensionRecord
from .serializers import PensionInputSerializer, PensionOutputSerializer
from .services import plan_pension

class PensionCreateView(generics.CreateAPIView):
    serializer_class = PensionInputSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        record = serializer.save(user=self.request.user)
        result = plan_pension(record)
        record.recommended_age = result
        record.save()
        self._output = {'id': str(record.id), 'recommended_age': result}

    def create(self, request, *args, **kwargs):
        self.perform_create(self.get_serializer(data=request.data))
        return Response(self._output, status=status.HTTP_201_CREATED)

class PensionListView(generics.ListAPIView):
    serializer_class = PensionOutputSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PensionRecord.objects.filter(user=self.request.user).order_by('-created_at')
