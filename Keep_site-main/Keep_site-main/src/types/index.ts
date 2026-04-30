// 이전 호환성 유지용 re-export
// 새 코드는 src/types/request.ts 를 직접 import 하세요.
export type { FittingStatus, TaggedProduct, FittingRequest } from './request';

export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  colors: string[];
  sizes: string[];
}
