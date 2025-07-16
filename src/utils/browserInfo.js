// 더 정확한 플랫폼 정보 감지
const getDetailedPlatform = () => {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  
  // 64비트 Windows 감지
  if (platform === 'Win32') {
    if (userAgent.includes('WOW64') || userAgent.includes('Win64') || userAgent.includes('x64')) {
      return 'Windows 64-bit';
    }
    return 'Windows 32-bit';
  }
  
  // macOS 감지
  if (platform.includes('Mac')) {
    if (userAgent.includes('Intel') || userAgent.includes('x86_64')) {
      return 'macOS Intel';
    } else if (userAgent.includes('ARM') || userAgent.includes('Apple Silicon')) {
      return 'macOS Apple Silicon';
    }
    return 'macOS';
  }
  
  // Linux 감지
  if (platform.includes('Linux')) {
    if (userAgent.includes('x86_64')) {
      return 'Linux 64-bit';
    } else if (userAgent.includes('i686')) {
      return 'Linux 32-bit';
    }
    return 'Linux';
  }
  
  return platform;
};

// 브라우저 정보 수집 유틸리티
export const getBrowserInfo = () => {
  const navigator = window.navigator;
  const screen = window.screen;
  
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform, // 원본 값 유지
    detailedPlatform: getDetailedPlatform(), // 더 정확한 플랫폼 정보
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