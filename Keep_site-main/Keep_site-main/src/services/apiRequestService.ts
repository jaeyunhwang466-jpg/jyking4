// ============================================================
// KEEP — API Request Service (IRequestService 구현체)
//
// ⚠️ 백엔드 구조: 요청 1개 = 상품 1개
//    createRequest: 단일 상품 1개 → POST /api/requests 1회 호출
//    여러 상품 분기 처리는 useRequests.createRequests()에서 담당
//
// 현재: mock 응답을 반환하는 형태로 구현됨 (fetch 주석 처리)
// 교체: BASE_URL 변경 + fetch 주석 해제 → 실제 API 연동 완료
//
// 전환 방법:
//   1. BASE_URL 을 실제 서버 주소로 변경
//   2. 각 함수에서 "실제 fetch" 블록 주석 해제
//   3. "mock 응답" 블록 주석 처리 또는 제거
//   4. src/services/index.ts 에서 import 대상 변경
// ============================================================

import type { IRequestService } from './requestService';
import type {
  FittingRequest,
  FittingStatus,
  CreateSingleRequestBody,
  GetRequestsResponse,
  AdminStats,
} from '../types/request';

// ------------------------------------------------------------
// BASE_URL — 백엔드 서버 주소
// 실제 연동 시 아래 값을 실제 서버 주소로 교체
// ------------------------------------------------------------
const BASE_URL = 'https://api.keep-service.com'; // TODO: 실제 서버 주소로 교체

// ============================================================
// 내부 API 응답 타입 (백엔드 응답 snake_case 구조)
// 실제 API 명세에 맞게 조정
// ============================================================

/** 백엔드 /api/requests 단일 항목 응답 구조 */
interface ApiRequestItem {
  request_id: string;
  product_id: string;
  product_name: string;
  color: string;
  size: string;
  fitting_room_id: string;
  status: FittingStatus;
  request_time: string;   // ISO 8601 → Unix timestamp 변환 필요
  session_id: string;
}

/** 백엔드 POST /api/requests 바디 구조 */
interface ApiCreateRequestBody {
  product_id: string;
  product_name: string;
  color: string;
  size: string;
  fitting_room_id: string;
  status: FittingStatus;
  session_id: string;
}

// ============================================================
// 데이터 매핑 함수 — API ↔ 프론트 타입 변환
// ============================================================

/**
 * mapApiResponseToRequest
 * 백엔드 응답(snake_case) → 프론트 FittingRequest(camelCase) 변환
 */
function mapApiResponseToRequest(item: ApiRequestItem): FittingRequest {
  return {
    requestId: item.request_id,
    productId: item.product_id,
    productName: item.product_name,
    color: item.color,
    size: item.size,
    fittingRoomId: item.fitting_room_id,
    status: item.status,
    requestTime: new Date(item.request_time).getTime(), // ISO 8601 → ms
    sessionId: item.session_id,
  };
}

/**
 * mapRequestToApiBody
 * 프론트 CreateSingleRequestBody → 백엔드 POST 바디(snake_case) 변환
 */
function mapRequestToApiBody(body: CreateSingleRequestBody): ApiCreateRequestBody {
  return {
    product_id: body.productId,
    product_name: body.productName,
    color: body.color,
    size: body.size,
    fitting_room_id: body.fittingRoomId,
    status: body.status,
    session_id: body.sessionId,
  };
}

// ============================================================
// Mock 데이터 — 실제 API 연동 전까지 사용하는 인메모리 저장소
// ============================================================

let mockStore: FittingRequest[] = [];

/** mock 피팅룸 배정 (1~4 랜덤) */
const assignFittingRoom = (): string =>
  String(Math.floor(Math.random() * 4) + 1);

// ============================================================
// API Request Service 구현체
// ============================================================

export const apiRequestService: IRequestService = {

  // ----------------------------------------------------------
  // [POST /api/requests]  피팅 요청 생성 (상품 1개)
  // ----------------------------------------------------------
  async createRequest(body: CreateSingleRequestBody): Promise<FittingRequest> {
    // ✅ [테스트용 로그] API 호출 payload 확인
    console.log('[apiRequestService] createRequest payload:', body);
    console.log('[apiRequestService] mapped API body:', mapRequestToApiBody(body));

    try {
      // ▼▼▼▼▼ 실제 fetch — 백엔드 준비 완료 시 아래 블록 주석 해제 ▼▼▼▼▼
      /*
      const response = await fetch(`${BASE_URL}/api/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mapRequestToApiBody(body)),
      });

      if (!response.ok) {
        throw new Error(`[apiRequestService] createRequest failed: ${response.status} ${response.statusText}`);
      }

      const apiData: ApiRequestItem = await response.json();
      const result = mapApiResponseToRequest(apiData);
      console.log('[apiRequestService] createRequest response:', result);
      return result;
      */
      // ▲▲▲▲▲ 실제 fetch 끝 ▲▲▲▲▲

      // ▼▼▼▼▼ mock 응답 — 실제 API 연동 시 이 블록 제거 ▼▼▼▼▼
      await simulateDelay(300);

      const newRequest: FittingRequest = {
        ...body,
        requestId: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        fittingRoomId: body.fittingRoomId || assignFittingRoom(),
        requestTime: Date.now(),
      };
      mockStore.push(newRequest);

      console.log('[apiRequestService] createRequest mock response:', newRequest);
      return newRequest;
      // ▲▲▲▲▲ mock 응답 끝 ▲▲▲▲▲

    } catch (error) {
      console.error('[apiRequestService] createRequest 에러:', error);
      throw error;
    }
  },

  // ----------------------------------------------------------
  // [GET /api/requests]  전체 요청 목록
  // ----------------------------------------------------------
  async getRequests(): Promise<GetRequestsResponse> {
    try {
      // ▼▼▼▼▼ 실제 fetch — 백엔드 준비 완료 시 아래 블록 주석 해제 ▼▼▼▼▼
      /*
      const response = await fetch(`${BASE_URL}/api/requests`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`[apiRequestService] getRequests failed: ${response.status} ${response.statusText}`);
      }

      const apiData: { requests: ApiRequestItem[] } = await response.json();
      const requests = apiData.requests.map(mapApiResponseToRequest);
      console.log('[apiRequestService] getRequests response:', requests);
      return { requests };
      */
      // ▲▲▲▲▲ 실제 fetch 끝 ▲▲▲▲▲

      // ▼▼▼▼▼ mock 응답 — 실제 API 연동 시 이 블록 제거 ▼▼▼▼▼
      await simulateDelay(200);

      console.log('[apiRequestService] getRequests mock data:', mockStore);
      return { requests: [...mockStore] };
      // ▲▲▲▲▲ mock 응답 끝 ▲▲▲▲▲

    } catch (error) {
      console.error('[apiRequestService] getRequests 에러:', error);
      throw error;
    }
  },

  // ----------------------------------------------------------
  // [PATCH /api/requests/:id]  상태 변경
  // ----------------------------------------------------------
  async updateStatus(requestId: string, status: FittingStatus): Promise<FittingRequest> {
    try {
      // ▼▼▼▼▼ 실제 fetch — 백엔드 준비 완료 시 아래 블록 주석 해제 ▼▼▼▼▼
      /*
      const response = await fetch(`${BASE_URL}/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`[apiRequestService] updateStatus failed: ${response.status} ${response.statusText}`);
      }

      const apiData: ApiRequestItem = await response.json();
      const result = mapApiResponseToRequest(apiData);
      console.log('[apiRequestService] updateStatus response:', result);
      return result;
      */
      // ▲▲▲▲▲ 실제 fetch 끝 ▲▲▲▲▲

      // ▼▼▼▼▼ mock 응답 — 실제 API 연동 시 이 블록 제거 ▼▼▼▼▼
      await simulateDelay(200);

      const index = mockStore.findIndex(r => r.requestId === requestId);
      if (index === -1) throw new Error(`[apiRequestService] Request ${requestId} not found`);

      mockStore[index] = { ...mockStore[index], status };
      console.log('[apiRequestService] updateStatus mock result:', mockStore[index]);
      return mockStore[index];
      // ▲▲▲▲▲ mock 응답 끝 ▲▲▲▲▲

    } catch (error) {
      console.error('[apiRequestService] updateStatus 에러:', error);
      throw error;
    }
  },

  // ----------------------------------------------------------
  // [GET /admin/stats]  관리자 통계
  // ----------------------------------------------------------
  async getAdminStats(): Promise<AdminStats> {
    try {
      // ▼▼▼▼▼ 실제 fetch — 백엔드 준비 완료 시 아래 블록 주석 해제 ▼▼▼▼▼
      /*
      const response = await fetch(`${BASE_URL}/admin/stats`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`[apiRequestService] getAdminStats failed: ${response.status} ${response.statusText}`);
      }

      const stats: AdminStats = await response.json();
      console.log('[apiRequestService] getAdminStats response:', stats);
      return stats;
      */
      // ▲▲▲▲▲ 실제 fetch 끝 ▲▲▲▲▲

      // ▼▼▼▼▼ mock 응답 — 실제 API 연동 시 이 블록 제거 ▼▼▼▼▼
      await simulateDelay(100);

      return {
        total: mockStore.length,
        pending: mockStore.filter(r => r.status === 'pending').length,
        assigned: mockStore.filter(r => r.status === 'assigned').length,
        completed: mockStore.filter(r => r.status === 'completed').length,
      };
      // ▲▲▲▲▲ mock 응답 끝 ▲▲▲▲▲

    } catch (error) {
      console.error('[apiRequestService] getAdminStats 에러:', error);
      throw error;
    }
  },
};

// ============================================================
// 내부 유틸 — 실제 API 연동 시 제거
// ============================================================

/** API 지연 시뮬레이션 (mock 전용) */
function simulateDelay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
