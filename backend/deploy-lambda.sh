#!/bin/bash

# Lambda 함수 배포 스크립트
REGION="ap-northeast-2"
ROLE_ARN="arn:aws:iam::887078546492:role/unified-monitoring-lambda-role"
ZIP_FILE="fileb://$(pwd)/function.zip"

# Lambda 함수 목록
declare -A FUNCTIONS
FUNCTIONS[unified-monitoring-getSummary]="src/handlers/usageHandler.getUsageSummary"
FUNCTIONS[unified-monitoring-getTopServices]="src/handlers/usageHandler.getTopServices"
FUNCTIONS[unified-monitoring-getTopEngines]="src/handlers/usageHandler.getTopEngines"
FUNCTIONS[unified-monitoring-getDailyTrend]="src/handlers/usageHandler.getDailyUsageTrend"
FUNCTIONS[unified-monitoring-getMonthlyTrend]="src/handlers/usageHandler.getMonthlyUsageTrend"
FUNCTIONS[unified-monitoring-getServiceUsage]="src/handlers/usageHandler.getUsageByService"

echo "🚀 Starting Lambda functions deployment..."
echo ""

for FUNCTION_NAME in "${!FUNCTIONS[@]}"; do
  HANDLER="${FUNCTIONS[$FUNCTION_NAME]}"

  echo "📦 Deploying $FUNCTION_NAME..."

  # 함수가 이미 존재하는지 확인
  if aws lambda get-function --function-name "$FUNCTION_NAME" --region "$REGION" > /dev/null 2>&1; then
    echo "   ↳ Function exists, updating code..."
    aws lambda update-function-code \
      --function-name "$FUNCTION_NAME" \
      --zip-file "$ZIP_FILE" \
      --region "$REGION" > /dev/null
  else
    echo "   ↳ Creating new function..."
    aws lambda create-function \
      --function-name "$FUNCTION_NAME" \
      --runtime nodejs20.x \
      --role "$ROLE_ARN" \
      --handler "$HANDLER" \
      --zip-file "$ZIP_FILE" \
      --timeout 30 \
      --memory-size 512 \
      --region "$REGION" > /dev/null
  fi

  echo "   ✅ $FUNCTION_NAME deployed successfully"
  echo ""
done

echo "🎉 All Lambda functions deployed!"
echo ""
echo "📋 Deployed functions:"
for FUNCTION_NAME in "${!FUNCTIONS[@]}"; do
  echo "   - $FUNCTION_NAME"
done
