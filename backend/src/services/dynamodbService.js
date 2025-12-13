/**
 * DynamoDB 서비스 레이어
 * DynamoDB 테이블 쿼리 및 데이터 집계
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { CognitoIdentityProviderClient, AdminGetUserCommand } = require('@aws-sdk/client-cognito-identity-provider');
const { SERVICES_CONFIG } = require('../config/services.js');
const { AWS_CONFIG, COGNITO_CONFIG } = require('../config/constants.js');
const { DynamoDBError, CognitoError, NotFoundError } = require('../utils/errors.js');

// 기본 클라이언트 (ap-northeast-2)
const client = new DynamoDBClient({ region: AWS_CONFIG.REGION });
const docClient = DynamoDBDocumentClient.from(client);

// us-east-1 리전용 클라이언트
const usEast1Client = new DynamoDBClient({ region: 'us-east-1' });
const usEast1DocClient = DynamoDBDocumentClient.from(usEast1Client);

const cognitoClient = new CognitoIdentityProviderClient({ region: AWS_CONFIG.REGION });

// 서비스별 적절한 DynamoDB 클라이언트 반환
const getDocClient = (service) => {
  return service.region === 'us-east-1' ? usEast1DocClient : docClient;
};

// 사용자 테이블 이름 (현재는 Cognito만 사용)
const USER_TABLES = {
  // 필요 시 DynamoDB 사용자 테이블 추가
};

// Cognito User Pool ID
const USER_POOL_ID = AWS_CONFIG.COGNITO_USER_POOL_ID;

/**
 * Cognito에서 사용자 정보 가져오기
 */
const getCognitoUserInfo = async (userId) => {
  try {
    const command = new AdminGetUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: userId
    });

    const response = await cognitoClient.send(command);

    // 사용자 속성에서 이메일 추출
    const emailAttr = response.UserAttributes?.find(attr => attr.Name === 'email');
    const nameAttr = response.UserAttributes?.find(attr => attr.Name === 'name');

    return {
      email: emailAttr?.Value || userId,
      username: nameAttr?.Value || response.Username || userId,
      status: response.UserStatus?.toLowerCase() || 'unknown',
      enabled: response.Enabled !== false,
      createdAt: response.UserCreateDate || null // 사용자 생성 날짜
    };
  } catch (error) {
    console.error(`Error fetching Cognito user ${userId}:`, error.message);
    // Cognito에 사용자가 없으면 userId를 이메일로 사용
    return {
      email: userId,
      username: userId,
      status: 'unknown',
      enabled: true,
      createdAt: null
    };
  }
};

/**
 * serviceId에서 언어 버전 확인 (_en 접미사)
 * 테이블 이름과 키 구조를 반환
 */
const getTableConfigForService = (service, serviceIdWithLang) => {
  const isEnglish = serviceIdWithLang && serviceIdWithLang.endsWith('_en');

  // 영어 버전이고 영어 테이블이 있으면 영어 테이블과 키 구조 사용
  if (isEnglish && service.usageTableEn) {
    return {
      tableName: service.usageTableEn,
      keyStructure: service.keyStructureEn || service.keyStructure
    };
  }

  // 기본 테이블과 키 구조 사용
  return {
    tableName: service.usageTable,
    keyStructure: service.keyStructure
  };
};

/**
 * 특정 서비스의 사용량 데이터 조회
 */
exports. getServiceUsage = async (serviceId, yearMonth) => {
  // _en, _kr 접미사 제거하여 실제 서비스 찾기
  const actualServiceId = serviceId.replace(/_kr$|_en$/, '');
  const service = SERVICES_CONFIG.find(s => s.id === actualServiceId);

  if (!service) {
    throw new Error(`Service not found: ${actualServiceId}`);
  }

  // 언어에 따른 테이블과 키 구조 선택
  const { tableName, keyStructure } = getTableConfigForService(service, serviceId);

  try {
    console.log(`Querying ${tableName} for yearMonth: ${yearMonth} (original serviceId: ${serviceId})`);
    console.log(`Using SK field: ${keyStructure.SK}`);

    // Scan 명령으로 전체 데이터 조회
    let command;

    // yearMonth가 'all'이면 필터 없이 전체 스캔
    if (yearMonth === 'all') {
      command = new ScanCommand({
        TableName: tableName
      });
    } else {
      // 실제 SK 필드명 결정
      // keyStructure.SK는 'engine#engineType#yearMonth' 같은 형식이거나 'yearMonth' 같은 실제 필드명일 수 있음
      const skFieldName = keyStructure.SK.includes('#') ? 'SK' : keyStructure.SK;
      
      command = new ScanCommand({
        TableName: tableName,
        FilterExpression: 'contains(#sk, :yearMonth) OR #yearMonth = :yearMonth',
        ExpressionAttributeNames: {
          '#sk': skFieldName,
          '#yearMonth': 'yearMonth'
        },
        ExpressionAttributeValues: {
          ':yearMonth': yearMonth
        }
      });
    }

    const serviceDocClient = getDocClient(service);
    const response = await serviceDocClient.send(command);

    console.log(`Found ${response.Count} items for ${actualServiceId} (table: ${tableName})`);
    
    // 교열 서비스의 경우 engineType 필드를 기준으로 그룹화
    if (actualServiceId === 'proofreading' && response.Items && response.Items.length > 0) {
      console.log('Proofreading service - checking for engineType variations');
      
      // 사용자별로 모든 엔진 타입의 데이터를 수집
      const userEngineMap = {};
      
      response.Items.forEach(item => {
        const userId = item.userId || item.PK;
        const engineType = item.engineType || 'unknown';
        const key = `${userId}-${engineType}`;
        
        // 기존 데이터가 있으면 토큰과 메시지 수를 누적
        if (userEngineMap[key]) {
          userEngineMap[key].totalTokens += (item.totalTokens || 0);
          userEngineMap[key].inputTokens += (item.inputTokens || item.totalInputTokens || 0);
          userEngineMap[key].outputTokens += (item.outputTokens || item.totalOutputTokens || 0);
          userEngineMap[key].messageCount += (item.messageCount || item.messages || item.requestCount || 1);
        } else {
          userEngineMap[key] = {
            ...item,
            _originalEngineType: engineType,
            _userId: userId
          };
        }
      });
      
      // Map을 배열로 변환
      const expandedItems = Object.values(userEngineMap);
      console.log(`Expanded ${response.Count} items to ${expandedItems.length} items with engineType differentiation`);
      
      return {
        serviceId: actualServiceId,
        serviceName: service.displayName,
        items: expandedItems,
        count: expandedItems.length
      };
    }
    
    if (response.Items && response.Items.length > 0) {
      console.log('Sample item:', JSON.stringify(response.Items[0]));
    }

    return {
      serviceId: actualServiceId,
      serviceName: service.displayName,
      items: response.Items || [],
      count: response.Count || 0
    };
  } catch (error) {
    console.error(`Error querying ${tableName}:`, error);
    return {
      serviceId: actualServiceId,
      serviceName: service.displayName,
      items: [],
      count: 0,
      error: error.message
    };
  }
};

/**
 * 모든 활성 서비스의 사용량 데이터 조회
 */
exports.getAllServicesUsage = async (yearMonth) => {
  const services = SERVICES_CONFIG;

  // 병렬로 모든 서비스 조회
  const promises = services.map(service =>
    exports.getServiceUsage(service.id, yearMonth)
  );

  const results = await Promise.all(promises);

  return results;
};

/**
 * 사용량 데이터 집계
 */
exports. aggregateUsageData = (items, serviceConfig) => {
  let totalTokens = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalMessages = 0;
  const uniqueUsers = new Set();
  const engineStats = {};

  items.forEach(item => {
    // 토큰 집계 (다양한 필드명 지원)
    totalTokens += (item.totalTokens || 0);
    totalInputTokens += (item.inputTokens || item.totalInputTokens || 0);
    totalOutputTokens += (item.outputTokens || item.totalOutputTokens || 0);
    totalMessages += (item.messageCount || item.messages || item.requestCount || 1);

    // 사용자 추출
    const userId = extractUserId(item, serviceConfig);
    if (userId) {
      uniqueUsers.add(userId);
    }

    // 엔진별 집계
    const engineType = extractEngineType(item, serviceConfig);
    if (engineType) {
      if (!engineStats[engineType]) {
        engineStats[engineType] = {
          totalTokens: 0,
          inputTokens: 0,
          outputTokens: 0,
          messageCount: 0
        };
      }
      engineStats[engineType].totalTokens += (item.totalTokens || 0);
      engineStats[engineType].inputTokens += (item.inputTokens || item.totalInputTokens || 0);
      engineStats[engineType].outputTokens += (item.outputTokens || item.totalOutputTokens || 0);
      engineStats[engineType].messageCount += (item.messageCount || item.messages || item.requestCount || 1);
    }
  });

  return {
    totalTokens,
    inputTokens: totalInputTokens,
    outputTokens: totalOutputTokens,
    messageCount: totalMessages,
    activeUsers: uniqueUsers.size,
    byEngine: engineStats
  };
};

/**
 * PK에서 userId 추출
 */
const extractUserId = (item, serviceConfig) => {
  const pkField = serviceConfig.keyStructure.PK;
  const pkValue = item[pkField] || item.PK;

  if (!pkValue) return null;

  // "user#userId" 형태면 userId만 추출
  if (typeof pkValue === 'string' && pkValue.includes('#')) {
    return pkValue.split('#')[1];
  }

  return pkValue;
};

/**
 * SK에서 engineType 추출
 */
const extractEngineType = (item, serviceConfig) => {
  // 교열 서비스는 engineType 필드를 직접 사용
  if (serviceConfig.id === 'proofreading') {
    // _originalEngineType은 이미 처리된 경우
    if (item._originalEngineType) {
      return item._originalEngineType.toLowerCase();
    }
    
    // engineType 필드 확인 (basic, pro 등)
    if (item.engineType) {
      // 11 -> basic, 22 -> pro 매핑 (모두 소문자로)
      const engineTypeStr = String(item.engineType).toLowerCase();
      const engineMap = {
        '11': 'basic',
        '22': 'pro',
        'basic': 'basic',
        'pro': 'pro'
      };
      return engineMap[engineTypeStr] || engineTypeStr;
    }
    
    return 'unknown';
  }
  
  const skField = serviceConfig.keyStructure.SK;
  const skValue = item[skField] || item.SK;

  if (!skValue) {
    // SK에 없으면 engineType 필드 확인
    return item.engineType || item.engine || null;
  }

  // "engine#engineType#yearMonth" 형태면 engineType 추출
  if (typeof skValue === 'string' && skValue.includes('#')) {
    const parts = skValue.split('#');
    if (parts[0] === 'engine' && parts.length >= 2) {
      return parts[1];
    }
  }

  return item.engineType || item.engine || null;
};

/**
 * 월별 데이터 집계
 */
exports. getMonthlyTrend = async (serviceId, monthsBack = 12) => {
  const currentDate = new Date();
  const monthlyData = [];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() - i);
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    let data;
    if (serviceId) {
      data = await getServiceUsage(serviceId, yearMonth);
    } else {
      const allData = await getAllServicesUsage(yearMonth);
      data = {
        items: allData.flatMap(d => d.items)
      };
    }

    const service = SERVICES_CONFIG.find(s => s.id === serviceId) || SERVICES_CONFIG[0];
    const aggregated = aggregateUsageData(data.items, service);

    monthlyData.push({
      yearMonth,
      ...aggregated
    });
  }

  return monthlyData;
};

/**
 * 일별 데이터 집계 (특정 월 또는 전체 기간)
 */
exports. getDailyTrend = async (serviceId, yearMonth) => {
  let allItems = [];

  // yearMonth가 'all'이거나 날짜 범위인 경우 전체 스캔
  const isFullScan = !yearMonth || yearMonth === 'all' || yearMonth.includes('~');

  if (serviceId) {
    // 특정 서비스만 조회
    const actualServiceId = serviceId.replace(/_kr$|_en$/, '');
    const service = SERVICES_CONFIG.find(s => s.id === actualServiceId);
    const { tableName, keyStructure } = getTableConfigForService(service, serviceId);

    if (isFullScan) {
      // 전체 스캔 (필터 없이)
      const command = new ScanCommand({
        TableName: tableName
      });
      const serviceDocClient = getDocClient(service);
      const response = await serviceDocClient.send(command);
      allItems = (response.Items || []).map(item => ({
        ...item,
        _serviceConfig: { ...service, keyStructure } // 영어 버전 키 구조 포함
      }));
    } else {
      // 특정 월만 조회
      const data = await getServiceUsage(serviceId, yearMonth);
      allItems = data.items.map(item => ({
        ...item,
        _serviceConfig: { ...service, keyStructure } // 영어 버전 키 구조 포함
      }));
    }
  } else {
    // 전체 서비스 조회 - 각 아이템에 서비스 정보 태깅
    if (isFullScan) {
      // 모든 서비스를 전체 스캔
      const services = SERVICES_CONFIG;
      const promises = services.map(async (service) => {
        const command = new ScanCommand({
          TableName: service.usageTable
        });
        const serviceDocClient = getDocClient(service);
        const response = await serviceDocClient.send(command);
        return {
          serviceId: service.id,
          items: response.Items || [],
          service
        };
      });
      const results = await Promise.all(promises);

      results.forEach(result => {
        if (result.items) {
          result.items.forEach(item => {
            allItems.push({
              ...item,
              _serviceConfig: result.service,
              _serviceId: result.service.id
            });
          });
        }
      });
    } else {
      // 특정 월만 조회
      const allData = await getAllServicesUsage(yearMonth);
      allData.forEach(serviceData => {
        const service = SERVICES_CONFIG.find(s => s.id === serviceData.serviceId);
        if (service && serviceData.items) {
          serviceData.items.forEach(item => {
            allItems.push({
              ...item,
              _serviceConfig: service,
              _serviceId: service.id
            });
          });
        }
      });
    }
  }

  // 날짜별로 그룹화
  const dailyMap = {};

  allItems.forEach(item => {
    // 각 아이템에 태깅된 서비스 설정 사용
    const serviceConfig = item._serviceConfig;
    if (!serviceConfig) return;

    // 날짜 추출
    const date = extractDate(item, serviceConfig);

    if (!date) return;

    if (!dailyMap[date]) {
      dailyMap[date] = [];
    }
    dailyMap[date].push(item);
  });

  // 각 날짜별로 집계
  const dailyData = Object.keys(dailyMap).sort().map(date => {
    const itemsForDate = dailyMap[date];

    // 해당 날짜의 모든 토큰 합산
    let totalTokens = 0;
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalMessages = 0;
    const uniqueUsers = new Set();

    itemsForDate.forEach(item => {
      totalTokens += (item.totalTokens || 0);
      totalInputTokens += (item.inputTokens || item.totalInputTokens || 0);
      totalOutputTokens += (item.outputTokens || item.totalOutputTokens || 0);
      totalMessages += (item.messageCount || item.messages || item.requestCount || 1);

      // 사용자 추출
      if (item._serviceConfig) {
        const userId = extractUserId(item, item._serviceConfig);
        if (userId) {
          uniqueUsers.add(userId);
        }
      }
    });

    return {
      date,
      totalTokens,
      inputTokens: totalInputTokens,
      outputTokens: totalOutputTokens,
      messageCount: totalMessages,
      activeUsers: uniqueUsers.size
    };
  });

  return dailyData;
};

/**
 * 날짜 추출
 */
const extractDate = (item, serviceConfig) => {
  // 1. 먼저 명시적인 date 필드 확인
  if (item.date) {
    // "2025-10-28#11" 같은 형태에서 날짜만 추출
    if (typeof item.date === 'string') {
      if (item.date.includes('#')) {
        return item.date.split('#')[0];
      }
      const match = item.date.match(/\d{4}-\d{2}-\d{2}/);
      if (match) return match[0];
    }
    return item.date;
  }

  // 2. lastUsedAt이 가장 정확한 날짜 필드 (제목 서비스에서 사용)
  if (item.lastUsedAt && typeof item.lastUsedAt === 'string') {
    // ISO 형태 "2025-12-09T07:45:42.562945+00:00"에서 날짜 부분만 추출
    if (item.lastUsedAt.includes('T')) {
      return item.lastUsedAt.split('T')[0];
    }
    // YYYY-MM-DD 형태의 날짜 추출
    const match = item.lastUsedAt.match(/\d{4}-\d{2}-\d{2}/);
    if (match) return match[0];
  }
  
  // 3. updatedAt 필드 확인 (교열 서비스에서 주로 사용)
  if (item.updatedAt && typeof item.updatedAt === 'string') {
    // ISO 형태 "2025-12-12T06:56:28.970208+00:00"에서 날짜 부분만 추출
    if (item.updatedAt.includes('T')) {
      return item.updatedAt.split('T')[0];
    }
    // YYYY-MM-DD 형태의 날짜 추출
    const match = item.updatedAt.match(/\d{4}-\d{2}-\d{2}/);
    if (match) return match[0];
  }
  
  // 4. 다른 timestamp 형태의 날짜 필드들 확인
  const timestampField = item.createdAt || item.timestamp || item.usageDate;
  
  if (timestampField) {
    // 숫자(유닉스 타임스탬프)인 경우
    if (typeof timestampField === 'number') {
      const date = new Date(timestampField * 1000); // 초 단위 타임스탬프 가정
      return date.toISOString().split('T')[0];
    }
    
    // 문자열인 경우
    if (typeof timestampField === 'string') {
      // ISO 형태면 날짜 부분만 추출
      if (timestampField.includes('T')) {
        return timestampField.split('T')[0];
      }
      // YYYY-MM-DD 형태의 날짜 추출
      const match = timestampField.match(/\d{4}-\d{2}-\d{2}/);
      if (match) return match[0];
    }
  }

  // 4. SK에서 추출 시도
  const skField = serviceConfig.keyStructure.SK;
  const skValue = item[skField] || item.SK;

  if (skValue && typeof skValue === 'string') {
    // SK에서 날짜 패턴 추출
    const dateMatch = skValue.match(/\d{4}-\d{2}-\d{2}/);
    if (dateMatch) return dateMatch[0];
  }

  // 5. yearMonth 필드만 있는 경우 (월 단위 집계 데이터)
  // 교열 서비스의 경우 정확한 날짜가 없으므로 null 반환
  // (날짜 범위 필터링에서 제외됨)
  if (item.yearMonth && !item.lastUsedAt && !item.date) {
    // 교열 서비스는 월 단위로만 저장되므로 날짜 필터링 불가
    // yearMonth가 2025-12#basic 형태인 경우 처리
    const yearMonthStr = item.yearMonth.split('#')[0]; // #engineType 제거
    const match = yearMonthStr.match(/(\d{4})-(\d{2})/);
    if (match) {
      // 날짜 범위 필터링을 위해 null 반환하지 않고
      // 해당 월의 모든 날짜를 포함하도록 처리 필요
      // 일단 null 반환하여 날짜 필터링에서 제외
      return null;
    }
  }

  return null;
};

/**
 * 이메일로 사용자 검색
 */
exports. searchUserByEmail = async (email, serviceId = 'title') => {
  const userTable = USER_TABLES[serviceId];

  if (!userTable) {
    throw new Error(`User table not found for service: ${serviceId}`);
  }

  try {
    // 이메일로 사용자 검색 (Scan 사용)
    const command = new ScanCommand({
      TableName: userTable,
      FilterExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    });

    const response = await docClient.send(command);

    if (!response.Items || response.Items.length === 0) {
      return null;
    }

    return response.Items[0];
  } catch (error) {
    console.error(`Error searching user by email:`, error);
    throw error;
  }
};

/**
 * 사용자 ID로 사용량 조회
 */
exports. getUserUsage = async (userId, serviceId, yearMonth) => {
  const service = SERVICES_CONFIG.find(s => s.id === serviceId);

  if (!service) {
    throw new Error(`Service not found: ${serviceId}`);
  }

  try {
    console.log(`Querying usage for user ${userId} in ${service.usageTable} for ${yearMonth}`);

    // userId로 사용량 조회
    const command = new ScanCommand({
      TableName: service.usageTable,
      FilterExpression: 'userId = :userId AND contains(#sk, :yearMonth)',
      ExpressionAttributeNames: {
        '#sk': service.keyStructure.SK
      },
      ExpressionAttributeValues: {
        ':userId': userId,
        ':yearMonth': yearMonth
      }
    });

    const response = await docClient.send(command);

    console.log(`Found ${response.Count} usage records for user ${userId}`);

    return {
      userId,
      serviceId: service.id,
      serviceName: service.displayName,
      items: response.Items || [],
      count: response.Count || 0
    };
  } catch (error) {
    console.error(`Error querying user usage:`, error);
    throw error;
  }
};

/**
 * 날짜가 범위 내에 있는지 확인
 */
const isDateInRange = (dateStr, startDate, endDate) => {
  if (!dateStr) return false;
  if (!startDate || !endDate) return true; // 범위가 없으면 포함
  
  try {
    // 날짜 문자열을 Date 객체로 변환
    const date = new Date(dateStr + 'T00:00:00.000Z');
    const start = new Date(startDate + 'T00:00:00.000Z');
    const end = new Date(endDate + 'T23:59:59.999Z');
    
    // 날짜 비교
    return date >= start && date <= end;
  } catch (error) {
    console.error('Date parsing error in isDateInRange:', error);
    return false;
  }
};

/**
 * 사용자 가입 추이 데이터 조회 (일별 신규 가입자 수)
 */
exports. getUserRegistrationTrend = async () => {
  try {
    console.log('Fetching user registration trend from Cognito');

    // Cognito User Pool의 모든 사용자 조회
    const users = [];
    let paginationToken = null;

    do {
      const command = {
        UserPoolId: USER_POOL_ID,
        Limit: COGNITO_CONFIG.FETCH_LIMIT,
        ...(paginationToken && { PaginationToken: paginationToken })
      };

      const { CognitoIdentityProviderClient, ListUsersCommand } = await import('@aws-sdk/client-cognito-identity-provider');
      const listCommand = new ListUsersCommand(command);
      const response = await cognitoClient.send(listCommand);

      if (response.Users) {
        users.push(...response.Users);
      }

      paginationToken = response.PaginationToken;
    } while (paginationToken);

    console.log(`Found ${users.length} total users in Cognito`);

    // 날짜별로 그룹화
    const dailyRegistrations = {};

    users.forEach(user => {
      if (user.UserCreateDate) {
        const date = new Date(user.UserCreateDate);
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD

        if (!dailyRegistrations[dateStr]) {
          dailyRegistrations[dateStr] = {
            date: dateStr,
            newUsers: 0,
            userIds: []
          };
        }

        dailyRegistrations[dateStr].newUsers += 1;
        dailyRegistrations[dateStr].userIds.push(user.Username);
      }
    });

    // 날짜순 정렬 및 누적 계산
    const sortedDates = Object.keys(dailyRegistrations).sort();
    let cumulativeTotal = 0;

    const trendData = sortedDates.map(date => {
      const data = dailyRegistrations[date];
      cumulativeTotal += data.newUsers;

      return {
        date: data.date,
        newUsers: data.newUsers,
        cumulativeUsers: cumulativeTotal
      };
    });

    console.log(`Processed ${trendData.length} days of registration data`);

    return trendData;
  } catch (error) {
    console.error('Error fetching user registration trend:', error);
    throw error;
  }
};

/**
 * 모든 사용자와 사용량 조회 (단일 또는 전체 서비스)
 */
exports.getAllUsersWithUsage = async (serviceId = 'title', yearMonth) => {
  try {
    let allUsageItems = [];
    let startDate = null;
    let endDate = null;

    // 날짜 범위 파싱
    if (yearMonth && yearMonth.includes('~')) {
      const [start, end] = yearMonth.split('~');
      startDate = start;
      endDate = end;
    }

    // serviceId가 'all'이거나 비어있으면 전체 서비스 조회
    if (!serviceId || serviceId === 'all') {
      console.log(`Fetching all users from ALL services for ${yearMonth || 'all time'}`);

      // 모든 서비스를 병렬로 조회
      const services = SERVICES_CONFIG;
      const promises = services.map(async (service) => {
        let usageCommand;

        if (!yearMonth || yearMonth === 'all') {
          usageCommand = new ScanCommand({
            TableName: service.usageTable
          });
        } else if (yearMonth.includes('~')) {
          usageCommand = new ScanCommand({
            TableName: service.usageTable
          });
        } else {
          usageCommand = new ScanCommand({
            TableName: service.usageTable,
            FilterExpression: 'contains(#sk, :yearMonth)',
            ExpressionAttributeNames: {
              '#sk': service.keyStructure.SK
            },
            ExpressionAttributeValues: {
              ':yearMonth': yearMonth
            }
          });
        }

        const serviceDocClient = getDocClient(service);
        const response = await serviceDocClient.send(usageCommand);
        return {
          service,
          items: response.Items || []
        };
      });

      const results = await Promise.all(promises);

      // 모든 서비스의 아이템을 합치고 서비스 정보 태깅
      results.forEach(result => {
        result.items.forEach(item => {
          allUsageItems.push({
            ...item,
            _serviceConfig: result.service
          });
        });
      });
    } else {
      // 특정 서비스만 조회
      const actualServiceId = serviceId.replace(/_kr$|_en$/, '');
      const service = SERVICES_CONFIG.find(s => s.id === actualServiceId);

      if (!service) {
        throw new Error(`Service not found: ${actualServiceId}`);
      }

      const { tableName, keyStructure } = getTableConfigForService(service, serviceId);

      console.log(`Fetching all users from ${tableName} for ${yearMonth || 'all time'} (original serviceId: ${serviceId})`);

      let usageCommand;
      if (!yearMonth || yearMonth === 'all') {
        usageCommand = new ScanCommand({
          TableName: tableName
        });
      } else if (yearMonth.includes('~')) {
        usageCommand = new ScanCommand({
          TableName: tableName
        });
      } else {
        // 실제 SK 필드명 결정
        const skFieldName = keyStructure.SK.includes('#') ? 'SK' : keyStructure.SK;
        
        usageCommand = new ScanCommand({
          TableName: tableName,
          FilterExpression: 'contains(#sk, :yearMonth) OR #yearMonth = :yearMonth',
          ExpressionAttributeNames: {
            '#sk': skFieldName,
            '#yearMonth': 'yearMonth'
          },
          ExpressionAttributeValues: {
            ':yearMonth': yearMonth
          }
        });
      }

      const serviceDocClient = getDocClient(service);
      const response = await serviceDocClient.send(usageCommand);
      allUsageItems = (response.Items || []).map(item => ({
        ...item,
        _serviceConfig: { ...service, keyStructure } // 영어 버전 키 구조 포함
      }));
    }

    // 날짜 범위 필터링
    if (startDate && endDate) {
      allUsageItems = allUsageItems.filter(item => {
        const dateStr = extractDate(item, item._serviceConfig);
        
        // 날짜가 없는 경우 (교열 서비스 등 월 단위 데이터)
        if (!dateStr) {
          // yearMonth 필드에서 월 정보 추출하여 필터링
          if (item.yearMonth) {
            const yearMonthStr = item.yearMonth.split('#')[0]; // #engineType 제거
            const match = yearMonthStr.match(/(\d{4})-(\d{2})/);
            if (match) {
              const itemYear = parseInt(match[1]);
              const itemMonth = parseInt(match[2]);
              
              // 시작/종료 날짜의 년월 추출
              const startYear = parseInt(startDate.substring(0, 4));
              const startMonth = parseInt(startDate.substring(5, 7));
              const endYear = parseInt(endDate.substring(0, 4));
              const endMonth = parseInt(endDate.substring(5, 7));
              
              // 년월 기준으로 필터링
              const itemYearMonth = itemYear * 100 + itemMonth;
              const startYearMonth = startYear * 100 + startMonth;
              const endYearMonth = endYear * 100 + endMonth;
              
              return itemYearMonth >= startYearMonth && itemYearMonth <= endYearMonth;
            }
          }
          return false; // yearMonth도 없으면 제외
        }
        
        return isDateInRange(dateStr, startDate, endDate);
      });
    }

    console.log(`Found ${allUsageItems.length} total usage records`);

    // 1단계: userId별로 그룹화 (extractUserId 함수 사용)
    const userIdUsageMap = {};
    allUsageItems.forEach(item => {
      // userId를 다양한 형식에서 추출 (item.userId 또는 PK에서 추출)
      const userId = item.userId || extractUserId(item, item._serviceConfig);
      if (!userId) return;

      if (!userIdUsageMap[userId]) {
        userIdUsageMap[userId] = [];
      }
      userIdUsageMap[userId].push(item);
    });

    const uniqueUserIds = Object.keys(userIdUsageMap);
    console.log(`Found ${uniqueUserIds.length} unique user IDs`);

    // 2단계: 각 userId에 대해 Cognito에서 이메일 조회
    const userIdToEmailMap = {};
    await Promise.all(
      uniqueUserIds.map(async (userId) => {
        try {
          const cognitoUser = await getCognitoUserInfo(userId);
          userIdToEmailMap[userId] = {
            email: cognitoUser.email,
            username: cognitoUser.username,
            status: cognitoUser.status,
            enabled: cognitoUser.enabled,
            createdAt: cognitoUser.createdAt
          };
        } catch (error) {
          console.error(`Error fetching Cognito info for ${userId}:`, error.message);
          userIdToEmailMap[userId] = {
            email: userId,
            username: userId,
            status: 'unknown',
            enabled: true,
            createdAt: null
          };
        }
      })
    );

    // 3단계: 이메일을 기준으로 사용자 통합
    const emailUsageMap = {};
    uniqueUserIds.forEach(userId => {
      const userInfo = userIdToEmailMap[userId];
      const email = userInfo.email;
      const usageItems = userIdUsageMap[userId];

      if (!emailUsageMap[email]) {
        emailUsageMap[email] = {
          userIds: [userId],
          userInfo: userInfo,
          usageItems: []
        };
      } else {
        // 같은 이메일이 이미 있으면 userId 추가
        emailUsageMap[email].userIds.push(userId);
      }

      // 사용량 아이템 추가
      emailUsageMap[email].usageItems.push(...usageItems);
    });

    const uniqueEmails = Object.keys(emailUsageMap);
    console.log(`Consolidated into ${uniqueEmails.length} unique users by email`);

    // 4단계: 이메일별로 사용량 집계
    const usersWithUsage = uniqueEmails.map(email => {
      const data = emailUsageMap[email];
      const userUsageItems = data.usageItems;

      let totalTokens = 0;
      let totalInputTokens = 0;
      let totalOutputTokens = 0;
      let totalMessages = 0;
      const serviceDetails = {};

      userUsageItems.forEach(item => {
        totalTokens += (item.totalTokens || 0);
        totalInputTokens += (item.inputTokens || item.totalInputTokens || 0);
        totalOutputTokens += (item.outputTokens || item.totalOutputTokens || 0);
        totalMessages += (item.messageCount || item.messages || item.requestCount || 1);

        // 서비스별 상세 정보
        if (item._serviceConfig) {
          const serviceId = item._serviceConfig.id;
          let engineType = extractEngineType(item, item._serviceConfig);
          
          // 교열 서비스의 경우 engineType을 더 정확하게 추출
          if (serviceId === 'proofreading' && item.engineType) {
            engineType = item.engineType.toLowerCase();
          }
          
          // yearMonth에서 engineType 추출 (예: "2025-12#basic" -> "basic")
          if (!engineType && item.yearMonth && item.yearMonth.includes('#')) {
            const parts = item.yearMonth.split('#');
            if (parts.length > 1) {
              engineType = parts[1].toLowerCase();
            }
          }
          
          // 모든 엔진 타입을 소문자로 정규화 (Basic -> basic, Pro -> pro)
          if (engineType) {
            engineType = engineType.toLowerCase();
          }
          
          const key = `${serviceId}-${engineType || 'unknown'}`;

          if (!serviceDetails[key]) {
            serviceDetails[key] = {
              serviceId,
              engineType: engineType || 'unknown',
              totalTokens: 0,
              inputTokens: 0,
              outputTokens: 0,
              messageCount: 0
            };
          }

          serviceDetails[key].totalTokens += (item.totalTokens || 0);
          serviceDetails[key].inputTokens += (item.inputTokens || item.totalInputTokens || 0);
          serviceDetails[key].outputTokens += (item.outputTokens || item.totalOutputTokens || 0);
          serviceDetails[key].messageCount += (item.messageCount || item.messages || item.requestCount || 1);
        }
      });

      return {
        user: {
          userId: data.userIds.join(', '), // 여러 userId가 있으면 모두 표시
          email: email,
          username: data.userInfo.username,
          role: 'user',
          status: data.userInfo.enabled ? 'active' : 'inactive',
          createdAt: data.userInfo.createdAt // Cognito 사용자 생성 날짜
        },
        usage: {
          totalTokens,
          inputTokens: totalInputTokens,
          outputTokens: totalOutputTokens,
          messageCount: totalMessages,
          records: userUsageItems.length,
          details: Object.values(serviceDetails)
        }
      };
    });

    // 사용량이 많은 순으로 정렬
    usersWithUsage.sort((a, b) => b.usage.totalTokens - a.usage.totalTokens);

    return usersWithUsage;
  } catch (error) {
    console.error(`Error fetching all users with usage:`, error);
    throw error;
  }
};
