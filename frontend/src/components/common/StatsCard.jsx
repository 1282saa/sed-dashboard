import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * 통계 카드 컴포넌트
 */
const StatsCard = ({
  title,
  value,
  unit = '',
  trend,
  trendValue,
  icon: Icon,
  color = 'purple',
  loading = false,
}) => {
  const colorClasses = {
    purple: 'from-purple-600/20 to-purple-900/20 border-purple-600/30',
    blue: 'from-blue-600/20 to-blue-900/20 border-blue-600/30',
    green: 'from-green-600/20 to-green-900/20 border-green-600/30',
    amber: 'from-amber-600/20 to-amber-900/20 border-amber-600/30',
    red: 'from-red-600/20 to-red-900/20 border-red-600/30',
  };

  const iconColorClasses = {
    purple: 'text-purple-400',
    blue: 'text-blue-400',
    green: 'text-green-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-white rounded-xl p-6 border border-gray-200">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  const bgColors = {
    purple: 'bg-purple-50',
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    amber: 'bg-amber-50',
    red: 'bg-red-50',
  };

  const iconBgColors = {
    purple: 'bg-purple-100',
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    amber: 'bg-amber-100',
    red: 'bg-red-100',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'relative overflow-hidden rounded-xl p-6 border border-gray-200',
        bgColors[color] || bgColors.purple
      )}
    >
      {/* 아이콘 */}
      {Icon && (
        <div className={clsx(
          'inline-flex p-3 rounded-lg mb-4',
          iconBgColors[color] || iconBgColors.purple
        )}>
          <Icon className={clsx('w-6 h-6', iconColorClasses[color])} />
        </div>
      )}

      {/* 타이틀 */}
      <p className="text-sm text-gray-600 mb-1">{title}</p>

      {/* 값 */}
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-gray-900">
          {value?.toLocaleString()}
        </p>
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
      </div>

      {/* 트렌드 */}
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          {trend === 'up' ? (
            <TrendingUp className="w-4 h-4 text-green-600" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-600" />
          )}
          <span className={clsx(
            'text-sm font-medium',
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          )}>
            {trendValue}
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default StatsCard;
