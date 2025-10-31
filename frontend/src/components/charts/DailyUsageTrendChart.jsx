import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../common/Card';
import { fetchDailyUsageTrend } from '../../services/api';

/**
 * 일별 사용량 추이 차트
 */
const DailyUsageTrendChart = ({ selectedMonth, selectedService }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [hoveredData, setHoveredData] = useState(null);

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedService]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 날짜 범위 처리 - 전체 기간 또는 날짜 범위를 그대로 전달
      let yearMonth = selectedMonth;
      if (selectedMonth === 'all') {
        yearMonth = 'all'; // 전체 기간 조회
      } else if (selectedMonth.includes('~')) {
        // 날짜 범위를 그대로 전달
        yearMonth = selectedMonth;
      }
      // 특정 월(YYYY-MM) 형식은 그대로 사용

      const result = await fetchDailyUsageTrend(selectedService || null, yearMonth);

      // 등락률 계산
      const processedData = result.map((item, index) => {
        let changeRate = 0;
        let change = 0;

        if (index > 0) {
          const prevTotal = result[index - 1].totalTokens;
          change = item.totalTokens - prevTotal;
          changeRate = prevTotal > 0 ? ((change / prevTotal) * 100) : 0;
        }

        return {
          ...item,
          date: item.date,
          displayDate: formatDate(item.date),
          change,
          changeRate: parseFloat(changeRate.toFixed(2)),
          formattedTokens: item.totalTokens.toLocaleString()
        };
      });

      setData(processedData);
    } catch (err) {
      console.error('Failed to load daily trend:', err);
      setError('데이터를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // 통계 계산
  const stats = React.useMemo(() => {
    if (data.length === 0) return null;

    const total = data.reduce((sum, item) => sum + item.totalTokens, 0);
    const average = total / data.length;
    const max = Math.max(...data.map(d => d.totalTokens));
    const min = Math.min(...data.map(d => d.totalTokens));
    const maxDay = data.find(d => d.totalTokens === max);
    const minDay = data.find(d => d.totalTokens === min);

    // 전체 등락률 (첫날 대비 마지막 날)
    const firstDay = data[0];
    const lastDay = data[data.length - 1];
    const totalChange = lastDay.totalTokens - firstDay.totalTokens;
    const totalChangeRate = firstDay.totalTokens > 0
      ? ((totalChange / firstDay.totalTokens) * 100)
      : 0;

    return {
      total,
      average: Math.round(average),
      max,
      min,
      maxDay,
      minDay,
      totalChange,
      totalChangeRate: parseFloat(totalChangeRate.toFixed(2))
    };
  }, [data]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-3 text-sm">{data.date}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-600">총 토큰</span>
              <span className="font-semibold text-gray-900">{data.formattedTokens}</span>
            </div>
            {data.changeRate !== 0 && (
              <div className="flex items-center justify-between gap-4 pt-2 border-t border-gray-100">
                <span className="text-sm text-gray-600">전일 대비</span>
                <span className={`font-semibold ${
                  data.changeRate > 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {data.changeRate > 0 ? '+' : ''}{data.changeRate}%
                </span>
              </div>
            )}
            <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
              활성 사용자: {data.activeUsers || 0}명
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card title="일별 사용량 추이" tooltip="일별 총 토큰 사용량과 등락률">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-slate-600"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="일별 사용량 추이" tooltip="일별 총 토큰 사용량과 등락률">
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors text-sm font-medium"
          >
            다시 시도
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="일별 사용량 추이"
      tooltip="일별 총 토큰 사용량과 전일 대비 등락률"
    >
      {/* 통계 카드 */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="border border-violet-100 rounded-lg p-4 bg-gradient-to-br from-white to-violet-50/30 hover:border-violet-200 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                <Activity className="w-4 h-4 text-violet-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">평균</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.average.toLocaleString()}</p>
            <p className="text-xs text-gray-600 mt-1">일 평균 토큰</p>
          </div>

          <div className="border border-blue-100 rounded-lg p-4 bg-gradient-to-br from-white to-blue-50/30 hover:border-blue-200 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">최대</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.max.toLocaleString()}</p>
            <p className="text-xs text-gray-600 mt-1">{stats.maxDay?.displayDate}</p>
          </div>

          <div className="border border-slate-100 rounded-lg p-4 bg-gradient-to-br from-white to-slate-50/30 hover:border-slate-200 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-slate-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">최소</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.min.toLocaleString()}</p>
            <p className="text-xs text-gray-600 mt-1">{stats.minDay?.displayDate}</p>
          </div>

          <div className={`border rounded-lg p-4 transition-colors ${
            stats.totalChangeRate > 0
              ? 'border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30 hover:border-emerald-200'
              : stats.totalChangeRate < 0
              ? 'border-rose-100 bg-gradient-to-br from-white to-rose-50/30 hover:border-rose-200'
              : 'border-amber-100 bg-gradient-to-br from-white to-amber-50/30 hover:border-amber-200'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                stats.totalChangeRate > 0
                  ? 'bg-emerald-100'
                  : stats.totalChangeRate < 0
                  ? 'bg-rose-100'
                  : 'bg-amber-100'
              }`}>
                {stats.totalChangeRate > 0 ? (
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                ) : stats.totalChangeRate < 0 ? (
                  <TrendingDown className="w-4 h-4 text-rose-600" />
                ) : (
                  <Minus className="w-4 h-4 text-amber-600" />
                )}
              </div>
              <span className="text-sm font-medium text-gray-700">전체 등락률</span>
            </div>
            <p className={`text-2xl font-bold ${
              stats.totalChangeRate > 0
                ? 'text-emerald-600'
                : stats.totalChangeRate < 0
                ? 'text-rose-600'
                : 'text-gray-900'
            }`}>
              {stats.totalChangeRate > 0 ? '+' : ''}{stats.totalChangeRate}%
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {stats.totalChange > 0 ? '+' : ''}{stats.totalChange.toLocaleString()} 토큰
            </p>
          </div>
        </div>
      )}

      {/* 차트 */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="displayDate"
              stroke="#9ca3af"
              style={{ fontSize: '12px', fontWeight: '500' }}
            />
            <YAxis
              stroke="#8b5cf6"
              style={{ fontSize: '12px', fontWeight: '500' }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="totalTokens"
              stroke="#8b5cf6"
              strokeWidth={2.5}
              fill="url(#colorTokens)"
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 데이터 포인트 수 */}
      <div className="mt-4 text-center text-sm text-gray-500">
        {data.length}일 데이터
      </div>
    </Card>
  );
};

export default DailyUsageTrendChart;
