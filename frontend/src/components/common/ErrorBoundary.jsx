import React from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * 에러 바운더리 컴포넌트
 * React 컴포넌트 트리에서 발생하는 JavaScript 에러를 캐치하고
 * 에러 UI를 표시하여 전체 앱이 크래시되는 것을 방지
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // 다음 렌더링에서 폴백 UI가 보이도록 상태 업데이트
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 에러 로깅 서비스에 에러 리포트
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // 프로덕션 환경에서는 에러 로깅 서비스로 전송
    // 예: Sentry, LogRocket, etc.
    if (import.meta.env.PROD) {
      // reportError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  문제가 발생했습니다
                </h1>
                <p className="text-gray-600">
                  예상치 못한 오류가 발생했습니다.
                </p>
              </div>
            </div>

            {this.state.error && (
              <div className="mb-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-red-800 mb-2">
                    에러 메시지:
                  </p>
                  <p className="text-sm text-red-700 font-mono">
                    {this.state.error.toString()}
                  </p>
                </div>

                {import.meta.env.DEV && this.state.errorInfo && (
                  <details className="mt-4">
                    <summary className="text-sm font-semibold text-gray-700 cursor-pointer hover:text-gray-900">
                      스택 트레이스 보기 (개발 모드)
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-50 border border-gray-200 rounded p-4 overflow-x-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                다시 시도
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors font-medium"
              >
                홈으로 이동
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                문제가 계속되면 개발팀에 문의해주세요.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
