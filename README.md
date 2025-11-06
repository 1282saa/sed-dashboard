# Unified Monitoring Dashboard (Nexus)

통합 AI 서비스 모니터링 대시보드 - 서울경제신문

## 📋 프로젝트 개요

이 프로젝트는 여러 AI 서비스(제목, 교열, 보도, 외신, 퇴고, 버디)의 사용량을 실시간으로 모니터링하고 분석하는 통합 대시보드입니다.

**주요 기능:**
- 📊 서비스별/엔진별 사용량 통계
- 👥 사용자별 사용량 조회 및 검색
- 📈 일별/월별 사용량 추이 분석
- 🎯 Top 서비스 및 엔진 랭킹
- 📅 기간별 데이터 필터링

**기술 스택:**
- Frontend: React 19, Vite, Tailwind CSS, Recharts
- Backend: AWS Lambda (Node.js 20.x), Serverless Framework
- Database: DynamoDB (8개 테이블)
- Auth: AWS Cognito
- Hosting: CloudFront + S3

## 🏗 프로젝트 구조

```
dashboard_nexus/ver1/
├── frontend/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/      # UI 컴포넌트
│   │   │   ├── auth/        # 인증 관련
│   │   │   ├── charts/      # 차트 컴포넌트
│   │   │   ├── common/      # 공통 컴포넌트
│   │   │   ├── dashboard/   # 대시보드
│   │   │   └── user/        # 사용자 관련
│   │   ├── contexts/        # React Context
│   │   ├── services/        # API 서비스
│   │   ├── utils/           # 유틸리티
│   │   └── config/          # 설정 파일
│   └── package.json
│
└── backend/                 # Serverless 백엔드
    ├── src/
    │   ├── handlers/        # Lambda 핸들러
    │   ├── services/        # 비즈니스 로직
    │   ├── utils/           # 유틸리티
    │   └── config/          # 설정 파일
    ├── serverless.yml       # Serverless 설정
    └── package.json
```

## 🚀 시작하기

### 사전 요구사항

- Node.js 20.x 이상
- npm 또는 yarn
- AWS CLI 설정 완료
- AWS 계정 및 적절한 권한

### 설치

#### 1. 프로젝트 클론

```bash
git clone https://github.com/1282saa/sed-dashboard.git
cd sed-dashboard/dashboard_nexus/ver1
```

#### 2. Frontend 설치 및 실행

```bash
cd frontend
npm install

# 환경변수 설정
cp .env.example .env
# .env 파일에서 VITE_API_BASE_URL 수정

# 개발 서버 실행
npm run dev
```

Frontend는 `http://localhost:5173`에서 실행됩니다.

#### 3. Backend 설치 및 배포

```bash
cd backend
npm install

# 환경변수 설정 (선택사항)
cp .env.example .env

# 배포
npm run deploy

# 로컬 개발 (선택사항, Serverless Framework 로그인 필요)
npm run local
```

## 🔧 환경 변수

### Frontend (.env)

```env
VITE_API_BASE_URL=https://your-api-gateway-url/dev
```

### Backend (.env)

```env
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
ALLOWED_ORIGIN=https://dashboard.sedaily.ai
STAGE=dev
```

## 📦 배포

### Frontend 배포 (CloudFront + S3)

```bash
cd frontend
npm run build

# S3 업로드
aws s3 sync dist/ s3://sed-dashboard-monitoring/ --delete

# CloudFront 캐시 무효화
aws cloudfront create-invalidation --distribution-id ECRURESQSCGGQ --paths "/*"
```

### Backend 배포 (Lambda)

```bash
cd backend
npm run deploy          # dev 환경
npm run deploy:prod     # production 환경
```

## 🧪 테스트

```bash
# Frontend 테스트
cd frontend
npm run test

# Backend 테스트
cd backend
npm run test
```

## 📊 DynamoDB 테이블

프로젝트는 다음 8개의 DynamoDB 테이블과 연결됩니다:

| 서비스 | 테이블 이름 | 설명 |
|--------|------------|------|
| 제목 (한글) | nx-tt-dev-ver3-usage-tracking | 제목 생성 서비스 |
| 교열 (한글) | nx-wt-prf-usage | 교열 서비스 |
| 보도 (한글) | w1-usage | 보도 작성 서비스 |
| 외신 (한글) | f1-usage-two | 외신 번역 서비스 |
| 퇴고 (한글) | sedaily-column-usage | 퇴고 서비스 |
| 버디 (한글) | p2-two-usage-two | 버디 서비스 |
| 제목 (영문) | tf1-usage-two | 영문 제목 생성 |
| 퇴고 (영문) | er1-usage-two | 영문 퇴고 |

## 🎨 주요 기능

### 1. 엔진 이름 포맷팅

각 서비스별 엔진을 구분하기 쉽도록 고유한 프리픽스와 번호로 표시:

- `t1-1`, `t1-2` - 제목 서비스 엔진
- `p1-1`, `p1-2` - 교열 서비스 엔진
- `w1-1`, `w1-2` - 보도 서비스 엔진
- `f1-1`, `f1-2` - 외신 서비스 엔진
- `r1-1`, `r1-2` - 퇴고 서비스 엔진
- `b1-1`, `b1-2` - 버디 서비스 엔진

### 2. 사용자 인증

AWS Cognito를 통한 안전한 사용자 인증

### 3. 실시간 데이터 조회

DynamoDB Scan을 통한 실시간 사용량 데이터 조회

## 🔒 보안

- CORS 설정: 허용된 도메인만 접근 가능
- Cognito 인증: 인증된 사용자만 대시보드 접근
- IAM 역할: 최소 권한 원칙 적용
- 환경변수: 민감한 정보는 환경변수로 관리

## 📝 API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/usage/all` | 전체 서비스 사용량 |
| GET | `/usage/{serviceId}` | 특정 서비스 사용량 |
| GET | `/usage/summary` | 사용량 요약 통계 |
| GET | `/usage/top/services` | Top 5 서비스 |
| GET | `/usage/top/engines` | Top 5 엔진 |
| GET | `/usage/trend/daily` | 일별 사용량 추이 |
| GET | `/usage/trend/monthly` | 월별 사용량 추이 |
| GET | `/usage/user` | 사용자별 사용량 |
| GET | `/usage/users/all` | 전체 사용자 사용량 |
| GET | `/usage/users/registration-trend` | 사용자 가입 추이 |

## 🤝 기여

프로젝트 개선 제안이나 버그 리포트는 이슈로 등록해주세요.

## 📄 라이선스

서울경제신문 내부 프로젝트

## 🔗 링크

- 프로덕션: https://dashboard.sedaily.ai
- API: https://05oo6stfzk.execute-api.us-east-1.amazonaws.com/dev
- GitHub: https://github.com/1282saa/sed-dashboard

## 📞 문의

프로젝트 관련 문의사항은 개발팀으로 연락주세요.

---

**최종 업데이트:** 2025-11-06
**버전:** 1.0.0
