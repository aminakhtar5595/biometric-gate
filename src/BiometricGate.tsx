import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useBiometricLock } from './BiometricLockContext';
import type { BiometricGateProps, BiometricLockContextValue } from './types';

function DefaultFallback({ ctx }: { ctx: BiometricLockContextValue }) {
  return (
    <View style={styles.fallback} accessibilityRole="summary">
      <Text style={styles.title}>Locked</Text>
      <Text style={styles.subtitle}>Authenticate to continue</Text>
      <Pressable
        style={[styles.button, ctx.busy && styles.buttonDisabled]}
        disabled={ctx.busy}
        onPress={() => {
          void ctx.unlock();
        }}
      >
        {ctx.busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonLabel}>Unlock</Text>
        )}
      </Pressable>
    </View>
  );
}

function renderFallback(
  fallback: BiometricGateProps['fallback'],
  ctx: BiometricLockContextValue
): ReactNode {
  if (fallback == null) {
    return <DefaultFallback ctx={ctx} />;
  }
  if (typeof fallback === 'function') {
    return fallback(ctx);
  }
  return fallback;
}

/**
 * Screen / route gate. Renders children only when lock is off or the session is unlocked.
 */
export function BiometricGate({ children, fallback, active = true }: BiometricGateProps) {
  const ctx = useBiometricLock();

  if (!active || !ctx.enabled || ctx.unlocked) {
    return <>{children}</>;
  }

  return <>{renderFallback(fallback, ctx)}</>;
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#111',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#aaa',
    marginBottom: 24,
  },
  button: {
    minWidth: 140,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2f6fed',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
