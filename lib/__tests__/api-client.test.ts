import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// We need to test the interceptors, so we import the real module
// but mock its dependencies
describe('api-client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be an axios instance with interceptors', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const apiClient = require('../api-client').default;
    expect(apiClient).toBeDefined();
    expect(apiClient.interceptors).toBeDefined();
    expect(apiClient.interceptors.request).toBeDefined();
    expect(apiClient.interceptors.response).toBeDefined();
  });

  it('should export default instance', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const apiClient = require('../api-client').default;
    expect(typeof apiClient.get).toBe('function');
    expect(typeof apiClient.post).toBe('function');
    expect(typeof apiClient.put).toBe('function');
    expect(typeof apiClient.delete).toBe('function');
  });

  describe('secure storage helpers', () => {
    it('getToken should call SecureStore.getItemAsync', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('my-token');
      const { getToken } = require('../secure-storage');
      const result = await getToken();
      expect(result).toBe('my-token');
    });

    it('setToken should call SecureStore.setItemAsync', async () => {
      const { setToken } = require('../secure-storage');
      await setToken('new-token');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('auth_token', 'new-token');
    });

    it('deleteToken should call SecureStore.deleteItemAsync', async () => {
      const { deleteToken } = require('../secure-storage');
      await deleteToken();
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
    });
  });

  describe('API URL config', () => {
    it('getApiUrl should return stored URL or default', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('https://custom.url');
      const { getApiUrl } = require('../../constants/api');
      const url = await getApiUrl();
      expect(url).toBe('https://custom.url');
    });

    it('getApiUrl should return default when nothing stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
      const { getApiUrl, DEFAULT_API_URL } = require('../../constants/api');
      const url = await getApiUrl();
      expect(url).toBe(DEFAULT_API_URL);
    });
  });
});
