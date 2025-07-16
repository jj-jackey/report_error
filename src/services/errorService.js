import { supabase } from '../lib/supabase';

// 오류 보고서 제출
export const submitErrorReport = async (errorData) => {
  try {
    const { data, error } = await supabase
      .from('error_reports')
      .insert([{
        project_name: errorData.projectName,
        error_title: errorData.errorTitle,
        error_detail: errorData.errorDetail,
        user_name: errorData.userName,
        user_email: errorData.userEmail,
        user_agent: errorData.userAgent,
        url: errorData.url,
        browser_info: errorData.browserInfo,
        status: '접수됨',
        priority: errorData.priority || '보통'
      }])
      .select();

    if (error) {
      throw error;
    }

    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error submitting report:', error);
    return { success: false, error: error.message };
  }
};

// 모든 오류 보고서 조회 (관리자용)
export const getErrorReports = async (filters = {}) => {
  try {
    let query = supabase
      .from('error_reports')
      .select('*')
      .order('created_at', { ascending: false });

    // 필터 적용
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.project) {
      query = query.eq('project_name', filters.project);
    }
    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching reports:', error);
    return { success: false, error: error.message };
  }
};

// 오류 보고서 상태 업데이트
export const updateErrorReport = async (id, updateData) => {
  try {
    const { data, error } = await supabase
      .from('error_reports')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }

    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error updating report:', error);
    return { success: false, error: error.message };
  }
};

// 오류 보고서 삭제
export const deleteErrorReport = async (id) => {
  try {
    const { error } = await supabase
      .from('error_reports')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting report:', error);
    return { success: false, error: error.message };
  }
};

// 프로젝트 목록 조회
export const getProjects = async () => {
  try {
    const { data, error } = await supabase
      .from('error_reports')
      .select('project_name')
      .distinct();

    if (error) {
      throw error;
    }

    return { success: true, data: data.map(item => item.project_name) };
  } catch (error) {
    console.error('Error fetching projects:', error);
    return { success: false, error: error.message };
  }
}; 