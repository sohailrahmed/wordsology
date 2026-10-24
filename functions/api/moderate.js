// The buttons in Sohail's "new comment" email land here.
// GET only shows a page with a button (email apps sometimes open links on their own);
// the actual approve / delete / reply happens on POST.
import { db, esc, same, page, token } from '../_lib.js';

async function load(env, url) {
  const id = Number(url.searchParams.get('id'));
  const t = url.searchParams.get('t') || '';
  if (!Number.isInteger(id) || id < 1) return null;
  const c = await (await db(env)).prepare('SELECT * FROM comments WHERE id = ?').bind(id).first();
  if (!c || !same(c.token, t)) return null;
  return c;
}

const card = (c) => `<div class="card"><p class="who">${esc(c.name)}${c.email ? ` <span class="meta">· ${esc(c.email)}</span>` : ''}</p>
<p class="meta">On <a href="${esc(c.page)}">${esc(c.page)}</a> · ${esc(c.created.slice(0, 10))} · ${c.status === 'approved' ? 'Approved' : 'Waiting for approval'}</p>
<div class="text">${esc(c.text)}</div></div>`;

const missing = () => page('Link expired', '<h1>This link doesn’t work anymore</h1><p>The comment may already have been deleted.</p>');

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const c = await load(env, url);
  if (!c) return missing();
  const action = url.searchParams.get('do');
  const hidden = `<input type="hidden" name="id" value="${c.id}"><input type="hidden" name="t" value="${esc(c.token)}">`;
  if (action === 'delete') {
    return page('Delete comment', `<h1>Delete this comment?</h1>${card(c)}
<form method="post"><input type="hidden" name="do" value="delete">${hidden}<div class="row"><button class="no">Delete it</button><a class="btn plain" href="?id=${c.id}&t=${esc(c.token)}&do=approve">Approve instead</a></div></form>`);
  }
  if (action === 'reply') {
    return page('Reply', `<h1>Approve and reply</h1>${card(c)}
<form method="post"><input type="hidden" name="do" value="reply">${hidden}
<label for="reply" class="note">Your reply shows under this comment as “Sohail (Wordsology), Site author”.</label>
<textarea id="reply" name="reply" required></textarea><div class="row"><button class="ok">Approve and post my reply</button></div></form>`);
  }
  return page('Approve comment', `<h1>Approve this comment?</h1>${card(c)}
<form method="post"><input type="hidden" name="do" value="approve">${hidden}<div class="row"><button class="ok">Approve</button><a class="btn plain" href="?id=${c.id}&t=${esc(c.token)}&do=reply">Approve and reply</a><a class="btn no" href="?id=${c.id}&t=${esc(c.token)}&do=delete">Delete</a></div></form>`);
}

export async function onRequestPost({ request, env }) {
  const form = await request.formData();
  const url = new URL(request.url);
  url.searchParams.set('id', form.get('id') || '');
  url.searchParams.set('t', form.get('t') || '');
  const c = await load(env, url);
  if (!c) return missing();
  const DB = await db(env);
  const action = form.get('do');

  if (action === 'delete') {
    await DB.prepare('DELETE FROM comments WHERE id = ?').bind(c.id).run();
    return page('Deleted', '<h1>Deleted</h1><div class="card done">That comment is gone for good.</div>');
  }

  await DB.prepare(`UPDATE comments SET status = 'approved' WHERE id = ?`).bind(c.id).run();
  let extra = '';
  const reply = String(form.get('reply') || '').replace(/\r\n/g, '\n').trim();
  if (action === 'reply' && reply) {
    const created = new Date().toISOString().replace('T', ' ').slice(0, 19);
    // Replies attach to the top of the conversation, like the archive.
    const thread = c.parent ?? String(c.id);
    await DB.prepare(
      `INSERT INTO comments (parent, page, topic, name, text, created, status, token, owner) VALUES (?, ?, ?, 'Sohail (Wordsology)', ?, ?, 'approved', ?, 1)`
    ).bind(thread, c.page, c.topic, reply.slice(0, 10000), created, token()).run();
    extra = ' Your reply is posted under it.';
  }
  const where = c.page.startsWith('/qa') ? '/qa/' : c.page;
  return page('Approved', `<h1>Approved</h1><div class="card done">It’s live on the site now.${extra}</div>${card({ ...c, status: 'approved' })}
<p><a class="btn plain" href="${esc(where)}">See it on the site</a></p>`);
}
