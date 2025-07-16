-- 오류 보고서 테이블 생성
CREATE TABLE error_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_name TEXT NOT NULL,
  error_title TEXT NOT NULL,
  error_detail TEXT,
  user_name TEXT,
  user_email TEXT,
  user_agent TEXT,
  url TEXT,
  browser_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT '접수됨' CHECK (status IN ('접수됨', '수정완료', '수정불가', '보류')),
  admin_reply TEXT,
  admin_email_sent BOOLEAN DEFAULT FALSE,
  admin_user_id UUID REFERENCES auth.users(id),
  priority TEXT DEFAULT '보통' CHECK (priority IN ('긴급', '높음', '보통', '낮음'))
);

-- 인덱스 생성
CREATE INDEX idx_error_reports_project_name ON error_reports(project_name);
CREATE INDEX idx_error_reports_status ON error_reports(status);
CREATE INDEX idx_error_reports_created_at ON error_reports(created_at);
CREATE INDEX idx_error_reports_priority ON error_reports(priority);

-- RLS (Row Level Security) 활성화
ALTER TABLE error_reports ENABLE ROW LEVEL SECURITY;

-- 정책 생성: 모든 사용자가 오류를 제출할 수 있음
CREATE POLICY "Anyone can insert error reports" ON error_reports
  FOR INSERT WITH CHECK (true);

-- 정책 생성: 인증된 사용자만 오류를 조회할 수 있음
CREATE POLICY "Authenticated users can view error reports" ON error_reports
  FOR SELECT USING (auth.role() = 'authenticated');

-- 정책 생성: 인증된 사용자만 오류를 업데이트할 수 있음
CREATE POLICY "Authenticated users can update error reports" ON error_reports
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 정책 생성: 인증된 사용자만 오류를 삭제할 수 있음
CREATE POLICY "Authenticated users can delete error reports" ON error_reports
  FOR DELETE USING (auth.role() = 'authenticated');

-- 업데이트 시간 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_error_reports_updated_at BEFORE UPDATE ON error_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 관리자 사용자 프로필 테이블 (선택사항)
CREATE TABLE admin_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 관리자 프로필 RLS
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON admin_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON admin_profiles
  FOR UPDATE USING (auth.uid() = id); 