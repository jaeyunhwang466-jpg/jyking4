// ============================================================
// KEEP — useRequests Hook
//
// 컴포넌트는 이 hook만 사용합니다.
// store 또는 서비스에 대해 직접 알 필요가 없습니다.
// 실제 API 전환 시 hook 코드는 변경 없음 — service만 교체.
//
// ⚠️ 백엔드 구조: 요청 1개 = 상품 1개
//    createRequest  — 단일 상품 1개 요청 (서비스 직접 호출)
//    createRequests — 상품 n개 태깅 → n개 개별 요청 생성 (UI 진입점)
// ============================================================

import { useCallback, useState } from 'react';
import { useFittingStore } from '../store/useFittingStore';
import { requestService } from '../services';
import type {
  FittingStatus,
  CreateFittingRequestBody,
  CreateSingleRequestBody,
} from '../types/request';

/**
 * useRequests
 *
 * - requests:       전체 요청 목록 (Zustand subscribe로 실시간 반영)
 * - loading:        API 호출 중 여부 (UI 로딩 처리용)
 * - error:          API 실패 시 에러 메시지 (향후 UI 에러 처리용)
 * - createRequests: 고객용 — 태깅된 상품 배열 → 상품별 개별 요청 생성 (UI 진입점)
 * - createRequest:  내부용 — 단일 상품 요청 1개 생성 (서비스 직접 호출)
 * - updateStatus:   직원용 — 상태 변경 (PATCH)
 */
export const useRequests = () => {
  const requests = useFittingStore(state => state.requests);

  // ----------------------------------------------------------
  // 로딩 / 에러 상태 — API 호출 대응 준비
  // ----------------------------------------------------------
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ----------------------------------------------------------
  // createRequest — 단일 상품 요청 1개 생성
  // 서비스 레이어 직접 호출 (내부 / 테스트용)
  // ----------------------------------------------------------
  const createRequest = useCallback(
    async (body: CreateSingleRequestBody) => {
      setLoading(true);
      setError(null);
      try {
        return await requestService.createRequest(body);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'createRequest 실패';
        setError(message);
        console.error('[useRequests] createRequest 에러:', message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ----------------------------------------------------------
  // createRequests — 상품 n개 태깅 → n개 개별 요청 생성
  //
  // ⚠️ 핵심 변환 지점: "요청 1개 = 상품 1개" 백엔드 구조에 맞춤
  //
  // - 상품 3개 태깅 → createRequest 3회 병렬 호출
  // - 같은 세션의 요청들은 sessionId로 묶임 (백엔드 그룹핑용)
  // - CustomerApp은 이 함수 하나만 호출하면 됨
  //
  // 반환값: 생성된 FittingRequest 배열 (첫 번째 fittingRoomId를 UI에 표시)
  // ----------------------------------------------------------
  const createRequests = useCallback(
    async (body: CreateFittingRequestBody) => {
      if (body.products.length === 0) return [];

      setLoading(true);
      setError(null);

      console.log('[useRequests] createRequests 시작 — 상품 수:', body.products.length);

      try {
        // 상품 배열 → 개별 요청 병렬 생성
        // Promise.all: 전체 성공 또는 전체 실패 (원자적 처리)
        const results = await Promise.all(
          body.products.map((product) => {
            const singleBody: CreateSingleRequestBody = {
              productId:     product.productId,
              productName:   product.productName,
              color:         product.color,
              size:          product.size,
              fittingRoomId: body.fittingRoomId,
              status:        body.status,
              sessionId:     body.sessionId, // 같은 세션으로 묶음
            };

            console.log('[useRequests] 개별 요청 생성:', singleBody);
            return requestService.createRequest(singleBody);
          })
        );

        console.log('[useRequests] createRequests 완료 — 생성된 요청 수:', results.length);
        return results;

      } catch (err) {
        const message = err instanceof Error ? err.message : 'createRequests 실패';
        setError(message);
        console.error('[useRequests] createRequests 에러:', message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ----------------------------------------------------------
  // updateStatus — 단일 요청 상태 변경
  // ----------------------------------------------------------
  const updateStatus = useCallback(
    async (requestId: string, status: FittingStatus) => {
      setLoading(true);
      setError(null);
      try {
        return await requestService.updateStatus(requestId, status);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'updateStatus 실패';
        setError(message);
        console.error('[useRequests] updateStatus 에러:', message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { requests, loading, error, createRequest, createRequests, updateStatus };
};

/**
 * useAdminStats
 *
 * - 관리자 대시보드용 통계 (GET /admin/stats)
 * - requests가 바뀔 때마다 재계산 (실제 API에선 polling 또는 websocket으로 교체)
 */
export const useAdminStats = () => {
  const requests = useFittingStore(state => state.requests);

  const stats = {
    total:     requests.length,
    pending:   requests.filter(r => r.status === 'pending').length,
    assigned:  requests.filter(r => r.status === 'assigned').length,
    completed: requests.filter(r => r.status === 'completed').length,
  };

  return stats;
};
