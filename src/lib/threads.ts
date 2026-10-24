// Client-side rendering shared by the Q&A page and the comments under each page.
export type Post = { id: number | string; a: string; d: string; t: string; s?: number; p?: string | null; page?: string; topic?: string };
export type Thread = Post & { topic: string; r?: Post[]; ans?: number; win?: number; isNew?: boolean };

export const fmt = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export function fill(el: HTMLElement, text: string) {
  // Plain text only: paragraphs from blank lines, line breaks kept.
  el.replaceChildren(...text.split(/\n\s*\n/).map((para) => {
    const p = document.createElement('p');
    p.textContent = para;
    return p;
  }));
}

export function post(c: Post, isReply: boolean) {
  const wrap = document.createElement(isReply ? 'li' : 'div');
  wrap.className = isReply ? 'reply' + (c.s ? ' reply-sohail' : '') : 'post';
  const who = document.createElement('p');
  who.className = 'who';
  who.textContent = c.s ? 'Sohail (Wordsology)' : c.a;
  if (c.s) { const b = document.createElement('span'); b.className = 'badge-sohail'; b.textContent = 'Site author'; who.append(' ', b); }
  if (isReply) { const t = document.createElement('time'); t.textContent = fmt(c.d); who.append(' · ', t); }
  const text = document.createElement('div');
  text.className = 'text';
  fill(text, c.t);
  wrap.append(who, text);
  return wrap;
}

// Turn the flat list from /api/comments into new threads, plus replies to archive threads.
export function group(rows: Post[]) {
  const threads = new Map<string, Thread>();
  const archiveReplies = new Map<string, Post[]>();
  for (const c of rows) if (!c.p) threads.set(String(c.id), { ...c, topic: c.topic || 'general', r: [], isNew: true });
  for (const c of rows) {
    if (!c.p) continue;
    if (c.p.startsWith('a')) {
      const k = c.p.slice(1);
      archiveReplies.set(k, [...(archiveReplies.get(k) || []), c]);
    } else threads.get(c.p)?.r!.push(c);
  }
  for (const th of threads.values()) th.ans = th.r!.some((r) => r.s) ? 1 : 0;
  return { threads: [...threads.values()].reverse(), archiveReplies };
}

// Add a "Reply" button that opens a reply form (cloned from #tpl-reply) under the thread.
export function replyButton(li: HTMLElement, parent: string, topic: string) {
  const tpl = document.getElementById('tpl-reply') as HTMLTemplateElement | null;
  if (!tpl) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'reply-btn';
  btn.textContent = 'Reply';
  btn.addEventListener('click', () => {
    const open = li.querySelector('form.cform');
    if (open) { open.remove(); btn.setAttribute('aria-expanded', 'false'); return; }
    const form = tpl.content.firstElementChild!.cloneNode(true) as HTMLFormElement;
    form.dataset.parent = parent;
    form.dataset.topic = topic;
    form.querySelectorAll('[id]').forEach((el) => { el.id = el.id + '-' + parent; });
    btn.after(form);
    btn.setAttribute('aria-expanded', 'true');
    (window as any).wsComments?.mount(form);
    (form.querySelector('textarea') as HTMLTextAreaElement).focus();
  });
  li.append(btn);
}
