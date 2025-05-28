from django.urls import path
from .views import FinanceCreateView, FinanceListView

urlpatterns = [
    path('users/me/finance', FinanceCreateView.as_view(), name='finance-create'),
    path('users/me/finance/list', FinanceListView.as_view(), name='finance-list'),
]