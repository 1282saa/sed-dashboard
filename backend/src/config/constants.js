/**
 * ============================================
 * Backend 애플리케이션 상수 정의
 * ============================================
 *
 * 이 파일은 백엔드 Lambda 함수에서 사용하는 모든 상수를 중앙화하여 관리합니다.
 * 하드코딩을 방지하고 유지보수를 용이하게 합니다.
 *
 * 주요 섹션:
 * - AWS_CONFIG: AWS 서비스 연결 설정
 * - API_CONFIG: API 동작 관련 설정
 * - COGNITO_CONFIG: AWS Cognito 인증 설정
 * - DYNAMODB_CONFIG: DynamoDB 쿼리 설정
 * - DATE_CONFIG: 날짜 처리 관련 설정
 * - CACHE_CONFIG: 캐시 TTL 설정 (향후 Redis 도입 시)
 * - CORS_CONFIG: CORS 보안 설정
 * - ERROR_MESSAGES: 표준화된 에러 메시지
 * - DEFAULTS: 기본값 정의
 *
 * @module backend/config/constants
 * @since 1.0.0
 */

// ============================================
// AWS 서비스 설정
// ============================================
/**
 * AWS 리전 및 서비스 연결 정보
 *
 * @property {string} REGION - AWS 리전 (기본: us-east-1)
 * @property {string} COGNITO_USER_POOL_ID - Cognito User Pool ID
 */
export const AWS_CONFIG = {
  REGION: process.env.AWS_REGION || 'us-east-1',
  COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID || 'us-east-1_ohLOswurY',
};

// ============================================
// API 동작 설정
// ============================================
/**
 * API 타임아웃 및 페이지네이션 설정
 *
 * @property {number} TIMEOUT - API 요청 타임아웃 (밀리초)
 * @property {number} DEFAULT_PAGE_SIZE - 기본 페이지 크기
 * @property {number} MAX_PAGE_SIZE - 최대 페이지 크기
 */
export const API_CONFIG = {
  TIMEOUT: 30000, // 30초 - Lambda 기본 타임아웃보다 짧게 설정
  DEFAULT_PAGE_SIZE: 100, // 한 번에 반환할 기본 아이템 수
  MAX_PAGE_SIZE: 1000, // 최대 허용 아이템 수
};

// ============================================
// AWS Cognito 인증 설정
// ============================================
/**
 * Cognito User Pool 쿼리 설정
 *
 * @property {number} FETCH_LIMIT - Cognito ListUsers API 호출 시 최대 반환 수 (AWS 제한)
 * @property {number} MAX_RETRIES - API 호출 실패 시 재시도 횟수
 */
export const COGNITO_CONFIG = {
  FETCH_LIMIT: 60, // Cognito ListUsers API의 최대 제한값
  MAX_RETRIES: 3, // 네트워크 오류 시 재시도 횟수
};

// ============================================
// DynamoDB 쿼리 설정
// ============================================
/**
 * DynamoDB Scan/Query 작업 설정
 *
 * @property {number} MAX_SCAN_ITEMS - Scan 작업 시 최대 조회 아이템 수
 * @property {number} BATCH_SIZE - Batch 작업 시 한 번에 처리할 아이템 수
 */
export const DYNAMODB_CONFIG = {
  MAX_SCAN_ITEMS: 1000, // 대용량 테이블 스캔 시 제한
  BATCH_SIZE: 25, // BatchGetItem/BatchWriteItem 최대 크기 (AWS 제한)
};

// ============================================
// 날짜 처리 설정
// ============================================
/**
 * 날짜 포맷 및 기본 기간 설정
 *
 * @property {number} DEFAULT_MONTHS_BACK - 추이 분석 시 기본 조회 월 수
 * @property {string} DATE_FORMAT - 날짜 형식 (ISO 8601)
 * @property {string} YEAR_MONTH_FORMAT - 년월 형식
 */
export const DATE_CONFIG = {
  DEFAULT_MONTHS_BACK: 12, // 월별 추이 조회 시 최근 12개월
  DATE_FORMAT: 'YYYY-MM-DD', // 예: 2025-11-06
  YEAR_MONTH_FORMAT: 'YYYY-MM', // 예: 2025-11
};

// ============================================
// 캐시 TTL 설정 (향후 확장)
// ============================================
/**
 * 캐시 유효 시간 설정 (초 단위)
 * 현재는 미사용, 향후 Redis/ElastiCache 도입 시 활용
 *
 * @property {number} TTL_SHORT - 짧은 캐시 (1분) - 실시간성 중요 데이터
 * @property {number} TTL_MEDIUM - 중간 캐시 (5분) - 일반 데이터
 * @property {number} TTL_LONG - 긴 캐시 (1시간) - 정적 데이터
 */
export const CACHE_CONFIG = {
  TTL_SHORT: 60, // 1분 - 사용량 통계
  TTL_MEDIUM: 300, // 5분 - Top 랭킹
  TTL_LONG: 3600, // 1시간 - 사용자 목록
};

// ============================================
// CORS 보안 설정
// ============================================
/**
 * Cross-Origin Resource Sharing 설정
 * 허용된 도메인만 API 접근 가능
 *
 * @property {string[]} ALLOWED_ORIGINS - 허용된 오리진 목록
 * @property {string} ALLOWED_HEADERS - 허용된 HTTP 헤더
 * @property {string} ALLOWED_METHODS - 허용된 HTTP 메서드
 */
export const CORS_CONFIG = {
  ALLOWED_ORIGINS: [
    'https://dashboard.sedaily.ai', // 프로덕션 도메인
    'http://localhost:5173', // Vite 로컬 개발 서버
    'http://localhost:3000', // 로컬 테스트 환경
  ],
  ALLOWED_HEADERS: 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  ALLOWED_METHODS: 'GET,POST,OPTIONS',
};

// ============================================
// 표준 에러 메시지
// ============================================
/**
 * 일관된 에러 메시지 정의
 * 프론트엔드에 전달되는 모든 에러는 이 메시지를 사용
 *
 * @property {string} SERVICE_NOT_FOUND - 서비스를 찾을 수 없음
 * @property {string} USER_NOT_FOUND - 사용자를 찾을 수 없음
 * @property {string} INVALID_EMAIL - 잘못된 이메일 형식
 * @property {string} INVALID_YEAR_MONTH - 잘못된 년월 형식
 * @property {string} INVALID_SERVICE_ID - 잘못된 서비스 ID
 * @property {string} MISSING_PARAMETER - 필수 파라미터 누락
 * @property {string} DYNAMODB_QUERY_FAILED - DynamoDB 쿼리 실패
 * @property {string} COGNITO_QUERY_FAILED - Cognito 쿼리 실패
 */
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

// ============================================
// 기본값 정의
// ============================================
/**
 * API 파라미터 기본값
 *
 * @property {string} YEAR_MONTH - 현재 년월 (동적 생성)
 * @property {number} LIMIT - Top 조회 시 기본 제한값
 * @property {null} SERVICE_ID - 서비스 필터 기본값 (null = 전체)
 */
export const DEFAULTS = {
  YEAR_MONTH: getCurrentYearMonth(), // 현재 년월 자동 계산
  LIMIT: 5, // Top 5 기본값
  SERVICE_ID: null, // 전체 서비스 조회
};

// ============================================
// 유틸리티 함수
// ============================================
/**
 * 현재 년월을 YYYY-MM 형식으로 반환
 *
 * @returns {string} 현재 년월 (예: "2025-11")
 * @example
 * getCurrentYearMonth() // "2025-11"
 */
function getCurrentYearMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}
