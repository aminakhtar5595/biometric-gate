import type { ReactNode } from 'react';
import type { AuthenticationType, SecurityLevel } from 'expo-local-authentication';

export type BiometricCapability = {
  /** Hardware supports biometrics and user has enrolled. */
  available: boolean;
  /** Whether a device passcode/PIN can be used as fallback by the OS. */
  hasHardware: boolean;
  isEnrolled: boolean;
  securityLevel: SecurityLevel;
  supportedTypes: AuthenticationType[];
};

export type AuthenticateOptions = {
  promptMessage?: string;
  cancelLabel?: string;
  fallbackLabel?: string;
  /** When true, OS device passcode is not offered as fallback. */
  disableDeviceFallback?: boolean;
};

export type AuthenticateResult =
  | { success: true }
  | { success: false; error: string; warning?: string };

export type BiometricLockContextValue = {
  /** User preference: lock is turned on. Persisted. */
  enabled: boolean;
  /** Current session unlocked after a successful challenge. In-memory only. */
  unlocked: boolean;
  /** True while enable/disable/unlock prompts are in flight. */
  busy: boolean;
  /** Last known device capability snapshot. */
  capability: BiometricCapability | null;
  /** Re-check hardware / enrollment. */
  refreshCapability: () => Promise<BiometricCapability>;
  /** Opt in: challenge once, then persist enabled and unlock session. */
  enable: (options?: AuthenticateOptions) => Promise<boolean>;
  /** Opt out: optional challenge, then clear preference and unlock session. */
  disable: (options?: AuthenticateOptions & { requireAuth?: boolean }) => Promise<boolean>;
  /** Mark session locked without changing preference. */
  lock: () => void;
  /** Run biometric prompt; on success mark session unlocked. */
  unlock: (options?: AuthenticateOptions) => Promise<boolean>;
  /** Alias of unlock — useful from custom lock screens. */
  authenticate: (options?: AuthenticateOptions) => Promise<AuthenticateResult>;
};

export type BiometricLockProviderProps = {
  children: ReactNode;
  /**
   * When lock is enabled, clear the session after this many ms in background.
   * `0` locks immediately on background. Default: `0`.
   */
  gracePeriodMs?: number;
  /** When true (default), AppState background/inactive applies the resume gate. */
  lockOnResume?: boolean;
  /** Default prompt copy for enable / unlock / resume. */
  promptMessage?: string;
  /** Default cancel button label. */
  cancelLabel?: string;
  /** Passed through to LocalAuthentication unless overridden per call. */
  disableDeviceFallback?: boolean;
  /** AsyncStorage key for the enabled preference. */
  storageKey?: string;
  /** Seed enabled before storage is read (uncontrolled). */
  defaultEnabled?: boolean;
};

export type BiometricGateProps = {
  children: ReactNode;
  /**
   * Shown while the session is locked (and lock is enabled).
   * Defaults to a minimal unlock button.
   */
  fallback?: ReactNode | ((ctx: BiometricLockContextValue) => ReactNode);
  /** When false, children render even if locked (gate is inert). Default true. */
  active?: boolean;
};
