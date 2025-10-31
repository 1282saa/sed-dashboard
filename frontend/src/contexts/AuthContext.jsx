import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

// AuthContext 생성
const AuthContext = createContext(null);

/**
 * AuthContext를 사용하는 커스텀 훅
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * 인증 상태 관리 Provider
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 로컬 스토리지에서 사용자 정보 및 토큰 복원
  useEffect(() => {
    const restoreSession = async () => {
      const storedUser = localStorage.getItem('user');
      const storedTokens = localStorage.getItem('tokens');

      if (storedUser && storedTokens) {
        try {
          const userData = JSON.parse(storedUser);
          const tokens = JSON.parse(storedTokens);

          // 토큰 유효성 검증
          await authService.validateToken(tokens.accessToken);

          setUser(userData);
        } catch (error) {
          console.error('Session restoration failed:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('tokens');
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  /**
   * 로그인 처리 (Cognito)
   */
  const login = async ({ email, password }) => {
    try {
      // Cognito를 통한 로그인
      const response = await authService.login(email, password);

      const userData = {
        email: response.email,
        name: response.name,
        loginTime: response.loginTime,
      };

      // 사용자 정보 및 토큰 저장
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('tokens', JSON.stringify(response.tokens));

      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  /**
   * 로그아웃 처리
   */
  const logout = () => {
    setUser(null);
    authService.logout();
  };

  /**
   * 인증 여부 확인
   */
  const isAuthenticated = () => {
    return !!user;
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
