import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import ErrorReportForm from './components/ErrorReportForm';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 현재 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 인증 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* 오류 보고 폼 - 누구나 접근 가능 */}
        <Route path="/report" element={<ErrorReportForm />} />
        
        {/* 로그인 페이지 */}
        <Route 
          path="/login" 
          element={
            user ? <Navigate to="/admin" replace /> : <Login />
          } 
        />
        
        {/* 관리자 대시보드 - 로그인 필요 */}
        <Route 
          path="/admin/*" 
          element={
            user ? <AdminDashboard /> : <Navigate to="/login" replace />
          } 
        />
        
        {/* 기본 라우트 */}
        <Route 
          path="/" 
          element={
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
              <div className="card max-w-md w-full text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                  오류 보고 시스템
                </h1>
                <p className="text-gray-600 mb-6">
                  시스템에서 발생한 오류를 신속하게 보고하고 관리할 수 있는 플랫폼입니다.
                </p>
                <div className="space-y-3">
                  <a 
                    href="/report?project=테스트프로젝트" 
                    className="block btn-primary text-center"
                  >
                    오류 보고하기
                  </a>
                  <a 
                    href="/admin" 
                    className="block btn-secondary text-center"
                  >
                    관리자 로그인
                  </a>
                </div>
              </div>
            </div>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
