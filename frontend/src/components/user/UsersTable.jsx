import React, { useState, useEffect } from 'react';
import { Users, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../common/Card';
import { fetchAllUsersUsage } from '../../services/api';

/**
 * 모든 사용자의 사용량을 표시하는 테이블 컴포넌트
 */
const UsersTable = ({ selectedMonth, selectedService = 'title' }) => {
  const [loading, setLoading] = useState(true);
  const [usersData, setUsersData] = useState([]);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('totalTokens'); // totalTokens, email, messageCount
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc

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

  const getSortedUsers = () => {
    if (!usersData || usersData.length === 0) return [];

    return [...usersData].sort((a, b) => {
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
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const sortedUsers = getSortedUsers();

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-red-300 mx-auto mb-3" />
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadUsersData}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            다시 시도
          </button>
        </div>
      ) : sortedUsers.length === 0 ? (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">사용자 데이터가 없습니다</p>
        </div>
      ) : (
        <div>
          {/* 요약 정보 */}
          <div className="mb-4 p-4 bg-purple-50 rounded-lg flex items-center gap-3">
            <Users className="w-6 h-6 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">전체 사용자 수</p>
              <p className="text-2xl font-bold text-purple-600">{sortedUsers.length}명</p>
            </div>
            <div className="ml-auto">
              <p className="text-sm text-gray-600">총 토큰 사용량</p>
              <p className="text-2xl font-bold text-gray-900">
                {sortedUsers.reduce((sum, u) => sum + u.usage.totalTokens, 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* 테이블 */}
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
                          userData.usage.details.map((detail, idx) => (
                            <span key={idx} className="inline-flex px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                              {detail.engineType} ({detail.totalTokens.toLocaleString()})
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        userData.user.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {userData.user.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 힌트 (향후 추가 가능) */}
          {sortedUsers.length > 20 && (
            <div className="mt-4 text-center text-sm text-gray-500">
              총 {sortedUsers.length}명의 사용자를 표시하고 있습니다
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default UsersTable;
