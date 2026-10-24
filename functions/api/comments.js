// GET  /api/comments  → every approved new comment (the archive lives in /qa-data.json)
// POST /api/comments  → a reader leaves a comment or reply; it waits for Sohail's approval
import { db, json, esc, token, sha256, turnstileCheck, sendEmail } from '../_lib.js';

const TOPICS = new Set(['blood-bank', 'chemistry', 'coagulation', 'endocrinology', 'hematology', 'immunology',
  'microbiology', 'urinalysis-body-fluids', 'strategy', 'licensing', 'general']);

export async function onRequestGet({ env }) {
  const DB = await db(env);
  const { results } = await DB.prepare(
    `SELECT id, parent, page, topic, name, text, created, owner FROM comments WHERE status = 'approved' ORDER BY id`
  ).all();
  return json(results.map((c) => ({ id: c.id, p: c.parent, page: c.page, topic: c.topic, a: c.name, t: c.text, d: c.created.slice(0, 10), s: c.owner ? 1 : 0 })));
}

export async function onRequestPost({ request, env }) {
  let f;
  try { f = await request.json(); } catch { return json({ error: 'Something went wrong. Please try again.' }, 400); }

  // Bots fill every field; people never see this one.
  if (f.website) return json({ ok: true });

  const name = String(f.name ?? '').trim().slice(0, 60);
  const email = String(f.email ?? '').trim().slice(0, 120);
  const text = String(f.text ?? '').replace(/\r\n/g, '\n').trim();
  const page = String(f.page ?? '/').slice(0, 200);
  const topic = TOPICS.has(f.topic) ? f.topic : 'general';
  const parent = /^a?\d{1,9}$/.test(String(f.parent ?? '')) ? String(f.parent) : null;

  if (!name) return json({ error: 'Please add your name.' }, 400);
  if (text.length < 3) return json({ error: 'Please write a comment.' }, 400);
  if (text.length > 5000) return json({ error: 'Please keep it under 5,000 characters.' }, 400);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'That email address doesn’t look right.' }, 400);
  if ((text.match(/https?:\/\//g) || []).length > 2) return json({ error: 'Please include no more than two links.' }, 400);

  const ip = request.headers.get('cf-connecting-ip') || '';
  // A test site key on the page means PUBLIC_TURNSTILE_SITEKEY wasn't there when the site was built.
  const spam = String(f.sitekey || '').startsWith('1x0000') && env.DEV_MODE !== '1' ? 'site-key-missing-at-build' : await turnstileCheck(env, f.turnstile, ip);
  if (spam) {
    console.log('[turnstile]', spam, 'sitekey on page:', String(f.sitekey || '').slice(0, 12));
    return json({ error: `The spam check didn’t go through. Please try again. (${spam})` }, 400);
  }

  const DB = await db(env);
  const ipHash = await sha256(ip + (env.TURNSTILE_SECRET || 'dev'));
  const recent = await DB.prepare(`SELECT COUNT(*) AS n FROM comments WHERE ip_hash = ? AND created > datetime('now', '-10 minutes')`).bind(ipHash).first();
  if (recent.n >= 5) return json({ error: 'You’ve posted a few comments in a row. Please wait a few minutes.' }, 429);

  const t = token();
  const created = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const row = await DB.prepare(
    `INSERT INTO comments (parent, page, topic, name, email, text, created, token, ip_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`
  ).bind(parent, page, topic, name, email || null, text, created, t, ipHash).first();

  const origin = new URL(request.url).origin;
  const link = `${origin}/api/moderate?id=${row.id}&t=${t}`;
  let context = '';
  if (parent) {
    const p = parent.startsWith('a') ? null : await DB.prepare('SELECT name, text FROM comments WHERE id = ?').bind(Number(parent)).first();
    context = p ? `<p style="color:#5B6A61;font-size:14px;margin:0 0 6px">In reply to ${esc(p.name)}: “${esc(p.text.slice(0, 160))}${p.text.length > 160 ? '…' : ''}”</p>`
      : `<p style="color:#5B6A61;font-size:14px;margin:0 0 6px">A reply to an older conversation in the Q&amp;A archive</p>`;
  }
  const sent = await sendEmail(env, {
    subject: `New comment from ${name} on Wordsology`,
    html: `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:16px;line-height:1.55;color:#14201A;max-width:560px">
<p style="margin:0 0 4px"><strong>${esc(name)}</strong>${email ? ` · ${esc(email)}` : ''}</p>
<p style="color:#5B6A61;font-size:14px;margin:0 0 12px">On <a href="${origin}${esc(page)}">${esc(page)}</a></p>
${context}
<div style="white-space:pre-line;background:#F6F7F4;border-radius:12px;padding:14px 16px;margin:0 0 18px">${esc(text)}</div>
<a href="${link}&do=approve" style="display:inline-block;background:#2F6B3F;color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:10px;margin:0 8px 8px 0">Approve</a>
<a href="${link}&do=reply" style="display:inline-block;background:#fff;color:#14201A;border:1px solid #CBD2C7;text-decoration:none;font-weight:700;padding:11px 21px;border-radius:10px;margin:0 8px 8px 0">Approve and reply</a>
<a href="${link}&do=delete" style="display:inline-block;background:#fff;color:#8A1C1C;border:1px solid #CBD2C7;text-decoration:none;font-weight:700;padding:11px 21px;border-radius:10px;margin:0 0 8px 0">Delete</a>
<p style="color:#5B6A61;font-size:13px;margin:12px 0 0">Nothing shows on the site until you approve it.</p></div>`,
  });

  const out = { ok: true };
  if (env.DEV_MODE === '1') { out.dev_link = link; out.emailed = sent; }
  return json(out);
}
