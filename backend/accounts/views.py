from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from .models import UserProfile
from members.models import Member
from .utils import generate_otp, send_otp
import random
import os

class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            print("📝 Registration attempt:", request.data.get('username'))
            
            username = request.data.get('username')
            email = request.data.get('email')
            password = request.data.get('password')
            password2 = request.data.get('password2')
            name = request.data.get('name', username)
            phone = request.data.get('phone', '')
            
            if not username or not email or not password:
                return Response({
                    'error': 'Username, email and password are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if password != password2:
                return Response({
                    'error': 'Passwords do not match'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if User.objects.filter(username=username).exists():
                return Response({
                    'error': 'Username already taken'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if User.objects.filter(email=email).exists():
                return Response({
                    'error': 'Email already registered'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=name
            )
            print(f"✅ User created: {user.username}")
            
            member = Member.objects.create(
                user=user,
                name=name,
                phone=phone,
                email=email,
                is_active=True,
                status='active'
            )
            print(f"✅ Member created: {member.name}")
            
            profile = UserProfile.objects.create(
                user=user,
                member=member,
                phone_verified=False
            )
            print(f"✅ Profile created")
            
            otp = generate_otp()
            print(f"🔑 OTP for {username}: {otp}")
            
            # Try to send email, fallback to console
            try:
                success, method = send_otp(phone, email, otp, name)
                print(f"📧 OTP sent via {method}: {success}")
            except Exception as e:
                print(f"⚠️ Email error (but continuing): {e}")
            
            profile.otp_code = otp
            profile.otp_created_at = timezone.now()
            profile.otp_attempts = 0
            profile.save()
            
            return Response({
                'message': 'Registration successful! Check your email for OTP.',
                'user': {
                    'username': user.username,
                    'email': user.email,
                    'name': member.name,
                    'phone': member.phone,
                },
                'debug_otp': otp,
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print("❌ Error:", str(e))
            import traceback
            traceback.print_exc()
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            email = request.data.get('email')
            otp = request.data.get('otp')
            
            if not otp:
                return Response({'error': 'OTP is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            
            profile = UserProfile.objects.get(user=user)
            
            if profile.phone_verified:
                refresh = RefreshToken.for_user(user)
                return Response({
                    'message': 'Already verified!',
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'name': user.first_name,
                        'phone_verified': True,
                    }
                }, status=status.HTTP_200_OK)
            
            if profile.otp_code != otp:
                profile.otp_attempts += 1
                profile.save()
                remaining = 5 - profile.otp_attempts
                return Response({
                    'error': f'Invalid OTP. {remaining} attempts remaining.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if profile.otp_created_at and (timezone.now() - profile.otp_created_at) > timedelta(minutes=5):
                return Response({'error': 'OTP expired'}, status=status.HTTP_400_BAD_REQUEST)
            
            profile.phone_verified = True
            profile.otp_code = None
            profile.otp_created_at = None
            profile.otp_attempts = 0
            profile.save()
            
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'Email verified! 🎉',
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'name': user.first_name,
                    'phone_verified': True,
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            print("❌ Verify Error:", str(e))
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ResendOTPView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            email = request.data.get('email')
            
            if not email:
                return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            
            profile = UserProfile.objects.get(user=user)
            
            if profile.phone_verified:
                return Response({'error': 'Already verified'}, status=status.HTTP_400_BAD_REQUEST)
            
            otp = generate_otp()
            profile.otp_code = otp
            profile.otp_created_at = timezone.now()
            profile.otp_attempts = 0
            profile.save()
            
            try:
                success, method = send_otp(profile.member.phone, email, otp, profile.member.name)
                print(f"📧 New OTP sent via {method}: {success}")
            except Exception as e:
                print(f"⚠️ Email error: {e}")
            
            return Response({
                'message': 'OTP resent! Check your email.',
                'debug_otp': otp,
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            print("❌ Resend Error:", str(e))
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            profile = UserProfile.objects.get(user=request.user)
            member = profile.member
            
            return Response({
                'id': profile.user.id,
                'username': profile.user.username,
                'email': profile.user.email,
                'name': member.name,
                'phone': member.phone or '',
                'address': member.address or '',
                'profile_pic': member.profile_pic.url if member.profile_pic else None,
                'phone_verified': profile.phone_verified,
                'member': {
                    'id': member.id,
                    'name': member.name,
                    'phone': member.phone or '',
                    'email': member.email or '',
                    'address': member.address or '',
                    'profile_pic': member.profile_pic.url if member.profile_pic else None,
                    'phone_verified': profile.phone_verified,
                }
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def patch(self, request):
        try:
            profile = UserProfile.objects.get(user=request.user)
            member = profile.member
            
            # Handle profile picture upload
            if request.FILES and 'profile_pic' in request.FILES:
                print("📸 Uploading profile picture")
                file = request.FILES['profile_pic']
                
                # Delete old picture if exists
                if member.profile_pic:
                    old_path = member.profile_pic.path
                    if os.path.isfile(old_path):
                        os.remove(old_path)
                
                member.profile_pic = file
                member.save()
                print("✅ Profile picture updated")
                return self.get(request)
            
            # Handle text fields
            data = request.data
            if 'name' in data:
                member.name = data['name']
            if 'phone' in data:
                member.phone = data['phone']
            if 'email' in data:
                member.email = data['email']
                profile.user.email = data['email']
                profile.user.save()
            if 'address' in data:
                member.address = data['address']
            
            member.save()
            profile.save()
            
            return self.get(request)
            
        except Exception as e:
            print(f"❌ Profile update error: {e}")
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            username = request.data.get('username')
            password = request.data.get('password')
            
            if not username or not password:
                return Response({'error': 'Username and password required'}, status=status.HTTP_400_BAD_REQUEST)
            
            user = authenticate(username=username, password=password)
            if not user:
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
            
            try:
                profile = UserProfile.objects.get(user=user)
                if not profile.phone_verified:
                    return Response({
                        'error': 'Please verify your email before logging in.',
                        'email_verified': False,
                    }, status=status.HTTP_403_FORBIDDEN)
            except UserProfile.DoesNotExist:
                profile = UserProfile.objects.create(user=user, phone_verified=True)
            
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'name': user.first_name or user.username,
                    'phone_verified': profile.phone_verified,
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            print("❌ Login Error:", str(e))
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
