import random
import string
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings

def generate_otp():
    """Generate 6-digit OTP"""
    return ''.join(random.choices(string.digits, k=6))

def send_otp_via_email(email_address, otp_code, name='User'):
    """
    Send OTP via Email - REAL EMAIL
    """
    try:
        # Try to use HTML template
        try:
            html_message = render_to_string('email/otp_email.html', {
                'name': name,
                'otp': otp_code,
            })
        except:
            html_message = None
        
        # Plain text fallback
        plain_message = f'''
PAYAT - Your Verification Code

Hello {name},

Your PAYAT verification code is: {otp_code}

⏱️ This code will expire in 5 minutes.
🔒 Please do not share this code with anyone.

Enter this code to verify your account.

If you didn't request this code, please ignore this email.

---
Thanks,
PAYAT Team
'''
        
        subject = '🔐 PAYAT - Your Verification Code'
        
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [email_address],
            fail_silently=False,
            html_message=html_message,
        )
        
        print(f"✅ Real email sent to {email_address}")
        return True
        
    except Exception as e:
        print(f"❌ Email error: {e}")
        # Fallback: Print OTP to console
        print(f"📱 [FALLBACK] OTP for {email_address}: {otp_code}")
        return False

def send_otp(phone, email, otp, name='User'):
    """
    Main function - Send OTP via Real Email
    """
    success = send_otp_via_email(email, otp, name)
    
    if success:
        return True, 'email'
    
    # Always show in console for debugging
    print(f"📱 [DEBUG] OTP for {email}: {otp}")
    return True, 'debug'
