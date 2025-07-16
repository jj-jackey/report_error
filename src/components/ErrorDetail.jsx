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
import { sendErrorNotification, sendStatusUpdateNotification } from '../services/emailService';
import { sendErrorNotificationViaGmail, sendStatusUpdateNotificationViaGmail } from '../services/gmailService';
import { sendEmailWithRateLimit, sendStatusUpdateWithRateLimit, sendAdminReplyWithRateLimit, getEmailStatus } from '../services/emailRateLimiter';
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
    
    // 상태 변경 확인
    const oldStatus = error.status;
    const newStatus = formData.status;
    const statusChanged = oldStatus !== newStatus;
    
    try {
      const result = await updateErrorReport(id, formData);
      if (result.success) {
        toast.success('오류 보고서가 업데이트되었습니다.');
        
        // 상태가 변경되었으면 이메일 알림 발송 (Rate Limiter 적용)
        if (statusChanged && error.user_email) {
          try {
            const emailResult = await sendStatusUpdateWithRateLimit(
              error, 
              oldStatus, 
              newStatus, 
              error.user_email
            );
            
            if (emailResult.success) {
              toast.success('상태 변경 알림이 큐에 추가되어 발송 예정입니다.');
              
              // 큐 상태 정보 표시
              const status = emailResult.status;
              if (status.queueLength > 1) {
                toast.info(`현재 큐에 ${status.queueLength}개의 이메일이 대기 중입니다.`);
              }
            }
          } catch (emailError) {
            console.warn('이메일 알림 발송 실패:', emailError);
            // 이메일 실패는 주요 기능에 영향을 주지 않도록 warning만 표시
          }
        }
        
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

  // 전체 보고서 이메일 발송 (주석처리)
  /*
  const handleSendEmail = async () => {
    // 이메일 주소 확인 (사용자 이메일 또는 기본 관리자 이메일)
    const recipientEmail = error.user_email || 'admin@yourcompany.com';
    
    try {
      // 로딩 토스트 표시
      const loadingToast = toast.loading('이메일을 큐에 추가하는 중...');
      
      // 이메일 발송 (Gmail SMTP + Rate Limiter 사용)
      const result = await sendEmailWithRateLimit(error, recipientEmail);
      
      // 로딩 토스트 제거
      toast.dismiss(loadingToast);
      
      if (result.success) {
        toast.success(`이메일이 큐에 추가되어 ${recipientEmail}으로 발송 예정입니다.`);
        
        // 큐 및 제한 상태 정보 표시
        const status = result.status;
        const statusMsg = `일일: ${status.dailyCount}/${status.dailyRemaining + status.dailyCount}, 시간: ${status.hourlyCount}/${status.hourlyRemaining + status.hourlyCount}`;
        
        if (status.queueLength > 1) {
          toast.info(`현재 큐에 ${status.queueLength}개의 이메일이 대기 중입니다. (${statusMsg})`);
        } else {
          toast.info(`Gmail 제한 현황: ${statusMsg}`);
        }
      } else {
        toast.error(result.message || '이메일 발송 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('이메일 발송 오류:', error);
      toast.error('이메일 발송 중 예상치 못한 오류가 발생했습니다.');
    }
  };
  */

  // 관리자 답변 발송
  const handleSendReply = async () => {
    if (!formData.admin_reply.trim()) {
      toast.error('답변을 작성해주세요.');
      return;
    }

    if (!error.user_email) {
      toast.error('보고자의 이메일 정보가 없습니다.');
      return;
    }

    try {
      // 로딩 토스트 표시
      const loadingToast = toast.loading('답변을 큐에 추가하는 중...');
      
      // 답변 이메일 발송 (Rate Limiter 적용)
      const result = await sendAdminReplyWithRateLimit(
        error, 
        formData.admin_reply, 
        error.user_email
      );
      
      // 로딩 토스트 제거
      toast.dismiss(loadingToast);
      
      if (result.success) {
        toast.success(`관리자 답변이 큐에 추가되어 ${error.user_email}으로 발송 예정입니다.`);
        
        // 큐 상태 정보 표시
        const status = result.status;
        if (status.queueLength > 1) {
          toast.info(`현재 큐에 ${status.queueLength}개의 이메일이 대기 중입니다.`);
        }
      } else {
        toast.error(result.message || '답변 발송 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('답변 발송 오류:', error);
      toast.error('답변 발송 중 예상치 못한 오류가 발생했습니다.');
    }
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
          {/* 전체 보고서 이메일 발송 버튼 (주석처리)
          {error.user_email && (
            <button
              onClick={handleSendEmail}
              className="btn-secondary flex items-center space-x-2"
            >
              <Mail className="w-4 h-4" />
              <span>이메일 발송</span>
            </button>
          )}
          */}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-3">관리자 응답</h3>
            
            <div className="space-y-3">
              {/* 상태 및 우선순위 섹션 */}
              <div className="bg-gray-50 p-3 rounded-lg border">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-gray-700 whitespace-nowrap">
                      상태 변경
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="form-select-compact"
                    >
                      <option value="접수됨">📝 접수됨</option>
                      <option value="수정완료">✅ 수정완료</option>
                      <option value="보류">⏸️ 보류</option>
                      <option value="수정불가">❌ 수정불가</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-gray-700 whitespace-nowrap">
                      우선순위
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="form-select-compact"
                    >
                      <option value="낮음">🟢 낮음</option>
                      <option value="보통">🟡 보통</option>
                      <option value="높음">🟠 높음</option>
                      <option value="긴급">🔴 긴급</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* 답변 메시지 섹션 */}
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                 <div className="flex items-center justify-between mb-2">
                   <label className="block text-xs font-medium text-blue-800">
                     📝 답변 메시지
                   </label>
                  {error.user_email && formData.admin_reply.trim() && (
                    <button
                      type="button"
                      onClick={handleSendReply}
                      className="btn-primary flex items-center space-x-2 text-sm px-3 py-1"
                    >
                      <Mail className="w-4 h-4" />
                      <span>답변 발송</span>
                    </button>
                  )}
                </div>
                <textarea
                  name="admin_reply"
                  value={formData.admin_reply}
                  onChange={handleInputChange}
                  rows={6}
                  placeholder="사용자에게 전달할 답변을 작성하세요..."
                  className="form-textarea border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                />
                {error.user_email && formData.admin_reply.trim() ? (
                  <div className="mt-3 p-2 bg-green-100 border border-green-200 rounded text-sm text-green-800">
                    💌 답변을 작성하셨습니다. 우측 "답변 발송" 버튼으로 <strong>{error.user_email}</strong>에게 전달하세요.
                  </div>
                ) : error.user_email ? (
                  <p className="text-sm text-blue-600 mt-2">
                    💡 답변을 작성하면 사용자에게 이메일로 전달할 수 있습니다.
                  </p>
                ) : (
                  <div className="mt-3 p-2 bg-yellow-100 border border-yellow-200 rounded text-sm text-yellow-800">
                    ⚠️ 보고자의 이메일 정보가 없어 답변을 전달할 수 없습니다.
                  </div>
                )}
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
                  <span>{error.browser_info.detailedPlatform || error.browser_info.platform || 'N/A'}</span>
                  
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