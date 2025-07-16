import emailjs from '@emailjs/browser';

// EmailJS 설정 (환경 변수 또는 직접 설정)
const emailConfig = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'your_service_id',
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'your_template_id',
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'your_public_key'
};

// EmailJS 초기화
emailjs.init(emailConfig.publicKey);

/**
 * 오류 보고서 이메일 발송
 * @param {Object} errorData - 오류 데이터
 * @param {string} recipientEmail - 수신자 이메일
 * @returns {Promise} 발송 결과
 */
export const sendErrorNotification = async (errorData, recipientEmail = null) => {
  try {
    const templateParams = {
      to_email: recipientEmail || 'admin@yourcompany.com',
      error_title: errorData.error_title,
      error_description: errorData.error_description,
      project_name: errorData.project_name,
      user_name: errorData.user_name || '익명',
      priority: errorData.priority,
      status: errorData.status,
      browser_info: errorData.browser_info,
      page_url: errorData.page_url,
      created_at: new Date(errorData.created_at).toLocaleString('ko-KR'),
      error_id: errorData.id
    };

    const result = await emailjs.send(
      emailConfig.serviceId,
      emailConfig.templateId,
      templateParams
    );

    return {
      success: true,
      message: '이메일이 성공적으로 발송되었습니다.',
      result
    };
  } catch (error) {
    console.error('이메일 발송 오류:', error);
    return {
      success: false,
      message: '이메일 발송 중 오류가 발생했습니다.',
      error
    };
  }
};

/**
 * 상태 변경 알림 이메일 발송
 * @param {Object} errorData - 오류 데이터
 * @param {string} oldStatus - 이전 상태
 * @param {string} newStatus - 새 상태
 * @param {string} recipientEmail - 수신자 이메일
 * @returns {Promise} 발송 결과
 */
export const sendStatusUpdateNotification = async (errorData, oldStatus, newStatus, recipientEmail = null) => {
  try {
    const templateParams = {
      to_email: recipientEmail || errorData.user_email || 'admin@yourcompany.com',
      error_title: errorData.error_title,
      project_name: errorData.project_name,
      old_status: oldStatus,
      new_status: newStatus,
      error_id: errorData.id,
      update_time: new Date().toLocaleString('ko-KR')
    };

    const result = await emailjs.send(
      emailConfig.serviceId,
      'template_status_update', // 상태 업데이트용 별도 템플릿
      templateParams
    );

    return {
      success: true,
      message: '상태 변경 알림이 발송되었습니다.',
      result
    };
  } catch (error) {
    console.error('상태 변경 알림 발송 오류:', error);
    return {
      success: false,
      message: '상태 변경 알림 발송 중 오류가 발생했습니다.',
      error
    };
  }
};

/**
 * 커스텀 이메일 발송
 * @param {Object} emailData - 이메일 데이터
 * @returns {Promise} 발송 결과
 */
export const sendCustomEmail = async (emailData) => {
  try {
    const result = await emailjs.send(
      emailConfig.serviceId,
      emailConfig.templateId,
      emailData
    );

    return {
      success: true,
      message: '이메일이 성공적으로 발송되었습니다.',
      result
    };
  } catch (error) {
    console.error('커스텀 이메일 발송 오류:', error);
    return {
      success: false,
      message: '이메일 발송 중 오류가 발생했습니다.',
      error
    };
  }
}; 