export interface ProductGroup {
  id: string;
  name: string;
  code: string;
  description: string | null;
  active: number;
  sort_order: number;
  media: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  deleted_by: string | null;
}

export interface ProductGroupCategory {
  id: string;
  product_group_id: string;
  name: string;
  code: string;
  active: number;
  sort_order: number;
  media: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  deleted_by: string | null;
}

export interface Product {
  id: string;
  name: string;
  code: string;
  description: string | null;
  category_id: string;
  price: number;
  active: boolean;
  sort_order: number;
  is_sold_out: number;
  media: string;
  overrides: string;
  is_product_tag: boolean;
  barcodes: string;
}

export interface CartItem extends Product {
  qty: number;
}
