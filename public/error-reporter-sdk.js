/**
 * Error Reporter SDK
 * 다른 프로젝트에서 오류 보고 시스템을 쉽게 사용할 수 있는 SDK
 */
(function() {
  'use strict';

  // 설정
  const CONFIG = {
    // 오류 보고 시스템 URL (실제 배포 후 변경 필요)
    reportUrl: 'http://localhost:5173/report',
    // 자동으로 수집할 정보
    autoCollect: {
      browserInfo: true,
      userAgent: true,
      url: true,
      timestamp: true,
      errors: false // JavaScript 오류 자동 수집 여부
    }
  };

  // 브라우저 정보 수집
  function getBrowserInfo() {
    const nav = navigator;
    const screen = window.screen;
    
    return {
      userAgent: nav.userAgent,
      platform: nav.platform,
      language: nav.language,
      cookieEnabled: nav.cookieEnabled,
      onLine: nav.onLine,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      referrer: document.referrer
    };
  }

  // 오류 보고 창 열기
  function openErrorReport(options = {}) {
    // 기본 옵션 설정
    const defaultOptions = {
      project: 'Unknown Project',
      width: 800,
      height: 700,
      ...options
    };

    // URL 파라미터 구성
    const params = new URLSearchParams({
      project: defaultOptions.project
    });

    // 새 창 옵션
    const windowFeatures = [
      `width=${defaultOptions.width}`,
      `height=${defaultOptions.height}`,
      'scrollbars=yes',
      'resizable=yes',
      'menubar=no',
      'toolbar=no',
      'location=no',
      'status=no'
    ].join(',');

    // 새 창에서 오류 보고 폼 열기
    const reportWindow = window.open(
      `${CONFIG.reportUrl}?${params.toString()}`,
      'ErrorReport',
      windowFeatures
    );

    // 창이 열렸는지 확인
    if (!reportWindow) {
      alert('팝업이 차단되었습니다. 팝업을 허용하고 다시 시도해주세요.');
      return false;
    }

    return reportWindow;
  }

  // 버튼 생성 및 추가
  function createErrorReportButton(options = {}) {
    const defaultOptions = {
      text: '오류 신고',
      position: 'bottom-right',
      style: {
        backgroundColor: '#ef4444',
        color: 'white',
        padding: '12px 16px',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: '9999',
        position: 'fixed'
      },
      ...options
    };

    // 버튼 요소 생성
    const button = document.createElement('button');
    button.textContent = defaultOptions.text;
    button.id = 'error-report-btn';

    // 스타일 적용
    Object.assign(button.style, defaultOptions.style);

    // 위치 설정
    switch (defaultOptions.position) {
      case 'bottom-right':
        button.style.bottom = '20px';
        button.style.right = '20px';
        break;
      case 'bottom-left':
        button.style.bottom = '20px';
        button.style.left = '20px';
        break;
      case 'top-right':
        button.style.top = '20px';
        button.style.right = '20px';
        break;
      case 'top-left':
        button.style.top = '20px';
        button.style.left = '20px';
        break;
    }

    // 클릭 이벤트
    button.addEventListener('click', function() {
      openErrorReport({
        project: defaultOptions.project || document.title || 'Unknown Project'
      });
    });

    // 호버 효과
    button.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.05)';
      this.style.transition = 'transform 0.2s ease';
    });

    button.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1)';
    });

    // DOM에 추가
    document.body.appendChild(button);

    return button;
  }

  // JavaScript 오류 자동 수집 (옵션)
  function setupAutoErrorCollection(projectName) {
    window.addEventListener('error', function(event) {
      console.log('JavaScript 오류 감지:', event.error);
      
      // 자동으로 오류 보고 창 열기 여부를 사용자가 선택할 수 있도록
      if (confirm('JavaScript 오류가 발생했습니다. 오류를 신고하시겠습니까?')) {
        openErrorReport({
          project: projectName,
          autoFill: {
            title: `JavaScript 오류: ${event.error?.name || 'Unknown Error'}`,
            detail: `파일: ${event.filename}\n라인: ${event.lineno}\n오류: ${event.error?.message || event.message}`
          }
        });
      }
    });

    window.addEventListener('unhandledrejection', function(event) {
      console.log('Promise 거부 감지:', event.reason);
      
      if (confirm('비동기 오류가 발생했습니다. 오류를 신고하시겠습니까?')) {
        openErrorReport({
          project: projectName,
          autoFill: {
            title: 'Promise Rejection 오류',
            detail: `오류: ${event.reason}`
          }
        });
      }
    });
  }

  // 공개 API
  window.ErrorReporter = {
    // 설정 변경
    config: function(newConfig) {
      Object.assign(CONFIG, newConfig);
    },

    // 오류 보고 창 열기
    report: openErrorReport,

    // 오류 보고 버튼 생성
    createButton: createErrorReportButton,

    // 자동 오류 수집 설정
    setupAutoCollection: setupAutoErrorCollection,

    // 브라우저 정보 가져오기
    getBrowserInfo: getBrowserInfo,

    // 유틸리티: 이 스크립트가 포함된 페이지에서 빠르게 초기화
    init: function(options = {}) {
      const defaultOptions = {
        projectName: document.title || 'Unknown Project',
        showButton: true,
        autoCollectErrors: false,
        buttonOptions: {},
        ...options
      };

      // 설정 업데이트
      if (options.config) {
        this.config(options.config);
      }

      // 버튼 생성
      if (defaultOptions.showButton) {
        this.createButton({
          project: defaultOptions.projectName,
          ...defaultOptions.buttonOptions
        });
      }

      // 자동 오류 수집
      if (defaultOptions.autoCollectErrors) {
        this.setupAutoCollection(defaultOptions.projectName);
      }

      console.log('🐛 Error Reporter SDK 초기화됨:', defaultOptions.projectName);
    }
  };

  // 스크립트 로드 완료 후 자동 초기화 (data-auto-init="true"인 경우)
  document.addEventListener('DOMContentLoaded', function() {
    const scripts = document.querySelectorAll('script[src*="error-reporter-sdk"]');
    const currentScript = scripts[scripts.length - 1];
    
    if (currentScript && currentScript.dataset.autoInit === 'true') {
      const projectName = currentScript.dataset.project || document.title || 'Unknown Project';
      const showButton = currentScript.dataset.showButton !== 'false';
      const autoCollectErrors = currentScript.dataset.autoCollectErrors === 'true';
      
      window.ErrorReporter.init({
        projectName: projectName,
        showButton: showButton,
        autoCollectErrors: autoCollectErrors
      });
    }
  });

})();

/*
사용법:

1. 기본 사용법:
<script src="error-reporter-sdk.js" data-auto-init="true" data-project="내 프로젝트"></script>

2. 수동 설정:
<script src="error-reporter-sdk.js"></script>
<script>
  ErrorReporter.init({
    projectName: '주문서 시스템',
    showButton: true,
    autoCollectErrors: false,
    buttonOptions: {
      text: '버그 신고',
      position: 'bottom-left'
    }
  });
</script>

3. 프로그래밍 방식:
<script>
  // 오류 보고 창 직접 열기
  ErrorReporter.report({ project: '고객관리 시스템' });
  
  // 커스텀 버튼 생성
  ErrorReporter.createButton({
    text: '문제 신고',
    project: '재고관리 시스템',
    position: 'top-right'
  });
</script>
*/ 