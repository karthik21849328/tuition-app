/*
  # Create Default Admin User

  1. Purpose
    - Creates a default admin user for initial system access
    - Email: admin@tuition.com
    - Password: Admin@123

  2. Important Notes
    - This should be changed after first login in production
    - The admin can create additional admin users if needed
*/

-- Note: This is a comment for the admin to create their user
-- The admin user should be created through Supabase Auth dashboard or via signup
-- Default credentials suggestion:
-- Email: admin@tuition.com
-- Password: Admin@123
-- Then manually insert into profiles table with role 'admin'