/**
 * 애플리케이션 상수 정의
 */

// AWS 설정
export const AWS_CONFIG = {
  REGION: process.env.AWS_REGION || 'us-east-1',
  COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID || 'us-east-1_ohLOswurY',
};

// API 설정
export const API_CONFIG = {
  TIMEOUT: 30000, // 30초
  DEFAULT_PAGE_SIZE: 100,
  MAX_PAGE_SIZE: 1000,
};

// Cognito 설정
export const COGNITO_CONFIG = {
  FETCH_LIMIT: 60, // Cognito ListUsers API 제한
  MAX_RETRIES: 3,
};

// DynamoDB 설정
export const DYNAMODB_CONFIG = {
  MAX_SCAN_ITEMS: 1000,
  BATCH_SIZE: 25,
};

// 날짜 관련
export const DATE_CONFIG = {
  DEFAULT_MONTHS_BACK: 12,
  DATE_FORMAT: 'YYYY-MM-DD',
  YEAR_MONTH_FORMAT: 'YYYY-MM',
};

// 캐시 설정 (향후 Redis 도입 시 사용)
export const CACHE_CONFIG = {
  TTL_SHORT: 60, // 1분
  TTL_MEDIUM: 300, // 5분
  TTL_LONG: 3600, // 1시간
};

// CORS 설정
export const CORS_CONFIG = {
  ALLOWED_ORIGINS: [
    'https://dashboard.sedaily.ai',
    'http://localhost:5173', // Vite 개발 서버
    'http://localhost:3000', // 로컬 테스트
  ],
  ALLOWED_HEADERS: 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  ALLOWED_METHODS: 'GET,POST,OPTIONS',
};

// 에러 메시지
export const ERROR_MESSAGES = {
  SERVICE_NOT_FOUND: 'Service not found',
  USER_NOT_FOUND: 'User not found',
  INVALID_EMAIL: 'Invalid email format',
  INVALID_YEAR_MONTH: 'Invalid yearMonth format. Expected: YYYY-MM',
  INVALID_SERVICE_ID: 'Invalid serviceId',
  MISSING_PARAMETER: 'Required parameter is missing',
  DYNAMODB_QUERY_FAILED: 'Failed to query DynamoDB',
  COGNITO_QUERY_FAILED: 'Failed to query Cognito',
};

// 기본값
export const DEFAULTS = {
  YEAR_MONTH: getCurrentYearMonth(),
  LIMIT: 5,
  SERVICE_ID: null,
};

/**
 * 현재 년월 (YYYY-MM) 반환
 */
function getCurrentYearMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}
