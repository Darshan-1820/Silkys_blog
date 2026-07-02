import { clearCookie } from '../../lib/auth.js';

export const prerender = false;

export async function POST() {
  const headers = new Headers({ Location: '/admin/login' });
  headers.append('Set-Cookie', clearCookie({ secure: import.meta.env.PROD }));
  return new Response(null, { status: 302, headers });
}
