import type { Product } from '../types';

export const mockProducts: Product[] = [
  {
    id: 'prod-001',
    name: 'Classic White T-Shirt',
    price: 35000,
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&auto=format&fit=crop',
    colors: ['White', 'Black', 'Grey'],
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'prod-002',
    name: 'Denim Jacket Vintage',
    price: 89000,
    imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=600&auto=format&fit=crop',
    colors: ['Blue', 'Black'],
    sizes: ['M', 'L', 'XL'],
  },
  {
    id: 'prod-003',
    name: 'Pleated Midi Skirt',
    price: 54000,
    imageUrl: 'https://images.unsplash.com/photo-1583496661160-c588c443c982?q=80&w=600&auto=format&fit=crop',
    colors: ['Beige', 'Navy', 'Olive'],
    sizes: ['S', 'M', 'L'],
  },
  {
    id: 'prod-004',
    name: 'Oversize Wool Coat',
    price: 159000,
    imageUrl: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=600&auto=format&fit=crop',
    colors: ['Charcoal', 'Camel', 'Black'],
    sizes: ['Free'],
  }
];
