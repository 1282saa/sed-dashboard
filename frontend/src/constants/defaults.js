/**
 * 공통 상수 관리
 * 애플리케이션 전반에서 사용되는 기본값 및 설정
 */

/**
 * 날짜 관련 기본값
 */
export const DEFAULT_YEAR_MONTH = '2025-10';
export const DEFAULT_USER_YEAR_MONTH = '2025-08';

/**
 * 페이지네이션 및 제한값
 */
export const DEFAULT_LIMIT = 5;
export const DEFAULT_TOP_LIMIT = 5;
export const DEFAULT_MONTHS = 12;

/**
 * API 타임아웃 (밀리초)
 */
export const API_TIMEOUT = 30000;

/**
 * 차트 색상 팔레트
 */
export const CHART_COLORS = {
  primary: '#9333ea',      // purple-600
  secondary: '#3b82f6',    // blue-500
  success: '#10b981',      // green-500
  warning: '#f59e0b',      // amber-500
  danger: '#ef4444',       // red-500
  info: '#06b6d4',         // cyan-500
};

/**
 * 서비스 색상 매핑
 */
export const SERVICE_COLORS = {
  title: '#9333ea',        // purple-600
  proofreading: '#3b82f6', // blue-500
  news: '#10b981',         // green-500
  foreign: '#f59e0b',      // amber-500
  revision: '#ef4444',     // red-500
  buddy: '#06b6d4',        // cyan-500
};

/**
 * 로딩 딜레이 (밀리초)
 */
export const LOADING_DELAY = 300;

/**
 * 디바운스 딜레이 (밀리초)
 */
export const DEBOUNCE_DELAY = 500;

/**
 * 로컬 스토리지 키
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_INFO: 'user_info',
  SELECTED_SERVICE: 'selected_service',
  SELECTED_MONTH: 'selected_month',
};

/**
 * 에러 메시지
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '네트워크 오류가 발생했습니다. 다시 시도해주세요.',
  SERVER_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  AUTH_ERROR: '인증에 실패했습니다. 다시 로그인해주세요.',
  NOT_FOUND: '데이터를 찾을 수 없습니다.',
  INVALID_INPUT: '입력값이 올바르지 않습니다.',
};

/**
 * 성공 메시지
 */
export const SUCCESS_MESSAGES = {
  DATA_LOADED: '데이터를 성공적으로 불러왔습니다.',
  EXPORT_SUCCESS: '내보내기가 완료되었습니다.',
};
