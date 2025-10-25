import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Activity,
  Zap,
  Users,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { motion } from 'framer-motion';
import StatsCard from '../common/StatsCard';
import Card from '../common/Card';
import PieChartCard from '../charts/PieChartCard';
import BarChartCard from '../charts/BarChartCard';
import LineChartCard from '../charts/LineChartCard';
import UserSearch from '../user/UserSearch';
import UsersTable from '../user/UsersTable';
import {
  fetchUsageSummary,
  fetchTopServices,
  fetchTopEngines,
  fetchDailyUsageTrend,
  fetchMonthlyUsageTrend,
} from '../../services/api';
import { SERVICES_CONFIG } from '../../config/services';

/**
 * 통합 모니터링 대시보드 메인 컴포넌트
 */
const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedService, setSelectedService] = useState('');

  // 데이터 상태
  const [summary, setSummary] = useState(null);
  const [topServices, setTopServices] = useState([]);
  const [topEngines, setTopEngines] = useState([]);
  const [dailyTrend, setDailyTrend] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);

  // 초기 데이터 로드
  useEffect(() => {
    loadAllData();
  }, [selectedMonth]);

  const loadAllData = async () => {
    try {
      setLoading(true);

      const [summaryData, servicesData, enginesData, dailyData, monthlyData] = await Promise.all([
        fetchUsageSummary(selectedMonth),
        fetchTopServices(selectedMonth),
        fetchTopEngines(selectedMonth),
        fetchDailyUsageTrend(null, selectedMonth),
        fetchMonthlyUsageTrend(null, 12),
      ]);

      setSummary(summaryData);
      setTopServices(servicesData);
      setTopEngines(enginesData);
      setDailyTrend(dailyData);
      setMonthlyTrend(monthlyData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  // 차트 데이터 변환
  const getServicePieData = () => {
    return topServices.map(service => ({
      name: service.serviceName,
      value: service.currentMonth.totalTokens,
    }));
  };

  const getEngineBarData = () => {
    return topEngines.map(engine => ({
      name: engine.engineType,
      totalTokens: engine.totalTokens,
    }));
  };

  const getDailyLineData = () => {
    return dailyTrend.map(day => ({
      name: day.date.split('-')[2], // 일자만 표시
      totalTokens: day.totalTokens,
    }));
  };

  const getMonthlyLineData = () => {
    return monthlyTrend.map(month => ({
      name: month.yearMonth,
      totalTokens: month.totalTokens,
    }));
  };

  // 트렌드 계산
  const calculateTrend = () => {
    if (!summary) return { trend: 'up', value: '0%' };

    const current = summary.currentMonth.totalTokens;
    const last = summary.lastMonth.totalTokens;
    const diff = current - last;
    const percentage = ((diff / last) * 100).toFixed(1);

    return {
      trend: diff >= 0 ? 'up' : 'down',
      value: `${Math.abs(percentage)}%`,
    };
  };

  const trend = calculateTrend();

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* 헤더 */}
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              통합 사용량 모니터링 대시보드
            </h1>
            <p className="text-gray-500 mt-1">
              전체 마이크로서비스의 통합 사용 현황
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* 월 선택 */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-white text-gray-900 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">전체 기간</option>
              <option value="2025-10">2025-10</option>
              <option value="2025-09">2025-09</option>
              <option value="2025-08">2025-08</option>
              <option value="2025-07">2025-07</option>
            </select>

            {/* 서비스 필터 */}
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="bg-white text-gray-900 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">전체 서비스</option>
              {SERVICES_CONFIG.map(service => (
                <option key={service.id} value={service.id}>
                  {service.displayName}
                </option>
              ))}
            </select>

            {/* 새로고침 버튼 */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* 통계 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="총 토큰 사용량"
          value={summary?.currentMonth.totalTokens}
          unit="tokens"
          trend={trend.trend}
          trendValue={trend.value}
          icon={Zap}
          color="purple"
          loading={loading}
        />
        <StatsCard
          title="총 메시지 수"
          value={summary?.currentMonth.totalMessages}
          unit="messages"
          icon={Activity}
          color="blue"
          loading={loading}
        />
        <StatsCard
          title="활성 사용자"
          value={summary?.currentMonth.totalActiveUsers}
          unit="users"
          icon={Users}
          color="green"
          loading={loading}
        />
        <StatsCard
          title="활성 서비스"
          value={summary?.currentMonth.totalServices}
          unit="services"
          icon={TrendingUp}
          color="amber"
          loading={loading}
        />
      </div>

      {/* Top 5 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <PieChartCard
          title="상위 5개 서비스"
          tooltip="사용량 상위 Top 5 서비스"
          data={getServicePieData()}
          dataKey="value"
          nameKey="name"
        />
        <BarChartCard
          title="상위 5개 엔진"
          tooltip="사용량 상위 Top 5 엔진"
          data={getEngineBarData()}
          dataKey="totalTokens"
          xAxisKey="name"
          color="#3B82F6"
        />
        <BarChartCard
          title="입출력 비율"
          tooltip="전체 입력 vs 출력 토큰 비율"
          data={[
            { name: '입력', value: summary?.currentMonth.totalInputTokens || 0 },
            { name: '출력', value: summary?.currentMonth.totalOutputTokens || 0 },
          ]}
          dataKey="value"
          xAxisKey="name"
          color="#10B981"
        />
      </div>

      {/* 추이 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <LineChartCard
          title="일별 사용량 추이"
          tooltip="이번 달 일별 토큰 사용량"
          data={getDailyLineData()}
          dataKey="totalTokens"
          xAxisKey="name"
          color="#8B5CF6"
          height={300}
        />
        <LineChartCard
          title="월별 사용량 추이"
          tooltip="최근 12개월 토큰 사용량"
          data={getMonthlyLineData()}
          dataKey="totalTokens"
          xAxisKey="name"
          color="#3B82F6"
          height={300}
        />
      </div>

      {/* 전체 사용자 테이블 섹션 */}
      <div className="mb-8">
        <UsersTable selectedMonth={selectedMonth} selectedService="title" />
      </div>

      {/* 사용자 검색 섹션 */}
      <div className="mb-8">
        <UserSearch selectedMonth={selectedMonth} selectedService="title" />
      </div>

      {/* 서비스별 상세 테이블 */}
      <Card title="서비스별 상세 사용량" tooltip="전체 서비스의 상세 사용 통계">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-3 text-gray-600 font-medium">서비스명</th>
                <th className="text-right p-3 text-gray-600 font-medium">총 토큰</th>
                <th className="text-right p-3 text-gray-600 font-medium">입력 토큰</th>
                <th className="text-right p-3 text-gray-600 font-medium">출력 토큰</th>
                <th className="text-right p-3 text-gray-600 font-medium">메시지 수</th>
                <th className="text-right p-3 text-gray-600 font-medium">활성 사용자</th>
              </tr>
            </thead>
            <tbody>
              {topServices.map((service, index) => (
                <motion.tr
                  key={service.serviceId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3 text-gray-900">{service.serviceName}</td>
                  <td className="p-3 text-right text-gray-900 font-medium">
                    {service.currentMonth.totalTokens.toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-gray-600">
                    {service.currentMonth.inputTokens.toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-gray-600">
                    {service.currentMonth.outputTokens.toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-gray-600">
                    {service.currentMonth.messageCount.toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-gray-600">
                    {service.currentMonth.activeUsers}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
