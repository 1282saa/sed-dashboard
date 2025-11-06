# Backend Config 디렉토리

이 디렉토리는 백엔드 Lambda 함수의 설정 파일을 관리합니다.

## 📁 파일 구조

```
backend/src/config/
├── constants.js    # 애플리케이션 전역 상수 (AWS, API, CORS 등)
├── services.js     # DynamoDB 서비스 테이블 정의
└── README.md       # 이 파일
```

## 📄 파일 설명

### `constants.js`
**목적**: 애플리케이션 전역 상수 중앙 관리

**주요 내용**:
- `AWS_CONFIG`: AWS 리전, Cognito User Pool ID
- `API_CONFIG`: API 타임아웃, 페이지네이션 설정
- `COGNITO_CONFIG`: Cognito 쿼리 제한값
- `DYNAMODB_CONFIG`: DynamoDB Scan 설정
- `DATE_CONFIG`: 날짜 형식 및 기본 기간
- `CACHE_CONFIG`: 캐시 TTL (향후 Redis 도입 시)
- `CORS_CONFIG`: CORS 보안 설정
- `ERROR_MESSAGES`: 표준 에러 메시지
- `DEFAULTS`: API 파라미터 기본값

**사용 예시**:
```javascript
import { AWS_CONFIG, CORS_CONFIG } from '../config/constants.js';

const region = AWS_CONFIG.REGION;
const allowedOrigins = CORS_CONFIG.ALLOWED_ORIGINS;
```

### `services.js`
**목적**: 8개 DynamoDB 테이블 메타데이터 정의

**주요 내용**:
- 각 서비스별 DynamoDB 테이블 이름
- 서비스 활성화 상태
- 서비스 한글/영문 이름
- 실제 데이터 레코드 수

**서비스 목록**:
1. `title` - 제목 생성 (한글)
2. `proofreading` - 교열 (한글)
3. `news` - 보도 작성 (한글)
4. `foreign` - 외신 번역 (한글)
5. `revision` - 퇴고 (한글)
6. `buddy` - 버디 (한글)
7. `title_en` - 제목 생성 (영문)
8. `revision_en` - 퇴고 (영문)

**사용 예시**:
```javascript
import { SERVICE_CONFIG } from '../config/services.js';

const titleService = SERVICE_CONFIG.find(s => s.id === 'title');
console.log(titleService.tableName); // 'nx-tt-dev-ver3-usage-tracking'
```

## 🔒 보안 주의사항

- **환경변수 사용**: 민감한 정보는 반드시 환경변수로 관리
- **하드코딩 금지**: API 키, 시크릿 등은 절대 constants.js에 하드코딩 금지
- **CORS 검증**: 프로덕션 배포 전 ALLOWED_ORIGINS 확인 필수

## 🔧 수정 가이드

### 새로운 상수 추가
```javascript
// constants.js에 새 섹션 추가
export const NEW_CONFIG = {
  SETTING_1: 'value1',
  SETTING_2: 'value2',
};
```

### 새로운 서비스 추가
```javascript
// services.js의 SERVICE_CONFIG 배열에 추가
{
  id: 'new_service',
  tableName: 'new-service-table',
  active: true,
  name: '새 서비스',
  name_en: 'New Service',
  recordCount: 0,
}
```

## 📊 연관 파일

- `backend/src/handlers/usageHandler.js` - 이 상수들을 사용하는 핸들러
- `backend/src/services/dynamodbService.js` - DynamoDB 쿼리에서 서비스 설정 사용
- `backend/src/utils/validators.js` - 검증에 상수 활용

---

**작성일**: 2025-11-06  
**버전**: 1.0.0
