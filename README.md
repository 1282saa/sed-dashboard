# 통합 모니터링 대시보드

6개 마이크로서비스의 DynamoDB 사용량 데이터를 통합 조회하는 모니터링 대시보드입니다.

## 📊 주요 기능

### ✅ 구현 완료

1. **통합 통계 대시보드**
   - 전체 서비스의 토큰 사용량 집계
   - 메시지 수, 활성 사용자 통계
   - 월간 사용량 추이 및 비교

2. **시각화 차트**
   - 서비스별 사용량 파이 차트
   - 엔진별 사용량 바 차트
   - 일별/월별 추이 라인 차트
   - 입출력 토큰 비율 차트

3. **서비스별 상세 데이터**
   - 각 마이크로서비스별 상세 통계
   - 엔진별 분류
   - 실시간 데이터 새로고침

4. **필터링 및 검색**
   - 월별 필터링
   - 서비스별 필터링
   - 상세 데이터 검색

5. **백엔드 Lambda API**
   - DynamoDB 실시간 데이터 조회
   - 병렬 쿼리 최적화
   - RESTful API 엔드포인트

## 🏗️ 프로젝트 구조

```
unified-monitoring-dashboard/
├── frontend/                      # React 프론트엔드
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # 공통 컴포넌트 (Card, StatsCard)
│   │   │   ├── charts/           # 차트 컴포넌트 (Pie, Bar, Line)
│   │   │   └── dashboard/        # 대시보드 메인 페이지
│   │   ├── services/             # API 서비스 레이어
│   │   ├── config/               # 설정 파일 (서비스 목록)
│   │   └── utils/                # 유틸리티 함수
│   └── package.json
│
├── backend/                       # Lambda 백엔드 (TODO)
│   ├── handlers/                 # Lambda 핸들러
│   ├── services/                 # 비즈니스 로직
│   └── utils/                    # 헬퍼 함수
│
└── docs/                          # 문서
```

## 서비스 목록

- **제목 (Nexus Title)** - `nx-tt-dev-ver3-usage-tracking`
- **교열 (Nexus Writing Pro)** - `nx-wt-prf-usage`
- **보도 (W1)** - `w1-usage`
- **외신 (F1)** - `f1-usage-two`
- **퇴고 (Seoul Economic Column)** - `sedaily-column-usage`
- **버디 (P2)** - `p2-two-usage-two`

## 🚀 시작하기

### 1. 백엔드 설정 및 배포

```bash
cd backend

# 의존성 설치
npm install

# AWS 자격 증명 설정 (이미 되어있다면 생략)
aws configure

# Serverless Framework 배포
npm run deploy

# 배포 후 나오는 API Gateway URL을 복사하세요
# 예: https://xxxxx.execute-api.ap-northeast-2.amazonaws.com/dev
```

### 2. 프론트엔드 설정 및 실행

```bash
cd frontend

# 의존성 설치
npm install

# 환경 변수 파일 생성
cp .env.example .env

# .env 파일 수정 - API_BASE_URL을 백엔드 URL로 변경
# VITE_API_BASE_URL=https://xxxxx.execute-api.ap-northeast-2.amazonaws.com/dev

# 개발 서버 실행
npm run dev

# 브라우저에서 http://localhost:5174 접속
```

## 로컬 개발 (Backend Offline)

백엔드를 로컬에서 실행하려면:

```bash
cd backend

# Serverless Offline 실행
npm run local

# http://localhost:3001 에서 실행됨
```

프론트엔드 `.env` 파일:
```
VITE_API_BASE_URL=http://localhost:3001
```

## 📦 기술 스택

### Frontend
- **React 18** - UI 라이브러리
- **Vite** - 빌드 도구
- **Tailwind CSS** - 스타일링
- **Recharts** - 차트 라이브러리
- **Framer Motion** - 애니메이션
- **Lucide React** - 아이콘
- **Axios** - HTTP 클라이언트

### Backend
- **AWS Lambda** - 서버리스 함수
- **Node.js 20** - 런타임
- **AWS SDK v3** - DynamoDB 클라이언트
- **Serverless Framework** - 배포 도구
- **DynamoDB** - 데이터베이스

## API 엔드포인트

### GET /usage/all
전체 서비스 사용량 조회
- Query: `yearMonth` (예: 2025-10)

### GET /usage/{serviceId}
특정 서비스 사용량 조회
- Path: `serviceId`
- Query: `yearMonth`

### GET /usage/summary
통계 요약 조회
- Query: `yearMonth`

### GET /usage/top/services
Top 5 서비스
- Query: `yearMonth`, `limit` (기본값: 5)

### GET /usage/top/engines
Top 5 엔진
- Query: `yearMonth`, `limit`

### GET /usage/trend/daily
일별 추이
- Query: `serviceId` (옵션), `yearMonth`

### GET /usage/trend/monthly
월별 추이
- Query: `serviceId` (옵션), `months` (기본값: 12)

## 📝 서비스 설정

`frontend/src/config/services.js` 파일에서 모니터링할 서비스 목록을 관리합니다:

```javascript
export const SERVICES_CONFIG = [
  {
    id: 'nx-tt-dev-ver3',
    name: 'Nexus Title',
    displayName: 'Nexus 타이틀 생성기',
    usageTable: 'nx-tt-dev-ver3-usage-tracking',
    color: '#8B5CF6',
    engines: ['T5', 'C7', 'pro'],
  },
  // ... 더 많은 서비스
];
```

## 🗄️ DynamoDB 테이블 구조

각 서비스는 다음과 같은 usage 테이블을 가집니다:

```
PK: user#<userId>
SK: engine#<engineType>#<yearMonth>

Attributes:
- userId: string
- engineType: string
- yearMonth: string (YYYY-MM)
- totalTokens: number
- inputTokens: number
- outputTokens: number
- messageCount: number
- lastUsedAt: string (ISO date)
```

## 📊 현재 모니터링 중인 서비스

1. **Nexus Title** - AI 타이틀 생성
2. **Nexus Proofreading** - AI 교정
3. **Nexus Writing Pro** - AI 라이팅
4. **Nexus Router** - AI 라우팅
5. **AI Nova** - AI Nova 서비스
6. **Seoul Economic Column** - 서울경제 칼럼
7. **B1, F1, G2** - 기타 프로젝트들

## 🔜 다음 단계

### 백엔드 구현
1. Lambda 함수 생성
   - 전체 서비스 usage 데이터 집계
   - DynamoDB 병렬 조회 최적화
   - 캐싱 전략 구현

2. API Gateway 설정
   - REST API 엔드포인트
   - CORS 설정
   - API 키 인증

3. 배포
   - S3 + CloudFront (Frontend)
   - Lambda + API Gateway (Backend)
   - IAM 권한 설정

### 기능 개선
- 실시간 업데이트 (WebSocket)
- 알림 기능 (한도 초과시)
- 데이터 내보내기 (CSV/Excel)
- 사용자별 권한 관리
- 커스텀 대시보드 생성

## 📄 라이센스

MIT License

## 👥 작성자

서울경제신문 개발팀
