from django.urls import path
from .views import RegisterView, LoginView, MeView

urlpatterns = [
    path('auth/register', RegisterView.as_view(), name='auth-register'),
    path('auth/login',    LoginView.as_view(),    name='auth-login'),
    path('auth/me',       MeView.as_view(),       name='auth-me'),
]
