-- Seed default admin user
-- Password: Admin@123
-- Hash generated with bcrypt (cost factor 10)

INSERT INTO users (id, email, password_hash, name, role, is_active, total_xp, level, created_at)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'admin@codebasics.io',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeKpHvJFDBwCITI.iqAjI.EHRwi8S5cGi',
  'Admin User',
  'admin',
  true,
  0,
  1,
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeKpHvJFDBwCITI.iqAjI.EHRwi8S5cGi';

-- =============================================
-- DEFAULT ADMIN CREDENTIALS
-- =============================================
-- Email:    admin@codebasics.io
-- Password: Admin@123
--
-- IMPORTANT: Change this password after first login!
-- =============================================
