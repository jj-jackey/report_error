// 브라우저 정보 수집 유틸리티
export const getBrowserInfo = () => {
  const navigator = window.navigator;
  const screen = window.screen;
  
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    screenResolution: `${screen.width}x${screen.height}`,
    colorDepth: screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    referrer: document.referrer
  };
};

// 프로젝트 이름을 URL 파라미터에서 추출
export const getProjectName = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('project') || '알 수 없음';
};

// 오류 컨텍스트 정보 수집
export const getErrorContext = () => {
  return {
    browserInfo: getBrowserInfo(),
    projectName: getProjectName(),
    timestamp: new Date().toISOString()
  };
}; 