# Frontend Source 디렉토리

React 기반 프론트엔드 애플리케이션의 모든 소스 코드를 포함합니다.

## 📁 디렉토리 구조

```
frontend/src/
├── components/       # React 컴포넌트
│   ├── auth/            # 인증 관련 (Login)
│   ├── charts/          # 차트 컴포넌트 (Recharts)
│   ├── common/          # 공통 UI 컴포넌트
│   ├── dashboard/       # 대시보드 메인
│   └── user/            # 사용자 관련 (검색, 테이블)
│
├── constants/        # 공통 상수
│   └── defaults.js      # 기본값, 색상, 메시지 등
│
├── contexts/         # React Context
│   └── AuthContext.jsx  # 인증 상태 관리
│
├── services/         # API 통신
│   ├── api.js           # 백엔드 API 호출
│   └── authService.js   # Cognito 인증 서비스
│
├── utils/            # 유틸리티
│   └── engineFormatter.js # 엔진 이름 포맷팅
│
├── config/           # 설정
│   └── services.js      # 서비스 정의
│
├── App.jsx           # 루트 컴포넌트
└── main.jsx          # 진입점
```

## 🎯 각 디렉토리 역할

### 📁 components/

#### `auth/` - 인증 화면
- `Login.jsx`: 로그인 페이지 (Cognito)

#### `charts/` - 데이터 시각화
- `BarChartCard.jsx`: 막대 차트 카드
- `LineChartCard.jsx`: 라인 차트 카드
- `PieChartCard.jsx`: 파이 차트 카드
- `DailyUsageTrendChart.jsx`: 일별 추이 차트
- `UserRegistrationTrendChart.jsx`: 가입 추이 차트

**특징**:
- Recharts 라이브러리 사용
- 반응형 디자인
- 공통 색상 팔레트 (`constants/defaults.js`)

#### `common/` - 재사용 가능한 UI 컴포넌트
- `Card.jsx`: 기본 카드 컨테이너
- `CustomSelect.jsx`: 커스텀 드롭다운
- `DateRangePicker.jsx`: 날짜 범위 선택기
- `StatsCard.jsx`: 통계 카드
- `EmptyState.jsx`: 빈 상태 표시
- `ErrorBoundary.jsx`: React 에러 경계
- `ErrorMessage.jsx`: 에러 메시지
- `LoadingSpinner.jsx`: 로딩 스피너

**특징**:
- 일관된 UI/UX
- Tailwind CSS 스타일
- Accessibility (a11y) 고려

#### `dashboard/` - 메인 화면
- `Dashboard.jsx`: 대시보드 메인 화면
  - 서비스 필터
  - 월 선택기
  - 통계 카드
  - 차트 모음
  - 사용자 테이블

#### `user/` - 사용자 관리
- `UserSearch.jsx`: 이메일 검색
- `UsersTable.jsx`: 사용자 목록 및 사용량 표시

### 📁 constants/
- `defaults.js`: 공통 상수 관리
  - 날짜 기본값
  - 페이지네이션
  - 차트 색상
  - 에러 메시지
  - 로컬 스토리지 키

### 📁 contexts/
- `AuthContext.jsx`: 전역 인증 상태
  - 로그인/로그아웃
  - 사용자 정보
  - 토큰 관리

### 📁 services/
- `api.js`: 백엔드 API 통신
  - Axios 인스턴스
  - 10개 API 함수
- `authService.js`: Cognito 인증
  - 로그인
  - 토큰 검증

### 📁 utils/
- `engineFormatter.js`: 엔진 이름 변환
  - t5 → t1-1
  - Basic → p1-1
  - 11 → w1-1

## 🔄 데이터 흐름

### 1. 인증 흐름
```
Login.jsx
   ↓
authService.signIn()
   ↓
AuthContext (상태 저장)
   ↓
Dashboard.jsx (인증됨)
```

### 2. 데이터 조회 흐름
```
Dashboard.jsx (컴포넌트)
   ↓
api.fetchAllServicesUsage()
   ↓
Backend API (Lambda)
   ↓
engineFormatter.formatServiceEngines() (변환)
   ↓
Charts (시각화)
```

## 🎨 스타일링 가이드

### Tailwind CSS 클래스 사용
```jsx
<div className="p-4 bg-white rounded-lg shadow">
  <h2 className="text-lg font-semibold text-gray-900">Title</h2>
</div>
```

### 색상 팔레트
```javascript
import { CHART_COLORS, SERVICE_COLORS } from '@/constants/defaults';

// 차트 색상
<Bar fill={CHART_COLORS.primary} />

// 서비스별 색상
<div style={{ color: SERVICE_COLORS.title }} />
```

## 🔧 개발 가이드

### 새 컴포넌트 추가

1. **파일 생성** (`components/common/NewComponent.jsx`)
```jsx
import React from 'react';

/**
 * 컴포넌트 설명
 * 
 * @param {Object} props - 컴포넌트 props
 * @param {string} props.title - 제목
 */
const NewComponent = ({ title }) => {
  return (
    <div className="p-4">
      <h2>{title}</h2>
    </div>
  );
};

export default NewComponent;
```

2. **사용**
```jsx
import NewComponent from './components/common/NewComponent';

<NewComponent title="제목" />
```

### 새 API 함수 추가

1. **API 함수 정의** (`services/api.js`)
```javascript
export const fetchNewData = async (params) => {
  try {
    const response = await apiClient.get('/usage/new-endpoint', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch new data:', error);
    throw error;
  }
};
```

2. **컴포넌트에서 사용**
```jsx
import { fetchNewData } from '@/services/api';

const [data, setData] = useState(null);

useEffect(() => {
  fetchNewData({ param: 'value' })
    .then(setData)
    .catch(console.error);
}, []);
```

## 🧪 테스트

### 로컬 개발 서버
```bash
npm run dev  # http://localhost:5173
```

### 프로덕션 빌드
```bash
npm run build
npm run preview  # 빌드 결과 미리보기
```

## 📊 성능 최적화

### 1. Code Splitting
```jsx
// 동적 import로 번들 크기 줄이기
const Dashboard = lazy(() => import('./components/dashboard/Dashboard'));
```

### 2. Memoization
```jsx
// 불필요한 re-render 방지
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
const memoizedCallback = useCallback(() => doSomething(a, b), [a, b]);
```

### 3. 이미지 최적화
- WebP 형식 사용
- Lazy loading
- Responsive images

## ⚠️ 주의사항

1. **상태 관리**
   - 로컬 상태: `useState`
   - 전역 상태: `Context API`
   - 서버 상태: API 호출

2. **에러 처리**
   - `ErrorBoundary`로 전체 앱 감싸기
   - API 호출 시 try-catch 사용
   - 사용자 친화적 에러 메시지

3. **접근성 (a11y)**
   - 시맨틱 HTML 사용
   - ARIA 속성 추가
   - 키보드 네비게이션 지원

4. **보안**
   - XSS 방지 (React 기본 제공)
   - CSRF 토큰 사용
   - 민감한 데이터 로컬 스토리지 저장 금지

---

**작성일**: 2025-11-06
**버전**: 1.0.0
