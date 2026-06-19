import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    const emailFromState = location.state?.email;
    const emailFromSession = sessionStorage.getItem('registration_email');
    
    if (emailFromState) {
      setEmail(emailFromState);
    } else if (emailFromSession) {
      setEmail(emailFromSession);
    } else {
      toast.error('Email not found. Please register again.');
      navigate('/register');
      return;
    }

    const timerInterval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timerInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeout(() => {
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, 100);

    return () => clearInterval(timerInterval);
  }, []);

  // ✅ If user is already logged in, redirect to home
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\s/g, '').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const otpArray = pastedData.split('');
      const newOtp = [...otp];
      otpArray.forEach((digit, i) => {
        if (i < 6) newOtp[i] = digit;
      });
      setOtp(newOtp);
      const lastIndex = Math.min(otpArray.length - 1, 5);
      if (inputRefs.current[lastIndex]) {
        inputRefs.current[lastIndex].focus();
      }
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      console.log('📤 Verifying OTP for:', email);
      
      const response = await api.post('/auth/verify-otp/', {
        email: email,
        otp: otpCode,
      });

      console.log('✅ Verification response:', response.data);

      if (response.data.access) {
        // ✅ Store tokens
        localStorage.setItem('accessToken', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
        
        // ✅ Set authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
        
        // ✅ Store user data
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        toast.success('Email verified successfully! 🎉');
        sessionStorage.removeItem('registration_email');
        
        // ✅ Navigate to home page
        navigate('/');
        
        // ✅ Reload page to refresh auth state
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        toast.error('Verification failed. Please try again.');
      }
    } catch (error) {
      console.error('❌ Verification error:', error);
      const errorMessage = error.response?.data?.error || 'Invalid OTP. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setResendLoading(true);
    try {
      const response = await api.post('/auth/resend-otp/', {
        email: email,
      });
      
      console.log('📤 Resend response:', response.data);
      
      toast.success('New OTP sent to your email!');
      
      setTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } catch (error) {
      console.error('❌ Resend error:', error);
      toast.error('Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
            <span className="text-3xl font-bold text-white">📧</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Verify Your Email</h1>
          <p className="text-sm text-gray-500 mt-1">
            We've sent a 6-digit code to <br />
            <span className="font-semibold text-gray-700">{email}</span>
          </p>
          <p className="text-xs text-gray-400 mt-2">
            📧 Check your inbox (and spam folder)
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
              />
            ))}
          </div>

          <button
            onClick={handleVerify}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors duration-200"
          >
            {loading ? 'Verifying...' : 'Verify & Login'}
          </button>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              {canResend ? (
                <button
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="text-indigo-600 font-medium hover:text-indigo-700 disabled:opacity-50"
                >
                  {resendLoading ? 'Sending...' : 'Resend OTP'}
                </button>
              ) : (
                <span>
                  Resend code in <span className="font-semibold text-gray-700">{timer}s</span>
                </span>
              )}
            </p>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/register')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to Registration
            </button>
          </div>

          <div className="mt-6 p-3 bg-blue-50 rounded-xl">
            <p className="text-xs text-blue-600 text-center">
              💡 You'll be automatically logged in after verification
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
