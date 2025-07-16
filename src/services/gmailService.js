// Gmail SMTP를 통한 이메일 발송 서비스 (백엔드 API 사용)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * 백엔드 API를 통한 이메일 발송
 * @param {Object} errorData - 오류 데이터
 * @param {string} recipientEmail - 수신자 이메일
 * @returns {Promise} 발송 결과
 */
export const sendErrorNotificationViaGmail = async (errorData, recipientEmail = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: recipientEmail || 'admin@yourcompany.com',
        errorData: errorData
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        message: result.message,
        messageId: result.messageId
      };
    } else {
      return {
        success: false,
        message: result.message || '이메일 발송에 실패했습니다.'
      };
    }
  } catch (error) {
    console.error('Gmail 이메일 발송 오류:', error);
    return {
      success: false,
      message: '서버와의 연결에 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.',
      error: error.message
    };
  }
};

/**
 * 상태 변경 알림 이메일 발송 (Gmail)
 * @param {Object} errorData - 오류 데이터
 * @param {string} oldStatus - 이전 상태
 * @param {string} newStatus - 새 상태
 * @param {string} recipientEmail - 수신자 이메일
 * @returns {Promise} 발송 결과
 */
export const sendStatusUpdateNotificationViaGmail = async (errorData, oldStatus, newStatus, recipientEmail = null) => {
  try {
    const customHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4299e1;">📝 오류 상태 업데이트</h2>
        
        <div style="background: #ebf8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4299e1;">
          <h3 style="margin-top: 0; color: #2b6cb0;">상태 변경 알림</h3>
          <p><strong>오류 제목:</strong> ${errorData.error_title}</p>
          <p><strong>프로젝트:</strong> ${errorData.project_name}</p>
          <p><strong>이전 상태:</strong> <span style="color: #e53e3e;">${oldStatus}</span></p>
          <p><strong>현재 상태:</strong> <span style="color: #38a169;">${newStatus}</span></p>
          <p><strong>업데이트 시간:</strong> ${new Date().toLocaleString('ko-KR')}</p>
        </div>
        
              <div style="text-align: center; margin: 30px 0;">
        <a href="${import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173'}/admin/errors/${errorData.id}" 
           style="background: #4299e1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          오류 상세 보기
        </a>
      </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
        <p style="color: #718096; font-size: 14px; text-align: center;">
          이 이메일은 오류 관리 시스템에서 자동으로 발송되었습니다.
        </p>
      </div>
    `;

    const response = await fetch(`${API_BASE_URL}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: recipientEmail || errorData.user_email || 'admin@yourcompany.com',
        subject: `[상태 변경] ${errorData.project_name} - ${errorData.error_title}`,
        html: customHtml,
        errorData: errorData
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        message: '상태 변경 알림이 발송되었습니다.',
        messageId: result.messageId
      };
    } else {
      return {
        success: false,
        message: result.message || '상태 변경 알림 발송에 실패했습니다.'
      };
    }
  } catch (error) {
    console.error('Gmail 상태 변경 알림 발송 오류:', error);
    return {
      success: false,
      message: '서버와의 연결에 실패했습니다.',
      error: error.message
    };
  }
}; 