// ============================================================
// KEEP — Service Entry Point
//
// 여기서 사용할 서비스 구현체를 결정합니다.
// Mock → 실제 API 전환 시 import 한 줄만 바꾸면 됩니다.
//
//   현재: mockRequestService
//   교체: apiRequestService  (백엔드 구축 완료 후)
// ============================================================

export { mockRequestService as requestService } from './mockRequestService';

// API 전환 예시 (백엔드 준비 완료 시 위 줄을 아래 줄로 교체)
// export { apiRequestService as requestService } from './apiRequestService';
