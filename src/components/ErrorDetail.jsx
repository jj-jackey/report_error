import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Mail, 
  Clock, 
  User, 
  Monitor, 
  Globe,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { updateErrorReport, getErrorReports } from '../services/errorService';
import toast from 'react-hot-toast';

const ErrorDetail = ({ onStatsUpdate }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    status: '',
    admin_reply: '',
    priority: ''
  });

  useEffect(() => {
    loadErrorDetail();
  }, [id]);

  const loadErrorDetail = async () => {
    try {
      const result = await getErrorReports();
      if (result.success) {
        const errorDetail = result.data.find(item => item.id === id);
        if (errorDetail) {
          setError(errorDetail);
          setFormData({
            status: errorDetail.status,
            admin_reply: errorDetail.admin_reply || '',
            priority: errorDetail.priority
          });
        } else {
          toast.error('오류 보고서를 찾을 수 없습니다.');
          navigate('/admin/errors');
        }
      }
    } catch (error) {
      console.error('Error loading error detail:', error);
      toast.error('오류 상세 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateErrorReport(id, formData);
      if (result.success) {
        toast.success('오류 보고서가 업데이트되었습니다.');
        setError(prev => ({ ...prev, ...formData }));
        onStatsUpdate?.();
      } else {
        toast.error('업데이트에 실패했습니다: ' + result.error);
      }
    } catch (error) {
      toast.error('오류가 발생했습니다: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSendEmail = async () => {
    if (!error.user_email) {
      toast.error('이메일 주소가 없습니다.');
      return;
    }

    // 실제 이메일 발송 구현 필요
    toast.success('이메일 발송 기능은 구현 예정입니다.');
  };

  const getStatusIcon = (status) => {
    const icons = {
      '접수됨': <Clock className="w-5 h-5 text-orange-500" />,
      '수정완료': <CheckCircle className="w-5 h-5 text-green-500" />,
      '보류': <Clock className="w-5 h-5 text-yellow-500" />,
      '수정불가': <XCircle className="w-5 h-5 text-red-500" />
    };
    return icons[status] || <AlertTriangle className="w-5 h-5 text-gray-500" />;
  };

  const getStatusBadge = (status) => {
    const styles = {
      '접수됨': 'bg-orange-100 text-orange-800',
      '수정완료': 'bg-green-100 text-green-800',
      '보류': 'bg-yellow-100 text-yellow-800',
      '수정불가': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {getStatusIcon(status)}
        <span className="ml-2">{status}</span>
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      '긴급': 'bg-red-100 text-red-800 border-red-200',
      '높음': 'bg-orange-100 text-orange-800 border-orange-200',
      '보통': 'bg-blue-100 text-blue-800 border-blue-200',
      '낮음': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${styles[priority]}`}>
        {priority}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">오류를 찾을 수 없습니다</h3>
        <button onClick={() => navigate('/admin/errors')} className="btn-primary">
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/errors')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>목록으로 돌아가기</span>
        </button>
        
        <div className="flex items-center space-x-3">
          {error.user_email && (
            <button
              onClick={handleSendEmail}
              className="btn-secondary flex items-center space-x-2"
            >
              <Mail className="w-4 h-4" />
              <span>이메일 발송</span>
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center space-x-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>저장 중...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>저장</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 메인 컨텐츠 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 오류 정보 */}
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {error.error_title}
                </h1>
                <div className="flex items-center space-x-4">
                  {getStatusBadge(error.status)}
                  {getPriorityBadge(error.priority)}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">상세 설명</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {error.error_detail || '상세 설명이 없습니다.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 관리자 응답 */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">관리자 응답</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상태 변경
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="접수됨">접수됨</option>
                    <option value="수정완료">수정완료</option>
                    <option value="보류">보류</option>
                    <option value="수정불가">수정불가</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    우선순위
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="낮음">낮음</option>
                    <option value="보통">보통</option>
                    <option value="높음">높음</option>
                    <option value="긴급">긴급</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  답변 메시지
                </label>
                <textarea
                  name="admin_reply"
                  value={formData.admin_reply}
                  onChange={handleInputChange}
                  rows={6}
                  placeholder="사용자에게 전달할 답변을 작성하세요..."
                  className="input-field resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 사이드바 */}
        <div className="space-y-6">
          {/* 보고자 정보 */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">보고자 정보</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {error.user_name || '익명'}
                  </p>
                  <p className="text-sm text-gray-500">이름</p>
                </div>
              </div>
              
              {error.user_email && (
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {error.user_email}
                    </p>
                    <p className="text-sm text-gray-500">이메일</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(error.created_at).toLocaleString('ko-KR')}
                  </p>
                  <p className="text-sm text-gray-500">보고 시간</p>
                </div>
              </div>
            </div>
          </div>

          {/* 기술 정보 */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">기술 정보</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Monitor className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {error.project_name}
                  </p>
                  <p className="text-sm text-gray-500">프로젝트</p>
                </div>
              </div>
              
              {error.url && (
                <div className="flex items-start space-x-3">
                  <Globe className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 break-all">
                      {error.url}
                    </p>
                    <p className="text-sm text-gray-500">URL</p>
                  </div>
                </div>
              )}
              
              {error.user_agent && (
                <div className="flex items-start space-x-3">
                  <Monitor className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-700 break-all">
                      {error.user_agent}
                    </p>
                    <p className="text-sm text-gray-500">브라우저</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 브라우저 정보 */}
          {error.browser_info && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">브라우저 상세 정보</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium">플랫폼:</span>
                  <span>{error.browser_info.platform || 'N/A'}</span>
                  
                  <span className="font-medium">언어:</span>
                  <span>{error.browser_info.language || 'N/A'}</span>
                  
                  <span className="font-medium">해상도:</span>
                  <span>{error.browser_info.screenResolution || 'N/A'}</span>
                  
                  <span className="font-medium">타임존:</span>
                  <span>{error.browser_info.timezone || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDetail; 