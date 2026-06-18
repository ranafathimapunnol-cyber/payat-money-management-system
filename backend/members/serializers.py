from rest_framework import serializers
from django.db import models
from .models import Member, Transaction

class MemberSerializer(serializers.ModelSerializer):
    profile_pic_url = serializers.SerializerMethodField()
    balance = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Member
        fields = [
            'id', 'user', 'name', 'phone', 'email', 'address', 
            'profile_pic', 'profile_pic_url', 'is_active', 'status', 'status_display',
            'joined_date', 'notes', 'deceased_date', 'closed_date',
            'is_deleted', 'deleted_at', 'phone_verified', 'balance'
        ]
        read_only_fields = ['id', 'joined_date', 'is_deleted', 'deleted_at']

    def get_profile_pic_url(self, obj):
        if obj.profile_pic and hasattr(obj.profile_pic, 'url'):
            return obj.profile_pic.url
        return None

    def get_balance(self, obj):
        try:
            received = obj.transactions.filter(type='received').aggregate(
                total=models.Sum('amount')
            )['total'] or 0
            
            given = obj.transactions.filter(type='given').aggregate(
                total=models.Sum('amount')
            )['total'] or 0
            
            return float(received) - float(given)
        except:
            return 0


class TransactionSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source='member.name', read_only=True)
    member_phone = serializers.CharField(source='member.phone', read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'member', 'member_name', 'member_phone',
            'type', 'amount', 'payat', 'payat_date', 'kittuvan',
            'ippol_payattiyath', 'ippol_date', 'kodukkan', 
            'bakki_kittan', 'note', 'is_new', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
