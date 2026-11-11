import type { Accord } from "./accords";

export type Product = {
  id: string;
  name: string;
  brand: string;
  volume_ml: number | null;
  description: string;
  price_cents: number | null;
  image_path: string | null;
  is_available: boolean;
  is_featured: boolean;
  accords: Accord[];
  updated_at: string;
};

export type StoreSettings = {
  id: number;
  store_name: string;
  tagline: string;
  whatsapp: string | null;
  instagram: string | null;
};

export const PRODUCT_COLUMNS =
  "id,name,brand,volume_ml,description,price_cents,image_path,is_available,is_featured,accords,updated_at";
export const SETTINGS_COLUMNS = "id,store_name,tagline,whatsapp,instagram";
