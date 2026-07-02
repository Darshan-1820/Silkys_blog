// Single-user auth for Silky. Runs on the Cloudflare edge (Web Crypto) AND in
// Node 22 (same global crypto), so tools/hash-password.mjs can reuse it.
//
// - Password is stored ONLY as a PBKDF2 hash (secret: SILKY_PASSWORD_HASH).
// - Login sets a signed httpOnly cookie (secret: SESSION_SECRET). No DB session table needed.

const enc = new TextEncoder();
const ITERATIONS = 100_000;
const KEY_LEN = 32;
export const SESSION_COOKIE = 'sb_session';
const SESSION_DAYS = 30;

// --- base64url helpers -----------------------------------------------------
function bytesToB64url(bytes) {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlToBytes(str) {
  const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// constant-time-ish comparison
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// --- password hashing ------------------------------------------------------
async function pbkdf2(password, salt) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    key,
    KEY_LEN * 8
  );
  return new Uint8Array(bits);
}

// Produce the string to store in SILKY_PASSWORD_HASH.
export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(password, salt);
  return `pbkdf2$${ITERATIONS}$${bytesToB64url(salt)}$${bytesToB64url(hash)}`;
}

export async function verifyPassword(password, stored) {
  if (!stored) return false;
  const [scheme, , saltB64, hashB64] = stored.split('$');
  if (scheme !== 'pbkdf2' || !saltB64 || !hashB64) return false;
  const salt = b64urlToBytes(saltB64);
  const got = await pbkdf2(password, salt);
  return safeEqual(bytesToB64url(got), hashB64);
}

// --- session tokens (HMAC-signed) -----------------------------------------
async function hmac(secret, data) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return bytesToB64url(new Uint8Array(sig));
}

export async function signSession(secret) {
  const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = `silky.${exp}`;
  const sig = await hmac(secret, payload);
  return `${payload}.${sig}`;
}

export async function verifySession(secret, token) {
  if (!token) return false;
  const i = token.lastIndexOf('.');
  if (i < 0) return false;
  const payload = token.slice(0, i);
  const sig = token.slice(i + 1);
  const expected = await hmac(secret, payload);
  if (!safeEqual(sig, expected)) return false;
  const exp = Number(payload.split('.')[1]);
  return Number.isFinite(exp) && Date.now() < exp;
}

// Cookie string for setting the session.
export function sessionCookie(token, { secure = true } = {}) {
  const parts = [
    `${SESSION_COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${SESSION_DAYS * 24 * 60 * 60}`,
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

export function clearCookie({ secure = true } = {}) {
  const parts = [`${SESSION_COOKIE}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

// Route guard. Call at the top of every protected page/API.
//   Page:  const denied = await guard(Astro);        if (denied) return denied;
//   API:   const denied = await guard(ctx, {api:true}); if (denied) return denied;
// Returns a Response (redirect / 401) when unauthorized, else null.
// (We use this instead of src/middleware.js because the project path contains an
//  apostrophe, which breaks Astro's middleware virtual-module loader.)
export async function guard(context, { api = false } = {}) {
  const secret = context.locals?.runtime?.env?.SESSION_SECRET || '';
  const token = context.cookies.get(SESSION_COOKIE)?.value;
  if (await verifySession(secret, token)) return null;
  if (api) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }
  return new Response(null, { status: 302, headers: { Location: '/admin/login' } });
}
