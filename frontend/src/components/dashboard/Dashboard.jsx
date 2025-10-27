import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import UsersTable from '../user/UsersTable';
import { SERVICES_CONFIG } from '../../config/services';

/**
 * 통합 모니터링 대시보드 메인 컴포넌트
 */
const Dashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedService, setSelectedService] = useState('');

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
          </div>
        </div>
      </header>

      {/* 전체 사용자 테이블 섹션 */}
      <UsersTable selectedMonth={selectedMonth} selectedService={selectedService || 'title'} />
    </div>
  );
};

export default Dashboard;
