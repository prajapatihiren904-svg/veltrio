import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import { TOKEN_STORAGE_KEY } from '@/constants/app';

import { authService } from '@/services/authService';
import { registerUnauthorizedHandler } from '@/services/apiClient';

import { storage } from '@/utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(
    ({ redirect = false } = {}) => {
      storage.remove(TOKEN_STORAGE_KEY);

      setUser(null);
      setLoading(false);

      if (redirect) {
        navigate('/login', { replace: true });
      }
    },
    [navigate]
  );

  useEffect(() => {
    return registerUnauthorizedHandler(
      () => clearSession({ redirect: true })
    );
  }, [clearSession]);

  useEffect(() => {
    let active = true;

    const token = storage.get(TOKEN_STORAGE_KEY);

    if (!token) {
      setLoading(false);

      return () => {
        active = false;
      };
    }

    authService
      .me()
      .then((currentUser) => {
        if (active) {
          setUser(currentUser);
        }
      })
      .catch(() => {
        if (active) {
          clearSession();
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [clearSession]);

  const establishSession = useCallback((result) => {
    storage.set(TOKEN_STORAGE_KEY, result.token);

    setUser(result.user);

    return result.user;
  }, []);

  // Registration only sends OTP. It does not establish a session.
  const register = useCallback(
    async (payload) => authService.register(payload),
    []
  );

  const verifyEmail = useCallback(
    async (payload) => {
      const result = await authService.verifyEmail(payload);

      establishSession(result);

      return result.user;
    },
    [establishSession]
  );

  const login = useCallback(
    async (payload, expectedRole) => {
      const result = await authService.login(payload);

      if (
        expectedRole &&
        result.user.role !== expectedRole
      ) {
        throw new Error(
          expectedRole === 'user'
            ? 'Administrator accounts must sign in using the Admin Login tab.'
            : 'This account does not have administrator access.'
        );
      }

      return establishSession(result);
    },
    [establishSession]
  );

  const updateUser = useCallback((updatedUser) => {
    setUser((currentUser) => ({
      ...currentUser,
      ...updatedUser,
    }));
  }, []);

  const logout = useCallback(async () => {
    try {
      if (storage.get(TOKEN_STORAGE_KEY)) {
        await authService.logout();
      }
    } catch {
      // Local logout is still performed if the API is unreachable.
    } finally {
      clearSession();

      navigate('/login', { replace: true });
    }
  }, [clearSession, navigate]);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),

      register,
      verifyEmail,
      login,
      logout,

      clearSession,
      updateUser,
      establishSession,
    }),
    [
      user,
      loading,
      register,
      verifyEmail,
      login,
      logout,
      clearSession,
      updateUser,
      establishSession,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within AuthProvider'
    );
  }

  return context;
}