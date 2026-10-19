import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_KEY = '@biometric-gate/enabled';

export async function readEnabled(storageKey: string = DEFAULT_KEY): Promise<boolean | null> {
  const value = await AsyncStorage.getItem(storageKey);
  if (value === null) return null;
  return value === 'true';
}

export async function writeEnabled(
  enabled: boolean,
  storageKey: string = DEFAULT_KEY
): Promise<void> {
  await AsyncStorage.setItem(storageKey, enabled ? 'true' : 'false');
}

export { DEFAULT_KEY as DEFAULT_STORAGE_KEY };
