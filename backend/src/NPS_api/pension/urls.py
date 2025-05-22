# src/NPS_api/pension/urls.py

from django.urls import path
from .views import PensionSimulationView

urlpatterns = [
    path('users/me/pension/simulate', PensionSimulationView.as_view(), name='pension-simulate'),
]
