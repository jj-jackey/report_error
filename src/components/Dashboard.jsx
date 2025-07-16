import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  Calendar,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  Eye
} from 'lucide-react';
import { getErrorReports } from '../services/errorService';

const Dashboard = ({ stats, onStatsUpdate }) => {
  const navigate = useNavigate();
  const [recentErrors, setRecentErrors] = useState([]);
  const [projectStats, setProjectStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const result = await getErrorReports();
      if (result.success) {
        const errors = result.data;
        
        // 최근 5개 오류
        setRecentErrors(errors.slice(0, 5));
        
        // 프로젝트별 통계
        const projectMap = {};
        errors.forEach(error => {
          if (!projectMap[error.project_name]) {
            projectMap[error.project_name] = {
              name: error.project_name,
              total: 0,
              pending: 0,
              completed: 0
            };
          }
          projectMap[error.project_name].total++;
          if (error.status === '접수됨') projectMap[error.project_name].pending++;
          if (error.status === '수정완료') projectMap[error.project_name].completed++;
        });
        
        setProjectStats(Object.values(projectMap));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      '접수됨': 'status-badge status-pending',
      '수정완료': 'status-badge status-completed',
      '보류': 'status-badge status-on-hold',
      '수정불가': 'status-badge status-impossible'
    };
    
    return (
      <span className={styles[status]}>
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      '긴급': 'priority-badge priority-urgent',
      '높음': 'priority-badge priority-high',
      '보통': 'priority-badge priority-normal',
      '낮음': 'priority-badge priority-low'
    };
    
    return (
      <span className={styles[priority]}>
        {priority}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 font-medium">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 최근 오류 목록 */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">최근 오류 보고서</h2>
                <p className="text-sm text-gray-600">새로 접수된 오류들을 확인하세요</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/errors')}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded-lg transition-all duration-200 group"
            >
              <span className="font-medium">전체 보기</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {recentErrors.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">아직 오류 보고서가 없습니다.</p>
              <p className="text-sm text-gray-400 mt-1">새로운 오류가 접수되면 여기에 표시됩니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentErrors.map((error) => (
                <div
                  key={error.id}
                  onClick={() => navigate(`/admin/errors/${error.id}`)}
                  className="p-5 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md cursor-pointer transition-all duration-200 group"
                >
                  {/* 첫 번째 줄: 제목과 상태 */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg flex-1 mr-4 group-hover:text-blue-700 transition-colors">
                      {error.error_title}
                    </h3>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {getPriorityBadge(error.priority)}
                      {getStatusBadge(error.status)}
                    </div>
                  </div>

                  {/* 두 번째 줄: 프로젝트와 사용자 정보 */}
                  <div className="flex items-center justify-between text-sm mb-3">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="font-medium text-gray-600">프로젝트:</span>
                        <span className="text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded">
                          {error.project_name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-600">신고자:</span>
                        <span className="text-gray-700">{error.user_name || '익명'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(error.created_at).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* 세 번째 줄: 오류 설명 미리보기 */}
                  {error.error_description && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {error.error_description.length > 100 
                          ? error.error_description.substring(0, 100) + '...'
                          : error.error_description
                        }
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 프로젝트별 통계 */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">프로젝트별 오류 현황</h2>
              <p className="text-sm text-gray-600">각 프로젝트의 오류 처리 현황을 확인하세요</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {projectStats.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">프로젝트 데이터가 없습니다.</p>
              <p className="text-sm text-gray-400 mt-1">프로젝트에서 오류가 보고되면 통계가 표시됩니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projectStats.map((project) => (
                <div key={project.name} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200 group">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-700 transition-colors">
                      {project.name}
                    </h3>
                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                      <Activity className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span>전체 오류</span>
                      </span>
                      <span className="font-semibold text-gray-900">{project.total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 flex items-center space-x-2">
                        <Clock className="w-3 h-3 text-orange-500" />
                        <span>대기 중</span>
                      </span>
                      <span className="text-orange-600 font-semibold">{project.pending}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>완료</span>
                      </span>
                      <span className="text-green-600 font-semibold">{project.completed}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>진행률</span>
                      <span>{project.total > 0 ? Math.round((project.completed / project.total) * 100) : 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${project.total > 0 ? (project.completed / project.total) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 빠른 액션 & 시스템 정보 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">빠른 액션</h3>
                <p className="text-sm text-gray-600">자주 사용하는 기능들</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <button
              onClick={() => navigate('/admin/errors?status=접수됨')}
              className="w-full text-left p-4 border border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 group-hover:text-orange-700 transition-colors">
                    대기 중인 오류 처리
                  </div>
                  <div className="text-sm text-gray-500">{stats.pending}개의 오류가 처리를 기다리고 있습니다</div>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => navigate('/admin/errors?priority=긴급')}
              className="w-full text-left p-4 border border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 group-hover:text-red-700 transition-colors">
                    긴급 오류 확인
                  </div>
                  <div className="text-sm text-gray-500">우선순위가 높은 오류를 먼저 처리하세요</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">시스템 정보</h3>
                <p className="text-sm text-gray-600">전체 시스템 현황</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>총 처리된 오류</span>
              </span>
              <span className="font-semibold text-gray-900">{stats.completed}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span>평균 처리율</span>
              </span>
              <span className="font-semibold text-gray-900">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-purple-500" />
                <span>활성 프로젝트</span>
              </span>
              <span className="font-semibold text-gray-900">{projectStats.length}</span>
            </div>
            <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <div className="text-sm text-blue-700 font-medium">
                시스템이 정상적으로 운영 중입니다
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 