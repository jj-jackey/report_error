// Express 백엔드 서버 - 이메일 발송 API
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 미들웨어
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// Gmail SMTP 설정
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'jkj0601test@gmail.com',
    pass: process.env.EMAIL_PASS || 'tdbgwrrmgbdtacxm'
  }
});

// 이메일 발송 API
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html, errorData } = req.body;

    const mailOptions = {
      from: 'jkj0601test@gmail.com',
      to: to || 'admin@yourcompany.com',
      subject: subject || `[오류 보고] ${errorData.project_name} - ${errorData.error_title}`,
      html: html || `
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
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
          <p style="color: #718096; font-size: 14px; text-align: center;">
            이 이메일은 오류 관리 시스템에서 자동으로 발송되었습니다.
          </p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    
    res.json({
      success: true,
      message: '이메일이 성공적으로 발송되었습니다.',
      messageId: result.messageId
    });
    
  } catch (error) {
    console.error('이메일 발송 오류:', error);
    res.status(500).json({
      success: false,
      message: '이메일 발송 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 서버 시작
const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';  // Render 배포용

app.listen(PORT, HOST, () => {
  console.log(`이메일 서버가 ${HOST}:${PORT}에서 실행 중입니다.`);
});

module.exports = app; 