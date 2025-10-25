import React, { useState } from 'react';
import { Search, User, Mail, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../common/Card';
import { fetchUserUsageByEmail } from '../../services/api';

/**
 * 사용자 검색 및 사용량 조회 컴포넌트
 */
const UserSearch = ({ selectedMonth, selectedService = 'title' }) => {
  const [email, setEmail] = useState('');
  const [searching, setSearching] = useState(false);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('이메일을 입력해주세요');
      return;
    }

    setSearching(true);
    setError(null);
    setUserData(null);

    try {
      const data = await fetchUserUsageByEmail(email, selectedService, selectedMonth);
      setUserData(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('사용자를 찾을 수 없습니다');
      } else {
        setError('사용자 조회 중 오류가 발생했습니다');
      }
      console.error('User search error:', err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <Card title="사용자별 사용량 조회" tooltip="이메일로 특정 사용자의 사용량을 검색합니다">
      {/* 검색 폼 */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="사용자 이메일을 입력하세요 (예: user@example.com)"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            {searching ? '검색 중...' : '검색'}
          </button>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </form>

      {/* 검색 결과 */}
      <AnimatePresence>
        {userData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* 사용자 정보 */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">사용자 정보</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-gray-500">이메일</p>
                      <p className="text-gray-900 font-medium">{userData.user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">사용자명</p>
                      <p className="text-gray-900 font-medium">{userData.user.username}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">역할</p>
                      <p className="text-gray-900 font-medium">{userData.user.role}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">상태</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        userData.user.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {userData.user.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 사용량 통계 */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  사용량 통계 ({selectedMonth})
                </h3>
              </div>

              {userData.usage.records > 0 ? (
                <>
                  {/* 전체 통계 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600 mb-1">총 토큰</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {userData.usage.totalTokens.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600 mb-1">입력 토큰</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {userData.usage.inputTokens.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600 mb-1">출력 토큰</p>
                      <p className="text-2xl font-bold text-green-600">
                        {userData.usage.outputTokens.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600 mb-1">메시지 수</p>
                      <p className="text-2xl font-bold text-amber-600">
                        {userData.usage.messageCount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* 엔진별 상세 */}
                  {userData.usage.details && userData.usage.details.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">엔진별 상세</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left p-2 text-gray-600 font-medium">엔진</th>
                              <th className="text-right p-2 text-gray-600 font-medium">총 토큰</th>
                              <th className="text-right p-2 text-gray-600 font-medium">입력</th>
                              <th className="text-right p-2 text-gray-600 font-medium">출력</th>
                              <th className="text-right p-2 text-gray-600 font-medium">메시지</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userData.usage.details.map((detail, index) => (
                              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="p-2 text-gray-900 font-medium">{detail.engineType}</td>
                                <td className="p-2 text-right text-gray-900">{detail.totalTokens.toLocaleString()}</td>
                                <td className="p-2 text-right text-gray-600">{detail.inputTokens.toLocaleString()}</td>
                                <td className="p-2 text-right text-gray-600">{detail.outputTokens.toLocaleString()}</td>
                                <td className="p-2 text-right text-gray-600">{detail.messageCount.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">해당 기간의 사용량이 없습니다</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default UserSearch;
