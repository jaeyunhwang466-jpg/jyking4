import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FittingRequest, FittingStatus } from '../types';

interface FittingStore {
  requests: FittingRequest[];
  // ⚠️ 백엔드 구조: 요청 1개 = 상품 1개
  // addRequest는 단일 상품 FittingRequest를 받음
  addRequest: (request: Omit<FittingRequest, 'requestTime'>) => void;
  updateRequestStatus: (requestId: string, status: FittingStatus) => void;
  clearRequests: () => void;
}

export const useFittingStore = create<FittingStore>()(
  persist(
    (set) => ({
      requests: [],
      addRequest: (requestData) => set((state) => {
        const newRequest: FittingRequest = {
          ...requestData,
          requestTime: Date.now(),
        };
        return { requests: [newRequest, ...state.requests] };
      }),
      updateRequestStatus: (requestId, status) => set((state) => ({
        requests: state.requests.map((req) =>
          req.requestId === requestId
            ? { ...req, status }
            : req
        )
      })),
      clearRequests: () => set({ requests: [] }),
    }),
    {
      name: 'keep-fitting-storage-v2',
    }
  )
);

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'keep-fitting-storage-v2') {
      useFittingStore.persist.rehydrate();
    }
  });
}
