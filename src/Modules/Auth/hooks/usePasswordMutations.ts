import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import type { ChangePasswordRequest, ForgotPasswordRequest, ResetPasswordRequest, ApiResponse } from '../types/auth.types';

export const useChangePassword = () => {
  return useMutation<ApiResponse, Error, ChangePasswordRequest>({
    mutationFn: authService.changePassword,
  });
};

export const useForgotPassword = () => {
  return useMutation<ApiResponse, Error, ForgotPasswordRequest>({
    mutationFn: authService.forgotPassword,
  });
};

export const useResetPassword = () => {
  return useMutation<ApiResponse, Error, ResetPasswordRequest>({
    mutationFn: authService.resetPassword,
  });
};