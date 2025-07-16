import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  LogOut, 
  Home, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle,
  BarChart3,
  Settings
} from 'lucide-react';
import ErrorList from './ErrorList';
import ErrorDetail from './ErrorDetail';
import Dashboard from './Dashboard';
import toast, { Toaster } from 'react-hot-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    onHold: 0,
    impossible: 0
  });

  useEffect(() => {
    // 현재 사용자 정보 가져오기
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getCurrentUser();
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .from('error_reports')
        .select('status');

      if (error) throw error;

      const statsCount = {
        total: data.length,
        pending: data.filter(item => item.status === '접수됨').length,
        completed: data.filter(item => item.status === '수정완료').length,
        onHold: data.filter(item => item.status === '보류').length,
        impossible: data.filter(item => item.status === '수정불가').length
      };

      setStats(statsCount);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('로그아웃되었습니다.');
      navigate('/');
    } catch (error) {
      toast.error('로그아웃 중 오류가 발생했습니다.');
    }
  };

  const navigation = [
    { name: '대시보드', href: '/admin', icon: Home },
    { name: '오류 목록', href: '/admin/errors', icon: AlertTriangle },
  ];

  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* 상단 헤더 */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl shadow-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  오류 관리 시스템
                </h1>
                <p className="text-sm text-gray-500">실시간 오류 추적 및 관리</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block">
                <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  {user?.email}님
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">로그아웃</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {stats.total}
                </div>
                <div className="text-sm text-gray-600 mt-1">전체 오류</div>
              </div>
              <div className="p-3 bg-gray-100 rounded-xl group-hover:bg-blue-100 transition-colors">
                <BarChart3 className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-orange-600 group-hover:text-orange-700 transition-colors">
                  {stats.pending}
                </div>
                <div className="text-sm text-gray-600 mt-1 flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>접수됨</span>
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition-colors">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-600 group-hover:text-green-700 transition-colors">
                  {stats.completed}
                </div>
                <div className="text-sm text-gray-600 mt-1 flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>수정완료</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-yellow-600 group-hover:text-yellow-700 transition-colors">
                  {stats.onHold}
                </div>
                <div className="text-sm text-gray-600 mt-1 flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>보류</span>
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl group-hover:bg-yellow-200 transition-colors">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-red-600 group-hover:text-red-700 transition-colors">
                  {stats.impossible}
                </div>
                <div className="text-sm text-gray-600 mt-1 flex items-center space-x-1">
                  <XCircle className="w-4 h-4" />
                  <span>수정불가</span>
                </div>
              </div>
              <div className="p-3 bg-red-100 rounded-xl group-hover:bg-red-200 transition-colors">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* 네비게이션 */}
        <div className="mb-8">
          <nav className="flex space-x-2 bg-white rounded-2xl p-2 shadow-lg border border-gray-100">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.href)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  currentPath === item.href
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* 라우트 컨텐츠 */}
        <Routes>
          <Route index element={<Dashboard stats={stats} onStatsUpdate={loadStats} />} />
          <Route path="errors" element={<ErrorList onStatsUpdate={loadStats} />} />
          <Route path="errors/:id" element={<ErrorDetail onStatsUpdate={loadStats} />} />
        </Routes>
      </div>
      
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'white',
            color: '#374151',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
          },
        }}
      />
    </div>
  );
};

export default AdminDashboard; 