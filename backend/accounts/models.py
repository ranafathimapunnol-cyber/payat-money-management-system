# accounts/models.py
from django.db import models
from django.contrib.auth.models import User
from members.models import Member

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    member = models.OneToOneField(Member, on_delete=models.CASCADE, related_name='user_profile')
    phone_verified = models.BooleanField(default=False)
    otp_code = models.CharField(max_length=6, null=True, blank=True)
    otp_created_at = models.DateTimeField(null=True, blank=True)
    otp_attempts = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.member.name}"

    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'