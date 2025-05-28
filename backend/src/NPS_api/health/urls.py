from django.urls import path
from .views import HealthCreateView, HealthListView, HealthSimulationView

urlpatterns = [
    path('users/me/health', HealthCreateView.as_view(), name='health-create'),
    path('health/simulate', HealthSimulationView.as_view(), name='health-simulate'),
    path('users/me/health/list', HealthListView.as_view(), name='health-list'),
]
