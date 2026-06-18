from rest_framework import status, generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from .serializers import RegisterSerializer, UserProfileSerializer
from .models import UserProfile
from members.models import Member
from .utils import generate_otp, send_otp
import traceback

# ==================== REGISTER VIEW ====================
class RegisterView(generics.CreateAPIView):
    """
    Register a new user with OTP verification
    """
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
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
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ==================== VERIFY OTP VIEW ====================
class VerifyOTPView(APIView):
    """
    Verify user's OTP and login
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            email = request.data.get('email')
            phone = request.data.get('phone')
            otp = request.data.get('otp')

            if not otp:
                return Response({'error': 'OTP is required'}, status=status.HTTP_400_BAD_REQUEST)

            member = self._get_member(email, phone)
            if not member:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

            profile = UserProfile.objects.get(member=member)

            if profile.phone_verified:
                return self._login_response(profile.user, 'Email already verified!')

            if profile.otp_code != otp:
                profile.otp_attempts += 1
                profile.save()
                remaining = 5 - profile.otp_attempts
                return Response({
                    'error': f'Invalid OTP. {remaining} attempts remaining.'
                }, status=status.HTTP_400_BAD_REQUEST)

            if profile.otp_created_at and (timezone.now() - profile.otp_created_at) > timedelta(minutes=5):
                return Response({'error': 'OTP has expired'}, status=status.HTTP_400_BAD_REQUEST)

            profile.phone_verified = True
            profile.otp_code = None
            profile.otp_created_at = None
            profile.otp_attempts = 0
            profile.save()

            return self._login_response(profile.user, 'Email verified successfully! 🎉')

        except Member.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except UserProfile.DoesNotExist:
            return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _get_member(self, email, phone):
        """Helper to find member by email or phone"""
        if email:
            try:
                return Member.objects.get(email=email)
            except Member.DoesNotExist:
                pass
        if phone:
            try:
                return Member.objects.get(phone=phone)
            except Member.DoesNotExist:
                pass
        return None

    def _login_response(self, user, message):
        """Helper to generate login response"""
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': message,
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


# ==================== RESEND OTP VIEW ====================
class ResendOTPView(APIView):
    """
    Resend OTP to user's email/phone
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            email = request.data.get('email')
            phone = request.data.get('phone')

            member = self._get_member(email, phone)
            if not member:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

            profile = UserProfile.objects.get(member=member)

            if profile.phone_verified:
                return Response({'error': 'Already verified'}, status=status.HTTP_400_BAD_REQUEST)

            new_otp = generate_otp()
            success, method = send_otp(member.phone, member.email, new_otp, member.name)

            profile.otp_code = new_otp
            profile.otp_created_at = timezone.now()
            profile.otp_attempts = 0
            profile.save()

            return Response({
                'message': 'New OTP sent!',
                'otp_sent': success,
                'method_used': method,
                'debug_otp': new_otp,
            }, status=status.HTTP_200_OK)

        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _get_member(self, email, phone):
        """Helper to find member by email or phone"""
        if email:
            try:
                return Member.objects.get(email=email)
            except Member.DoesNotExist:
                pass
        if phone:
            try:
                return Member.objects.get(phone=phone)
            except Member.DoesNotExist:
                pass
        return None


# ==================== PROFILE VIEW ====================
class ProfileView(generics.RetrieveUpdateAPIView):
    """
    Get and update user profile
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        """Get or create profile for current user"""
        profile, _ = UserProfile.objects.get_or_create(
            user=self.request.user,
            defaults={'phone_verified': True}
        )
        self._ensure_member(profile)
        return profile

    def _ensure_member(self, profile):
        """Ensure member exists for profile"""
        if not hasattr(profile, 'member'):
            member = Member.objects.create(
                user=profile.user,
                name=profile.user.get_full_name() or profile.user.username,
                email=profile.user.email,
                phone='',
                is_active=True
            )
            profile.member = member
            profile.save()
        return profile.member

    def retrieve(self, request, *args, **kwargs):
        """Get profile with additional member data"""
        try:
            profile = self.get_object()
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

    def update(self, request, *args, **kwargs):
        """Update profile with file upload support"""
        try:
            profile = self.get_object()
            member = profile.member

            # Handle file upload
            if request.FILES and 'profile_pic' in request.FILES:
                member.profile_pic = request.FILES['profile_pic']
                member.save()
                return self.retrieve(request)

            # Handle text fields
            data = request.data
            if 'name' in data:
                member.name = data['name']
            if 'phone' in data:
                member.phone = data['phone']
            if 'email' in data:
                member.email = data['email']
                if data['email']:
                    profile.user.email = data['email']
                    profile.user.save()
            if 'address' in data:
                member.address = data['address']

            member.save()
            profile.save()
            return self.retrieve(request)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== LOGIN VIEW ====================
class LoginView(APIView):
    """
    Login user and return JWT tokens
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            username = request.data.get('username')
            password = request.data.get('password')

            if not username or not password:
                return Response({
                    'error': 'Username and password are required'
                }, status=status.HTTP_400_BAD_REQUEST)

            user = authenticate(username=username, password=password)
            if not user:
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

            profile, _ = UserProfile.objects.get_or_create(
                user=user,
                defaults={'phone_verified': True}
            )

            if not hasattr(profile, 'member'):
                Member.objects.create(
                    user=user,
                    name=user.get_full_name() or user.username,
                    email=user.email,
                    phone='',
                    is_active=True
                )

            if not profile.phone_verified:
                return Response({
                    'error': 'Please verify your email before logging in.',
                    'email_verified': False,
                    'email': user.email,
                }, status=status.HTTP_403_FORBIDDEN)

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
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
