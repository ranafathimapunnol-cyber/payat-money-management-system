# accounts/urls.py
from django.urls import path
from .views import (
    RegisterView, VerifyOTPView, ResendOTPView, 
    ProfileView, LoginView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('resend-otp/', ResendOTPView.as_view(), name='resend-otp'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('login/', LoginView.as_view(), name='login'),
]