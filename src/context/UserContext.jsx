import React, { createContext, useState, useContext, useEffect } from 'react';
import * as authService from '../services/authService';

const UserContext = createContext();
const VALID_ROLES = new Set(['client', 'freelancer']);

const normalizeRole = (role) => {
  const normalized = String(role || '').trim().toLowerCase();
  return VALID_ROLES.has(normalized) ? normalized : null;
};

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUserState] = useState(null);

  const setUser = (data) => {
    if (data) {
      const role = normalizeRole(data.role);
      if (!role) {
        setUserState(null);
        return null;
      }

      const mapped = { ...data, role };
      mapped.photo = mapped.avatar || mapped.photo || `https://i.pravatar.cc/150?u=${mapped.email || 'user'}`;
      setUserState(mapped);
      return mapped;
    } else {
      setUserState(null);
      return null;
    }
  };

  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const token = localStorage.getItem('freelancepro_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await authService.getMe();
      if (res.success && res.data) {
        if (!setUser(res.data)) {
          localStorage.removeItem('freelancepro_token');
        }
      } else {
        localStorage.removeItem('freelancepro_token');
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error.message);
      localStorage.removeItem('freelancepro_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      if (res.success && res.data.token) {
        const authenticatedUser = setUser(res.data);
        if (!authenticatedUser) {
          return { success: false, message: 'This account has an invalid role.' };
        }
        localStorage.setItem('freelancepro_token', res.data.token);
        // The login response establishes state immediately; /me then refreshes it
        // from the authenticated database user without delaying route selection.
        void loadUser();
        return { success: true, role: authenticatedUser.role };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (error) {
      return { success: false, message: error.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName, email, password, role) => {
    setLoading(true);
    try {
      const res = await authService.register(fullName, email, password, role);
      return res;
    } catch (error) {
      return { success: false, message: error.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout API failed:', err.message);
    } finally {
      localStorage.removeItem('freelancepro_token');
      sessionStorage.removeItem('freelancepro_selected_role');
      setUser(null);
      setLoading(false);
    }
  };

  const updateUser = async (updates) => {
    try {
      const res = await authService.updateMe(updates);
      if (res.success) {
        const updatedUser = setUser(res.data);
        return updatedUser
          ? { success: true, role: updatedUser.role }
          : { success: false, message: 'Profile contains an invalid role.' };
      }
      return { success: false, message: res.message || 'Profile update failed' };
    } catch (error) {
      return { success: false, message: error.message || 'Profile update failed' };
    }
  };

  return (
    <UserContext.Provider value={{
      user,
      login,
      register,
      logout,
      updateUser,
      loadUser,
      isAuthenticated: !!user,
      loading
    }}>
      {children}
    </UserContext.Provider>
  );
};
