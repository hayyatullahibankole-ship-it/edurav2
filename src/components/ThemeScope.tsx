import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from 'next-themes';

// Dark mode is only allowed inside the app dashboards.
// Public / marketing pages always render in light mode.
const DASHBOARD_PREFIXES = [
  '/dashboard',
  '/mobile-home',
  '/admin',
  '/services',
  '/wallet',
  '/practice',
  '/results',
  '/test-results',
  '/challenge-results',
  '/answer-review',
  '/study-hub',
  '/resources',
  '/profile',
  '/settings',
  '/school-dashboard',
  '/school',
];

export const isDashboardPath = (pathname: string) =>
  DASHBOARD_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

export const ThemeScope = () => {
  const { pathname } = useLocation();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    const allowDark = isDashboardPath(pathname);
    root.classList.toggle('dark', allowDark && resolvedTheme === 'dark');
  }, [pathname, resolvedTheme]);

  return null;
};

export default ThemeScope;
