import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * 에러 메시지 컴포넌트
 * API 요청 실패 등의 에러 상황에서 표시되는 공통 에러 UI
 */
const ErrorMessage = ({ 
  message = '오류가 발생했습니다.',
  description = null,
  onRetry = null,
  fullScreen = false,
  className = '' 
}) => {
  const content = (
    <div className={`flex flex-col items-center justify-center gap-4 p-6 ${className}`}>
      <div className="p-4 bg-red-100 rounded-full">
        <AlertCircle className="w-10 h-10 text-red-600" />
      </div>
      
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {message}
        </h3>
        {description && (
          <p className="text-sm text-gray-600">
            {description}
          </p>
        )}
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          다시 시도
        </button>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg">
      {content}
    </div>
  );
};

export default ErrorMessage;
