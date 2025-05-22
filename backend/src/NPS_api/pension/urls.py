from django.urls import path
from .views import PensionCreateView, PensionListView

urlpatterns = [
    path('users/me/pension', PensionCreateView.as_view(), name='pension-create'),
    path('users/me/pension/list', PensionListView.as_view(), name='pension-list'),
]
