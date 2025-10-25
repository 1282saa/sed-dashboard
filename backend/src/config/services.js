/**
 * 서비스 설정 (프론트엔드와 동일)
 * DynamoDB 테이블 정보 및 쿼리 구조 정의
 */

export const SERVICES_CONFIG = [
  {
    id: 'title',
    name: 'Title Service',
    displayName: '제목 (Nexus Title)',
    usageTable: 'nx-tt-dev-ver3-usage-tracking',
    conversationsTable: 'nx-tt-dev-ver3-conversations',
    engines: ['T5', 'C7', 'pro'],
    active: true,
    keyStructure: {
      PK: 'PK',          // Actual DynamoDB field name
      SK: 'SK',          // Actual DynamoDB field name
      PKPattern: 'user#userId',
      SKPattern: 'engine#engineType#yearMonth'
    }
  },
  {
    id: 'proofreading',
    name: 'Proofreading Service',
    displayName: '교열 (Nexus Writing Pro)',
    usageTable: 'nx-wt-prf-usage',
    conversationsTable: 'nx-wt-prf-conversations',
    engines: ['Basic', 'Pro', 'Elite'],
    active: true,
    keyStructure: {
      PK: 'PK',
      SK: 'SK',
      PKPattern: 'userId',
      SKPattern: 'yearMonth'
    }
  },
  {
    id: 'news',
    name: 'News Service',
    displayName: '보도 (W1)',
    usageTable: 'w1-usage',
    conversationsTable: 'w1-conversations-v2',
    engines: ['w1'],
    active: false,
    keyStructure: {
      PK: 'PK',
      SK: 'SK',
      PKPattern: 'userId',
      SKPattern: 'yearMonth'
    }
  },
  {
    id: 'foreign',
    name: 'Foreign News Service',
    displayName: '외신 (F1)',
    usageTable: 'f1-usage-two',
    conversationsTable: 'f1-conversations-two',
    engines: ['f1'],
    active: false,
    keyStructure: {
      PK: 'PK',
      SK: 'SK',
      PKPattern: 'userId',
      SKPattern: 'date'
    }
  },
  {
    id: 'revision',
    name: 'Revision Service',
    displayName: '퇴고 (Seoul Economic Column)',
    usageTable: 'sedaily-column-usage',
    conversationsTable: 'sedaily-column-conversations',
    engines: ['column'],
    active: false,
    keyStructure: {
      PK: 'PK',
      SK: 'SK',
      PKPattern: 'userId',
      SKPattern: 'usageDate#engineType'
    }
  },
  {
    id: 'buddy',
    name: 'Buddy Service',
    displayName: '버디 (P2)',
    usageTable: 'p2-two-usage-two',
    conversationsTable: 'p2-two-conversations-two',
    engines: ['p2'],
    active: false,
    keyStructure: {
      PK: 'PK',
      SK: 'SK',
      PKPattern: 'userId',
      SKPattern: 'date'
    }
  }
];

export const getServiceById = (serviceId) => {
  return SERVICES_CONFIG.find(service => service.id === serviceId);
};

export const getActiveServices = () => {
  return SERVICES_CONFIG.filter(service => service.active);
};
