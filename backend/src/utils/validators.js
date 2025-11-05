/**
 * 입력값 검증 유틸리티
 */

import { SERVICES_CONFIG } from '../config/services.js';
import { ERROR_MESSAGES } from '../config/constants.js';

/**
 * 이메일 형식 검증
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: ERROR_MESSAGES.INVALID_EMAIL };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_EMAIL };
  }

  return { valid: true };
};

/**
 * yearMonth 형식 검증 (YYYY-MM 또는 'all' 또는 날짜 범위 'YYYY-MM-DD~YYYY-MM-DD')
 */
export const validateYearMonth = (yearMonth) => {
  if (!yearMonth) {
    return { valid: true }; // Optional parameter
  }

  // 'all' 허용
  if (yearMonth === 'all') {
    return { valid: true };
  }

  // 날짜 범위 형식 (YYYY-MM-DD~YYYY-MM-DD)
  if (yearMonth.includes('~')) {
    const [start, end] = yearMonth.split('~');
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateRegex.test(start) || !dateRegex.test(end)) {
      return { valid: false, error: 'Invalid date range format. Expected: YYYY-MM-DD~YYYY-MM-DD' };
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return { valid: false, error: 'Invalid date in range' };
    }

    if (startDate > endDate) {
      return { valid: false, error: 'Start date must be before end date' };
    }

    return { valid: true };
  }

  // YYYY-MM 형식
  const yearMonthRegex = /^\d{4}-\d{2}$/;
  if (!yearMonthRegex.test(yearMonth)) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_YEAR_MONTH };
  }

  // 실제 유효한 날짜인지 확인
  const [year, month] = yearMonth.split('-').map(Number);
  if (month < 1 || month > 12) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_YEAR_MONTH };
  }

  return { valid: true };
};

/**
 * serviceId 검증
 */
export const validateServiceId = (serviceId) => {
  if (!serviceId) {
    return { valid: true }; // Optional parameter
  }

  if (serviceId === 'all') {
    return { valid: true };
  }

  // _en, _kr 접미사 제거 후 검증
  const actualServiceId = serviceId.replace(/_kr$|_en$/, '');
  const service = SERVICES_CONFIG.find(s => s.id === actualServiceId);

  if (!service) {
    return {
      valid: false,
      error: `${ERROR_MESSAGES.INVALID_SERVICE_ID}: ${serviceId}`
    };
  }

  return { valid: true, service };
};

/**
 * limit 파라미터 검증 (숫자 범위)
 */
export const validateLimit = (limit, min = 1, max = 100) => {
  if (!limit) {
    return { valid: true }; // Optional parameter
  }

  const numLimit = parseInt(limit);
  if (isNaN(numLimit)) {
    return { valid: false, error: 'Limit must be a number' };
  }

  if (numLimit < min || numLimit > max) {
    return { valid: false, error: `Limit must be between ${min} and ${max}` };
  }

  return { valid: true, value: numLimit };
};

/**
 * months 파라미터 검증
 */
export const validateMonths = (months, min = 1, max = 24) => {
  if (!months) {
    return { valid: true }; // Optional parameter
  }

  const numMonths = parseInt(months);
  if (isNaN(numMonths)) {
    return { valid: false, error: 'Months must be a number' };
  }

  if (numMonths < min || numMonths > max) {
    return { valid: false, error: `Months must be between ${min} and ${max}` };
  }

  return { valid: true, value: numMonths };
};

/**
 * 필수 파라미터 검증
 */
export const validateRequired = (value, paramName) => {
  if (!value) {
    return {
      valid: false,
      error: `${ERROR_MESSAGES.MISSING_PARAMETER}: ${paramName}`
    };
  }
  return { valid: true };
};

/**
 * 여러 검증 결과를 합쳐서 반환
 */
export const combineValidations = (...validations) => {
  for (const validation of validations) {
    if (!validation.valid) {
      return validation;
    }
  }
  return { valid: true };
};

/**
 * Query String Parameters 일괄 검증
 */
export const validateQueryParams = (params, schema) => {
  const errors = [];

  for (const [key, validators] of Object.entries(schema)) {
    const value = params?.[key];

    for (const validator of validators) {
      const result = validator(value);
      if (!result.valid) {
        errors.push({ field: key, error: result.error });
        break; // 첫 번째 에러만 수집
      }
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true };
};
