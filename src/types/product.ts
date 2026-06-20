export interface Product {
  id: number;
  name: string;
  category: string;
  categoryId?: number;
  price: number;
  imageUrls?: string[];
  style?: string;
  size?: string;
  gender?: string;
  colorIds?: number[];
  colors?: string[];
  conditionPercentage?: number;
}

export interface ProductResponse {
  id: number;
  sellerId?: number;
  sellerName?: string;
  name: string;
  description?: string;
  price: number;
  categoryId?: number;
  category?: string;
  brand?: string;
  gender?: string;
  imageUrls?: string[];
  status?: string;
  style?: string;
  stock?: number;
  sizes?: string[];
  colorIds?: number[];
  colors?: string[];
  conditionPercentage?: number;
  length?: number;
  shoulder?: number;
  chest?: number;
  waist?: number;
  createdAt?: string;
  updatedAt?: string;
}
