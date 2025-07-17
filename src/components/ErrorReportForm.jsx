import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, Send, X, CheckCircle } from 'lucide-react';
import { submitErrorReport } from '../services/errorService';
import { getErrorContext } from '../utils/browserInfo';
import toast, { Toaster } from 'react-hot-toast';

const ErrorReportForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    errorTitle: '',
    errorDetail: '',
    userName: '',
    userEmail: '',
    priority: '보통'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [context, setContext] = useState(null);

  useEffect(() => {
    // 잘못된 URL 형태 자동 수정
    const currentPath = location.pathname;
    if (currentPath.includes('/report/project=')) {
      const project = currentPath.split('project=')[1];
      if (project) {
        navigate(`/report?project=${decodeURIComponent(project)}`, { replace: true });
        return;
      }
    }

    // 컴포넌트 마운트시 브라우저 정보 수집
    const errorContext = getErrorContext();
    setContext(errorContext);
  }, [location, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.errorTitle.trim()) {
      toast.error('오류 제목을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const errorData = {
        ...formData,
        projectName: context.projectName,
        userAgent: context.browserInfo.userAgent,
        url: context.browserInfo.url,
        browserInfo: context.browserInfo
      };

      const result = await submitErrorReport(errorData);

      if (result.success) {
        setIsSubmitted(true);
        toast.success('오류 보고서가 성공적으로 제출되었습니다!');
        // 3초 후 창 닫기
        setTimeout(() => {
          window.close();
        }, 3000);
      } else {
        toast.error('오류 보고서 제출에 실패했습니다: ' + result.error);
      }
    } catch (error) {
      toast.error('오류가 발생했습니다: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (window.confirm('작성 중인 내용이 사라집니다. 정말 닫으시겠습니까?')) {
      window.close();
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">제출 완료!</h2>
          <p className="text-gray-600 mb-4">
            오류 보고서가 성공적으로 제출되었습니다.<br />
            관리자가 검토 후 답변드리겠습니다.
          </p>
          <p className="text-sm text-gray-500">
            이 창은 자동으로 닫힙니다...
          </p>
        </div>
        <Toaster position="top-center" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  오류 보고서
                  {context?.projectName && (
                    <span className="text-lg font-normal text-gray-600 ml-2">
                      ({context.projectName})
                    </span>
                  )}
                </h1>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* 자동 수집된 정보 */}
          {context && (
            <div className="bg-gray-50 rounded-lg p-4 text-sm">
              <h3 className="font-medium text-gray-700 mb-3">자동 수집된 정보</h3>
              <div className="space-y-2 text-gray-600">
                <div>
                  <span className="font-medium text-gray-700">URL:</span>
                  <div className="mt-1 p-2 bg-white border rounded text-xs break-all font-mono">
                    {context.browserInfo.url}
                  </div>
                </div>
                <p><span className="font-medium">브라우저:</span> {context.browserInfo.userAgent.split(' ')[0]}</p>
                <p><span className="font-medium">시간:</span> {new Date(context.timestamp).toLocaleString('ko-KR')}</p>
              </div>
            </div>
          )}
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="card">
          <div className="space-y-6">
            {/* 오류 정보 섹션 */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h3 className="text-sm font-medium text-red-800 mb-4">🚨 오류 정보</h3>
              <div className="space-y-4">
                {/* 오류 제목 + 우선순위 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="errorTitle" className="block text-sm font-medium text-gray-700">
                      오류 제목 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <label htmlFor="priority" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                        우선순위
                      </label>
                      <select
                        id="priority"
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
                  <input
                    type="text"
                    id="errorTitle"
                    name="errorTitle"
                    value={formData.errorTitle}
                    onChange={handleInputChange}
                    placeholder="예: 주문서 저장 시 오류 발생"
                    className="form-input"
                    required
                  />
                </div>

                {/* 상세 설명 */}
                <div>
                  <label htmlFor="errorDetail" className="block text-sm font-medium text-gray-700 mb-2">
                    상세 설명
                  </label>
                  <textarea
                    id="errorDetail"
                    name="errorDetail"
                    value={formData.errorDetail}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="오류가 발생한 상황을 자세히 설명해주세요..."
                    className="form-textarea"
                  />
                </div>
              </div>
            </div>

            {/* 사용자 정보 */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-blue-800 mb-3">👤 연락처 정보 (선택사항)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
                    이름
                  </label>
                  <input
                    type="text"
                    id="userName"
                    name="userName"
                    value={formData.userName}
                    onChange={handleInputChange}
                    placeholder="홍길동"
                    className="form-input"
                  />
                </div>
                <div>
                  <label htmlFor="userEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    이메일 (답변 받기)
                  </label>
                  <input
                    type="email"
                    id="userEmail"
                    name="userEmail"
                    value={formData.userEmail}
                    onChange={handleInputChange}
                    placeholder="example@email.com"
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* 제출 버튼 */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>제출 중...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>오류 보고서 제출</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
      
      <Toaster position="top-center" />
    </div>
  );
};

export default ErrorReportForm; 