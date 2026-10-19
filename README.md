# biometric-gate

Face ID / fingerprint **gate** for React Native (Expo): protect screens or re-lock on app resume.

This package does **not** replace `expo-local-authentication`. It adds the product layer on top:

- persisted **enabled** preference
- in-memory **unlocked** session
- **resume** lock (AppState + optional grace period)
- **screen** gate (`BiometricGate`)

## Install

```bash
npx expo install biometric-gate expo-local-authentication @react-native-async-storage/async-storage
```

Add the Local Authentication config plugin (Face ID usage string / Android permissions) in `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-local-authentication",
        {
          "faceIDPermission": "Allow $(PRODUCT_NAME) to use Face ID."
        }
      ]
    ]
  }
}
```

## Usage

```tsx
import { BiometricGate, BiometricLockProvider, useBiometricLock } from 'biometric-gate';

export default function App() {
  return (
    <BiometricLockProvider gracePeriodMs={30_000} lockOnResume>
      <RootNavigator />
    </BiometricLockProvider>
  );
}

function Settings() {
  const { enabled, enable, disable } = useBiometricLock();
  return (
    <Button
      title={enabled ? 'Disable lock' : 'Enable lock'}
      onPress={() => void (enabled ? disable() : enable())}
    />
  );
}

function VaultScreen() {
  return (
    <BiometricGate>
      <SecretContent />
    </BiometricGate>
  );
}
```

### Resume gate

With `lockOnResume` (default `true`), leaving the app clears the session after `gracePeriodMs` (default `0` = immediate). Put `BiometricGate` at the root (or a stack) to show a lock UI until `unlock()` succeeds.

### Screen gate

Wrap any sensitive screen in `<BiometricGate>`. Pass `fallback` for a custom lock screen.

## API

| Export | Role |
|--------|------|
| `BiometricLockProvider` | Session + preference + resume listener |
| `useBiometricLock()` | `enable` / `disable` / `lock` / `unlock` / state |
| `BiometricGate` | Renders children only when unlocked (or lock off) |
| `getBiometricCapability()` | Hardware / enrollment check |

## Requirements

- Expo SDK 52+ recommended (uses `expo-local-authentication`)
- iOS: Face ID / Touch ID enrolled for a real device test
- Android: fingerprint / biometric enrolled
