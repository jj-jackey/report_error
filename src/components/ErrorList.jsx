import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  RefreshCw,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { getErrorReports, deleteErrorReport } from '../services/errorService';
import toast from 'react-hot-toast';

const ErrorList = ({ onStatsUpdate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    project: '',
    priority: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    // URL 파라미터에서 필터 읽기
    const params = new URLSearchParams(location.search);
    const statusParam = params.get('status');
    const priorityParam = params.get('priority');
    
    if (statusParam) {
      setFilters(prev => ({ ...prev, status: statusParam }));
    }
    if (priorityParam) {
      setFilters(prev => ({ ...prev, priority: priorityParam }));
    }
    
    loadErrors();
  }, [location.search]);

  const loadErrors = async () => {
    setLoading(true);
    try {
      const result = await getErrorReports(filters);
      if (result.success) {
        setErrors(result.data);
        
        // 프로젝트 목록 추출
        const uniqueProjects = [...new Set(result.data.map(error => error.project_name))];
        setProjects(uniqueProjects);
      } else {
        toast.error('오류 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      toast.error('오류가 발생했습니다: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyFilters = () => {
    loadErrors();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      project: '',
      priority: ''
    });
    setSearchTerm('');
    loadErrors();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('이 오류 보고서를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const result = await deleteErrorReport(id);
      if (result.success) {
        toast.success('오류 보고서가 삭제되었습니다.');
        loadErrors();
        onStatsUpdate?.();
      } else {
        toast.error('삭제에 실패했습니다: ' + result.error);
      }
    } catch (error) {
      toast.error('오류가 발생했습니다: ' + error.message);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      '접수됨': 'bg-orange-100 text-orange-800',
      '수정완료': 'bg-green-100 text-green-800',
      '보류': 'bg-yellow-100 text-yellow-800',
      '수정불가': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      '긴급': 'bg-red-100 text-red-800',
      '높음': 'bg-orange-100 text-orange-800',
      '보통': 'bg-blue-100 text-blue-800',
      '낮음': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${styles[priority]}`}>
        {priority}
      </span>
    );
  };

  // 검색 필터링
  const filteredErrors = errors.filter(error => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        error.error_title.toLowerCase().includes(searchLower) ||
        error.project_name.toLowerCase().includes(searchLower) ||
        (error.user_name && error.user_name.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 및 검색 */}
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">오류 보고서 목록</h2>
            <p className="text-sm text-gray-600">총 {filteredErrors.length}개의 오류 보고서</p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            {/* 검색 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="제목, 프로젝트, 사용자 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
            </div>
            
            {/* 필터 버튼 */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>필터</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            {/* 새로고침 */}
            <button
              onClick={loadErrors}
              className="btn-secondary flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>새로고침</span>
            </button>
          </div>
        </div>
        
        {/* 필터 패널 */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="input-field"
                >
                  <option value="">전체</option>
                  <option value="접수됨">접수됨</option>
                  <option value="수정완료">수정완료</option>
                  <option value="보류">보류</option>
                  <option value="수정불가">수정불가</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">프로젝트</label>
                <select
                  value={filters.project}
                  onChange={(e) => handleFilterChange('project', e.target.value)}
                  className="input-field"
                >
                  <option value="">전체</option>
                  {projects.map(project => (
                    <option key={project} value={project}>{project}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">우선순위</label>
                <select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="input-field"
                >
                  <option value="">전체</option>
                  <option value="긴급">긴급</option>
                  <option value="높음">높음</option>
                  <option value="보통">보통</option>
                  <option value="낮음">낮음</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <button onClick={clearFilters} className="btn-secondary">
                필터 초기화
              </button>
              <button onClick={applyFilters} className="btn-primary">
                필터 적용
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 오류 목록 */}
      <div className="card">
        {filteredErrors.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">오류 보고서가 없습니다</h3>
            <p className="text-gray-600">
              {searchTerm || Object.values(filters).some(f => f) 
                ? '검색 조건에 맞는 오류 보고서가 없습니다.' 
                : '아직 등록된 오류 보고서가 없습니다.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    오류 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    프로젝트
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    보고자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    우선순위
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    등록일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredErrors.map((error) => (
                  <tr key={error.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900 truncate max-w-xs">
                          {error.error_title}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {error.error_detail || '상세 설명 없음'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {error.project_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{error.user_name || '익명'}</div>
                      <div className="text-sm text-gray-500">{error.user_email || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(error.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(error.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(error.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/admin/errors/${error.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                          title="상세 보기"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(error.id)}
                          className="text-red-600 hover:text-red-900"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorList; 