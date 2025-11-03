-- Fix NULL boolean fields in the database
-- This script updates all NULL values for is_featured and is_active fields to FALSE

-- Update activities table
UPDATE activities SET is_featured = FALSE WHERE is_featured IS NULL;
UPDATE activities SET is_active = TRUE WHERE is_active IS NULL;

-- Update packages table
UPDATE packages SET is_featured = FALSE WHERE is_featured IS NULL;
UPDATE packages SET is_active = TRUE WHERE is_active IS NULL;
UPDATE packages SET is_published = FALSE WHERE is_published IS NULL;

-- Update group_trips table
UPDATE group_trips SET is_featured = FALSE WHERE is_featured IS NULL;
UPDATE group_trips SET is_active = TRUE WHERE is_active IS NULL;

-- Update hotels table
UPDATE hotels SET is_featured = FALSE WHERE is_featured IS NULL;
UPDATE hotels SET is_active = TRUE WHERE is_active IS NULL;

-- Update blog_posts table
UPDATE blog_posts SET is_featured = FALSE WHERE is_featured IS NULL;
UPDATE blog_posts SET is_active = TRUE WHERE is_active IS NULL;
UPDATE blog_posts SET is_published = FALSE WHERE is_published IS NULL;

-- Update attractions table
UPDATE attractions SET is_active = TRUE WHERE is_active IS NULL;

-- Update accommodations table
UPDATE accommodations SET is_active = TRUE WHERE is_active IS NULL;

-- Update inclusions table
UPDATE inclusions SET is_active = TRUE WHERE is_active IS NULL;

-- Update exclusions table
UPDATE exclusions SET is_active = TRUE WHERE is_active IS NULL;

-- Update media_assets table
UPDATE media_assets SET is_active = TRUE WHERE is_active IS NULL;

-- Update regions table
UPDATE regions SET is_active = TRUE WHERE is_active IS NULL;

-- Update countries table
UPDATE countries SET is_active = TRUE WHERE is_active IS NULL;

-- Update holiday_types table
UPDATE holiday_types SET is_active = TRUE WHERE is_active IS NULL;

-- Update hotel_types table
UPDATE hotel_types SET is_active = TRUE WHERE is_active IS NULL;

-- Update group_trip_departures table
UPDATE group_trip_departures SET is_active = TRUE WHERE is_active IS NULL;

-- Update reviews table (if exists)
UPDATE reviews SET is_featured = FALSE WHERE is_featured IS NULL;
UPDATE reviews SET is_approved = FALSE WHERE is_approved IS NULL;
