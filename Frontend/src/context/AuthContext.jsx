import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import {
  login as apiLogin,
  googleLogin as apiGoogleLogin,
  register as apiRegister,
  registerPartner as apiRegisterPartner,
  verifyOtp as apiVerifyOtp,
  resendOtp as apiResendOtp,
  forgotPassword as apiForgotPassword,
  verifyResetOtp as apiVerifyResetOtp,
  resetPassword as apiResetPassword,
  changePassword as apiChangePassword,
  sendEmailVerification as apiSendEmailVerification,
  verifyEmail as apiVerifyEmail,
  getMe,
  logout as apiLogout,
} from '../api/authApi';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  // 'user' | 'partner' — which panel the user selected
  const [authMode, setAuthMode] = useState('user');

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await getMe();
        if (res.success && res.data) {
          setCurrentUser(res.data);
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Only wipe if token was invalid and refresh also failed
        if (token) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        }
        setCurrentUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Compute the correct post-login redirect path based on user role.
   */
  const getPostLoginPath = useCallback((user) => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'partner') return '/partner';
    return '/profile';
  }, []);

  /**
   * Handle everything after a successful login/register response.
   */
  const handleAuthSuccess = useCallback((userData) => {
    if (userData.token) {
      localStorage.setItem('token', userData.token);
    }
    if (userData.refreshToken) {
      localStorage.setItem('refreshToken', userData.refreshToken);
    }
    setCurrentUser(userData);
    setIsAuthenticated(true);
    setAuthModalOpen(false);
    setAuthError(null);
  }, []);

  const login = async (credentials) => {
    try {
      setAuthError(null);
      const res = await apiLogin(credentials);
      if (res.success) {
        handleAuthSuccess(res.data);
        if (pendingAction) {
          pendingAction();
          setPendingAction(null);
        }
        return { success: true, user: res.data, redirectTo: getPostLoginPath(res.data) };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (error) {
      const respData = error.response?.data;
      if (respData?.requiresVerification || respData?.code === 'ACCOUNT_NOT_VERIFIED') {
        return {
          success: false,
          requiresVerification: true,
          email: respData?.data?.email || credentials.email,
          message: respData.message || 'Please verify your email address to log in.',
        };
      }
      const msg = respData?.message || error.message || 'Login failed. Please try again.';
      setAuthError(msg);
      return { success: false, message: msg };
    }
  };

  const loginWithGoogle = async ({ credential, role = 'user' }) => {
    try {
      setAuthError(null);
      const res = await apiGoogleLogin({ credential, role });
      if (res.success) {
        handleAuthSuccess(res.data);
        if (pendingAction) {
          pendingAction();
          setPendingAction(null);
        }
        return { success: true, user: res.data, redirectTo: getPostLoginPath(res.data) };
      }
      return { success: false, message: res.message || 'Google Sign-In failed.' };
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Google Sign-In failed. Please try again.';
      setAuthError(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    try {
      setAuthError(null);
      const res = await apiRegister(userData);
      if (res.success) {
        if (res.data?.requiresVerification) {
          return {
            success: true,
            requiresVerification: true,
            email: res.data.email,
            message: res.message,
            devOtp: res.data.devOtp,
          };
        }
        handleAuthSuccess(res.data);
        return { success: true, user: res.data, redirectTo: getPostLoginPath(res.data) };
      }
      return { success: false, message: res.message || 'Registration failed.' };
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed. Please try again.';
      setAuthError(msg);
      return { success: false, message: msg };
    }
  };

  const registerPartnerAccount = async (partnerData) => {
    try {
      setAuthError(null);
      const res = await apiRegisterPartner(partnerData);
      if (res.success) {
        if (res.data?.requiresVerification) {
          return {
            success: true,
            requiresVerification: true,
            email: res.data.email,
            message: res.message,
            devOtp: res.data.devOtp,
          };
        }
        handleAuthSuccess(res.data);
        return { success: true, user: res.data, redirectTo: '/partner' };
      }
      const msg = res.message || 'Partner registration failed.';
      setAuthError(msg);
      return { success: false, message: msg };
    } catch (error) {
      const msg = error.response?.data?.message || 'Partner registration failed. Please try again.';
      setAuthError(msg);
      return { success: false, message: msg };
    }
  };

  const verifyOtp = async (payload) => {
    try {
      setAuthError(null);
      const res = await apiVerifyOtp(payload);
      if (res.success) {
        if (res.data?.token) {
          handleAuthSuccess(res.data);
        }
        return { success: true, data: res.data, message: res.message };
      }
      return { success: false, message: res.message || 'Verification failed.' };
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Verification failed.';
      setAuthError(msg);
      return { success: false, message: msg };
    }
  };

  const resendOtp = async (payload) => {
    try {
      const res = await apiResendOtp(payload);
      return res;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to resend code.';
      return { success: false, message: msg };
    }
  };

  const forgotPassword = async (payload) => {
    try {
      const res = await apiForgotPassword(payload);
      return res;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to process request.';
      return { success: false, message: msg };
    }
  };

  const verifyResetOtp = async (payload) => {
    try {
      const res = await apiVerifyResetOtp(payload);
      return res;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Invalid or expired OTP.';
      return { success: false, message: msg };
    }
  };

  const resetPassword = async (payload) => {
    try {
      const res = await apiResetPassword(payload);
      return res;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Password reset failed.';
      return { success: false, message: msg };
    }
  };

  const changePassword = async (payload) => {
    try {
      const res = await apiChangePassword(payload);
      if (res.success && res.data?.token) {
        handleAuthSuccess({ ...currentUser, ...res.data });
      }
      return res;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to change password.';
      return { success: false, message: msg };
    }
  };

  const sendEmailVerification = async () => {
    try {
      return await apiSendEmailVerification();
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to send verification email.';
      return { success: false, message: msg };
    }
  };

  const verifyEmail = async (payload) => {
    try {
      const res = await apiVerifyEmail(payload);
      if (res.success) {
        setCurrentUser((prev) => (prev ? { ...prev, isEmailVerified: true } : prev));
      }
      return res;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to verify email.';
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('discovery_active_trip');
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  };

  const requireAuth = (callback) => {
    if (isAuthenticated) {
      if (callback) callback();
    } else {
      if (callback) setPendingAction(() => callback);
      setAuthModalOpen(true);
    }
  };

  const openPartnerAuth = () => {
    setAuthMode('partner');
    setAuthModalOpen(true);
  };

  const updateUser = (updatedData) => {
    setCurrentUser((prev) => ({ ...prev, ...updatedData }));
  };

  const value = {
    currentUser,
    user: currentUser,
    isAuthenticated,
    isLoading,
    role: currentUser?.role || null,
    isEmailVerified: Boolean(currentUser?.isEmailVerified),
    isMobileVerified: Boolean(currentUser?.isMobileVerified),
    login,
    loginWithGoogle,
    register,
    registerPartnerAccount,
    verifyOtp,
    resendOtp,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    changePassword,
    sendEmailVerification,
    verifyEmail,
    logout,
    updateUser,
    authModalOpen,
    setAuthModalOpen,
    authError,
    setAuthError,
    requireAuth,
    authMode,
    setAuthMode,
    openPartnerAuth,
    getPostLoginPath,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
