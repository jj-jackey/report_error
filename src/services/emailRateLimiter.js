// Gmail SMTP 제한 대응 - 이메일 발송 속도 제어

class EmailRateLimiter {
  constructor() {
    this.dailyCount = 0;
    this.hourlyCount = 0;
    this.lastReset = new Date().setHours(0, 0, 0, 0);
    this.lastHourReset = new Date().setMinutes(0, 0, 0);
    this.queue = [];
    this.isProcessing = false;
    
    // 제한 설정 (안전 마진 포함)
    this.DAILY_LIMIT = 400;    // Gmail 500개 중 400개만 사용
    this.HOURLY_LIMIT = 80;    // 시간당 80개 (안전 마진)
    this.DELAY_BETWEEN_EMAILS = 3000; // 3초 간격
  }

  // 현재 제한 상태 확인
  checkLimits() {
    const now = new Date();
    const today = now.setHours(0, 0, 0, 0);
    const currentHour = now.setMinutes(0, 0, 0);

    // 일일 리셋
    if (today > this.lastReset) {
      this.dailyCount = 0;
      this.lastReset = today;
    }

    // 시간별 리셋
    if (currentHour > this.lastHourReset) {
      this.hourlyCount = 0;
      this.lastHourReset = currentHour;
    }

    return {
      canSend: this.dailyCount < this.DAILY_LIMIT && this.hourlyCount < this.HOURLY_LIMIT,
      dailyRemaining: this.DAILY_LIMIT - this.dailyCount,
      hourlyRemaining: this.HOURLY_LIMIT - this.hourlyCount,
      dailyCount: this.dailyCount,
      hourlyCount: this.hourlyCount
    };
  }

  // 이메일 발송 큐에 추가
  async queueEmail(emailData) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        emailData,
        resolve,
        reject,
        timestamp: Date.now()
      });

      // 큐 처리 시작
      this.processQueue();
    });
  }

  // 큐 처리
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const limits = this.checkLimits();
      
      if (!limits.canSend) {
        // 제한 도달 시 대기
        const waitTime = this.calculateWaitTime();
        console.log(`Gmail 제한 도달. ${waitTime/1000}초 후 재시도...`);
        await this.sleep(waitTime);
        continue;
      }

      const emailTask = this.queue.shift();
      
      try {
        // 실제 이메일 발송 (백엔드 API 호출)
        const result = await this.sendEmailToBackend(emailTask.emailData);
        
        // 성공 시 카운터 증가
        this.dailyCount++;
        this.hourlyCount++;
        
        emailTask.resolve(result);
        
        console.log(`이메일 발송 완료. 일일: ${this.dailyCount}/${this.DAILY_LIMIT}, 시간: ${this.hourlyCount}/${this.HOURLY_LIMIT}`);
        
      } catch (error) {
        emailTask.reject(error);
      }

      // 다음 이메일까지 대기
      if (this.queue.length > 0) {
        await this.sleep(this.DELAY_BETWEEN_EMAILS);
      }
    }

    this.isProcessing = false;
  }

  // 백엔드 API 호출
  async sendEmailToBackend(emailData) {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    const response = await fetch(`${API_BASE_URL}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      throw new Error(`이메일 발송 실패: ${response.statusText}`);
    }

    return await response.json();
  }

  // 대기 시간 계산
  calculateWaitTime() {
    const now = new Date();
    
    // 시간당 제한에 걸린 경우 - 다음 시간까지 대기
    if (this.hourlyCount >= this.HOURLY_LIMIT) {
      const nextHour = new Date(now);
      nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
      return nextHour.getTime() - now.getTime();
    }
    
    // 일일 제한에 걸린 경우 - 다음 날까지 대기
    if (this.dailyCount >= this.DAILY_LIMIT) {
      const nextDay = new Date(now);
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(0, 0, 0, 0);
      return nextDay.getTime() - now.getTime();
    }

    return 0;
  }

  // 지연 함수
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 현재 상태 조회
  getStatus() {
    const limits = this.checkLimits();
    return {
      ...limits,
      queueLength: this.queue.length,
      isProcessing: this.isProcessing,
      nextResetTime: {
        daily: new Date(this.lastReset + 24 * 60 * 60 * 1000),
        hourly: new Date(this.lastHourReset + 60 * 60 * 1000)
      }
    };
  }
}

// 싱글톤 인스턴스
const emailRateLimiter = new EmailRateLimiter();

// 이메일 발송 함수 (제한 적용)
export const sendEmailWithRateLimit = async (errorData, recipientEmail = null, emailType = 'error-report') => {
  try {
    const emailPayload = {
      to: recipientEmail || 'admin@yourcompany.com',
      errorData: errorData,
      emailType: emailType
    };

    const result = await emailRateLimiter.queueEmail(emailPayload);
    
    return {
      success: true,
      message: '이메일이 큐에 추가되어 발송 예정입니다.',
      result,
      status: emailRateLimiter.getStatus()
    };
    
  } catch (error) {
    console.error('이메일 큐 추가 실패:', error);
    return {
      success: false,
      message: '이메일 발송 큐 추가에 실패했습니다.',
      error: error.message
    };
  }
};

// 상태 업데이트 알림 발송 (제한 적용)
export const sendStatusUpdateWithRateLimit = async (errorData, oldStatus, newStatus, recipientEmail = null) => {
  try {
    const emailPayload = {
      to: recipientEmail || errorData.user_email || 'admin@yourcompany.com',
      subject: `[상태 변경] ${errorData.project_name} - ${errorData.error_title}`,
      html: generateStatusUpdateHtml(errorData, oldStatus, newStatus),
      errorData: errorData,
      emailType: 'status-update'
    };

    const result = await emailRateLimiter.queueEmail(emailPayload);
    
    return {
      success: true,
      message: '상태 변경 알림이 큐에 추가되어 발송 예정입니다.',
      result,
      status: emailRateLimiter.getStatus()
    };
    
  } catch (error) {
    console.error('상태 변경 알림 큐 추가 실패:', error);
    return {
      success: false,
      message: '상태 변경 알림 발송 큐 추가에 실패했습니다.',
      error: error.message
    };
  }
};

// 관리자 답변 발송 (제한 적용)
export const sendAdminReplyWithRateLimit = async (errorData, adminReply, recipientEmail = null) => {
  try {
    const emailPayload = {
      to: recipientEmail || errorData.user_email || 'admin@yourcompany.com',
      subject: `[답변] ${errorData.project_name} - ${errorData.error_title}`,
      html: generateAdminReplyHtml(errorData, adminReply),
      errorData: errorData,
      emailType: 'admin-reply'
    };

    const result = await emailRateLimiter.queueEmail(emailPayload);
    
    return {
      success: true,
      message: '관리자 답변이 큐에 추가되어 발송 예정입니다.',
      result,
      status: emailRateLimiter.getStatus()
    };
    
  } catch (error) {
    console.error('관리자 답변 큐 추가 실패:', error);
    return {
      success: false,
      message: '관리자 답변 발송 큐 추가에 실패했습니다.',
      error: error.message
    };
  }
};

// 상태 업데이트 HTML 생성
function generateStatusUpdateHtml(errorData, oldStatus, newStatus) {
  return `
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
}

// 관리자 답변 HTML 생성
function generateAdminReplyHtml(errorData, adminReply) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #38a169;">✅ 관리자 답변</h2>
      
      <div style="background: #f0fff4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #38a169;">
        <h3 style="margin-top: 0; color: #2f855a;">귀하의 오류 보고에 대한 답변입니다</h3>
        <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p style="white-space: pre-wrap; margin: 0; color: #2d3748; line-height: 1.6;">${adminReply}</p>
        </div>
      </div>
      
      <div style="background: #ebf8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4299e1;">
        <h3 style="margin-top: 0; color: #2b6cb0;">관련 오류 정보</h3>
        <p><strong>오류 제목:</strong> ${errorData.error_title}</p>
        <p><strong>프로젝트:</strong> ${errorData.project_name}</p>
        <p><strong>현재 상태:</strong> <span style="color: #38a169;">${errorData.status}</span></p>
        <p><strong>우선순위:</strong> ${errorData.priority}</p>
        <p><strong>답변 시간:</strong> ${new Date().toLocaleString('ko-KR')}</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173'}/admin/errors/${errorData.id}" 
           style="background: #4299e1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          오류 상세 보기
        </a>
      </div>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
      <p style="color: #718096; font-size: 14px; text-align: center;">
        이 이메일은 오류 관리 시스템에서 자동으로 발송되었습니다.<br>
        추가 문의사항이 있으시면 이 이메일에 답장해 주세요.
      </p>
    </div>
  `;
}

// 이메일 발송 상태 조회
export const getEmailStatus = () => {
  return emailRateLimiter.getStatus();
};

export default emailRateLimiter; 