import * as SecureStore from 'expo-secure-store';

const mockGet = jest.fn();
const mockPost = jest.fn();
jest.mock('../../lib/api-client', () => ({
  __esModule: true,
  default: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
  },
}));

import { useAuthStore } from '../auth-store';

describe('auth-store', () => {
  beforeEach(() => {
    // Reset store between tests
    useAuthStore.setState({ user: null, token: null, isLoading: true });
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should set user and token on successful login', async () => {
      const user = { id: 1, username: 'user1', display_name: 'User 1' };
      mockPost.mockResolvedValueOnce({ data: { token: 'jwt-token', user } });

      await useAuthStore.getState().login('user1', 'password123');

      const state = useAuthStore.getState();
      expect(state.user).toEqual(user);
      expect(state.token).toBe('jwt-token');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('auth_token', 'jwt-token');
    });

    it('should throw on failed login', async () => {
      mockPost.mockRejectedValueOnce(new Error('401'));

      await expect(
        useAuthStore.getState().login('user1', 'wrong')
      ).rejects.toThrow();

      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  describe('logout', () => {
    it('should clear user, token and delete stored token', async () => {
      useAuthStore.setState({ user: { id: 1, username: 'user1', display_name: 'User 1' }, token: 'jwt-token' });

      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
    });
  });

  describe('hydrate', () => {
    it('should restore user from stored token', async () => {
      const user = { id: 1, username: 'user1', display_name: 'User 1' };
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('stored-token');
      mockGet.mockResolvedValueOnce({ data: user });

      await useAuthStore.getState().hydrate();

      const state = useAuthStore.getState();
      expect(state.user).toEqual(user);
      expect(state.token).toBe('stored-token');
      expect(state.isLoading).toBe(false);
    });

    it('should set isLoading false when no stored token', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);

      await useAuthStore.getState().hydrate();

      expect(useAuthStore.getState().isLoading).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
    });

    it('should clear state and token on hydration error', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('bad-token');
      mockGet.mockRejectedValueOnce(new Error('401'));

      await useAuthStore.getState().hydrate();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
    });
  });
});
