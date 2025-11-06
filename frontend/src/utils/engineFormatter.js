/**
 * 엔진 이름 포맷터
 * 각 서비스별로 엔진 이름에 프리픽스를 추가하여 구분하기 쉽게 표시
 */

// 서비스별 프리픽스 매핑
const SERVICE_PREFIX = {
  title: 't1',        // 제목 (Title)
  proofreading: 'p1', // 교열 (Proofreading)
  news: 'w1',         // 보도 (Writing/News)
  foreign: 'f1',      // 외신 (Foreign)
  revision: 'r1',     // 퇴고 (Revision)
  buddy: 'b1',        // 버디 (Buddy)
};

/**
 * 엔진 이름에 서비스 프리픽스 추가
 * @param {string} engineName - 원본 엔진 이름 (예: "t5", "Basic", "11/22")
 * @param {string} serviceId - 서비스 ID (예: "title", "proofreading")
 * @returns {string} 포맷된 엔진 이름 (예: "t1-t5", "p1-basic", "t1-11/22")
 */
export const formatEngineName = (engineName, serviceId) => {
  if (!engineName) return 'Unknown';
  if (!serviceId) return engineName;

  const prefix = SERVICE_PREFIX[serviceId];
  if (!prefix) return engineName;

  // 엔진 이름을 소문자로 변환
  const lowerEngineName = engineName.toLowerCase();

  return `${prefix}-${lowerEngineName}`;
};

/**
 * 여러 엔진 이름을 한 번에 포맷
 * @param {Array} engines - 엔진 객체 배열 [{ engineType: "t5", ... }]
 * @param {string} serviceId - 서비스 ID
 * @returns {Array} 포맷된 엔진 객체 배열
 */
export const formatEngineList = (engines, serviceId) => {
  if (!Array.isArray(engines)) return [];

  return engines.map(engine => ({
    ...engine,
    engineType: formatEngineName(engine.engineType, serviceId),
    originalEngineType: engine.engineType, // 원본 보존
  }));
};

/**
 * 엔진 통계 객체의 키를 포맷
 * @param {Object} byEngine - { "t5": {...}, "Basic": {...} }
 * @param {string} serviceId - 서비스 ID
 * @returns {Object} { "t1-t5": {...}, "p1-basic": {...} }
 */
export const formatEngineStats = (byEngine, serviceId) => {
  if (!byEngine || typeof byEngine !== 'object') return {};

  const formatted = {};
  Object.entries(byEngine).forEach(([engineName, stats]) => {
    const formattedName = formatEngineName(engineName, serviceId);
    formatted[formattedName] = {
      ...stats,
      engineType: formattedName,
      originalEngineType: engineName,
    };
  });

  return formatted;
};

/**
 * 서비스 데이터 전체의 엔진 이름 포맷
 * @param {Object} serviceData - 서비스 사용량 데이터
 * @returns {Object} 포맷된 서비스 데이터
 */
export const formatServiceEngines = (serviceData) => {
  if (!serviceData || !serviceData.serviceId) return serviceData;

  const serviceId = serviceData.serviceId;

  return {
    ...serviceData,
    byEngine: formatEngineStats(serviceData.byEngine, serviceId),
    currentMonth: serviceData.currentMonth ? {
      ...serviceData.currentMonth,
      byEngine: formatEngineStats(serviceData.currentMonth.byEngine, serviceId),
    } : undefined,
  };
};

/**
 * 전체 서비스 데이터의 엔진 이름 포맷
 * @param {Object} allServicesData - { title: {...}, proofreading: {...}, ... }
 * @returns {Object} 포맷된 전체 서비스 데이터
 */
export const formatAllServicesEngines = (allServicesData) => {
  if (!allServicesData || typeof allServicesData !== 'object') return allServicesData;

  const formatted = {};
  Object.entries(allServicesData).forEach(([serviceId, serviceData]) => {
    formatted[serviceId] = formatServiceEngines(serviceData);
  });

  return formatted;
};

/**
 * Top 엔진 리스트 포맷
 * @param {Array} topEngines - [{ engineType: "t5", ... }]
 * @param {string} serviceId - 서비스 ID (옵션, 전체 서비스 통합 시 생략)
 * @returns {Array} 포맷된 엔진 리스트
 */
export const formatTopEngines = (topEngines, serviceId = null) => {
  if (!Array.isArray(topEngines)) return [];

  // serviceId가 없으면 엔진 이름에서 서비스 추론 시도
  return topEngines.map(engine => {
    const formattedName = serviceId
      ? formatEngineName(engine.engineType, serviceId)
      : engine.engineType; // 전체 통합 시에는 그대로 표시

    return {
      ...engine,
      engineType: formattedName,
      originalEngineType: engine.engineType,
    };
  });
};

/**
 * 서비스 프리픽스 목록 가져오기
 * @returns {Object} 서비스 프리픽스 매핑
 */
export const getServicePrefixes = () => SERVICE_PREFIX;

/**
 * 프리픽스로 서비스 ID 찾기
 * @param {string} prefix - 프리픽스 (예: "t1")
 * @returns {string|null} 서비스 ID (예: "title") 또는 null
 */
export const getServiceIdByPrefix = (prefix) => {
  const entry = Object.entries(SERVICE_PREFIX).find(([_, p]) => p === prefix);
  return entry ? entry[0] : null;
};
