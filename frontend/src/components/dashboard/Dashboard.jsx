import React, { useState } from 'react';
import { Layers, LogOut, User } from 'lucide-react';
import UsersTable from '../user/UsersTable';
import CustomSelect from '../common/CustomSelect';
import DateRangePicker from '../common/DateRangePicker';
import DailyUsageTrendChart from '../charts/DailyUsageTrendChart';
import UserRegistrationTrendChart from '../charts/UserRegistrationTrendChart';
import { SERVICES_CONFIG } from '../../config/services';
import { useAuth } from '../../contexts/AuthContext';

/**
 * 통합 모니터링 대시보드 메인 컴포넌트
 */
const Dashboard = () => {
  const { user, logout } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedService, setSelectedService] = useState(''); // 전체 서비스를 기본값으로

  // 서비스명 매핑
  const serviceNameMap = {
    'title': '제목',
    'proofreading': '교열',
    'news': '보도',
    'foreign': '외신',
    'revision': '퇴고',
    'buddy': '버디'
  };

  // 서비스 옵션 생성 (한국어/영어로 그룹화)
  const serviceOptions = [
    { value: '', label: '전체 서비스' },
    { value: 'divider_kr', label: '─── 한국어 버전 ───', disabled: true },
    ...SERVICES_CONFIG.map(service => ({
      value: `${service.id}_kr`,
      label: `${serviceNameMap[service.id] || service.displayName} (kr)`
    })),
    { value: 'divider_en', label: '─── 영어 버전 ───', disabled: true },
    ...SERVICES_CONFIG.map(service => ({
      value: `${service.id}_en`,
      label: `${serviceNameMap[service.id] || service.displayName} (en)`
    }))
  ];

  // 개발 중인 영어 서비스 (제목, 퇴고 제외)
  const developingEnServices = ['proofreading_en', 'news_en', 'foreign_en', 'buddy_en'];

  // 서비스 선택 핸들러
  const handleServiceChange = (value) => {
    // 개발 중인 서비스인지 확인
    if (developingEnServices.includes(value)) {
      alert('해당 서비스는 현재 개발 중입니다.');
      return;
    }
    setSelectedService(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 p-4 sm:p-6">
      {/* 헤더 */}
      <header className="mb-8">
        {/* 상단: 사용자 정보 및 로그아웃 */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user?.name || '사용자'}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>로그아웃</span>
          </button>
        </div>

        {/* 메인 헤더 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              통합 사용량 모니터링 대시보드
            </h1>
            <p className="text-gray-600 mt-1 text-sm">
              전체 마이크로서비스의 통합 사용 현황
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            {/* 날짜 범위 선택 */}
            <DateRangePicker
              value={selectedMonth}
              onChange={setSelectedMonth}
              className="min-w-[280px]"
            />

            {/* 서비스 필터 */}
            <CustomSelect
              value={selectedService}
              onChange={handleServiceChange}
              options={serviceOptions}
              placeholder="서비스 선택"
              icon={Layers}
              className="min-w-[200px]"
            />
          </div>
        </div>
      </header>

      {/* 사용자 가입 추이 차트 */}
      <div className="mb-8">
        <UserRegistrationTrendChart />
      </div>

      {/* 일별 사용량 추이 차트 */}
      <div className="mb-8">
        <DailyUsageTrendChart selectedMonth={selectedMonth} selectedService={selectedService} />
      </div>

      {/* 전체 사용자 테이블 섹션 */}
      <UsersTable selectedMonth={selectedMonth} selectedService={selectedService} />
    </div>
  );
};

export default Dashboard;
