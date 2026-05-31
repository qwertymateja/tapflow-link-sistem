-- Run this in Supabase SQL Editor to add new columns
-- (Run schema.sql first if you haven't already)

alter table profiles add column if not exists font_family        text not null default 'inter';
alter table profiles add column if not exists background_type    text not null default 'solid';
alter table profiles add column if not exists background_gradient text not null default 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
alter table profiles add column if not exists background_image_url text not null default '';
alter table profiles add column if not exists button_border_color text not null default 'transparent';
alter table profiles add column if not exists text_color         text not null default '#ffffff';

-- Also drop and recreate the button_style check to allow 'shadow'
alter table profiles drop constraint if exists profiles_button_style_check;
alter table profiles add constraint profiles_button_style_check
  check (button_style in ('pill', 'rounded', 'square', 'shadow'));

-- Background image with opacity/overlay controls
alter table profiles add column if not exists bg_image_url     text;
alter table profiles add column if not exists bg_image_opacity integer default 100;
alter table profiles add column if not exists bg_image_overlay integer default 0;

-- Storage bucket for background images (also create via Supabase dashboard if preferred)
insert into storage.buckets (id, name, public) values ('backgrounds', 'backgrounds', true)
  on conflict (id) do nothing;
