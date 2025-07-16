# 🐛 오류 보고 시스템 (Error Reporting System)

> 다양한 프로젝트에서 발생하는 오류를 중앙 집중식으로 관리하는 웹 애플리케이션

## ✨ 주요 기능

### 📝 오류 보고 기능
- **새 창 팝업**: 버튼 클릭 시 오류 보고 전용 창 열림
- **자동 정보 수집**: 브라우저 정보, URL, 시간 등 자동 수집
- **프로젝트 구분**: URL 파라미터를 통한 프로젝트별 구분
- **우선순위 설정**: 긴급, 높음, 보통, 낮음 4단계

### 🎛️ 관리자 대시보드
- **실시간 통계**: 오류 현황을 한눈에 파악
- **상태 관리**: 접수됨 → 수정완료/수정불가/보류
- **검색 & 필터**: 프로젝트별, 상태별, 우선순위별 필터링
- **상세 보기**: 오류 상세 정보 및 브라우저 환경 확인

### 🔐 보안 기능
- **Supabase Auth**: 관리자 전용 로그인 시스템
- **RLS 정책**: 데이터베이스 보안 정책 적용
- **익명 보고**: 로그인 없이 오류 보고 가능

### 📧 알림 기능 (예정)
- **이메일 발송**: 처리 결과 자동 알림
- **상태 변경 알림**: 실시간 상태 업데이트

## 🚀 빠른 시작

### 1. 프로젝트 설치

```bash
git clone <repository-url>
cd report_error
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 `.env`로 복사하고 Supabase 정보를 입력하세요:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabase 데이터베이스 설정

`database-schema.sql` 파일의 내용을 Supabase SQL 에디터에서 실행하세요.

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173`에 접속하세요.

## 📖 사용법

### 오류 보고하기

#### 방법 1: 직접 접속
```
http://localhost:5173/report?project=프로젝트명
```

#### 방법 2: SDK 사용 (권장)
다른 프로젝트에 아래 코드를 추가하세요:

```html
<!-- 자동 초기화 -->
<script src="http://localhost:5173/error-reporter-sdk.js" 
        data-auto-init="true" 
        data-project="주문서시스템">
</script>

<!-- 또는 수동 설정 -->
<script src="http://localhost:5173/error-reporter-sdk.js"></script>
<script>
  ErrorReporter.init({
    projectName: '고객관리시스템',
    showButton: true,
    buttonOptions: {
      text: '버그 신고',
      position: 'bottom-right'
    }
  });
</script>
```

### 관리자 대시보드

1. `/admin` 경로로 접속
2. Supabase에서 생성한 관리자 계정으로 로그인
3. 오류 목록 확인 및 상태 변경

## 🏗️ 기술 스택

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Routing**: React Router DOM

## 📁 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── ErrorReportForm.jsx    # 오류 보고 폼
│   ├── AdminDashboard.jsx     # 관리자 대시보드
│   ├── Login.jsx              # 로그인 페이지
│   ├── Dashboard.jsx          # 대시보드 메인
│   ├── ErrorList.jsx          # 오류 목록
│   └── ErrorDetail.jsx        # 오류 상세보기
├── services/            # API 서비스
│   └── errorService.js        # 오류 관련 API
├── utils/              # 유틸리티
│   └── browserInfo.js         # 브라우저 정보 수집
├── lib/                # 라이브러리 설정
│   └── supabase.js            # Supabase 클라이언트
└── App.jsx             # 메인 앱 컴포넌트

public/
└── error-reporter-sdk.js      # 다른 프로젝트용 SDK
```

## 🗄️ 데이터베이스 스키마

### error_reports 테이블

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | UUID | 고유 ID |
| project_name | TEXT | 프로젝트명 |
| error_title | TEXT | 오류 제목 |
| error_detail | TEXT | 상세 설명 |
| user_name | TEXT | 사용자 이름 |
| user_email | TEXT | 사용자 이메일 |
| user_agent | TEXT | 브라우저 정보 |
| url | TEXT | 오류 발생 URL |
| browser_info | JSONB | 상세 브라우저 정보 |
| status | TEXT | 처리 상태 |
| priority | TEXT | 우선순위 |
| admin_reply | TEXT | 관리자 답변 |
| created_at | TIMESTAMP | 생성 시간 |
| updated_at | TIMESTAMP | 수정 시간 |

## 🚀 배포 가이드

### Render 배포

1. **GitHub에 코드 푸시**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo>
git push -u origin main
```

2. **Render에서 Static Site 생성**
   - GitHub 계정으로 Render 로그인
   - "New Static Site" 선택
   - GitHub 리포지토리 연결
   - Build 설정:
     - Build Command: `npm run build`
     - Publish Directory: `dist`

3. **환경 변수 설정**
   - Render 대시보드에서 Environment Variables 추가:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

4. **자동 배포 활성화**
   - main 브랜치 푸시 시 자동 재배포 설정

### Vercel 배포 (대안)

```bash
npm install -g vercel
vercel
```

## 🔧 환경 설정

### Supabase 프로젝트 생성

1. [Supabase](https://supabase.com) 계정 생성
2. 새 프로젝트 생성
3. SQL 에디터에서 `database-schema.sql` 실행
4. Authentication > Settings에서 사용자 추가

### 관리자 계정 생성

Supabase 대시보드에서:
1. Authentication > Users
2. "Add User" 클릭
3. 이메일/비밀번호 입력

## 📝 라이센스

MIT License - 자유롭게 사용, 수정, 배포 가능합니다.

## 🤝 기여하기

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 지원

문제가 있거나 질문이 있으시면 이슈를 생성해주세요.

---

**Made with ❤️ by Your Team**
