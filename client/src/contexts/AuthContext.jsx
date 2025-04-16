import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // API is imported from services/api.js

  // Check if token is valid on load
  useEffect(() => {
    const checkToken = async () => {
      console.log('Checking token:', token ? 'Token exists' : 'No token');
      if (token) {
        try {
          // Check if token is expired
          const decodedToken = jwtDecode(token);
          console.log('Decoded token:', decodedToken);
          const currentTime = Date.now() / 1000;

          if (decodedToken.exp < currentTime) {
            // Token expired
            console.log('Token expired');
            logout();
          } else {
            // Token valid, get user data
            console.log('Token valid, getting user data');
            try {
              const response = await authAPI.getProfile();
              console.log('User data:', response.data);
              setUser(response.data);
              setIsSignedIn(true);
            } catch (profileError) {
              console.error('Error getting user profile:', profileError);
              // Don't logout here, just set isSignedIn to false
              setIsSignedIn(false);
            }
          }
        } catch (error) {
          console.error('Error validating token:', error);
          logout();
        }
      }
      setIsLoaded(true);
    };

    checkToken();
  }, [token]);

  // Register a new user
  const register = async (username, email, password) => {
    try {
      const response = await authAPI.register(username, email, password);

      const { token: newToken, ...userData } = response.data;

      // Save token to localStorage
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      setIsSignedIn(true);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      console.log('Login response:', response.data);

      const { token: newToken, ...userData } = response.data;

      // Save token to localStorage
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      setIsSignedIn(true);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsSignedIn(false);
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const response = await authAPI.updateProfile(userData);
      setUser(response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await authAPI.changePassword(currentPassword, newPassword);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Update profile photo
  const updateProfilePhoto = async (formData) => {
    try {
      // Log the formData for debugging
      console.log('Updating profile photo with:', formData);

      // Extract photoUrl from formData if it exists
      const photoUrl = formData.get('photoUrl');

      // If we have a photoUrl from the preview, use it directly
      if (photoUrl) {
        // Create a simple object instead of FormData
        const response = await authAPI.updateProfilePhoto({ photoUrl });
        setUser(response.data);
        return response.data;
      } else {
        // Otherwise, try to send the FormData (this would require proper server-side handling)
        const response = await authAPI.updateProfilePhoto(formData);
        setUser(response.data);
        return response.data;
      }
    } catch (error) {
      console.error('Error in updateProfilePhoto:', error);
      throw error;
    }
  };

  // Delete profile photo
  const deleteProfilePhoto = async () => {
    try {
      const response = await authAPI.deleteProfilePhoto();
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error('Error in deleteProfilePhoto:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoaded,
        isSignedIn,
        register,
        login,
        logout,
        updateProfile,
        changePassword,
        updateProfilePhoto,
        deleteProfilePhoto
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
