export { BiometricGate } from './BiometricGate';
export { BiometricLockProvider, useBiometricLock } from './BiometricLockContext';
export { authenticateWithBiometrics, getBiometricCapability } from './biometrics';
export { DEFAULT_STORAGE_KEY } from './storage';

export type {
  AuthenticateOptions,
  AuthenticateResult,
  BiometricCapability,
  BiometricGateProps,
  BiometricLockContextValue,
  BiometricLockProviderProps,
} from './types';

/** Optional native module handle (version probe). Prefer the React APIs above. */
export { default as BiometricGateNativeModule } from './BiometricGateModule';
