from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

class Member(models.Model):
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('deceased', 'Deceased'),
        ('closed', 'Closed'),
    )
    
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='member_profile'
    )
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    profile_pic = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    is_active = models.BooleanField(default=True)  # For deceased
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    joined_date = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(null=True, blank=True)
    deceased_date = models.DateField(null=True, blank=True)
    closed_date = models.DateField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)  # For soft delete
    deleted_at = models.DateTimeField(null=True, blank=True)
    phone_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'members'
        ordering = ['name']


class Transaction(models.Model):
    TRANSACTION_TYPE = (
        ("given", "I Gave Money"),
        ("received", "I Received Money"),
    )

    member = models.ForeignKey(
        Member, 
        on_delete=models.CASCADE, 
        related_name="transactions"
    )
    type = models.CharField(max_length=10, choices=TRANSACTION_TYPE, default="received")
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payat = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payat_date = models.DateField(default=timezone.now)
    kittuvan = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    ippol_payattiyath = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    ippol_date = models.DateField(null=True, blank=True)
    kodukkan = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    bakki_kittan = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    note = models.TextField(null=True, blank=True)
    is_new = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.member.name} - {self.payat_date}"

    class Meta:
        db_table = 'transactions'
        ordering = ['-payat_date', '-created_at']
