# members/admin.py
from django.contrib import admin
from .models import Member, Transaction

@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'email', 'is_active', 'joined_date']
    search_fields = ['name', 'phone', 'email']
    list_filter = ['is_active', 'is_deleted']

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['member', 'type', 'payat', 'payat_date']
    search_fields = ['member__name']
    list_filter = ['type', 'is_new']