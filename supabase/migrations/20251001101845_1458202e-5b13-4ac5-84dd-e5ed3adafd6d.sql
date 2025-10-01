-- Update the users table DELETE policy to allow both admin and super_admin to delete users
DROP POLICY IF EXISTS "Only super admins can delete users" ON public.users;

CREATE POLICY "Admins can delete users"
ON public.users
FOR DELETE
USING (is_admin(auth.uid()));

-- Log the policy change
COMMENT ON POLICY "Admins can delete users" ON public.users IS 
'Allows both admin and super_admin roles to delete user accounts. Uses is_admin() function which checks for both admin and super_admin roles.';