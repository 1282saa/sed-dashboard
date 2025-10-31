import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { UserPlus, Users, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../common/Card';
import { fetchUserRegistrationTrend } from '../../services/api';

/**
 * 사용자 가입 추이 차트
 */
const UserRegistrationTrendChart = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchUserRegistrationTrend();

      // 날짜 포맷팅
      const processedData = result.map(item => ({
        ...item,
        displayDate: formatDate(item.date)
      }));

      setData(processedData);
    } catch (err) {
      console.error('Failed to load registration trend:', err);
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

    const total = data[data.length - 1]?.cumulativeUsers || 0;
    const totalNewUsers = data.reduce((sum, item) => sum + item.newUsers, 0);
    const avgDailyNewUsers = Math.round(totalNewUsers / data.length);
    const maxDaily = Math.max(...data.map(d => d.newUsers));
    const maxDay = data.find(d => d.newUsers === maxDaily);

    // 최근 7일 평균
    const last7Days = data.slice(-7);
    const last7DaysAvg = Math.round(
      last7Days.reduce((sum, item) => sum + item.newUsers, 0) / last7Days.length
    );

    return {
      total,
      avgDailyNewUsers,
      maxDaily,
      maxDay,
      last7DaysAvg
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
              <span className="text-sm text-gray-600">신규 가입</span>
              <span className="font-semibold text-gray-900">{data.newUsers}명</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-600">누적 사용자</span>
              <span className="font-semibold text-gray-900">{data.cumulativeUsers}명</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card title="사용자 가입 추이" tooltip="일별 신규 가입자 수와 누적 사용자 수">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-slate-600"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="사용자 가입 추이" tooltip="일별 신규 가입자 수와 누적 사용자 수">
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
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
      title="사용자 가입 추이"
      tooltip="일별 신규 가입자 수와 누적 사용자 수 (Cognito 기준)"
    >
      {/* 통계 카드 */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="border border-blue-100 rounded-lg p-4 bg-gradient-to-br from-white to-blue-50/30 hover:border-blue-200 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">총 사용자</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total.toLocaleString()}</p>
            <p className="text-xs text-gray-600 mt-1">누적 가입자</p>
          </div>

          <div className="border border-indigo-100 rounded-lg p-4 bg-gradient-to-br from-white to-indigo-50/30 hover:border-indigo-200 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">일 평균</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.avgDailyNewUsers}</p>
            <p className="text-xs text-gray-600 mt-1">신규 가입자</p>
          </div>

          <div className="border border-cyan-100 rounded-lg p-4 bg-gradient-to-br from-white to-cyan-50/30 hover:border-cyan-200 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-cyan-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">최대</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.maxDaily}</p>
            <p className="text-xs text-gray-600 mt-1">{stats.maxDay?.displayDate}</p>
          </div>

          <div className="border border-sky-100 rounded-lg p-4 bg-gradient-to-br from-white to-sky-50/30 hover:border-sky-200 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-sky-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">최근 7일</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.last7DaysAvg}</p>
            <p className="text-xs text-gray-600 mt-1">일 평균 가입자</p>
          </div>
        </div>
      )}

      {/* 차트 */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorNewUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="displayDate"
              stroke="#9ca3af"
              style={{ fontSize: '12px', fontWeight: '500' }}
            />
            <YAxis
              yAxisId="left"
              stroke="#3b82f6"
              style={{ fontSize: '12px', fontWeight: '500' }}
              label={{ value: '신규 가입자', angle: -90, position: 'insideLeft', style: { fill: '#3b82f6', fontWeight: '500' } }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#6366f1"
              style={{ fontSize: '12px', fontWeight: '500' }}
              label={{ value: '누적 사용자', angle: 90, position: 'insideRight', style: { fill: '#6366f1', fontWeight: '500' } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '13px', fontWeight: '500' }}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="newUsers"
              name="신규 가입자"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fill="url(#colorNewUsers)"
              animationDuration={800}
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="cumulativeUsers"
              name="누적 사용자"
              stroke="#6366f1"
              strokeWidth={2.5}
              fill="url(#colorCumulative)"
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

export default UserRegistrationTrendChart;
