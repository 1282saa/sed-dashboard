# Pull Request: Improve backend code quality and security (v2)

## 📋 Summary

백엔드 코드 품질 및 보안 개선 작업입니다.

### 주요 변경사항

#### 1. ✅ 상수 파일 분리
- 하드코딩된 값들을 `src/config/constants.js`로 중앙 집중화
- AWS 설정, API 설정, CORS 설정, 에러 메시지 등 관리

#### 2. ✅ 입력값 검증 레이어
- `src/utils/validators.js` 추가
- 이메일, yearMonth, serviceId 등 모든 API 파라미터 검증
- 명확한 에러 메시지 제공

#### 3. ✅ 에러 처리 표준화
- `src/utils/errors.js` 추가
- 커스텀 에러 클래스 (ValidationError, NotFoundError, DynamoDBError 등)
- 일관된 에러 응답 형식

#### 4. ✅ CORS 설정 개선
- 모든 도메인 허용 (`*`) → 특정 도메인만 허용
- `https://dashboard.sedaily.ai` 및 로컬 개발 환경만 허용
- Origin 검증 로직 추가

#### 5. ✅ 환경 변수 지원
- `.env.example` 추가
- AWS_REGION, COGNITO_USER_POOL_ID 등 환경 변수로 관리

---

## 📁 변경된 파일

### 새로 추가된 파일 (7개)
- `backend/.env.example` - 환경 변수 템플릿
- `backend/IMPROVEMENTS.md` - 상세 개선 문서
- `backend/serverless.yml` - Serverless 설정
- `backend/src/config/constants.js` - 상수 관리
- `backend/src/utils/validators.js` - 입력 검증
- `backend/src/utils/errors.js` - 에러 처리
- `backend/src/utils/response.js` - HTTP 응답 헬퍼

### 수정된 파일 (2개)
- `backend/src/handlers/usageHandler.js` - 검증 및 CORS 개선
- `backend/src/services/dynamodbService.js` - 상수 사용

---

## 🎯 개선 효과

### 보안
- ✅ CORS 설정 강화 (특정 도메인만 허용)
- ✅ 입력값 검증으로 인젝션 공격 방어
- ✅ 환경 변수로 민감 정보 분리

### 유지보수성
- ✅ 상수 중앙 관리로 변경 용이
- ✅ 재사용 가능한 검증/에러 처리 로직
- ✅ 명확한 코드 구조

### 사용자 경험
- ✅ 명확한 에러 메시지
- ✅ 일관된 API 응답 형식
- ✅ 빠른 입력 검증 (DynamoDB 호출 전)

---

## 🧪 Test plan

- [ ] 로컬 환경에서 API 테스트
- [ ] CORS 헤더 확인 (https://dashboard.sedaily.ai)
- [ ] 입력값 검증 테스트 (잘못된 파라미터)
- [ ] 에러 응답 형식 확인
- [ ] 환경 변수 설정 확인

---

## 📝 배포 시 주의사항

1. **환경 변수 설정**
   ```bash
   cp backend/.env.example backend/.env
   # 필요한 값 수정
   ```

2. **Serverless 배포**
   ```bash
   cd backend
   serverless deploy --stage dev
   ```

3. **CORS 확인**
   - 프론트엔드 도메인이 허용 목록에 있는지 확인
   - 로컬 개발: `http://localhost:5173`
   - 프로덕션: `https://dashboard.sedaily.ai`

---

## 📖 문서

자세한 내용은 `backend/IMPROVEMENTS.md` 참고

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
