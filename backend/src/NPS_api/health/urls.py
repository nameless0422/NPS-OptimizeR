from django.urls import path
from .views import HealthCreateView, HealthListView

urlpatterns = [
    path('users/me/health', HealthCreateView.as_view(), name='health-create'),
    path('users/me/health/list', HealthListView.as_view(), name='health-list'),
]
