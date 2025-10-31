/**
 * API 서비스 레이어
 * 백엔드 Lambda API와 통신
 */

import axios from 'axios';

// API Base URL (환경변수로 설정)
// 로컬 개발: http://localhost:3001
// 프로덕션: API Gateway URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 전체 서비스 사용량 조회
 */
export const fetchAllServicesUsage = async (yearMonth = '2025-10') => {
  try {
    const response = await apiClient.get('/usage/all', {
      params: { yearMonth }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch all services usage:', error);
    throw error;
  }
};

/**
 * 특정 서비스 사용량 조회
 */
export const fetchServiceUsage = async (serviceId, yearMonth = '2025-10') => {
  try {
    const response = await apiClient.get(`/usage/${serviceId}`, {
      params: { yearMonth }
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch usage for service ${serviceId}:`, error);
    throw error;
  }
};

/**
 * 통계 요약 조회
 */
export const fetchUsageSummary = async (yearMonth = '2025-10') => {
  try {
    const response = await apiClient.get('/usage/summary', {
      params: { yearMonth }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch usage summary:', error);
    throw error;
  }
};

/**
 * Top 5 서비스 조회
 */
export const fetchTopServices = async (yearMonth = '2025-10', limit = 5) => {
  try {
    const response = await apiClient.get('/usage/top/services', {
      params: { yearMonth, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch top services:', error);
    throw error;
  }
};

/**
 * Top 5 엔진 조회
 */
export const fetchTopEngines = async (yearMonth = '2025-10', limit = 5) => {
  try {
    const response = await apiClient.get('/usage/top/engines', {
      params: { yearMonth, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch top engines:', error);
    throw error;
  }
};

/**
 * 일별 사용량 추이 조회
 */
export const fetchDailyUsageTrend = async (serviceId = null, yearMonth = '2025-10') => {
  try {
    // serviceId가 빈 문자열이거나 null이면 파라미터에서 제외
    const params = { yearMonth };
    if (serviceId) {
      params.serviceId = serviceId;
    }

    const response = await apiClient.get('/usage/trend/daily', {
      params
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch daily usage trend:', error);
    throw error;
  }
};

/**
 * 월별 사용량 추이 조회
 */
export const fetchMonthlyUsageTrend = async (serviceId = null, months = 12) => {
  try {
    const response = await apiClient.get('/usage/trend/monthly', {
      params: { serviceId, months }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch monthly usage trend:', error);
    throw error;
  }
};

/**
 * 이메일로 사용자 사용량 조회
 */
export const fetchUserUsageByEmail = async (email, serviceId = 'title', yearMonth = '2025-08') => {
  try {
    const response = await apiClient.get('/usage/user', {
      params: { email, serviceId, yearMonth }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user usage:', error);
    throw error;
  }
};

/**
 * 모든 사용자와 사용량 조회
 */
export const fetchAllUsersUsage = async (serviceId = '', yearMonth = '2025-08') => {
  try {
    // serviceId가 빈 문자열이면 파라미터에서 제외
    const params = { yearMonth };
    if (serviceId) {
      params.serviceId = serviceId;
    }

    const response = await apiClient.get('/usage/users/all', {
      params
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch all users usage:', error);
    throw error;
  }
};

/**
 * 사용자 가입 추이 조회
 */
export const fetchUserRegistrationTrend = async () => {
  try {
    const response = await apiClient.get('/usage/users/registration-trend');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user registration trend:', error);
    throw error;
  }
};
