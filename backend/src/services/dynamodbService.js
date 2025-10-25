/**
 * DynamoDB 서비스 레이어
 * DynamoDB 테이블 쿼리 및 데이터 집계
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { CognitoIdentityProviderClient, AdminGetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { SERVICES_CONFIG } from '../config/services.js';

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);
const cognitoClient = new CognitoIdentityProviderClient({ region: 'us-east-1' });

// 사용자 테이블 이름
const USER_TABLES = {
  title: 'nexus-title-generator-users-prod',
  // 다른 서비스의 사용자 테이블은 필요시 추가
};

// Cognito User Pool ID
const USER_POOL_ID = 'us-east-1_ohLOswurY'; // sedaily.ai_cognito

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
      enabled: response.Enabled !== false
    };
  } catch (error) {
    console.error(`Error fetching Cognito user ${userId}:`, error.message);
    // Cognito에 사용자가 없으면 userId를 이메일로 사용
    return {
      email: userId,
      username: userId,
      status: 'unknown',
      enabled: true
    };
  }
};

/**
 * 특정 서비스의 사용량 데이터 조회
 */
export const getServiceUsage = async (serviceId, yearMonth) => {
  const service = SERVICES_CONFIG.find(s => s.id === serviceId);

  if (!service) {
    throw new Error(`Service not found: ${serviceId}`);
  }

  try {
    console.log(`Querying ${service.usageTable} for yearMonth: ${yearMonth}`);
    console.log(`Using SK field: ${service.keyStructure.SK}`);

    // Scan 명령으로 전체 데이터 조회
    const command = new ScanCommand({
      TableName: service.usageTable,
      FilterExpression: 'contains(#sk, :yearMonth)',
      ExpressionAttributeNames: {
        '#sk': service.keyStructure.SK
      },
      ExpressionAttributeValues: {
        ':yearMonth': yearMonth
      }
    });

    const response = await docClient.send(command);

    console.log(`Found ${response.Count} items for ${service.id}`);
    if (response.Items && response.Items.length > 0) {
      console.log('Sample item:', JSON.stringify(response.Items[0]));
    }

    return {
      serviceId: service.id,
      serviceName: service.displayName,
      items: response.Items || [],
      count: response.Count || 0
    };
  } catch (error) {
    console.error(`Error querying ${service.usageTable}:`, error);
    return {
      serviceId: service.id,
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
export const getAllServicesUsage = async (yearMonth) => {
  const services = SERVICES_CONFIG;

  // 병렬로 모든 서비스 조회
  const promises = services.map(service =>
    getServiceUsage(service.id, yearMonth)
  );

  const results = await Promise.all(promises);

  return results;
};

/**
 * 사용량 데이터 집계
 */
export const aggregateUsageData = (items, serviceConfig) => {
  let totalTokens = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalMessages = 0;
  const uniqueUsers = new Set();
  const engineStats = {};

  items.forEach(item => {
    // 토큰 집계
    totalTokens += (item.totalTokens || 0);
    totalInputTokens += (item.inputTokens || 0);
    totalOutputTokens += (item.outputTokens || 0);
    totalMessages += (item.messageCount || item.messages || 1);

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
      engineStats[engineType].inputTokens += (item.inputTokens || 0);
      engineStats[engineType].outputTokens += (item.outputTokens || 0);
      engineStats[engineType].messageCount += (item.messageCount || item.messages || 1);
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
export const getMonthlyTrend = async (serviceId, monthsBack = 12) => {
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
 * 일별 데이터 집계 (특정 월)
 */
export const getDailyTrend = async (serviceId, yearMonth) => {
  let data;

  if (serviceId) {
    data = await getServiceUsage(serviceId, yearMonth);
  } else {
    const allData = await getAllServicesUsage(yearMonth);
    data = {
      items: allData.flatMap(d => d.items)
    };
  }

  // 날짜별로 그룹화
  const dailyMap = {};
  const service = SERVICES_CONFIG.find(s => s.id === serviceId) || SERVICES_CONFIG[0];

  data.items.forEach(item => {
    // 날짜 추출
    const date = extractDate(item, service);

    if (!date) return;

    if (!dailyMap[date]) {
      dailyMap[date] = [];
    }
    dailyMap[date].push(item);
  });

  // 각 날짜별로 집계
  const dailyData = Object.keys(dailyMap).sort().map(date => {
    const aggregated = aggregateUsageData(dailyMap[date], service);
    return {
      date,
      ...aggregated
    };
  });

  return dailyData;
};

/**
 * 날짜 추출
 */
const extractDate = (item, serviceConfig) => {
  // createdAt, timestamp, date 등의 필드에서 날짜 추출
  const dateField = item.createdAt || item.timestamp || item.date || item.usageDate;

  if (!dateField) {
    // SK에서 추출 시도
    const skField = serviceConfig.keyStructure.SK;
    const skValue = item[skField] || item.SK;

    if (skValue && typeof skValue === 'string') {
      // "2025-10-24" 형태의 날짜 추출
      const match = skValue.match(/\d{4}-\d{2}-\d{2}/);
      if (match) return match[0];
    }

    return null;
  }

  // ISO 형태면 날짜 부분만 추출
  if (typeof dateField === 'string') {
    return dateField.split('T')[0];
  }

  return dateField;
};

/**
 * 이메일로 사용자 검색
 */
export const searchUserByEmail = async (email, serviceId = 'title') => {
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
export const getUserUsage = async (userId, serviceId, yearMonth) => {
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
 * 모든 사용자와 사용량 조회
 */
export const getAllUsersWithUsage = async (serviceId = 'title', yearMonth) => {
  const service = SERVICES_CONFIG.find(s => s.id === serviceId);

  if (!service) {
    throw new Error(`Service not found: ${serviceId}`);
  }

  try {
    console.log(`Fetching all users with usage from ${service.usageTable} for ${yearMonth || 'all time'}`);

    // 사용량 테이블에서 데이터 조회
    let usageCommand;

    // yearMonth가 없거나 'all'이면 전체 조회
    if (!yearMonth || yearMonth === 'all') {
      usageCommand = new ScanCommand({
        TableName: service.usageTable
      });
    } else {
      // 특정 월만 조회
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

    const usageResponse = await docClient.send(usageCommand);
    const usageItems = usageResponse.Items || [];

    console.log(`Found ${usageItems.length} usage records`);

    // userId별로 그룹화
    const userUsageMap = {};
    usageItems.forEach(item => {
      const userId = item.userId;
      if (!userId) return;

      if (!userUsageMap[userId]) {
        userUsageMap[userId] = [];
      }
      userUsageMap[userId].push(item);
    });

    const uniqueUserIds = Object.keys(userUsageMap);
    console.log(`Found ${uniqueUserIds.length} unique users`);

    // 각 사용자의 정보와 사용량 집계
    const usersWithUsage = await Promise.all(
      uniqueUserIds.map(async (userId) => {
        try {
          // Cognito에서 사용자 정보 가져오기
          const cognitoUser = await getCognitoUserInfo(userId);

          // 해당 사용자의 사용량 집계
          const userUsageItems = userUsageMap[userId];
          const aggregated = aggregateUsageData(userUsageItems, service);

          // 엔진별 상세 정보
          const details = Object.keys(aggregated.byEngine).map(engineType => ({
            engineType,
            totalTokens: aggregated.byEngine[engineType].totalTokens,
            inputTokens: aggregated.byEngine[engineType].inputTokens,
            outputTokens: aggregated.byEngine[engineType].outputTokens,
            messageCount: aggregated.byEngine[engineType].messageCount
          }));

          return {
            user: {
              userId,
              email: cognitoUser.email,
              username: cognitoUser.username,
              role: 'user',
              status: cognitoUser.enabled ? 'active' : 'inactive',
              createdAt: null
            },
            usage: {
              totalTokens: aggregated.totalTokens,
              inputTokens: aggregated.inputTokens,
              outputTokens: aggregated.outputTokens,
              messageCount: aggregated.messageCount,
              records: userUsageItems.length,
              details
            }
          };
        } catch (error) {
          console.error(`Error processing user ${userId}:`, error);
          // 오류 발생 시에도 userId는 표시
          return {
            user: {
              userId,
              email: userId,
              username: userId,
              role: 'user',
              status: 'unknown',
              createdAt: null
            },
            usage: {
              totalTokens: 0,
              inputTokens: 0,
              outputTokens: 0,
              messageCount: 0,
              records: 0,
              details: []
            }
          };
        }
      })
    );

    // 사용량이 많은 순으로 정렬
    usersWithUsage.sort((a, b) => b.usage.totalTokens - a.usage.totalTokens);

    return usersWithUsage;
  } catch (error) {
    console.error(`Error fetching all users with usage:`, error);
    throw error;
  }
};
