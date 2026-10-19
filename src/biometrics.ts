import * as LocalAuthentication from 'expo-local-authentication';

import type { AuthenticateOptions, AuthenticateResult, BiometricCapability } from './types';

export async function getBiometricCapability(): Promise<BiometricCapability> {
  const [hasHardware, isEnrolled, securityLevel, supportedTypes] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
    LocalAuthentication.getEnrolledLevelAsync(),
    LocalAuthentication.supportedAuthenticationTypesAsync(),
  ]);

  return {
    hasHardware,
    isEnrolled,
    securityLevel,
    supportedTypes,
    available: hasHardware && isEnrolled,
  };
}

export async function authenticateWithBiometrics(
  options: AuthenticateOptions = {}
): Promise<AuthenticateResult> {
  const {
    promptMessage = 'Unlock',
    cancelLabel = 'Cancel',
    fallbackLabel,
    disableDeviceFallback = false,
  } = options;

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    cancelLabel,
    fallbackLabel,
    disableDeviceFallback,
  });

  if (result.success) {
    return { success: true };
  }

  return {
    success: false,
    error: result.error ?? 'authentication_failed',
    warning: result.warning,
  };
}
