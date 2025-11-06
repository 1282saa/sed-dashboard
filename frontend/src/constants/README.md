# Frontend Constants 디렉토리

프론트엔드 애플리케이션의 공통 상수를 관리하는 디렉토리입니다.

## 📁 파일 구조

```
frontend/src/constants/
├── defaults.js    # 공통 상수, 기본값, 설정
└── README.md      # 이 파일
```

## 📄 `defaults.js` 상세

### 1. **날짜 관련 기본값**
```javascript
DEFAULT_YEAR_MONTH = '2025-10'        // 기본 조회 년월
DEFAULT_USER_YEAR_MONTH = '2025-08'  // 사용자 조회 기본 년월
```

### 2. **페이지네이션 및 제한값**
```javascript
DEFAULT_LIMIT = 5         // Top 조회 기본값
DEFAULT_TOP_LIMIT = 5     // Top N 제한
DEFAULT_MONTHS = 12       // 월별 추이 기본 개월 수
```

### 3. **API 설정**
```javascript
API_TIMEOUT = 30000  // 30초 - API 요청 타임아웃
```

### 4. **차트 색상 팔레트**
```javascript
CHART_COLORS = {
  primary: '#9333ea',    // purple-600
  secondary: '#3b82f6',  // blue-500
  success: '#10b981',    // green-500
  warning: '#f59e0b',    // amber-500
  danger: '#ef4444',     // red-500
  info: '#06b6d4',       // cyan-500
}
```

### 5. **서비스별 색상 매핑**
각 서비스를 시각적으로 구분하기 위한 고유 색상:
```javascript
SERVICE_COLORS = {
  title: '#9333ea',        // 제목 - 보라색
  proofreading: '#3b82f6', // 교열 - 파란색
  news: '#10b981',         // 보도 - 초록색
  foreign: '#f59e0b',      // 외신 - 주황색
  revision: '#ef4444',     // 퇴고 - 빨간색
  buddy: '#06b6d4',        // 버디 - 청록색
}
```

### 6. **UI 타이밍**
```javascript
LOADING_DELAY = 300      // 로딩 딜레이 (밀리초)
DEBOUNCE_DELAY = 500     // 디바운스 딜레이 (밀리초)
```

### 7. **로컬 스토리지 키**
```javascript
STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_INFO: 'user_info',
  SELECTED_SERVICE: 'selected_service',
  SELECTED_MONTH: 'selected_month',
}
```

### 8. **에러 메시지**
```javascript
ERROR_MESSAGES = {
  NETWORK_ERROR: '네트워크 오류가 발생했습니다...',
  SERVER_ERROR: '서버 오류가 발생했습니다...',
  AUTH_ERROR: '인증에 실패했습니다...',
  NOT_FOUND: '데이터를 찾을 수 없습니다.',
  INVALID_INPUT: '입력값이 올바르지 않습니다.',
}
```

### 9. **성공 메시지**
```javascript
SUCCESS_MESSAGES = {
  DATA_LOADED: '데이터를 성공적으로 불러왔습니다.',
  EXPORT_SUCCESS: '내보내기가 완료되었습니다.',
}
```

## 💡 사용 예시

### 컴포넌트에서 상수 사용
```jsx
import { DEFAULT_YEAR_MONTH, SERVICE_COLORS, ERROR_MESSAGES } from '@/constants/defaults';

function MyComponent() {
  const [month, setMonth] = useState(DEFAULT_YEAR_MONTH);
  const serviceColor = SERVICE_COLORS.title;
  
  if (error) {
    return <ErrorMessage message={ERROR_MESSAGES.NETWORK_ERROR} />;
  }
  
  return <div style={{ color: serviceColor }}>...</div>;
}
```

### API 서비스에서 사용
```javascript
import { API_TIMEOUT, DEFAULT_LIMIT } from '@/constants/defaults';

const apiClient = axios.create({
  timeout: API_TIMEOUT,
});

export const fetchTopServices = async (limit = DEFAULT_LIMIT) => {
  // ...
};
```

### 차트에서 색상 사용
```jsx
import { CHART_COLORS } from '@/constants/defaults';

<BarChart>
  <Bar dataKey="value" fill={CHART_COLORS.primary} />
</BarChart>
```

## 🔧 수정 가이드

### 새로운 상수 추가
```javascript
// defaults.js 하단에 추가
export const NEW_SETTING = {
  OPTION_1: 'value1',
  OPTION_2: 'value2',
};
```

### 기존 상수 수정
```javascript
// ⚠️ 주의: 다른 파일에서 사용 중인지 확인 필요
export const DEFAULT_LIMIT = 10; // 5에서 10으로 변경
```

## 📊 연관 파일

이 상수들을 사용하는 주요 파일:
- `src/services/api.js` - API 호출 시 기본값 사용
- `src/components/charts/*.jsx` - 차트 색상 사용
- `src/components/common/ErrorMessage.jsx` - 에러 메시지 사용
- `src/components/common/LoadingSpinner.jsx` - 로딩 딜레이 사용

## ⚠️ 주의사항

1. **타입 일관성**: 숫자는 숫자로, 문자열은 문자열로 일관성 유지
2. **Tailwind 색상**: 가능하면 Tailwind CSS 색상 팔레트 사용
3. **명명 규칙**: 상수는 모두 대문자 + 언더스코어 (SNAKE_CASE)
4. **문서화**: 새 상수 추가 시 JSDoc 주석 필수

---

**작성일**: 2025-11-06  
**버전**: 1.0.0
