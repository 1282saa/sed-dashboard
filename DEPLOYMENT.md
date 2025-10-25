# 배포 가이드

## 사전 준비

### 1. AWS CLI 설치 및 설정

```bash
# AWS CLI 설치 확인
aws --version

# AWS 자격 증명 설정
aws configure
# AWS Access Key ID: 입력
# AWS Secret Access Key: 입력
# Default region name: ap-northeast-2
# Default output format: json
```

### 2. Serverless Framework 설치

```bash
npm install -g serverless
```

## 백엔드 배포

### 1단계: 백엔드 의존성 설치

```bash
cd backend
npm install
```

### 2단계: Serverless 배포

```bash
# 개발 환경에 배포
serverless deploy --stage dev

# 또는 npm 스크립트 사용
npm run deploy
```

배포가 완료되면 다음과 같은 출력이 나타납니다:

```
✔ Service deployed to stack unified-monitoring-dashboard-dev (112s)

endpoints:
  GET - https://xxxxx.execute-api.ap-northeast-2.amazonaws.com/dev/usage/all
  GET - https://xxxxx.execute-api.ap-northeast-2.amazonaws.com/dev/usage/{serviceId}
  GET - https://xxxxx.execute-api.ap-northeast-2.amazonaws.com/dev/usage/summary
  GET - https://xxxxx.execute-api.ap-northeast-2.amazonaws.com/dev/usage/top/services
  GET - https://xxxxx.execute-api.ap-northeast-2.amazonaws.com/dev/usage/top/engines
  GET - https://xxxxx.execute-api.ap-northeast-2.amazonaws.com/dev/usage/trend/daily
  GET - https://xxxxx.execute-api.ap-northeast-2.amazonaws.com/dev/usage/trend/monthly
```

**중요**: `https://xxxxx.execute-api.ap-northeast-2.amazonaws.com/dev` URL을 복사해두세요!

### 3단계: API 테스트

```bash
# 요약 통계 테스트
curl https://xxxxx.execute-api.ap-northeast-2.amazonaws.com/dev/usage/summary?yearMonth=2025-10

# Top 서비스 테스트
curl https://xxxxx.execute-api.ap-northeast-2.amazonaws.com/dev/usage/top/services?yearMonth=2025-10
```

## 프론트엔드 배포

### 방법 1: 로컬 개발 서버

```bash
cd frontend

# 환경 변수 설정
cp .env.example .env

# .env 파일 수정
# VITE_API_BASE_URL=https://xxxxx.execute-api.ap-northeast-2.amazonaws.com/dev

# 개발 서버 실행
npm run dev
```

### 방법 2: AWS S3 + CloudFront 배포

#### 2-1. 빌드

```bash
cd frontend

# 환경 변수 설정
echo "VITE_API_BASE_URL=https://xxxxx.execute-api.ap-northeast-2.amazonaws.com/dev" > .env

# 프로덕션 빌드
npm run build
```

#### 2-2. S3 버킷 생성

```bash
# S3 버킷 생성 (버킷 이름은 유일해야 함)
aws s3 mb s3://unified-monitoring-dashboard-sedaily

# 정적 웹사이트 호스팅 활성화
aws s3 website s3://unified-monitoring-dashboard-sedaily \
  --index-document index.html \
  --error-document index.html
```

#### 2-3. 빌드 파일 업로드

```bash
# dist 폴더를 S3에 업로드
aws s3 sync dist/ s3://unified-monitoring-dashboard-sedaily --delete

# 퍼블릭 읽기 권한 설정
aws s3api put-bucket-policy --bucket unified-monitoring-dashboard-sedaily --policy '{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::unified-monitoring-dashboard-sedaily/*"
  }]
}'
```

#### 2-4. CloudFront 배포 (선택사항, HTTPS 및 CDN을 위해 권장)

AWS 콘솔에서:
1. CloudFront → Create Distribution
2. Origin Domain: `unified-monitoring-dashboard-sedaily.s3-website.ap-northeast-2.amazonaws.com`
3. Viewer Protocol Policy: Redirect HTTP to HTTPS
4. Default Root Object: `index.html`
5. Create Distribution

## 환경별 배포

### 개발 환경 (dev)

```bash
# 백엔드
cd backend
serverless deploy --stage dev

# 프론트엔드
cd frontend
echo "VITE_API_BASE_URL=https://[dev-api-url]" > .env
npm run dev
```

### 스테이징 환경 (staging)

```bash
# 백엔드
cd backend
serverless deploy --stage staging

# 프론트엔드
cd frontend
echo "VITE_API_BASE_URL=https://[staging-api-url]" > .env
npm run build
aws s3 sync dist/ s3://dashboard-staging
```

### 프로덕션 환경 (prod)

```bash
# 백엔드
cd backend
serverless deploy --stage prod

# 프론트엔드
cd frontend
echo "VITE_API_BASE_URL=https://[prod-api-url]" > .env
npm run build
aws s3 sync dist/ s3://dashboard-prod
```

## 문제 해결

### 1. Lambda 권한 오류

Lambda 함수가 DynamoDB에 접근할 수 없는 경우:

```bash
# serverless.yml의 IAM 권한 확인
# provider.iam.role.statements 섹션 확인
```

### 2. CORS 오류

프론트엔드에서 API 호출 시 CORS 오류가 발생하는 경우:

```bash
# serverless.yml에서 cors: true 확인
# events.http.cors: true
```

### 3. 배포 롤백

```bash
# 이전 버전으로 롤백
serverless rollback --timestamp [timestamp]

# 배포 기록 확인
serverless deploy list
```

## 로그 확인

### Lambda 로그 확인

```bash
# 실시간 로그 스트리밍
serverless logs -f getAllUsage --tail

# 특정 시간대 로그
serverless logs -f getAllUsage --startTime 1h
```

### CloudWatch 로그

AWS 콘솔 → CloudWatch → Logs → `/aws/lambda/unified-monitoring-dashboard-dev-*`

## 비용 최적화

1. **Lambda 메모리/타임아웃 조정**: `serverless.yml`의 `memorySize`, `timeout` 값 최적화
2. **DynamoDB 쿼리 최적화**: 불필요한 Scan 대신 Query 사용
3. **CloudFront 캐싱**: 정적 리소스 캐싱으로 S3 요청 감소
4. **Lambda 동시 실행 제한**: 비용 폭증 방지

## 모니터링

1. **CloudWatch 대시보드** 설정
   - Lambda 실행 시간
   - Lambda 오류율
   - DynamoDB 읽기/쓰기 용량

2. **알람 설정**
   - Lambda 오류 임계값 초과
   - DynamoDB 스로틀링 발생

## 제거 (Clean Up)

### 백엔드 제거

```bash
cd backend
serverless remove --stage dev
```

### 프론트엔드 제거

```bash
# S3 버킷 비우기 및 삭제
aws s3 rm s3://unified-monitoring-dashboard-sedaily --recursive
aws s3 rb s3://unified-monitoring-dashboard-sedaily

# CloudFront 배포 삭제 (콘솔에서 수동)
```
