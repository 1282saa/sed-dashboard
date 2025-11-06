# Backend Source 디렉토리

Lambda 함수의 모든 소스 코드를 포함합니다.

## 📁 디렉토리 구조

```
backend/src/
├── config/          # 설정 파일
│   ├── constants.js    # 전역 상수 (AWS, API, CORS 등)
│   └── services.js     # DynamoDB 서비스 테이블 정의
│
├── handlers/        # Lambda 핸들러 (API 진입점)
│   └── usageHandler.js # 10개 API 엔드포인트 핸들러
│
├── services/        # 비즈니스 로직
│   └── dynamodbService.js # DynamoDB 쿼리 + Cognito 연동
│
└── utils/           # 유틸리티 함수
    ├── errors.js       # 커스텀 에러 클래스
    ├── response.js     # HTTP 응답 헬퍼
    └── validators.js   # 입력 검증 레이어
```

## 🎯 각 디렉토리 역할

### 📁 config/
**목적**: 애플리케이션 설정 및 상수 관리

**파일**:
- `constants.js`: AWS 설정, API 설정, CORS, 에러 메시지 등
- `services.js`: 8개 DynamoDB 테이블 메타데이터

**책임**: 
- 환경별 설정 분리
- 하드코딩 방지
- 중앙화된 설정 관리

### 📁 handlers/
**목적**: API Gateway 이벤트 처리 (Lambda 진입점)

**파일**:
- `usageHandler.js`: 10개 API 엔드포인트

**API 목록**:
1. `getAllUsage` - 전체 서비스 사용량
2. `getUsageByService` - 특정 서비스 사용량
3. `getUsageSummary` - 사용량 요약 통계
4. `getTopServices` - Top 5 서비스
5. `getTopEngines` - Top 5 엔진
6. `getDailyUsageTrend` - 일별 사용량 추이
7. `getMonthlyUsageTrend` - 월별 사용량 추이
8. `getUserUsageByEmail` - 사용자별 사용량
9. `getAllUsersUsage` - 전체 사용자 사용량
10. `getUsersRegistrationTrend` - 사용자 가입 추이

**책임**:
- API 요청 파싱
- 입력 검증
- 비즈니스 로직 호출
- HTTP 응답 생성

### 📁 services/
**목적**: 비즈니스 로직 및 데이터 액세스

**파일**:
- `dynamodbService.js`: DynamoDB 쿼리 + Cognito 사용자 조회

**주요 기능**:
- DynamoDB 테이블 스캔
- Cognito User Pool 조회
- 데이터 집계 및 변환
- 통계 계산

**책임**:
- AWS 서비스 통신
- 데이터 처리 로직
- 에러 핸들링

### 📁 utils/
**목적**: 재사용 가능한 유틸리티 함수

**파일**:
- `errors.js`: 표준화된 에러 클래스
- `response.js`: HTTP 응답 헬퍼 (CORS 포함)
- `validators.js`: 입력 검증 함수

**책임**:
- 공통 기능 제공
- 코드 중복 제거
- 일관성 유지

## 🔄 데이터 흐름

```
1. API Gateway
   ↓
2. handlers/usageHandler.js (이벤트 수신)
   ↓
3. utils/validators.js (입력 검증)
   ↓
4. services/dynamodbService.js (데이터 조회)
   ↓
5. utils/response.js (응답 생성)
   ↓
6. API Gateway (클라이언트로 응답)
```

## 🔧 개발 가이드

### 새 API 엔드포인트 추가

1. **핸들러 추가** (`handlers/usageHandler.js`)
```javascript
export const newEndpoint = async (event) => {
  const origin = event.headers?.origin;
  
  // 1. 입력 검증
  const params = event.queryStringParameters || {};
  const validation = validateSomething(params.value);
  if (!validation.valid) {
    return validationErrorResponse([{ field: 'value', error: validation.error }], origin);
  }
  
  // 2. 비즈니스 로직
  const data = await someService(params);
  
  // 3. 성공 응답
  return successResponse(data, origin);
};
```

2. **serverless.yml에 등록**
```yaml
functions:
  newEndpoint:
    handler: src/handlers/usageHandler.newEndpoint
    events:
      - http:
          path: usage/new-endpoint
          method: get
          cors: true
```

3. **배포**
```bash
npm run deploy
```

### 새 서비스 추가

1. **설정 추가** (`config/services.js`)
```javascript
{
  id: 'new_service',
  tableName: 'new-service-table',
  active: true,
  name: '새 서비스',
  name_en: 'New Service',
}
```

2. **DynamoDB 권한 추가** (`serverless.yml`)
```yaml
- Effect: Allow
  Action:
    - dynamodb:Scan
    - dynamodb:Query
  Resource:
    - arn:aws:dynamodb:${self:provider.region}:*:table/new-service-table
```

## 🧪 테스트

### 로컬 테스트 (serverless-offline)
```bash
npm run local  # http://localhost:3001
```

### API 테스트 예시
```bash
# 전체 사용량 조회
curl http://localhost:3001/usage/all?yearMonth=2025-10

# 특정 서비스 조회
curl http://localhost:3001/usage/title?yearMonth=2025-10

# 사용자 검색
curl "http://localhost:3001/usage/user?email=user@example.com&serviceId=title"
```

## 📊 성능 최적화

### DynamoDB
- 필요한 속성만 ProjectionExpression 사용
- FilterExpression으로 불필요한 데이터 제외
- Parallel Scan 고려 (대용량 테이블)

### Lambda
- 메모리 512MB (현재 설정)
- 타임아웃 30초 (현재 설정)
- Cold Start 최소화 (불필요한 import 제거)

## ⚠️ 주의사항

1. **보안**
   - API 키는 환경변수 사용
   - CORS 설정 검증
   - 입력값 검증 필수

2. **에러 처리**
   - 모든 에러는 utils/errors.js의 클래스 사용
   - 클라이언트에 민감한 정보 노출 금지

3. **로깅**
   - console.log 대신 구조화된 로깅 권장
   - CloudWatch Logs 모니터링

---

**작성일**: 2025-11-06
**버전**: 1.0.0
