# 오류 보고 시스템 - 이메일 백엔드 서버

## 🚀 빠른 시작

### 1. 패키지 설치
```bash
cd backend
npm install
```

### 2. 서버 실행
```bash
# 개발 모드 (자동 재시작)
npm run dev

# 프로덕션 모드
npm start
```

### 3. 서버 확인
- 서버 주소: `http://localhost:3001`
- 이메일 API: `POST http://localhost:3001/api/send-email`

## 📧 Gmail 설정

현재 서버는 다음 Gmail 계정으로 설정되어 있습니다:
- **Gmail 계정**: `jkj0601test@gmail.com`
- **앱 비밀번호**: `tdbgwrrmgbdtacxm`

### Gmail 앱 비밀번호 설정 방법 (참고)
1. [Google 계정 관리](https://myaccount.google.com) → **보안**
2. **2단계 인증** 활성화 (필수)
3. **앱 비밀번호** 생성
4. 생성된 16자리 비밀번호를 `server.js`에 설정

## 🔧 API 사용법

### 이메일 발송 API
```javascript
POST /api/send-email
Content-Type: application/json

{
  "to": "recipient@example.com",
  "subject": "[오류 보고] 프로젝트명 - 오류 제목",
  "errorData": {
    "error_title": "오류 제목",
    "project_name": "프로젝트명",
    "priority": "긴급",
    "status": "접수됨",
    "user_name": "신고자",
    "error_description": "오류 설명",
    "browser_info": "브라우저 정보",
    "page_url": "페이지 URL",
    "created_at": "2025-01-16T10:00:00Z",
    "id": "error_id"
  }
}
```

### 응답 예시
```json
{
  "success": true,
  "message": "이메일이 성공적으로 발송되었습니다.",
  "messageId": "<unique_message_id>"
}
```

## 🛠️ 문제 해결

### 서버 실행 실패
- Node.js 버전 확인 (14 이상 권장)
- 포트 3001 사용 여부 확인

### 이메일 발송 실패
- Gmail 계정 및 앱 비밀번호 확인
- Gmail 2단계 인증 활성화 여부 확인
- 방화벽 및 네트워크 설정 확인

### CORS 오류
- 프론트엔드 주소가 `http://localhost:5173`인지 확인
- 필요시 `server.js`의 CORS 설정 수정

## 📋 로그 확인

서버 실행 시 다음과 같은 로그가 표시됩니다:
```
이메일 서버가 포트 3001에서 실행 중입니다.
```

이메일 발송 시:
```
이메일 발송 성공: <message_id>
```

## 🔒 보안 사항

- **중요**: 실제 운영 환경에서는 환경 변수를 사용하세요
- Gmail 계정 정보를 코드에 직접 포함하지 마세요
- `.env` 파일을 사용하여 민감한 정보를 관리하세요

### 환경 변수 사용 (권장)
```bash
# .env 파일 생성
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_app_password
PORT=3001
``` 