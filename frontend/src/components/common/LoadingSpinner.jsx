import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * 로딩 스피너 컴포넌트
 * 데이터 로딩 중 표시되는 공통 로딩 UI
 */
const LoadingSpinner = ({ 
  size = 'md', 
  message = '로딩 중...', 
  fullScreen = false,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const spinnerSize = sizeClasses[size] || sizeClasses.md;

  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`${spinnerSize} text-purple-600 animate-spin`} />
      {message && (
        <p className="text-gray-600 text-sm">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
