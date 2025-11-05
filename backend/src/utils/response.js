/**
 * HTTP 응답 헬퍼
 */

import { CORS_CONFIG } from '../config/constants.js';

/**
 * CORS 헤더 생성 (Origin 체크)
 */
export const getCorsHeaders = (origin) => {
  // Origin이 허용 목록에 있는지 확인
  const allowedOrigin = CORS_CONFIG.ALLOWED_ORIGINS.includes(origin)
    ? origin
    : CORS_CONFIG.ALLOWED_ORIGINS[0]; // 기본값: 첫 번째 허용 도메인

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': CORS_CONFIG.ALLOWED_HEADERS,
    'Access-Control-Allow-Methods': CORS_CONFIG.ALLOWED_METHODS,
    'Access-Control-Allow-Credentials': 'true',
  };
};

/**
 * 성공 응답
 */
export const successResponse = (data, origin = null) => ({
  statusCode: 200,
  headers: getCorsHeaders(origin),
  body: JSON.stringify(data),
});

/**
 * 에러 응답
 */
export const errorResponse = (message, statusCode = 500, origin = null, code = 'ERROR') => ({
  statusCode,
  headers: getCorsHeaders(origin),
  body: JSON.stringify({
    error: {
      code,
      message,
      statusCode,
    },
  }),
});

/**
 * 검증 실패 응답
 */
export const validationErrorResponse = (errors, origin = null) => ({
  statusCode: 400,
  headers: getCorsHeaders(origin),
  body: JSON.stringify({
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      statusCode: 400,
      details: errors,
    },
  }),
});

/**
 * Not Found 응답
 */
export const notFoundResponse = (resource, origin = null) => ({
  statusCode: 404,
  headers: getCorsHeaders(origin),
  body: JSON.stringify({
    error: {
      code: 'NOT_FOUND',
      message: `${resource} not found`,
      statusCode: 404,
    },
  }),
});

/**
 * OPTIONS 요청 처리 (Preflight)
 */
export const optionsResponse = (origin = null) => ({
  statusCode: 200,
  headers: getCorsHeaders(origin),
  body: '',
});
