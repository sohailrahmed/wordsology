// Shared helpers for the comment system (Cloudflare Pages Functions).
// Bindings and settings (Cloudflare Pages → Settings):
//   DB                 D1 database binding
//   TURNSTILE_SECRET   Turnstile secret key (spam check)
//   RESEND_API_KEY     Resend API key (sends the "new comment" email)
//   NOTIFY_EMAIL       where those emails go (Sohail's Gmail)
//   DEV_MODE           "1" only for local testing: skips Turnstile, logs email instead of sending

const SCHEMA = `CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent TEXT,            -- 'a123' = a conversation in the old archive, '45' = a new comment
  page TEXT NOT NULL,
  topic TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  text TEXT NOT NULL,
  created TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  token TEXT NOT NULL,
  owner INTEGER NOT NULL DEFAULT 0,
  ip_hash TEXT
)`;

let ready = false;
export async function db(env) {
  if (!env.DB) throw new Error('The DB binding is missing.');
  if (!ready) {
    await env.DB.prepare(SCHEMA).run();
    await env.DB.prepare('CREATE INDEX IF NOT EXISTS comments_status ON comments(status)').run();
    ready = true;
  }
  return env.DB;
}

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function token() {
  const b = new Uint8Array(24);
  crypto.getRandomValues(b);
  return [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

export async function sha256(s) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

// Constant-time-ish comparison for tokens.
export function same(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export async function turnstileOk(env, tokenValue, ip) {
  if (env.DEV_MODE === '1') return true;
  if (!env.TURNSTILE_SECRET || !tokenValue) return false;
  const body = new FormData();
  body.append('secret', env.TURNSTILE_SECRET);
  body.append('response', tokenValue);
  if (ip) body.append('remoteip', ip);
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  const out = await r.json().catch(() => ({}));
  return out.success === true;
}

export async function sendEmail(env, { subject, html }) {
  if (env.DEV_MODE === '1' || !env.RESEND_API_KEY) {
    console.log('[email]', subject, '\n', html);
    return env.DEV_MODE === '1';
  }
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from: env.FROM_EMAIL || 'Wordsology <onboarding@resend.dev>', to: [env.NOTIFY_EMAIL], subject, html }),
  });
  if (!r.ok) console.log('[email failed]', r.status, await r.text());
  return r.ok;
}

// The small HTML pages shown when Sohail taps a button in the email.
export function page(title, body) {
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${esc(title)} · Wordsology</title>
<style>
body{margin:0;background:#F6F7F4;color:#14201A;font:17px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:640px;margin:0 auto;padding:32px 16px 64px}
h1{font-size:26px;margin:0 0 16px}
.card{background:#fff;border:1px solid #E2E6DF;border-radius:14px;padding:18px 20px;margin:0 0 18px}
.who{font-weight:750;margin:0 0 4px}.meta{color:#5B6A61;font-size:14px;margin:0 0 10px}
.text{white-space:pre-line;overflow-wrap:anywhere}
.row{display:flex;flex-wrap:wrap;gap:10px}
button,.btn{font:inherit;font-weight:700;border-radius:12px;min-height:48px;padding:0 22px;border:1px solid transparent;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center}
.ok{background:#2F6B3F;color:#fff}.no{background:#fff;border-color:#CBD2C7;color:#8A1C1C}.plain{background:#fff;border-color:#CBD2C7;color:#14201A}
textarea{width:100%;box-sizing:border-box;min-height:140px;font:inherit;padding:12px;border:1px solid #CBD2C7;border-radius:12px;margin:0 0 10px}
.note{color:#5B6A61;font-size:15px}.done{background:#EEF5EF;border-color:#CFE3D4}
</style></head><body><main>${body}</main></body></html>`, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}
