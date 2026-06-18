from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from .serializers import RegisterSerializer
from .models import UserProfile
from members.models import Member
from .utils import generate_otp, send_otp
import traceback

class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save()
                profile = UserProfile.objects.get(user=user)
                
                otp = generate_otp()
                success, method = send_otp(
                    profile.member.phone, 
                    profile.member.email, 
                    otp, 
                    profile.member.name
                )
                
                profile.otp_code = otp
                profile.otp_created_at = timezone.now()
                profile.otp_attempts = 0
                profile.save()
                
                return Response({
                    'message': 'Registration successful! Please verify your email.',
                    'user': {
                        'username': user.username,
                        'email': user.email,
                        'name': user.first_name,
                        'phone': profile.member.phone,
                    },
                    'otp_sent': success,
                    'method_used': method,
                    'debug_otp': otp,
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                if 'user' in locals():
                    user.delete()
                return Response({
                    'error': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyOTPView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            email = request.data.get('email')
            phone = request.data.get('phone')
            otp = request.data.get('otp')
            
            if not otp:
                return Response({
                    'error': 'OTP is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            member = None
            if email:
                try:
                    member = Member.objects.get(email=email)
                except Member.DoesNotExist:
                    pass
            
            if not member and phone:
                try:
                    member = Member.objects.get(phone=phone)
                except Member.DoesNotExist:
                    pass
            
            if not member:
                return Response({
                    'error': 'User not found. Please register again.'
                }, status=status.HTTP_404_NOT_FOUND)
            
            profile = UserProfile.objects.get(member=member)
            
            if profile.phone_verified:
                refresh = RefreshToken.for_user(profile.user)
                return Response({
                    'message': 'Email already verified!',
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'user': {
                        'id': profile.user.id,
                        'username': profile.user.username,
                        'email': profile.user.email,
                        'name': profile.member.name,
                        'phone': profile.member.phone,
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
                return Response({
                    'error': 'OTP has expired. Please request a new one.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            profile.phone_verified = True
            profile.otp_code = None
            profile.otp_created_at = None
            profile.otp_attempts = 0
            profile.save()
            
            refresh = RefreshToken.for_user(profile.user)
            
            return Response({
                'message': 'Email verified successfully! 🎉',
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': profile.user.id,
                    'username': profile.user.username,
                    'email': profile.user.email,
                    'name': profile.member.name,
                    'phone': profile.member.phone,
                    'phone_verified': True,
                }
            }, status=status.HTTP_200_OK)
            
        except Member.DoesNotExist:
            return Response({
                'error': 'User not found. Please register again.'
            }, status=status.HTTP_404_NOT_FOUND)
        except UserProfile.DoesNotExist:
            return Response({
                'error': 'User profile not found. Please register again.'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            traceback.print_exc()
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ResendOTPView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            email = request.data.get('email')
            phone = request.data.get('phone')
            
            member = None
            if email:
                try:
                    member = Member.objects.get(email=email)
                except Member.DoesNotExist:
                    pass
            
            if not member and phone:
                try:
                    member = Member.objects.get(phone=phone)
                except Member.DoesNotExist:
                    pass
            
            if not member:
                return Response({
                    'error': 'User not found.'
                }, status=status.HTTP_404_NOT_FOUND)
            
            profile = UserProfile.objects.get(member=member)
            
            if profile.phone_verified:
                return Response({
                    'error': 'Email already verified. Please login.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            new_otp = generate_otp()
            success, method = send_otp(
                member.phone,
                member.email,
                new_otp,
                member.name
            )
            
            profile.otp_code = new_otp
            profile.otp_created_at = timezone.now()
            profile.otp_attempts = 0
            profile.save()
            
            return Response({
                'message': 'New OTP sent to your email!',
                'otp_sent': success,
                'method_used': method,
                'debug_otp': new_otp,
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            traceback.print_exc()
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            print(f"🔍 Getting profile for user: {request.user.username}")
            
            # Get or create profile
            profile, created = UserProfile.objects.get_or_create(
                user=request.user,
                defaults={
                    'phone_verified': True
                }
            )
            
            # Get or create member
            try:
                member = profile.member
            except Member.DoesNotExist:
                member = Member.objects.create(
                    user=request.user,
                    name=request.user.get_full_name() or request.user.username,
                    email=request.user.email,
                    phone='',
                    is_active=True
                )
                profile.member = member
                profile.save()
            
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
            print(f"❌ Error in ProfileView GET: {str(e)}")
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def put(self, request):
        """Full update - replaces entire resource"""
        return self._update_profile(request)
    
    def patch(self, request):
        """Partial update - updates only provided fields"""
        return self._update_profile(request)
    
    def _update_profile(self, request):
        try:
            print(f"📝 Updating profile for user: {request.user.username}")
            print(f"📝 Data: {request.data}")
            
            profile = UserProfile.objects.get(user=request.user)
            
            # Get or create member
            try:
                member = profile.member
            except Member.DoesNotExist:
                member = Member.objects.create(
                    user=request.user,
                    name=request.user.get_full_name() or request.user.username,
                    email=request.user.email,
                    phone='',
                    is_active=True
                )
                profile.member = member
                profile.save()
            
            # Handle profile picture upload
            if request.FILES and 'profile_pic' in request.FILES:
                print("📸 Uploading profile picture")
                member.profile_pic = request.FILES['profile_pic']
                member.save()
                # Return updated profile
                return self.get(request)
            
            # Update fields if provided
            data = request.data
            if 'name' in data:
                member.name = data['name']
            if 'phone' in data:
                member.phone = data['phone']
            if 'email' in data:
                member.email = data['email']
                # Also update user email
                if data['email']:
                    profile.user.email = data['email']
                    profile.user.save()
            if 'address' in data:
                member.address = data['address']
            
            member.save()
            profile.save()
            
            print(f"✅ Profile updated for: {member.name}")
            
            # Return updated profile
            return self.get(request)
            
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'User profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"❌ Error updating profile: {str(e)}")
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            username = request.data.get('username')
            password = request.data.get('password')
            
            if not username or not password:
                return Response({
                    'error': 'Username and password are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Authenticate user
            user = authenticate(username=username, password=password)
            
            if not user:
                return Response({
                    'error': 'Invalid credentials'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Get or create profile
            profile, created = UserProfile.objects.get_or_create(
                user=user,
                defaults={
                    'phone_verified': True
                }
            )
            
            # Get or create member
            try:
                member = profile.member
            except Member.DoesNotExist:
                member = Member.objects.create(
                    user=user,
                    name=user.get_full_name() or user.username,
                    email=user.email,
                    phone='',
                    is_active=True
                )
                profile.member = member
                profile.save()
            
            # Check if phone is verified (skip for existing users)
            if not profile.phone_verified:
                return Response({
                    'error': 'Please verify your email before logging in.',
                    'email_verified': False,
                    'email': user.email,
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Generate tokens
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
            print(f"❌ Error in LoginView: {str(e)}")
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
