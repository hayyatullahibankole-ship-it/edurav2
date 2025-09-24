-- Make the first user (owner) an admin
-- This will assign admin role to the user with email akboysulekz@gmail.com

INSERT INTO user_roles (user_id, role, assigned_by)
SELECT u.id, 'admin'::app_role, u.id
FROM users u 
WHERE u.email = 'akboysulekz@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM user_roles ur 
  WHERE ur.user_id = u.id AND ur.role IN ('admin', 'super_admin')
);

-- Also make them a super_admin for full privileges
INSERT INTO user_roles (user_id, role, assigned_by)
SELECT u.id, 'super_admin'::app_role, u.id
FROM users u 
WHERE u.email = 'akboysulekz@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM user_roles ur 
  WHERE ur.user_id = u.id AND ur.role = 'super_admin'
);