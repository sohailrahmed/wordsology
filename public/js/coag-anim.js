// "Watch me write it out": the coagulation cascade drawn step by step, following Sohail's instructions.
(function () {
  const root = document.getElementById('coag-anim');
  if (!root) return;
  const svg = root.querySelector('svg');
  const cap = root.querySelector('.ca-cap');
  const stepN = root.querySelector('.ca-step');
  const prev = root.querySelector('[data-ca="prev"]');
  const next = root.querySelector('[data-ca="next"]');
  const play = root.querySelector('[data-ca="play"]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const q = (id) => svg.querySelector('#' + id);

  const ORDER = [13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  const row = (list, gap, x0 = 70) => Object.fromEntries(list.map((n, i) => [n, [x0 + gap * i, 190]]));
  const FINAL = { 12: [150, 190], 11: [262, 190], 9: [372, 190], 10: [500, 190], 2: [640, 190], 1: [750, 190],
                  8: [436, 128], 5: [570, 128], 3: [526, 252], 7: [500, 306], 13: [872, 84] };
  const P1 = row(ORDER, 66);
  const P3 = row([13, 12, 11, 9, 10, 8, 7, 5, 3, 2, 1], 76);
  const P4 = Object.assign(row([13, 12, 11, 9, 10, 8, 5, 3, 2, 1], 84), { 7: FINAL[7] });
  const P5 = Object.assign({}, FINAL, { 13: [60, 190] });
  const HELPERS = [3, 5, 8];

  // Each step: caption (Sohail's words), positions, and which marks are drawn.
  const steps = [
    { cap: 'Let’s draw the coagulation cascade. It’s as easy as 12, 11, 10, 9…', pos: null, pen: [470, 190] },
    { cap: 'Write out the factors from 13 to 1, backwards.', pos: P1, write: true, pen: P1[1] },
    { cap: '4 and 6 don’t exist.', pos: P1, marks: ['x4', 'x6'], pen: P1[4] },
    { cap: '10 is special, so it’s out of order.', pos: P3, gone: [4, 6], pen: P3[10] },
    { cap: '7 is lucky, so it’s below the others.', pos: P4, gone: [4, 6], pen: FINAL[7] },
    { cap: '3, 5 and 8 are helpful mates (they help along particular steps of the pathway).', pos: P5, gone: [4, 6], helpers: true, pen: FINAL[5] },
    { cap: '13 is unlucky, so it’s not related “2” anything.', pos: FINAL, gone: [4, 6], helpers: true, marks: ['l13'], pen: FINAL[13] },
    { cap: 'Connect them: 12, 11, 9, 10, 2, 1 in a line, and 10 down to 7.', pos: FINAL, gone: [4, 6], helpers: true, marks: ['l13', 'lines'], pen: [750, 190] },
    { cap: 'The factors IN a straight line are part of the INTRINSIC pathway. The aPTT (which has more letters) monitors this pathway (which has more factors).', pos: FINAL, gone: [4, 6], helpers: true, marks: ['l13', 'lines', 'loop', 'tptt'], pen: [130, 96] },
    { cap: 'On the other hand, PT (which has fewer letters) monitors the Extrinsic pathway (which has fewer factors).', pos: FINAL, gone: [4, 6], helpers: true, marks: ['l13', 'lines', 'loop', 'tptt', 'ell', 'tpt'], pen: [560, 300] },
    { cap: 'Lack of 9 causes Hemophilia B. Lack of 8 causes Hemophilia A.', pos: FINAL, gone: [4, 6], helpers: true, marks: ['l13', 'lines', 'loop', 'tptt', 'ell', 'tpt', 'x9', 'x8', 'thb', 'tha'], pen: [440, 60] },
    { cap: '10 is a special number, so those factors surrounding it, 2, 7, 9 and 10, need vitamin K.', pos: FINAL, gone: [4, 6], helpers: true, marks: ['l13', 'lines', 'loop', 'tptt', 'ell', 'tpt', 'x9', 'x8', 'thb', 'tha', 'vk'], pen: [690, 262] },
  ];
  const ALLMARKS = ['x4', 'x6', 'l13', 'lines', 'loop', 'tptt', 'ell', 'tpt', 'x9', 'x8', 'thb', 'tha', 'vk'];
  let cur = 0, timer = null;

  function strokeIn(el, on, animate, delay = 0) {
    el.querySelectorAll('path').forEach((p, k) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = len;
      p.style.transition = 'none';
      if (!on) { p.style.strokeDashoffset = len; return; }
      if (!animate || reduce) { p.style.strokeDashoffset = 0; return; }
      p.style.strokeDashoffset = len;
      p.getBoundingClientRect();
      p.style.transition = `stroke-dashoffset ${Math.min(1.4, 0.35 + len / 900)}s ease ${delay + k * 0.25}s`;
      p.style.strokeDashoffset = 0;
    });
  }
  function textIn(el, on, animate, delay = 0) {
    el.style.transition = 'none';
    if (!on) { el.style.clipPath = 'inset(0 100% 0 0)'; el.style.opacity = 0; return; }
    el.style.opacity = 1;
    if (!animate || reduce) { el.style.clipPath = 'inset(0 0 0 0)'; return; }
    el.style.clipPath = 'inset(0 100% 0 0)';
    el.getBoundingClientRect();
    el.style.transition = `clip-path 0.5s ease ${delay}s`;
    el.style.clipPath = 'inset(0 -5% 0 0)';
  }

  function show(n, animate) {
    const s = steps[n];
    const forward = n === cur + 1;
    const anim = animate && forward;
    ORDER.forEach((f, idx) => {
      const g = q('n' + f), t = g.querySelector('text');
      const visible = !!s.pos && !(s.gone || []).includes(f) && s.pos[f];
      const [x, y] = (s.pos && s.pos[f]) || P1[f];
      g.style.transition = anim && !reduce ? 'transform 0.9s cubic-bezier(.5,.1,.3,1)' : 'none';
      const scale = s.helpers && HELPERS.includes(f) ? 0.8 : 1;
      g.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
      if (s.write && anim) textIn(t, true, true, idx * 0.28);
      else textIn(t, visible, false);
      g.style.opacity = visible ? 1 : 0;
      if ((s.gone || []).includes(f) && anim) { g.style.transition = 'opacity .5s'; }
    });
    ALLMARKS.forEach((m) => {
      const el = q('m-' + m);
      const on = (s.marks || []).includes(m);
      const had = (steps[cur].marks || []).includes(m);
      if (el.tagName === 'text') textIn(el, on, anim && !had, 0.3);
      else strokeIn(el, on, anim && !had);
    });
    // the pencil follows the writing
    const pen = q('pencil');
    pen.style.transition = anim && !reduce ? 'transform 0.8s ease' : 'none';
    pen.style.transform = `translate(${s.pen[0] + 14}px, ${s.pen[1] - 44}px)`;
    if (s.write && anim && !reduce) {
      ORDER.forEach((f, idx) => setTimeout(() => {
        if (cur !== n) return;
        pen.style.transition = 'transform 0.25s ease';
        pen.style.transform = `translate(${P1[f][0] + 14}px, ${P1[f][1] - 44}px)`;
      }, idx * 280));
    }
    cap.textContent = s.cap;
    stepN.textContent = `Step ${n + 1} of ${steps.length}`;
    prev.disabled = n === 0;
    next.disabled = n === steps.length - 1;
    cur = n;
  }

  function stop() { clearInterval(timer); timer = null; play.textContent = '▶ Play'; play.setAttribute('aria-pressed', 'false'); }
  prev.addEventListener('click', () => { stop(); show(Math.max(0, cur - 1), false); });
  next.addEventListener('click', () => { stop(); show(Math.min(steps.length - 1, cur + 1), true); });
  play.addEventListener('click', () => {
    if (timer) return stop();
    if (cur === steps.length - 1) show(0, false);
    play.textContent = '❚❚ Pause'; play.setAttribute('aria-pressed', 'true');
    const tick = () => { if (cur >= steps.length - 1) return stop(); show(cur + 1, true); };
    tick();
    timer = setInterval(tick, 5200);
  });
  show(0, false);
})();
