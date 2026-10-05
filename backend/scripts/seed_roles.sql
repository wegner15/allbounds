-- =======================================================
-- Seed Roles and User-Role Associations for AllBounds
-- =======================================================

-- 1. Ensure roles table exists
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Ensure user_roles join table exists
CREATE TABLE IF NOT EXISTS user_roles (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- 3. Upsert default roles
INSERT INTO roles (name, description, created_at, updated_at)
VALUES 
    ('admin', 'System Administrator with full access', NOW(), NOW()),
    ('finance', 'Finance staff — access to finance, invoicing, billing, and reports', NOW(), NOW())
ON CONFLICT (name) DO UPDATE 
SET description = EXCLUDED.description,
    updated_at = NOW();

-- 4. Verify seeded roles
SELECT id, name, description, created_at FROM roles ORDER BY id;
