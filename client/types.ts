export type CardItemT = {
  description?: string;
  image: any;
  name: string;
  price?: string;
};

export type IconT = {
  name: any;
  size: number;
  color: string;
  style?: any;
};

export type DataT = {
  id: number;
  name: string;
  description: string;
  store: string;
  price: string;
  image: any;
};

export type Item = {
  id?: number;
  created_at?: string;
  name: string;
  type: string;
  s3_key?: string;
  user_id?: number;
  image_url?: string;
  x?: number;
  y?: number;
  size?: number;
};

export type Outfit = {
  id?: number;
  created_at?: string;
  name: string;
  user_id?: number;
  s3_key?: string;
  image_url?: string;
  description?: string;
  metadata: Item[];
};

export type OutfitItem = {
  id: number;
  outfit_id: number;
  item_id: number;
  created_at: string;
};

export type Look = {
  id?: number;
  created_at?: string;
  name: string;
  description: string;
  user_id?: number;
  outfits?: Outfit[];
};

export type LookOutfit = {
  id?: number;
  look_id: number;
  outfit_id: number;
  created_at?: string;
};

export type TableTypes = {
  items: Item;
  looks: Look;
  outfits: Outfit;
};
