import { NativeModule, requireNativeModule } from 'expo';

declare class BiometricGateModule extends NativeModule<{
  /** Native package presence check — biometrics themselves use expo-local-authentication. */
  getNativeVersion(): string;
}> {
  getNativeVersion(): string;
}

export default requireNativeModule<BiometricGateModule>('BiometricGate');
