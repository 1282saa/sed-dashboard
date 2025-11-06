import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Dashboard from './components/dashboard/Dashboard';
import Login from './components/auth/Login';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';

/**
 * 인증된 사용자만 접근할 수 있는 라우터
 */
const AuthenticatedApp = () => {
  const { user, login, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen message="로딩 중..." size="lg" />;
  }

  if (!user) {
    return <Login onLogin={login} />;
  }

  return <Dashboard />;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="App">
          <AuthenticatedApp />
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
