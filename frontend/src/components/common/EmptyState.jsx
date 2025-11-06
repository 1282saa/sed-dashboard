import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * 빈 상태 컴포넌트
 * 데이터가 없을 때 표시되는 공통 UI
 */
const EmptyState = ({ 
  icon: Icon = Inbox,
  message = '데이터가 없습니다.',
  description = null,
  action = null,
  className = '' 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 p-8 ${className}`}>
      <div className="p-4 bg-gray-100 rounded-full">
        <Icon className="w-10 h-10 text-gray-400" />
      </div>
      
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-700 mb-1">
          {message}
        </h3>
        {description && (
          <p className="text-sm text-gray-500">
            {description}
          </p>
        )}
      </div>

      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
