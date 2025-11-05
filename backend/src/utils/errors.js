/**
 * 커스텀 에러 클래스 및 에러 핸들링
 */

/**
 * 기본 애플리케이션 에러
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true; // 운영 에러 (예측 가능)

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        statusCode: this.statusCode,
        ...(Object.keys(this.details).length > 0 && { details: this.details })
      }
    };
  }
}

/**
 * 검증 에러 (400)
 */
export class ValidationError extends AppError {
  constructor(message, details = {}) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

/**
 * 리소스 없음 에러 (404)
 */
export class NotFoundError extends AppError {
  constructor(resource, identifier) {
    super(
      `${resource} not found${identifier ? `: ${identifier}` : ''}`,
      404,
      'NOT_FOUND',
      { resource, identifier }
    );
  }
}

/**
 * DynamoDB 에러 (500)
 */
export class DynamoDBError extends AppError {
  constructor(message, tableName, operation) {
    super(
      message,
      500,
      'DYNAMODB_ERROR',
      { tableName, operation }
    );
  }
}

/**
 * Cognito 에러 (500)
 */
export class CognitoError extends AppError {
  constructor(message, operation) {
    super(
      message,
      500,
      'COGNITO_ERROR',
      { operation }
    );
  }
}

/**
 * 권한 에러 (403)
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * 인증 에러 (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * 에러 핸들러 - Lambda Response 형태로 변환
 */
export const handleError = (error, corsHeaders) => {
  // 로깅
  console.error('Error occurred:', {
    name: error.name,
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    stack: error.stack
  });

  // 운영 에러 (예측 가능한 에러)
  if (error.isOperational) {
    return {
      statusCode: error.statusCode,
      headers: corsHeaders,
      body: JSON.stringify(error.toJSON())
    };
  }

  // 알려지지 않은 에러 (프로그래밍 에러)
  return {
    statusCode: 500,
    headers: corsHeaders,
    body: JSON.stringify({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
        statusCode: 500
      }
    })
  };
};

/**
 * AWS SDK 에러를 AppError로 변환
 */
export const parseAWSError = (error, context = {}) => {
  const { tableName, operation, service } = context;

  // DynamoDB 에러
  if (error.name && error.name.includes('DynamoDB')) {
    return new DynamoDBError(
      error.message || 'DynamoDB operation failed',
      tableName,
      operation
    );
  }

  // Cognito 에러
  if (error.name && error.name.includes('Cognito')) {
    return new CognitoError(
      error.message || 'Cognito operation failed',
      operation
    );
  }

  // 기타 AWS 에러
  return new AppError(
    error.message || 'AWS service error',
    500,
    'AWS_ERROR',
    { service, ...context }
  );
};

/**
 * 검증 에러 배열을 ValidationError로 변환
 */
export const createValidationError = (errors) => {
  const messages = errors.map(e => `${e.field}: ${e.error}`).join(', ');
  return new ValidationError(`Validation failed: ${messages}`, { errors });
};
