/**
 * 통합 모니터링 대시보드 - 서비스 설정
 *
 * 모든 마이크로서비스의 DynamoDB 테이블 정보를 정의합니다.
 */

export const SERVICES_CONFIG = [
  {
    id: 'title',
    name: 'Title Service',
    displayName: '제목 (Nexus Title)',
    description: 'AI 기반 제목 생성 서비스',
    usageTable: 'nx-tt-dev-ver3-usage-tracking',
    usageTableEn: 'tf1-usage-two', // 영어 버전
    conversationsTable: 'nx-tt-dev-ver3-conversations',
    color: '#8B5CF6', // purple
    icon: '📝',
    category: 'sedaily',
    engines: ['T5', 'C7', 'pro'],
    active: true, // ✅ 124개 레코드
    keyStructure: { PK: 'user#userId', SK: 'engine#engineType#yearMonth' },
    keyStructureEn: { PK: 'userId', SK: 'date' }, // 영어 버전 키 구조
  },
  {
    id: 'proofreading',
    name: 'Proofreading Service',
    displayName: '교열 (Nexus Writing Pro)',
    description: 'AI 기반 텍스트 교정 서비스',
    usageTable: 'nx-wt-prf-usage',
    conversationsTable: 'nx-wt-prf-conversations',
    color: '#3B82F6', // blue
    icon: '✓',
    category: 'sedaily',
    engines: ['Basic', 'Pro', 'Elite'],
    active: true, // ✅ 71개 레코드
    keyStructure: { PK: 'userId', SK: 'yearMonth' },
  },
  {
    id: 'news',
    name: 'News Service',
    displayName: '보도 (W1)',
    description: 'AI 기반 보도자료 작성',
    usageTable: 'w1-usage',
    conversationsTable: 'w1-conversations-v2',
    color: '#10B981', // green
    icon: '📰',
    category: 'sedaily',
    engines: ['w1'],
    active: true, // ✅ 활성화됨
    keyStructure: { PK: 'userId', SK: 'yearMonth' },
  },
  {
    id: 'foreign',
    name: 'Foreign News Service',
    displayName: '외신 (F1)',
    description: 'AI 기반 외신 번역 및 요약',
    usageTable: 'f1-usage-two',
    conversationsTable: 'f1-conversations-two',
    color: '#F59E0B', // amber
    icon: '🌍',
    category: 'sedaily',
    engines: ['f1'],
    active: false, // ⏳ 준비됨 (0개)
    keyStructure: { PK: 'userId', SK: 'date' },
  },
  {
    id: 'revision',
    name: 'Revision Service',
    displayName: '퇴고 (Seoul Economic Column)',
    description: 'AI 기반 칼럼 퇴고',
    usageTable: 'sedaily-column-usage',
    usageTableEn: 'er1-usage-two', // 영어 버전
    conversationsTable: 'sedaily-column-conversations',
    color: '#EC4899', // pink
    icon: '✍️',
    category: 'sedaily',
    engines: ['column', 'C1'],
    active: true, // ✅ 활성화됨
    keyStructure: { PK: 'userId', SK: 'usageDate#engineType' },
    keyStructureEn: { PK: 'userId', SK: 'date' }, // 영어 버전 키 구조
  },
  {
    id: 'buddy',
    name: 'Buddy Service',
    displayName: '버디 (P2)',
    description: 'AI 글쓰기 도우미',
    usageTable: 'p2-two-usage-two',
    conversationsTable: 'p2-two-conversations-two',
    color: '#06B6D4', // cyan
    icon: '🤝',
    category: 'sedaily',
    engines: ['p2'],
    active: false, // ⏳ 준비됨 (0개)
    keyStructure: { PK: 'userId', SK: 'date' },
  },
];

/**
 * 서비스 ID로 서비스 정보 조회
 */
export const getServiceById = (serviceId) => {
  return SERVICES_CONFIG.find(service => service.id === serviceId);
};

/**
 * 카테고리별 서비스 그룹핑
 */
export const getServicesByCategory = () => {
  return SERVICES_CONFIG.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {});
};

/**
 * 모든 usage 테이블 목록
 */
export const getAllUsageTables = () => {
  return SERVICES_CONFIG.map(service => service.usageTable);
};
