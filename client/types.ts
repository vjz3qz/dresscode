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

export type MessageT = {
  image: any;
  lastMessage: string;
  name: string;
};

export type ProfileItemT = {
  age?: string;
  info1?: string;
  info2?: string;
  info3?: string;
  info4?: string;
  location?: string;
  matches: string;
  name: string;
};

export type TabBarIconT = {
  focused: boolean;
  iconName: any;
  text: string;
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
  s3_key: string;
  user_id: number;
  image_url?: string;
  x?: number;
  y?: number;
  size?: number;
};

export type User = {
  id: number;
  created_at: string;
  name: string;
};

export type Outfit = {
  id?: number;
  created_at?: string;
  name: string;
  user_id?: number;
  s3_key?: string;
  image_url?: string;
  metadata: Item[];
};

export type OutfitItem = {
  id: number;
  outfit_id: number;
  item_id: number;
  created_at: string;
};

export type Look = {
  id: number;
  created_at: string;
  name: string;
  description: string;
  user_id: number;
};

export type LookOutfit = {
  id: number;
  look_id: number;
  outfit_id: number;
  created_at: string;
};
