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
}
