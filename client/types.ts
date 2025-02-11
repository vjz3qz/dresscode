export type ShoppingCard = {
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
  color?: string; // Primary color of the item
  brand?: string; // Brand name
  category?: string; // Category (e.g., tops, pants, shoes)
  season?: string[]; // Applicable seasons (e.g., ["winter", "fall"])
  material?: string; // Fabric/material type
  style?: string[]; // Applicable styles (e.g., ["casual", "formal"])
  is_favorite?: boolean; // Indicates if the user marked it as a favorite
  usage_count?: number; // Tracks how many times the item has been used in outfits
  last_used?: string; // Timestamp of the last time the item was used
  condition?: string; // Condition of the item (e.g., "new", "worn", "vintage")
  tags?: string[]; // Custom tags for search/filter (e.g., ["outdoors", "party"])
  fit?: string; // Fit description (e.g., "loose", "tight", "regular")
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
  tags?: string[]; // Tags to describe the outfit (e.g., ["formal", "beach"])
  occasion?: string; // Suggested occasion for the outfit (e.g., "wedding", "office")
  style?: string[]; // Style tags (e.g., ["casual", "bohemian"])
  season?: string[]; // Seasons applicable for the outfit (e.g., ["summer", "spring"])
  favorite_count?: number; // Tracks how many users marked it as a favorite
  last_worn?: string; // Timestamp for the last time it was worn
  likes?: number; // User engagement metric
  is_public?: boolean; // Visibility status of the outfit (public or private)
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
  theme?: string; // Overall theme for the look (e.g., "minimalist", "retro")
  tags?: string[]; // Tags for search/filter (e.g., ["summer vacation", "business trip"])
  favorite_count?: number; // Tracks how many users favorited the look
  is_public?: boolean; // Public visibility status
  inspiration_source?: string; // Source of inspiration (e.g., "Pinterest", "celebrity")
};

export type LookOutfit = {
  id?: number;
  look_id: number;
  outfit_id: number;
  created_at?: string;
};

export type CalendarEvent = {
  id?: number;
  created_at?: string;
  user_id: string;
  outfit_id: number;
  all_day: boolean;
  start_timestamp: string; // ISO date string
  end_timestamp?: string; // Optional, for multi-day events
  event_type?: string; // e.g., "planned_outfit", "worn_outfit", "event"
  event_title?: string; // Optional event name/description
  recurrence?: string; // Optional, for recurring outfits (e.g., "weekly", "monthly")
  notes?: string; // Any additional notes about the outfit/event
};

// CREATE TABLE calendar_events (
//   id SERIAL PRIMARY KEY,
//   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
//   user_id uuid REFERENCES users(id),
//   outfit_id INTEGER REFERENCES outfits(id),
//   all_day BOOLEAN DEFAULT TRUE,
//   start_timestamp TIMESTAMPZ NOT NULL,
//   end_timestamp TIMESTAMPZ,
//   event_type TEXT,
//   event_title TEXT,
//   recurrence TEXT,
//   notes TEXT
// );

export type TableTypes = {
  items: Item;
  looks: Look;
  outfits: Outfit;
  // calendar_events: CalendarEvent;
};
