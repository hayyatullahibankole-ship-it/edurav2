-- Assign admin and super_admin roles to akeemsulekz@gmail.com
INSERT INTO user_roles (user_id, role, assigned_by)
SELECT u.id, 'admin'::app_role, u.id
FROM users u 
WHERE u.email = 'akeemsulekz@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM user_roles ur 
  WHERE ur.user_id = u.id AND ur.role = 'admin'
);

INSERT INTO user_roles (user_id, role, assigned_by)
SELECT u.id, 'super_admin'::app_role, u.id
FROM users u 
WHERE u.email = 'akeemsulekz@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM user_roles ur 
  WHERE ur.user_id = u.id AND ur.role = 'super_admin'
);