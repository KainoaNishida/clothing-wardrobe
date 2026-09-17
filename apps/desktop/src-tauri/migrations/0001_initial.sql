PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS body_profiles (
  id TEXT PRIMARY KEY,
  display_name TEXT,
  unit_system TEXT NOT NULL DEFAULT 'metric',
  height_cm REAL,
  measurement_completeness TEXT NOT NULL DEFAULT 'draft',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS body_measurements (
  id TEXT PRIMARY KEY,
  body_profile_id TEXT NOT NULL,
  measurement_key TEXT NOT NULL,
  value_cm REAL NOT NULL,
  source TEXT NOT NULL,
  required INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (body_profile_id) REFERENCES body_profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS clothing_items (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  subcategory TEXT,
  brand TEXT,
  name TEXT NOT NULL,
  size_label TEXT,
  primary_color TEXT,
  pattern TEXT,
  source_url TEXT,
  notes TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS clothing_images (
  id TEXT PRIMARY KEY,
  clothing_item_id TEXT NOT NULL,
  asset_id TEXT NOT NULL,
  role TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (clothing_item_id) REFERENCES clothing_items(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS garment_measurements (
  id TEXT PRIMARY KEY,
  clothing_item_id TEXT NOT NULL,
  measurement_key TEXT NOT NULL,
  value_cm REAL NOT NULL,
  source TEXT NOT NULL,
  confidence TEXT NOT NULL DEFAULT 'unknown',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (clothing_item_id) REFERENCES clothing_items(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS outfits (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  notes TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS outfit_items (
  id TEXT PRIMARY KEY,
  outfit_id TEXT NOT NULL,
  clothing_item_id TEXT NOT NULL,
  layer_index INTEGER NOT NULL,
  slot TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (outfit_id) REFERENCES outfits(id) ON DELETE CASCADE,
  FOREIGN KEY (clothing_item_id) REFERENCES clothing_items(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS import_drafts (
  id TEXT PRIMARY KEY,
  source_url TEXT NOT NULL,
  status TEXT NOT NULL,
  raw_title TEXT,
  raw_brand TEXT,
  candidate_json TEXT,
  error_message TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS generated_assets (
  id TEXT PRIMARY KEY,
  asset_kind TEXT NOT NULL,
  relative_path TEXT NOT NULL,
  source_id TEXT,
  created_at INTEGER NOT NULL
);
