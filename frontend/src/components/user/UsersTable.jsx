import React, { useState, useEffect } from 'react';
import { Users, Activity, TrendingUp, TrendingDown, Search, X } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../common/Card';
import { fetchAllUsersUsage } from '../../services/api';
import { formatEngineName } from '../../utils/engineFormatter';

/**
 * 모든 사용자의 사용량을 표시하는 테이블 컴포넌트
 */
const UsersTable = ({ selectedMonth, selectedService = 'title' }) => {
  const [loading, setLoading] = useState(true);
  const [usersData, setUsersData] = useState([]);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('totalTokens'); // totalTokens, email, messageCount, createdAt
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [emailFilter, setEmailFilter] = useState(''); // 이메일 필터

  useEffect(() => {
    loadUsersData();
  }, [selectedMonth, selectedService]);

  const loadUsersData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchAllUsersUsage(selectedService, selectedMonth);
      setUsersData(data.users || []);
    } catch (err) {
      console.error('Failed to load users data:', err);
      setError('사용자 데이터를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getFilteredAndSortedUsers = () => {
    if (!usersData || usersData.length === 0) return [];

    // 이메일 필터링
    let filtered = usersData;
    if (emailFilter.trim()) {
      const filterLower = emailFilter.toLowerCase();
      filtered = usersData.filter(userData => {
        const email = userData.user.email?.toLowerCase() || '';
        const username = userData.user.username?.toLowerCase() || '';
        const userId = userData.user.userId?.toLowerCase() || '';
        return email.includes(filterLower) || username.includes(filterLower) || userId.includes(filterLower);
      });
    }

    // 정렬
    return [...filtered].sort((a, b) => {
      let aValue, bValue;

      if (sortBy === 'email') {
        aValue = a.user.email || '';
        bValue = b.user.email || '';
      } else if (sortBy === 'totalTokens') {
        aValue = a.usage.totalTokens || 0;
        bValue = b.usage.totalTokens || 0;
      } else if (sortBy === 'messageCount') {
        aValue = a.usage.messageCount || 0;
        bValue = b.usage.messageCount || 0;
      } else if (sortBy === 'createdAt') {
        aValue = a.user.createdAt ? new Date(a.user.createdAt).getTime() : 0;
        bValue = b.user.createdAt ? new Date(b.user.createdAt).getTime() : 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const sortedUsers = getFilteredAndSortedUsers();

  const clearFilter = () => {
    setEmailFilter('');
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? (
      <TrendingUp className="w-4 h-4 inline ml-1" />
    ) : (
      <TrendingDown className="w-4 h-4 inline ml-1" />
    );
  };

  return (
    <Card title="전체 사용자별 사용량" tooltip={`${selectedMonth} 전체 사용자의 사용량 통계`}>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-slate-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadUsersData}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors text-sm font-medium"
          >
            다시 시도
          </button>
        </div>
      ) : usersData.length === 0 ? (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">사용자 데이터가 없습니다</p>
        </div>
      ) : (
        <div>
          {/* 검색 필터 */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
                placeholder="이메일, 사용자명 또는 User ID로 검색..."
                className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 text-gray-900"
              />
              {emailFilter && (
                <button
                  onClick={clearFilter}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            {emailFilter && (
              <p className="mt-2 text-sm text-gray-600">
                {sortedUsers.length}명의 사용자를 찾았습니다 (전체: {usersData.length}명)
              </p>
            )}
          </div>

          {/* 요약 정보 */}
          <div className="mb-4 p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-lg flex items-center gap-3 border border-blue-100">
            <div className="w-10 h-10 rounded-lg bg-white border border-blue-200 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {emailFilter ? '필터링된 사용자 수' : '전체 사용자 수'}
              </p>
              <p className="text-2xl font-bold text-gray-900">{sortedUsers.length}명</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm text-gray-600">총 토큰 사용량</p>
              <p className="text-2xl font-bold text-gray-900">
                {sortedUsers.reduce((sum, u) => sum + u.usage.totalTokens, 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* 테이블 또는 검색 결과 없음 메시지 */}
          {sortedUsers.length === 0 && emailFilter ? (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">검색 결과가 없습니다</p>
              <button
                onClick={clearFilter}
                className="mt-3 text-slate-600 hover:text-slate-700 text-sm font-medium"
              >
                필터 초기화
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-3 text-gray-600 font-medium">순위</th>
                    <th className="text-left p-3 text-gray-600 font-medium">User ID</th>
                    <th
                      className="text-left p-3 text-gray-600 font-medium cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('email')}
                    >
                      사용자 <SortIcon field="email" />
                    </th>
                    <th
                      className="text-right p-3 text-gray-600 font-medium cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('totalTokens')}
                    >
                      총 토큰 <SortIcon field="totalTokens" />
                    </th>
                    <th className="text-right p-3 text-gray-600 font-medium">입력 토큰</th>
                    <th className="text-right p-3 text-gray-600 font-medium">출력 토큰</th>
                    <th
                      className="text-right p-3 text-gray-600 font-medium cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('messageCount')}
                    >
                      메시지 수 <SortIcon field="messageCount" />
                    </th>
                    <th className="text-left p-3 text-gray-600 font-medium">엔진</th>
                    <th
                      className="text-left p-3 text-gray-600 font-medium cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('createdAt')}
                    >
                      가입일 <SortIcon field="createdAt" />
                    </th>
                    <th className="text-center p-3 text-gray-600 font-medium">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUsers.map((userData, index) => (
                    <motion.tr
                      key={userData.user.userId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-3 text-gray-900 font-medium">{index + 1}</td>
                      <td className="p-3">
                        <p className="text-xs text-gray-500 font-mono">{userData.user.userId}</p>
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="text-gray-900 font-medium">{userData.user.email}</p>
                          <p className="text-sm text-gray-500">{userData.user.username}</p>
                        </div>
                      </td>
                      <td className="p-3 text-right text-gray-900 font-bold">
                        {userData.usage.totalTokens.toLocaleString()}
                      </td>
                      <td className="p-3 text-right text-gray-600">
                        {userData.usage.inputTokens.toLocaleString()}
                      </td>
                      <td className="p-3 text-right text-gray-600">
                        {userData.usage.outputTokens.toLocaleString()}
                      </td>
                      <td className="p-3 text-right text-gray-600">
                        {userData.usage.messageCount.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col gap-1">
                          {userData.usage.details && userData.usage.details.length > 0 ? (
                            userData.usage.details.map((detail, idx) => {
                              // 서비스 ID 추출 (detail.serviceId가 있으면 사용, 없으면 selectedService에서)
                              const serviceId = detail.serviceId || selectedService.replace(/_kr$|_en$/, '');
                              const formattedEngine = formatEngineName(detail.engineType, serviceId);

                              return (
                                <span key={idx} className="inline-flex px-2 py-1 text-xs font-medium rounded bg-slate-100 text-slate-700 border border-slate-200">
                                  {formattedEngine} ({detail.totalTokens.toLocaleString()})
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        {userData.user.createdAt ? (
                          <div className="text-sm text-gray-600">
                            <div>{new Date(userData.user.createdAt).toLocaleDateString('ko-KR')}</div>
                            <div className="text-xs text-gray-400">
                              {new Date(userData.user.createdAt).toLocaleTimeString('ko-KR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded border ${
                          userData.user.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}>
                          {userData.user.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 사용자 수 표시 */}
          {sortedUsers.length > 20 && (
            <div className="mt-4 text-center text-sm text-gray-500">
              총 {sortedUsers.length}명의 사용자를 표시하고 있습니다
              {emailFilter && ` (필터링됨)`}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default UsersTable;
