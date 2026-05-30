/**
 * page.tsx — Root route (/)
 *
 * Renders nothing. Its only purpose is to read the client session state
 * and redirect to the appropriate route:
 *
 *   No session → /login
 *   Role ADMIN → /admin
 *   Role USER  → /dashboard
 *
 * router.replace is used instead of push so the root route is not added
 * to the browser history — pressing Back will not return to a blank screen.
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace('/login');
    } else if (user.role === 'ADMIN') {
      router.replace('/admin');
    } else {
      router.replace('/dashboard');
    }
  }, [router]);

  // Renders nothing; the redirect happens in the effect above
  return null;
}
