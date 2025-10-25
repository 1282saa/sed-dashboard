import React from 'react';
import clsx from 'clsx';

/**
 * 공통 카드 컴포넌트
 */
const Card = ({
  title,
  subtitle,
  tooltip,
  children,
  className,
  headerAction,
  collapsible = false,
  defaultCollapsed = false,
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  return (
    <div className={clsx(
      'bg-white rounded-xl shadow-sm border border-gray-200',
      className
    )}>
      {/* 헤더 */}
      {(title || tooltip || headerAction) && (
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {title && (
              <h4 className="text-base sm:text-lg font-semibold text-gray-900">
                {title}
              </h4>
            )}
            {subtitle && (
              <span className="text-sm text-gray-500">{subtitle}</span>
            )}
            {tooltip && (
              <div className="relative group">
                <span className="text-gray-400 cursor-help">ℹ</span>
                <div className="absolute left-0 top-6 w-48 p-2 bg-gray-900 text-white rounded-lg text-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  {tooltip}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {headerAction}
            {collapsible && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1 hover:bg-gray-50 rounded transition-colors text-gray-600"
              >
                <span className={clsx(
                  'transform transition-transform',
                  isCollapsed ? 'rotate-0' : 'rotate-180'
                )}>
                  ▼
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 내용 */}
      <div className={clsx(
        'p-4 sm:p-6',
        isCollapsed && 'hidden'
      )}>
        {children}
      </div>
    </div>
  );
};

export default Card;
