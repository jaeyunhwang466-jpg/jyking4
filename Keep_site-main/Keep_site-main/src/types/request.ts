// ============================================================
// KEEP — 공통 데이터 타입 정의 (Request Layer)
//
// ⚠️ 백엔드 구조: 요청 1개 = 상품 1개
//    UI에서 여러 상품을 태깅해도 각 상품별로 개별 요청 생성
// ============================================================

export type FittingStatus = 'pending' | 'assigned' | 'completed';

// --------------------------------------------------------------
// UI 레이어 타입 — 고객 화면에서 태깅 시 사용
// --------------------------------------------------------------

/** NFC 태깅 시 선택된 단일 상품 (UI 내부 상태용) */
export interface TaggedProduct {
  productId: string;
  productName: string;
  color: string;
  size: string;
}

// --------------------------------------------------------------
// API 레이어 타입 — 백엔드 연동 기준 (요청 1개 = 상품 1개)
// --------------------------------------------------------------

/**
 * FittingRequest — 단일 피팅 요청 (백엔드 DB 구조 기준)
 * products 배열이 아닌 단일 상품 필드로 구성
 */
export interface FittingRequest {
  requestId: string;
  productId: string;       // 단일 상품 ID
  productName: string;     // 단일 상품명
  color: string;           // 선택 색상
  size: string;            // 선택 사이즈
  fittingRoomId: string;
  status: FittingStatus;
  requestTime: number;     // Unix timestamp (ms) — API: ISO 8601 string으로 변환 필요
  sessionId: string;       // 같은 태깅 세션에서 생성된 요청들을 묶는 ID
}

/**
 * CreateSingleRequestBody — POST /api/requests 바디 (상품 1개)
 * 고객이 상품 n개 태깅 → n번 이 타입으로 호출
 */
export type CreateSingleRequestBody = Omit<FittingRequest, 'requestId' | 'requestTime'>;

/**
 * @deprecated 구버전 호환용 — 새 코드에서는 CreateSingleRequestBody 사용
 * products 배열 기반의 구 타입. useRequests.createRequests()가 내부에서 분기 처리.
 */
export interface CreateFittingRequestBody {
  products: TaggedProduct[];
  fittingRoomId: string;
  status: FittingStatus;
  sessionId: string;
}

/** PATCH /api/requests/:id — 상태 변경 바디 */
export interface UpdateStatusBody {
  status: FittingStatus;
}

/** GET /api/requests — 목록 응답 */
export interface GetRequestsResponse {
  requests: FittingRequest[];
}

/** GET /admin/stats — 관리자 통계 응답 */
export interface AdminStats {
  total: number;
  pending: number;
  assigned: number;
  completed: number;
}
