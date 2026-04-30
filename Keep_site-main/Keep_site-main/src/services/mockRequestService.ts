// ============================================================
// KEEP — Mock Request Service (IRequestService 구현체)
//
// ⚠️ 백엔드 구조: 요청 1개 = 상품 1개
//    createRequest에 단일 상품 데이터를 받아 저장
//
// 현재: Zustand + localStorage 기반으로 동작
// 교체: src/services/apiRequestService.ts 작성 후
//       index.ts 에서 import 대상만 바꾸면 됩니다.
// ============================================================

import { useFittingStore } from '../store/useFittingStore';
import type { IRequestService } from './requestService';
import type {
  FittingRequest,
  FittingStatus,
  CreateSingleRequestBody,
  GetRequestsResponse,
  AdminStats,
} from '../types/request';

/** mock 피팅룸 배정 (1~4 랜덤) */
const assignFittingRoom = (): string =>
  String(Math.floor(Math.random() * 4) + 1);

export const mockRequestService: IRequestService = {
  // ----------------------------------------------------------
  // [POST /api/requests]  피팅 요청 생성 (상품 1개)
  // 실제 API 교체 시: fetch('/api/requests', { method: 'POST', body })
  // ----------------------------------------------------------
  async createRequest(body: CreateSingleRequestBody): Promise<FittingRequest> {
    const newRequest: FittingRequest = {
      ...body,
      requestId:     `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      fittingRoomId: body.fittingRoomId || assignFittingRoom(),
      requestTime:   Date.now(),
    };

    // Zustand store 업데이트 (실제 API 연동 시 이 블록 제거)
    useFittingStore.getState().addRequest({
      requestId:     newRequest.requestId,
      productId:     newRequest.productId,
      productName:   newRequest.productName,
      color:         newRequest.color,
      size:          newRequest.size,
      fittingRoomId: newRequest.fittingRoomId,
      status:        newRequest.status,
      sessionId:     newRequest.sessionId,
    });

    return newRequest;
  },

  // ----------------------------------------------------------
  // [GET /api/requests]  전체 요청 목록
  // 실제 API 교체 시: fetch('/api/requests').then(r => r.json())
  // ----------------------------------------------------------
  async getRequests(): Promise<GetRequestsResponse> {
    const { requests } = useFittingStore.getState();
    return { requests };
  },

  // ----------------------------------------------------------
  // [PATCH /api/requests/:id]  상태 변경
  // 실제 API 교체 시: fetch(`/api/requests/${id}`, { method: 'PATCH', body })
  // ----------------------------------------------------------
  async updateStatus(requestId: string, status: FittingStatus): Promise<FittingRequest> {
    useFittingStore.getState().updateRequestStatus(requestId, status);

    const { requests } = useFittingStore.getState();
    const updated = requests.find(r => r.requestId === requestId);
    if (!updated) throw new Error(`Request ${requestId} not found`);
    return updated;
  },

  // ----------------------------------------------------------
  // [GET /admin/stats]  관리자 통계
  // 실제 API 교체 시: fetch('/admin/stats').then(r => r.json())
  // ----------------------------------------------------------
  async getAdminStats(): Promise<AdminStats> {
    const { requests } = useFittingStore.getState();
    return {
      total:     requests.length,
      pending:   requests.filter(r => r.status === 'pending').length,
      assigned:  requests.filter(r => r.status === 'assigned').length,
      completed: requests.filter(r => r.status === 'completed').length,
    };
  },
};
