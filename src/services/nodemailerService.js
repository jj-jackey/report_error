// 참고용 - 백엔드에서 사용할 Nodemailer 구현
// 실제 사용하려면 백엔드 서버가 필요합니다

import nodemailer from 'nodemailer';

// Gmail SMTP 설정
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER, // 예: 'your-email@gmail.com'
      pass: process.env.GMAIL_APP_PASSWORD // Gmail 앱 비밀번호
    }
  });
};

// 오류 보고서 이메일 발송
export const sendErrorEmailViaNodmailer = async (errorData, recipientEmail) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: recipientEmail,
      subject: `[오류 보고] ${errorData.project_name} - ${errorData.error_title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e53e3e;">🚨 새로운 오류 보고서</h2>
          
          <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2d3748;">오류 정보</h3>
            <p><strong>제목:</strong> ${errorData.error_title}</p>
            <p><strong>프로젝트:</strong> ${errorData.project_name}</p>
            <p><strong>우선순위:</strong> ${errorData.priority}</p>
            <p><strong>상태:</strong> ${errorData.status}</p>
            <p><strong>신고자:</strong> ${errorData.user_name || '익명'}</p>
            <p><strong>보고 시간:</strong> ${new Date(errorData.created_at).toLocaleString('ko-KR')}</p>
          </div>
          
          <div style="background: #fed7d7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #c53030;">오류 설명</h3>
            <p style="white-space: pre-wrap;">${errorData.error_description}</p>
          </div>
          
          <div style="background: #e2e8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #4a5568;">기술 정보</h3>
            <p><strong>브라우저:</strong> ${errorData.browser_info}</p>
            <p><strong>페이지 URL:</strong> ${errorData.page_url}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:5173/admin/errors/${errorData.id}" 
               style="background: #4299e1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              오류 상세 보기
            </a>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
          <p style="color: #718096; font-size: 14px; text-align: center;">
            이 이메일은 오류 관리 시스템에서 자동으로 발송되었습니다.
          </p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      message: '이메일이 성공적으로 발송되었습니다.',
      messageId: result.messageId
    };
    
  } catch (error) {
    console.error('Nodemailer 이메일 발송 오류:', error);
    return {
      success: false,
      message: '이메일 발송 중 오류가 발생했습니다.',
      error: error.message
    };
  }
};

// Gmail 앱 비밀번호 설정 방법:
// 1. Google 계정 관리 → 보안
// 2. 2단계 인증 활성화
// 3. 앱 비밀번호 생성
// 4. 생성된 16자리 비밀번호를 GMAIL_APP_PASSWORD에 설정 