/**
 * Lambda 핸들러 - 사용량 API
 */

import {
  getAllServicesUsage,
  getServiceUsage,
  aggregateUsageData,
  getMonthlyTrend,
  getDailyTrend,
  searchUserByEmail,
  getUserUsage,
  getAllUsersWithUsage,
  getUserRegistrationTrend
} from '../services/dynamodbService.js';
import { SERVICES_CONFIG } from '../config/services.js';
import { DEFAULTS } from '../config/constants.js';
import {
  validateEmail,
  validateYearMonth,
  validateServiceId,
  validateLimit,
  validateMonths,
  validateRequired
} from '../utils/validators.js';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
  optionsResponse
} from '../utils/response.js';
import { handleError, NotFoundError, ValidationError } from '../utils/errors.js';

/**
 * GET /usage/all
 * 모든 서비스의 사용량 조회
 */
export const getAllUsage = async (event) => {
  try {
    const origin = event.headers?.origin || event.headers?.Origin;
    const yearMonth = event.queryStringParameters?.yearMonth || DEFAULTS.YEAR_MONTH;

    // 검증
    const validation = validateYearMonth(yearMonth);
    if (!validation.valid) {
      return validationErrorResponse([{ field: 'yearMonth', error: validation.error }], origin);
    }

    const allData = await getAllServicesUsage(yearMonth);

    // 각 서비스별로 집계
    const result = {};
    allData.forEach(serviceData => {
      const service = SERVICES_CONFIG.find(s => s.id === serviceData.serviceId);
      if (!service) return;

      const aggregated = aggregateUsageData(serviceData.items, service);

      result[serviceData.serviceId] = {
        serviceId: serviceData.serviceId,
        serviceName: serviceData.serviceName,
        currentMonth: aggregated,
        lastMonth: {
          totalTokens: 0 // 이전 달 데이터는 별도 조회 필요
        },
        byEngine: aggregated.byEngine
      };
    });

    return successResponse(result, origin);
  } catch (error) {
    console.error('Error in getAllUsage:', error);
    const origin = event.headers?.origin || event.headers?.Origin;
    return errorResponse(error.message, 500, origin);
  }
};

/**
 * GET /usage/{serviceId}
 * 특정 서비스의 사용량 조회
 */
export const getUsageByService = async (event) => {
  try {
    const serviceId = event.pathParameters?.serviceId;
    const yearMonth = event.queryStringParameters?.yearMonth || getCurrentYearMonth();

    if (!serviceId) {
      return errorResponse('serviceId is required', 400);
    }

    const service = SERVICES_CONFIG.find(s => s.id === serviceId);
    if (!service) {
      return errorResponse('Service not found', 404);
    }

    const data = await getServiceUsage(serviceId, yearMonth);
    const aggregated = aggregateUsageData(data.items, service);

    return successResponse({
      serviceId: data.serviceId,
      serviceName: data.serviceName,
      currentMonth: aggregated,
      byEngine: aggregated.byEngine
    });
  } catch (error) {
    console.error('Error in getUsageByService:', error);
    return errorResponse(error.message);
  }
};

/**
 * GET /usage/summary
 * 전체 요약 통계
 */
export const getUsageSummary = async (event) => {
  try {
    const yearMonth = event.queryStringParameters?.yearMonth || getCurrentYearMonth();

    const allData = await getAllServicesUsage(yearMonth);

    let totalTokens = 0;
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalMessages = 0;
    let totalActiveUsers = 0;

    allData.forEach(serviceData => {
      const service = SERVICES_CONFIG.find(s => s.id === serviceData.serviceId);
      if (!service) return;

      const aggregated = aggregateUsageData(serviceData.items, service);
      totalTokens += aggregated.totalTokens;
      totalInputTokens += aggregated.inputTokens;
      totalOutputTokens += aggregated.outputTokens;
      totalMessages += aggregated.messageCount;
      totalActiveUsers += aggregated.activeUsers;
    });

    return successResponse({
      currentMonth: {
        totalTokens,
        totalInputTokens,
        totalOutputTokens,
        totalMessages,
        totalActiveUsers,
        totalServices: allData.filter(d => d.count > 0).length
      },
      lastMonth: {
        totalTokens: 0 // 이전 달 데이터는 별도 조회 필요
      }
    });
  } catch (error) {
    console.error('Error in getUsageSummary:', error);
    return errorResponse(error.message);
  }
};

/**
 * GET /usage/top/services
 * Top 5 서비스
 */
export const getTopServices = async (event) => {
  try {
    const yearMonth = event.queryStringParameters?.yearMonth || getCurrentYearMonth();
    const limit = parseInt(event.queryStringParameters?.limit || '5');

    const allData = await getAllServicesUsage(yearMonth);

    const servicesWithStats = allData.map(serviceData => {
      const service = SERVICES_CONFIG.find(s => s.id === serviceData.serviceId);
      if (!service) return null;

      const aggregated = aggregateUsageData(serviceData.items, service);

      return {
        serviceId: serviceData.serviceId,
        serviceName: serviceData.serviceName,
        currentMonth: aggregated
      };
    }).filter(Boolean);

    // 토큰 사용량 기준 정렬
    const sorted = servicesWithStats
      .sort((a, b) => b.currentMonth.totalTokens - a.currentMonth.totalTokens)
      .slice(0, limit);

    return successResponse(sorted);
  } catch (error) {
    console.error('Error in getTopServices:', error);
    return errorResponse(error.message);
  }
};

/**
 * GET /usage/top/engines
 * Top 5 엔진
 */
export const getTopEngines = async (event) => {
  try {
    const yearMonth = event.queryStringParameters?.yearMonth || getCurrentYearMonth();
    const limit = parseInt(event.queryStringParameters?.limit || '5');

    const allData = await getAllServicesUsage(yearMonth);

    const engineStats = {};

    allData.forEach(serviceData => {
      const service = SERVICES_CONFIG.find(s => s.id === serviceData.serviceId);
      if (!service) return;

      const aggregated = aggregateUsageData(serviceData.items, service);

      Object.entries(aggregated.byEngine).forEach(([engine, stats]) => {
        if (!engineStats[engine]) {
          engineStats[engine] = {
            engineType: engine,
            totalTokens: 0,
            inputTokens: 0,
            outputTokens: 0,
            messageCount: 0
          };
        }
        engineStats[engine].totalTokens += stats.totalTokens;
        engineStats[engine].inputTokens += stats.inputTokens;
        engineStats[engine].outputTokens += stats.outputTokens;
        engineStats[engine].messageCount += stats.messageCount;
      });
    });

    const sorted = Object.values(engineStats)
      .sort((a, b) => b.totalTokens - a.totalTokens)
      .slice(0, limit);

    return successResponse(sorted);
  } catch (error) {
    console.error('Error in getTopEngines:', error);
    return errorResponse(error.message);
  }
};

/**
 * GET /usage/trend/daily
 * 일별 추이
 */
export const getDailyUsageTrend = async (event) => {
  try {
    const serviceId = event.queryStringParameters?.serviceId || null;
    const yearMonth = event.queryStringParameters?.yearMonth || getCurrentYearMonth();

    const dailyData = await getDailyTrend(serviceId, yearMonth);

    return successResponse(dailyData);
  } catch (error) {
    console.error('Error in getDailyUsageTrend:', error);
    return errorResponse(error.message);
  }
};

/**
 * GET /usage/trend/monthly
 * 월별 추이
 */
export const getMonthlyUsageTrend = async (event) => {
  try {
    const serviceId = event.queryStringParameters?.serviceId || null;
    const months = parseInt(event.queryStringParameters?.months || '12');

    const monthlyData = await getMonthlyTrend(serviceId, months);

    return successResponse(monthlyData);
  } catch (error) {
    console.error('Error in getMonthlyUsageTrend:', error);
    return errorResponse(error.message);
  }
};

/**
 * GET /usage/user
 * 이메일로 사용자 사용량 조회
 */
export const getUserUsageByEmail = async (event) => {
  try {
    const origin = event.headers?.origin || event.headers?.Origin;
    const email = event.queryStringParameters?.email;
    const serviceId = event.queryStringParameters?.serviceId || '';
    const yearMonth = event.queryStringParameters?.yearMonth || DEFAULTS.YEAR_MONTH;

    // 검증
    const emailValidation = validateRequired(email, 'email');
    if (!emailValidation.valid) {
      return validationErrorResponse([{ field: 'email', error: emailValidation.error }], origin);
    }

    const emailFormatValidation = validateEmail(email);
    if (!emailFormatValidation.valid) {
      return validationErrorResponse([{ field: 'email', error: emailFormatValidation.error }], origin);
    }

    const serviceValidation = validateRequired(serviceId, 'serviceId');
    if (!serviceValidation.valid) {
      return validationErrorResponse([{ field: 'serviceId', error: serviceValidation.error }], origin);
    }

    const yearMonthValidation = validateYearMonth(yearMonth);
    if (!yearMonthValidation.valid) {
      return validationErrorResponse([{ field: 'yearMonth', error: yearMonthValidation.error }], origin);
    }

    console.log(`Searching for user: ${email} in service: ${serviceId}`);

    // 이메일로 사용자 검색
    const user = await searchUserByEmail(email, serviceId);

    if (!user) {
      return notFoundResponse('User', origin);
    }

    console.log(`Found user: ${user.user_id}`);

    // 사용자 사용량 조회
    const usageData = await getUserUsage(user.user_id, serviceId, yearMonth);
    const service = SERVICES_CONFIG.find(s => s.id === serviceId);
    const aggregated = aggregateUsageData(usageData.items, service);

    return successResponse({
      user: {
        userId: user.user_id,
        email: user.email,
        username: user.username,
        role: user.role,
        status: user.status
      },
      usage: {
        serviceId: usageData.serviceId,
        serviceName: usageData.serviceName,
        yearMonth,
        ...aggregated,
        records: usageData.count,
        details: usageData.items.map(item => ({
          engineType: item.engineType,
          totalTokens: item.totalTokens,
          inputTokens: item.inputTokens,
          outputTokens: item.outputTokens,
          messageCount: item.messageCount,
          lastUsedAt: item.lastUsedAt,
          yearMonth: item.yearMonth
        }))
      }
    }, origin);
  } catch (error) {
    console.error('Error in getUserUsageByEmail:', error);
    const origin = event.headers?.origin || event.headers?.Origin;
    return errorResponse(error.message, 500, origin);
  }
};

/**
 * GET /usage/users/all
 * 모든 사용자와 사용량 조회
 */
export const getAllUsersUsage = async (event) => {
  try {
    // serviceId가 없으면 전체 서비스 조회 (빈 문자열 또는 null)
    const serviceId = event.queryStringParameters?.serviceId || '';
    const yearMonth = event.queryStringParameters?.yearMonth || getCurrentYearMonth();

    console.log(`Fetching all users with usage for service: ${serviceId || 'ALL SERVICES'}, yearMonth: ${yearMonth}`);

    const usersWithUsage = await getAllUsersWithUsage(serviceId, yearMonth);

    return successResponse({
      serviceId: serviceId || 'all',
      yearMonth,
      totalUsers: usersWithUsage.length,
      users: usersWithUsage
    });
  } catch (error) {
    console.error('Error in getAllUsersUsage:', error);
    return errorResponse(error.message);
  }
};

/**
 * GET /users/registration-trend
 * 사용자 가입 추이 조회
 */
export const getUsersRegistrationTrend = async (event) => {
  try {
    console.log('Fetching user registration trend');

    const trendData = await getUserRegistrationTrend();

    return successResponse(trendData);
  } catch (error) {
    console.error('Error in getUsersRegistrationTrend:', error);
    return errorResponse(error.message);
  }
};

