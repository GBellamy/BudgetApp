import AsyncStorage from '@react-native-async-storage/async-storage';

// Default to localhost for development - configurable from settings
export const DEFAULT_API_URL = 'http://192.168.1.100:3000';

export async function getApiUrl(): Promise<string> {
  try {
    const stored = await AsyncStorage.getItem('api_url');
    return stored || DEFAULT_API_URL;
  } catch {
    return DEFAULT_API_URL;
  }
}

export async function setApiUrl(url: string): Promise<void> {
  await AsyncStorage.setItem('api_url', url);
}
