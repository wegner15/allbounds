-- Migration: Add amenities table and hotel_amenities association table
-- This migration creates the amenities infrastructure for hotels

-- Create amenities table
CREATE TABLE IF NOT EXISTS amenities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create hotel_amenities association table (many-to-many)
CREATE TABLE IF NOT EXISTS hotel_amenities (
    hotel_id INTEGER NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    amenity_id INTEGER NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
    PRIMARY KEY (hotel_id, amenity_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_amenities_category ON amenities(category);
CREATE INDEX IF NOT EXISTS idx_amenities_is_active ON amenities(is_active);
CREATE INDEX IF NOT EXISTS idx_hotel_amenities_hotel_id ON hotel_amenities(hotel_id);
CREATE INDEX IF NOT EXISTS idx_hotel_amenities_amenity_id ON hotel_amenities(amenity_id);

-- Insert some common amenities
INSERT INTO amenities (name, description, icon, category) VALUES
    ('WiFi', 'Free wireless internet access', 'wifi', 'General'),
    ('Swimming Pool', 'Outdoor or indoor swimming pool', 'waves', 'Recreation'),
    ('Fitness Center', 'Gym with exercise equipment', 'dumbbell', 'Recreation'),
    ('Restaurant', 'On-site dining restaurant', 'utensils', 'Dining'),
    ('Bar', 'Bar or lounge area', 'wine', 'Dining'),
    ('Room Service', '24-hour room service', 'concierge-bell', 'Services'),
    ('Spa', 'Spa and wellness center', 'spa', 'Recreation'),
    ('Parking', 'Free parking available', 'car', 'General'),
    ('Airport Shuttle', 'Airport transfer service', 'plane', 'Services'),
    ('Air Conditioning', 'Climate control in rooms', 'snowflake', 'Room'),
    ('Pet Friendly', 'Pets allowed', 'paw', 'General'),
    ('Business Center', 'Business facilities and meeting rooms', 'briefcase', 'Business'),
    ('Laundry Service', 'Laundry and dry cleaning', 'shirt', 'Services'),
    ('Concierge', 'Concierge service', 'bell', 'Services'),
    ('Safe', 'In-room safe', 'lock', 'Room'),
    ('Mini Bar', 'Mini bar in room', 'glass-martini', 'Room'),
    ('Balcony', 'Private balcony or terrace', 'home', 'Room'),
    ('Sea View', 'Ocean or sea view', 'water', 'Room'),
    ('Kitchen', 'Kitchenette or full kitchen', 'utensils', 'Room'),
    ('Non-Smoking', 'Non-smoking rooms available', 'smoking-ban', 'General')
ON CONFLICT (name) DO NOTHING;

-- Note: The old 'amenities' JSON column in hotels table is kept for backward compatibility
-- It has been renamed to 'amenities_json' in the model but the column name remains 'amenities'
-- You can migrate existing data with a script like:
-- 
-- UPDATE hotels SET amenities_json = amenities WHERE amenities IS NOT NULL;
-- 
-- Then manually map JSON amenities to the new amenities table and hotel_amenities association
