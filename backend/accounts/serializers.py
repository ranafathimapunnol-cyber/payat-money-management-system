from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile
from members.models import Member

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)
    name = serializers.CharField()
    phone = serializers.CharField()

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'name', 'phone']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match'})
        return data

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already registered')
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Username already taken')
        return value

    def create(self, validated_data):
        name = validated_data.pop('name')
        phone = validated_data.pop('phone')
        password = validated_data.pop('password')
        password2 = validated_data.pop('password2')

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=password,
            first_name=name
        )

        member = Member.objects.create(
            user=user,
            name=name,
            phone=phone,
            email=validated_data['email'],
            is_active=True
        )

        UserProfile.objects.create(
            user=user,
            member=member,
            phone_verified=False
        )

        return user


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    name = serializers.CharField(source='member.name')
    phone = serializers.CharField(source='member.phone')
    address = serializers.CharField(source='member.address', allow_blank=True, allow_null=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'name', 'phone', 'address', 'phone_verified']
