import random
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings

def generate_otp():
    return ''.join(random.choices('0123456789', k=6))

def send_otp(phone_number, email, otp, name):
    """
    Send OTP via real email
    """
    try:
        html_message = render_to_string('email/otp_email.html', {
            'name': name or 'User',
            'otp': otp,
        })
        
        send_mail(
            '🔐 PAYAT - Your Verification Code',
            f'Your OTP is: {otp}',
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
            html_message=html_message,
        )
        print(f"✅ Real email sent to {email}")
        return True, 'email'
    except Exception as e:
        print(f"❌ Email failed: {e}")
        return False, 'console'
