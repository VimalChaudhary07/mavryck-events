/*
  # Fix Security Issue with active_events_view

  1. Security Enhancement
    - Change active_events_view from SECURITY DEFINER to SECURITY INVOKER
    - This ensures the view respects Row Level Security (RLS) policies of the querying user
    - Prevents potential privilege escalation and security bypasses

  2. Changes Made
    - Alter the view to use SECURITY INVOKER instead of SECURITY DEFINER
    - This is a critical security fix for production deployment

  3. Impact
    - The view will now execute with the permissions of the user making the query
    - RLS policies will be properly enforced
    - Maintains data security and access control integrity
*/

-- Fix the security definer issue with active_events_view
-- Change from SECURITY DEFINER to SECURITY INVOKER to respect RLS policies
ALTER VIEW public.active_events_view SET (security_invoker = true);

-- Add a comment to document this security enhancement
COMMENT ON VIEW public.active_events_view IS 'Enhanced security view that respects RLS policies of the querying user';