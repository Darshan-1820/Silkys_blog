import { verifyPassword, signSession, sessionCookie } from '../../lib/auth.js';

export const prerender = false;

export async function POST({ request, locals, redirect }) {
  const env = locals.runtime.env;
  const form = await request.formData();
  const password = (form.get('password') || '').toString();

  const ok = await verifyPassword(password, env.SILKY_PASSWORD_HASH);
  if (!ok) return redirect('/admin/login?error=1', 302);

  const token = await signSession(env.SESSION_SECRET);
  const headers = new Headers({ Location: '/admin' });
  headers.append('Set-Cookie', sessionCookie(token, { secure: import.meta.env.PROD }));
  return new Response(null, { status: 302, headers });
}
