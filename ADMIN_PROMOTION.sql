-- SQL Snippet to Promote a User to Admin
-- Run this in the Supabase SQL Editor to make yourself an admin

-- Replace 'your-email@example.com' with your actual email address
UPDATE profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'your-email@example.com'
);

-- Alternative: If you know your user ID directly, you can use:
-- UPDATE profiles SET role = 'admin' WHERE id = 'your-user-id-uuid-here';

-- To verify the update worked, run this query:
-- SELECT p.id, u.email, p.full_name, p.role, p.created_at
-- FROM profiles p
-- JOIN auth.users u ON p.id = u.id
-- WHERE p.role = 'admin';

-- To see all user roles:
-- SELECT p.id, u.email, p.full_name, p.role, p.created_at
-- FROM profiles p
-- JOIN auth.users u ON p.id = u.id
-- ORDER BY p.created_at DESC;
