#!/bin/bash

API_ID="34khf6y2bd"
REGION="ap-northeast-2"
ACCOUNT_ID="887078546492"
USAGE_RESOURCE="7afbxo"

echo "🚀 Setting up API Gateway..."

# /usage/all
echo "📍 Creating /usage/all..."
ALL_RESOURCE=$(aws apigateway create-resource --rest-api-id $API_ID --parent-id $USAGE_RESOURCE --path-part all --region $REGION --query 'id' --output text)
aws apigateway put-method --rest-api-id $API_ID --resource-id $ALL_RESOURCE --http-method GET --authorization-type NONE --region $REGION > /dev/null
aws apigateway put-integration --rest-api-id $API_ID --resource-id $ALL_RESOURCE --http-method GET --type AWS_PROXY --integration-http-method POST --uri "arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/arn:aws:lambda:$REGION:$ACCOUNT_ID:function:unified-monitoring-getAllUsage/invocations" --region $REGION > /dev/null
aws lambda add-permission --function-name unified-monitoring-getAllUsage --statement-id apigateway-all --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:$REGION:$ACCOUNT_ID:$API_ID/*/*" --region $REGION 2>/dev/null || true

# /usage/summary
echo "📍 Creating /usage/summary..."
SUMMARY_RESOURCE=$(aws apigateway create-resource --rest-api-id $API_ID --parent-id $USAGE_RESOURCE --path-part summary --region $REGION --query 'id' --output text)
aws apigateway put-method --rest-api-id $API_ID --resource-id $SUMMARY_RESOURCE --http-method GET --authorization-type NONE --region $REGION > /dev/null
aws apigateway put-integration --rest-api-id $API_ID --resource-id $SUMMARY_RESOURCE --http-method GET --type AWS_PROXY --integration-http-method POST --uri "arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/arn:aws:lambda:$REGION:$ACCOUNT_ID:function:unified-monitoring-getSummary/invocations" --region $REGION > /dev/null
aws lambda add-permission --function-name unified-monitoring-getSummary --statement-id apigateway-summary --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:$REGION:$ACCOUNT_ID:$API_ID/*/*" --region $REGION 2>/dev/null || true

# /usage/top
echo "📍 Creating /usage/top..."
TOP_RESOURCE=$(aws apigateway create-resource --rest-api-id $API_ID --parent-id $USAGE_RESOURCE --path-part top --region $REGION --query 'id' --output text)

# /usage/top/services
SERVICES_RESOURCE=$(aws apigateway create-resource --rest-api-id $API_ID --parent-id $TOP_RESOURCE --path-part services --region $REGION --query 'id' --output text)
aws apigateway put-method --rest-api-id $API_ID --resource-id $SERVICES_RESOURCE --http-method GET --authorization-type NONE --region $REGION > /dev/null
aws apigateway put-integration --rest-api-id $API_ID --resource-id $SERVICES_RESOURCE --http-method GET --type AWS_PROXY --integration-http-method POST --uri "arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/arn:aws:lambda:$REGION:$ACCOUNT_ID:function:unified-monitoring-getTopServices/invocations" --region $REGION > /dev/null
aws lambda add-permission --function-name unified-monitoring-getTopServices --statement-id apigateway-topservices --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:$REGION:$ACCOUNT_ID:$API_ID/*/*" --region $REGION 2>/dev/null || true

# /usage/top/engines
ENGINES_RESOURCE=$(aws apigateway create-resource --rest-api-id $API_ID --parent-id $TOP_RESOURCE --path-part engines --region $REGION --query 'id' --output text)
aws apigateway put-method --rest-api-id $API_ID --resource-id $ENGINES_RESOURCE --http-method GET --authorization-type NONE --region $REGION > /dev/null
aws apigateway put-integration --rest-api-id $API_ID --resource-id $ENGINES_RESOURCE --http-method GET --type AWS_PROXY --integration-http-method POST --uri "arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/arn:aws:lambda:$REGION:$ACCOUNT_ID:function:unified-monitoring-getTopEngines/invocations" --region $REGION > /dev/null
aws lambda add-permission --function-name unified-monitoring-getTopEngines --statement-id apigateway-topengines --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:$REGION:$ACCOUNT_ID:$API_ID/*/*" --region $REGION 2>/dev/null || true

# /usage/trend
echo "📍 Creating /usage/trend..."
TREND_RESOURCE=$(aws apigateway create-resource --rest-api-id $API_ID --parent-id $USAGE_RESOURCE --path-part trend --region $REGION --query 'id' --output text)

# /usage/trend/daily
DAILY_RESOURCE=$(aws apigateway create-resource --rest-api-id $API_ID --parent-id $TREND_RESOURCE --path-part daily --region $REGION --query 'id' --output text)
aws apigateway put-method --rest-api-id $API_ID --resource-id $DAILY_RESOURCE --http-method GET --authorization-type NONE --region $REGION > /dev/null
aws apigateway put-integration --rest-api-id $API_ID --resource-id $DAILY_RESOURCE --http-method GET --type AWS_PROXY --integration-http-method POST --uri "arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/arn:aws:lambda:$REGION:$ACCOUNT_ID:function:unified-monitoring-getDailyTrend/invocations" --region $REGION > /dev/null
aws lambda add-permission --function-name unified-monitoring-getDailyTrend --statement-id apigateway-daily --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:$REGION:$ACCOUNT_ID:$API_ID/*/*" --region $REGION 2>/dev/null || true

# /usage/trend/monthly
MONTHLY_RESOURCE=$(aws apigateway create-resource --rest-api-id $API_ID --parent-id $TREND_RESOURCE --path-part monthly --region $REGION --query 'id' --output text)
aws apigateway put-method --rest-api-id $API_ID --resource-id $MONTHLY_RESOURCE --http-method GET --authorization-type NONE --region $REGION > /dev/null
aws apigateway put-integration --rest-api-id $API_ID --resource-id $MONTHLY_RESOURCE --http-method GET --type AWS_PROXY --integration-http-method POST --uri "arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/arn:aws:lambda:$REGION:$ACCOUNT_ID:function:unified-monitoring-getMonthlyTrend/invocations" --region $REGION > /dev/null
aws lambda add-permission --function-name unified-monitoring-getMonthlyTrend --statement-id apigateway-monthly --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:$REGION:$ACCOUNT_ID:$API_ID/*/*" --region $REGION 2>/dev/null || true

# /usage/{serviceId}
echo "📍 Creating /usage/{serviceId}..."
SERVICEID_RESOURCE=$(aws apigateway create-resource --rest-api-id $API_ID --parent-id $USAGE_RESOURCE --path-part '{serviceId}' --region $REGION --query 'id' --output text)
aws apigateway put-method --rest-api-id $API_ID --resource-id $SERVICEID_RESOURCE --http-method GET --authorization-type NONE --request-parameters method.request.path.serviceId=true --region $REGION > /dev/null
aws apigateway put-integration --rest-api-id $API_ID --resource-id $SERVICEID_RESOURCE --http-method GET --type AWS_PROXY --integration-http-method POST --uri "arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/arn:aws:lambda:$REGION:$ACCOUNT_ID:function:unified-monitoring-getServiceUsage/invocations" --region $REGION > /dev/null
aws lambda add-permission --function-name unified-monitoring-getServiceUsage --statement-id apigateway-service --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:$REGION:$ACCOUNT_ID:$API_ID/*/*" --region $REGION 2>/dev/null || true

echo "✅ All resources created!"

# CORS 설정
echo "🌐 Enabling CORS..."
for RESOURCE_ID in $ALL_RESOURCE $SUMMARY_RESOURCE $SERVICES_RESOURCE $ENGINES_RESOURCE $DAILY_RESOURCE $MONTHLY_RESOURCE $SERVICEID_RESOURCE; do
  aws apigateway put-method --rest-api-id $API_ID --resource-id $RESOURCE_ID --http-method OPTIONS --authorization-type NONE --region $REGION > /dev/null 2>&1
  aws apigateway put-integration --rest-api-id $API_ID --resource-id $RESOURCE_ID --http-method OPTIONS --type MOCK --request-templates '{"application/json":"{\"statusCode\": 200}"}' --region $REGION > /dev/null 2>&1
  aws apigateway put-method-response --rest-api-id $API_ID --resource-id $RESOURCE_ID --http-method OPTIONS --status-code 200 --response-parameters method.response.header.Access-Control-Allow-Headers=true,method.response.header.Access-Control-Allow-Methods=true,method.response.header.Access-Control-Allow-Origin=true --region $REGION > /dev/null 2>&1
  aws apigateway put-integration-response --rest-api-id $API_ID --resource-id $RESOURCE_ID --http-method OPTIONS --status-code 200 --response-parameters '{"method.response.header.Access-Control-Allow-Headers":"'"'"'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"'"'","method.response.header.Access-Control-Allow-Methods":"'"'"'GET,OPTIONS'"'"'","method.response.header.Access-Control-Allow-Origin":"'"'"'*'"'"'"}' --region $REGION > /dev/null 2>&1
done

echo "✅ CORS enabled!"

# API 배포
echo "🚀 Deploying API to 'dev' stage..."
aws apigateway create-deployment --rest-api-id $API_ID --stage-name dev --region $REGION > /dev/null

echo ""
echo "🎉 API Gateway setup complete!"
echo ""
echo "📋 API URL:"
echo "https://$API_ID.execute-api.$REGION.amazonaws.com/dev"
echo ""
echo "📌 Endpoints:"
echo "  GET /usage/all"
echo "  GET /usage/summary"
echo "  GET /usage/top/services"
echo "  GET /usage/top/engines"
echo "  GET /usage/trend/daily"
echo "  GET /usage/trend/monthly"
echo "  GET /usage/{serviceId}"
