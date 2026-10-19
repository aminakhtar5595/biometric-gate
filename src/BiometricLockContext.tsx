import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { authenticateWithBiometrics, getBiometricCapability } from './biometrics';
import { DEFAULT_STORAGE_KEY, readEnabled, writeEnabled } from './storage';
import type {
  AuthenticateOptions,
  AuthenticateResult,
  BiometricCapability,
  BiometricLockContextValue,
  BiometricLockProviderProps,
} from './types';

const BiometricLockContext = createContext<BiometricLockContextValue | null>(null);

export function BiometricLockProvider({
  children,
  gracePeriodMs = 0,
  lockOnResume = true,
  promptMessage = 'Unlock with biometrics',
  cancelLabel = 'Cancel',
  disableDeviceFallback = false,
  storageKey = DEFAULT_STORAGE_KEY,
  defaultEnabled = false,
}: BiometricLockProviderProps) {
  const [enabled, setEnabled] = useState(defaultEnabled);
  const [unlocked, setUnlocked] = useState(!defaultEnabled);
  const [busy, setBusy] = useState(false);
  const [capability, setCapability] = useState<BiometricCapability | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const backgroundedAt = useRef<number | null>(null);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const defaultAuthOptions = useMemo<AuthenticateOptions>(
    () => ({
      promptMessage,
      cancelLabel,
      disableDeviceFallback,
    }),
    [promptMessage, cancelLabel, disableDeviceFallback]
  );

  const refreshCapability = useCallback(async () => {
    const next = await getBiometricCapability();
    setCapability(next);
    return next;
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [stored, cap] = await Promise.all([readEnabled(storageKey), getBiometricCapability()]);
      if (cancelled) return;

      const isEnabled = stored ?? defaultEnabled;
      setCapability(cap);
      setEnabled(isEnabled);
      setUnlocked(!isEnabled);
      setHydrated(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [storageKey, defaultEnabled]);

  useEffect(() => {
    if (!lockOnResume || !hydrated) return;

    const onChange = (next: AppStateStatus) => {
      if (!enabledRef.current) return;

      if (next === 'background' || next === 'inactive') {
        if (backgroundedAt.current == null) {
          backgroundedAt.current = Date.now();
        }
        if (gracePeriodMs <= 0) {
          setUnlocked(false);
        }
        return;
      }

      if (next === 'active') {
        const started = backgroundedAt.current;
        backgroundedAt.current = null;
        if (started == null) return;

        const elapsed = Date.now() - started;
        if (elapsed >= gracePeriodMs) {
          setUnlocked(false);
        }
      }
    };

    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [lockOnResume, gracePeriodMs, hydrated]);

  const authenticate = useCallback(
    async (options?: AuthenticateOptions): Promise<AuthenticateResult> => {
      setBusy(true);
      try {
        const result = await authenticateWithBiometrics({
          ...defaultAuthOptions,
          ...options,
        });
        if (result.success) {
          setUnlocked(true);
        }
        return result;
      } finally {
        setBusy(false);
      }
    },
    [defaultAuthOptions]
  );

  const unlock = useCallback(
    async (options?: AuthenticateOptions) => {
      const result = await authenticate(options);
      return result.success;
    },
    [authenticate]
  );

  const lock = useCallback(() => {
    if (enabledRef.current) {
      setUnlocked(false);
    }
  }, []);

  const enable = useCallback(
    async (options?: AuthenticateOptions) => {
      setBusy(true);
      try {
        const cap = await refreshCapability();
        if (!cap.available) {
          return false;
        }

        const result = await authenticateWithBiometrics({
          ...defaultAuthOptions,
          promptMessage: options?.promptMessage ?? 'Enable biometric lock',
          ...options,
        });

        if (!result.success) {
          return false;
        }

        await writeEnabled(true, storageKey);
        setEnabled(true);
        setUnlocked(true);
        return true;
      } finally {
        setBusy(false);
      }
    },
    [defaultAuthOptions, refreshCapability, storageKey]
  );

  const disable = useCallback(
    async (options?: AuthenticateOptions & { requireAuth?: boolean }) => {
      const { requireAuth = false, ...authOptions } = options ?? {};
      setBusy(true);
      try {
        if (requireAuth) {
          const result = await authenticateWithBiometrics({
            ...defaultAuthOptions,
            promptMessage: authOptions.promptMessage ?? 'Disable biometric lock',
            ...authOptions,
          });
          if (!result.success) {
            return false;
          }
        }

        await writeEnabled(false, storageKey);
        setEnabled(false);
        setUnlocked(true);
        return true;
      } finally {
        setBusy(false);
      }
    },
    [defaultAuthOptions, storageKey]
  );

  const value = useMemo<BiometricLockContextValue>(
    () => ({
      enabled,
      unlocked,
      busy,
      capability,
      refreshCapability,
      enable,
      disable,
      lock,
      unlock,
      authenticate,
    }),
    [
      enabled,
      unlocked,
      busy,
      capability,
      refreshCapability,
      enable,
      disable,
      lock,
      unlock,
      authenticate,
    ]
  );

  return (
    <BiometricLockContext.Provider value={value}>{children}</BiometricLockContext.Provider>
  );
}

export function useBiometricLock(): BiometricLockContextValue {
  const ctx = useContext(BiometricLockContext);
  if (!ctx) {
    throw new Error('useBiometricLock must be used within a BiometricLockProvider');
  }
  return ctx;
}
