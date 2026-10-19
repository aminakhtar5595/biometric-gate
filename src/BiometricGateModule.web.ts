import { NativeModule, registerWebModule } from 'expo';

class BiometricGateModule extends NativeModule<{
  getNativeVersion(): string;
}> {
  getNativeVersion(): string {
    return 'web';
  }
}

export default registerWebModule(BiometricGateModule, 'BiometricGate');
