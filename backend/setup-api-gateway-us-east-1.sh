#!/bin/bash

API_ID="05oo6stfzk"
REGION="us-east-1"
ACCOUNT_ID="887078546492"

echo "🚀 Setting up API Gateway in us-east-1..."

# Root 리소스 ID
ROOT_ID=$(aws apigateway get-resources --rest-api-id $API_ID --region $REGION --query 'items[?path==`/`].id' --output text)

# /usage 리소스 생성
USAGE_RESOURCE=$(aws apigateway create-resource --rest-api-id $API_ID --parent-id $ROOT_ID --path-part usage --region $REGION --query 'id' --output text)

echo "📍 Creating /usage/all..."
ALL_RESOURCE=$(aws apigateway create-resource --rest-api-id $API_ID --parent-id $USAGE_RESOURCE --path-part all --region $REGION --query 'id' --output text)
aws apigateway put-method --rest-api-id $API_ID --resource-id $ALL_RESOURCE --http-method GET --authorization-type NONE --region $REGION > /dev/null
aws apigateway put-integration --rest-api-id $API_ID --resource-id $ALL_RESOURCE --http-method GET --type AWS_PROXY --integration-http-method POST --uri "arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/arn:aws:lambda:$REGION:$ACCOUNT_ID:function:unified-monitoring-getAllUsage-v2/invocations" --region $REGION > /dev/null
aws lambda add-permission --function-name unified-monitoring-getAllUsage-v2 --statement-id apigateway-all --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:$REGION:$ACCOUNT_ID:$API_ID/*/*" --region $REGION 2>/dev/null || true

echo "📍 Creating /usage/summary..."
SUMMARY_RESOURCE=$(aws apigateway create-resource --rest-api-id $API_ID --parent-id $USAGE_RESOURCE --path-part summary --region $REGION --query 'id' --output text)
aws apigateway put-method --rest-api-id $API_ID --resource-id $SUMMARY_RESOURCE --http-method GET --authorization-type NONE --region $REGION > /dev/null
aws apigateway put-integration --rest-api-id $API_ID --resource-id $SUMMARY_RESOURCE --http-method GET --type AWS_PROXY --integration-http-method POST --uri "arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/arn:aws:lambda:$REGION:$ACCOUNT_ID:function:unified-monitoring-getSummary-v2/invocations" --region $REGION > /dev/null
aws lambda add-permission --function-name unified-monitoring-getSummary-v2 --statement-id apigateway-summary --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:$REGION:$ACCOUNT_ID:$API_ID/*/*" --region $REGION 2>/dev/null || true

echo "📍 Creating /usage/top..."
TOP_RESOURCE=$(aws apigateway create-resource --rest-api-id $API_ID --parent-id $USAGE_RESOURCE --path-part top --region $REGION --query 'id' --output text)

SERVICES_RESOURCE=$(aws apigateway create-resource --rest-api-id $API_ID --parent-id $TOP_RESOURCE --path-part services --region $REGION --query 'id' --output text)
aws apigateway put-method --rest-api-id $API_ID --resource-id $SERVICES_RESOURCE --http-method GET --authorization-type NONE --region $REGION > /dev/null
aws apigateway put-integration --rest-api-id $API_ID --resource-id $SERVICES_RESOURCE --http-method GET --type AWS_PROXY --integration-http-method POST --uri "arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/arn:aws:lambda:$REGION:$ACCOUNT_ID:function:unified-monitoring-getTopServices-v2/invocations" --region $REGION > /dev/null
aws lambda add-permission --function-name unified-monitoring-getTopServices-v2 --statement-id apigateway-topservices --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:$REGION:$ACCOUNT_ID:$API_ID/*/*" --region $REGION 2>/dev/null || true

ENGINES_RESOURCE=$(aws apigateway create-resource --rest-api-id $API_ID --parent-id $TOP_RESOURCE --path-part engines --region $REGION --query 'id' --output text)
aws apigateway put-method --rest-api-id $API_ID --resource-id $ENGINES_RESOURCE --http-method GET --authorization-type NONE --region $REGION > /dev/null
aws apigateway put-integration --rest-api-id $API_ID --resource-id $ENGINES_RESOURCE --http-method GET --type AWS_PROXY --integration-http-method POST --uri "arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/arn:aws:lambda:$REGION:$ACCOUNT_ID:function:unified-monitoring-getTopEngines-v2/invocations" --region $REGION > /dev/null
aws lambda add-permission --function-name unified-monitoring-getTopEngines-v2 --statement-id apigateway-topengines --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:$REGION:$ACCOUNT_ID:$API_ID/*/*" --region $REGION 2>/dev/null || true

echo "📍 Creating /usage/trend..."
TREND_RESOURCE=$(aws apigateway create-resource --rest-api-id $API_ID --parent-id $USAGE_RESOURCE --path-part trend --region $REGION --query 'id' --output text)

DAILY_RESOURCE=$(aws apigateway create-resource --rest-api-id $API_ID --parent-id $TREND_RESOURCE --path-part daily --region $REGION --query 'id' --output text)
aws apigateway put-method --rest-api-id $API_ID --resource-id $DAILY_RESOURCE --http-method GET --authorization-type NONE --region $REGION > /dev/null
aws apigateway put-integration --rest-api-id $API_ID --resource-id $DAILY_RESOURCE --http-method GET --type AWS_PROXY --integration-http-method POST --uri "arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/arn:aws:lambda:$REGION:$ACCOUNT_ID:function:unified-monitoring-getDailyTrend-v2/invocations" --region $REGION > /dev/null
aws lambda add-permission --function-name unified-monitoring-getDailyTrend-v2 --statement-id apigateway-daily --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:$REGION:$ACCOUNT_ID:$API_ID/*/*" --region $REGION 2>/dev/null || true

MONTHLY_RESOURCE=$(aws apigateway create-resource --rest-api-id $API_ID --parent-id $TREND_RESOURCE --path-part monthly --region $REGION --query 'id' --output text)
aws apigateway put-method --rest-api-id $API_ID --resource-id $MONTHLY_RESOURCE --http-method GET --authorization-type NONE --region $REGION > /dev/null
aws apigateway put-integration --rest-api-id $API_ID --resource-id $MONTHLY_RESOURCE --http-method GET --type AWS_PROXY --integration-http-method POST --uri "arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/arn:aws:lambda:$REGION:$ACCOUNT_ID:function:unified-monitoring-getMonthlyTrend-v2/invocations" --region $REGION > /dev/null
aws lambda add-permission --function-name unified-monitoring-getMonthlyTrend-v2 --statement-id apigateway-monthly --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:$REGION:$ACCOUNT_ID:$API_ID/*/*" --region $REGION 2>/dev/null || true

echo "📍 Creating /usage/{serviceId}..."
SERVICEID_RESOURCE=$(aws apigateway create-resource --rest-api-id $API_ID --parent-id $USAGE_RESOURCE --path-part '{serviceId}' --region $REGION --query 'id' --output text)
aws apigateway put-method --rest-api-id $API_ID --resource-id $SERVICEID_RESOURCE --http-method GET --authorization-type NONE --request-parameters method.request.path.serviceId=true --region $REGION > /dev/null
aws apigateway put-integration --rest-api-id $API_ID --resource-id $SERVICEID_RESOURCE --http-method GET --type AWS_PROXY --integration-http-method POST --uri "arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/arn:aws:lambda:$REGION:$ACCOUNT_ID:function:unified-monitoring-getServiceUsage-v2/invocations" --region $REGION > /dev/null
aws lambda add-permission --function-name unified-monitoring-getServiceUsage-v2 --statement-id apigateway-service --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:$REGION:$ACCOUNT_ID:$API_ID/*/*" --region $REGION 2>/dev/null || true

echo "✅ All resources created!"

echo "🌐 Enabling CORS..."
for RESOURCE_ID in $ALL_RESOURCE $SUMMARY_RESOURCE $SERVICES_RESOURCE $ENGINES_RESOURCE $DAILY_RESOURCE $MONTHLY_RESOURCE $SERVICEID_RESOURCE; do
  aws apigateway put-method --rest-api-id $API_ID --resource-id $RESOURCE_ID --http-method OPTIONS --authorization-type NONE --region $REGION > /dev/null 2>&1
  aws apigateway put-integration --rest-api-id $API_ID --resource-id $RESOURCE_ID --http-method OPTIONS --type MOCK --request-templates '{"application/json":"{\"statusCode\": 200}"}' --region $REGION > /dev/null 2>&1
  aws apigateway put-method-response --rest-api-id $API_ID --resource-id $RESOURCE_ID --http-method OPTIONS --status-code 200 --response-parameters method.response.header.Access-Control-Allow-Headers=true,method.response.header.Access-Control-Allow-Methods=true,method.response.header.Access-Control-Allow-Origin=true --region $REGION > /dev/null 2>&1
  aws apigateway put-integration-response --rest-api-id $API_ID --resource-id $RESOURCE_ID --http-method OPTIONS --status-code 200 --response-parameters '{"method.response.header.Access-Control-Allow-Headers":"'"'"'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"'"'","method.response.header.Access-Control-Allow-Methods":"'"'"'GET,OPTIONS'"'"'","method.response.header.Access-Control-Allow-Origin":"'"'"'*'"'"'"}' --region $REGION > /dev/null 2>&1
done

echo "✅ CORS enabled!"

echo "🚀 Deploying API to 'dev' stage..."
aws apigateway create-deployment --rest-api-id $API_ID --stage-name dev --region $REGION > /dev/null

echo ""
echo "🎉 API Gateway setup complete!"
echo ""
echo "📋 API URL:"
echo "https://$API_ID.execute-api.$REGION.amazonaws.com/dev"
