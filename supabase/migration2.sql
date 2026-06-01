-- Run this in Supabase SQL Editor after migration.sql

-- New profile columns for text sizing, bold, and custom gradient
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS name_size text DEFAULT 'large';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio_size text DEFAULT 'medium';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS name_bold boolean DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio_bold boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gradient_start text DEFAULT '#833ab4';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gradient_end text DEFAULT '#fd1d1d';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gradient_direction text DEFAULT 'to bottom';

-- New link columns for link types
ALTER TABLE links ADD COLUMN IF NOT EXISTS link_type text DEFAULT 'link';
ALTER TABLE links ADD COLUMN IF NOT EXISTS content text;
ALTER TABLE links ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE links ADD COLUMN IF NOT EXISTS wifi_ssid text;
ALTER TABLE links ADD COLUMN IF NOT EXISTS wifi_password text;
ALTER TABLE links ADD COLUMN IF NOT EXISTS wifi_qr_url text;
