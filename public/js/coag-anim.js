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
                  8: [436, 158], 5: [570, 158], 3: [526, 252], 7: [500, 306], 13: [872, 84] };
  const P1 = row(ORDER, 66);
  const P2 = row([13, 12, 11, 10, 9, 8, 7, 5, 3, 2, 1], 76);
  const P3 = row([13, 12, 11, 9, 10, 8, 7, 5, 3, 2, 1], 76);
  const P4 = Object.assign(row([13, 12, 11, 9, 10, 8, 5, 3, 2, 1], 84), { 7: FINAL[7] });
  const P5 = Object.assign({}, FINAL, { 13: [60, 190] });
  const HELPERS = [3, 5, 8];

  // Each step: caption (Sohail's words), positions, and which marks are drawn.
  const steps = [
    { cap: 'Let’s draw the coagulation cascade. It’s as easy as 12, 11, 10, 9…', pos: null, pen: [470, 190] },
    { cap: 'Write out the factors from 13 to 1, backwards.', pos: P1, write: true, dur: 5600, pen: P1[1] },
    { cap: '4 and 6 don’t exist.', pos: P1, gone: [4, 6], erase: [4, 6], dur: 5600, pen: P1[6] },
    { cap: '10 is special, so it’s out of order.', pos: P3, gone: [4, 6], swap: true, dur: 5400, pen: P3[10] },
    { cap: '7 is lucky, so it’s below the others.', pos: P4, gone: [4, 6], lucky: true, dur: 6200, pen: FINAL[7] },
    { cap: '3, 5 and 8 are helpful mates (they help along particular steps of the pathway).', pos: P5, gone: [4, 6], helpers: true, pen: FINAL[5] },
    { cap: '13 is unlucky, so it’s excommunicated 2 the edge.', pos: FINAL, gone: [4, 6], helpers: true, marks: ['l13'], sad: true, dur: 9000, pen: FINAL[13] },
    { cap: 'Connect them: 12, 11, 9, 10, 2, 1 in a line, and 10 down to 7.', pos: FINAL, gone: [4, 6], helpers: true, marks: ['l13', 'lines'], pen: [750, 190] },
    { cap: 'The factors IN a straight line are part of the INTRINSIC pathway. The aPTT (which has more letters) monitors this pathway (which has more factors).', pos: FINAL, gone: [4, 6], helpers: true, marks: ['l13', 'lines', 'loop', 'tptt'], pen: [130, 96] },
    { cap: 'On the other hand, PT (which has fewer letters) monitors the Extrinsic pathway (which has fewer factors).', pos: FINAL, gone: [4, 6], helpers: true, marks: ['l13', 'lines', 'loop', 'tptt', 'ell', 'tpt'], pen: [560, 300] },
    { cap: 'Lack of 9 causes Hemophilia B. Lack of 8 causes Hemophilia A.', pos: FINAL, gone: [4, 6], helpers: true, marks: ['l13', 'lines', 'loop', 'tptt', 'ell', 'tpt', 'x9', 'x8', 'thb', 'tha'], pen: [440, 60] },
    { cap: '10 is a special number, so those factors surrounding it, 2, 7, 9 and 10, need vitamin K.', pos: FINAL, gone: [4, 6], helpers: true, marks: ['l13', 'lines', 'loop', 'tptt', 'ell', 'tpt', 'x9', 'x8', 'thb', 'tha', 'vk'], pen: [690, 262] },
  ];
  const ALLMARKS = ['l13', 'lines', 'loop', 'tptt', 'ell', 'tpt', 'x9', 'thb', 'x8', 'tha', 'vk'];
  let cur = 0, timer = null;
  // a pausable clock: everything timed in the animation runs off this, so Pause freezes it all
  let paused = false, pausedAt = 0, offset = 0, queue = [], qRAF = 0;
  const vnow = () => (paused ? pausedAt : performance.now()) - offset;
  const pump = () => {
    qRAF = 0;
    if (paused) return;
    const t = vnow();
    const due = queue.filter((j) => j.at <= t);
    queue = queue.filter((j) => j.at > t);
    due.forEach((j) => j.fn());
    if (queue.length) qRAF = requestAnimationFrame(pump);
  };
  function later(a, b) {
    const [fn, ms] = typeof a === 'function' ? [a, b] : [b, a];
    const job = { at: vnow() + ms, fn };
    queue.push(job);
    if (!qRAF && !paused) qRAF = requestAnimationFrame(pump);
    return job;
  }
  const cancel = (job) => { queue = queue.filter((j) => j !== job); };
  const anims = () => (root.getAnimations ? root.getAnimations({ subtree: true }) : []);
  function freeze() { if (paused) return; paused = true; pausedAt = performance.now(); anims().forEach((a) => a.pause()); }
  function thaw() {
    if (!paused) return;
    offset += performance.now() - pausedAt; paused = false;
    anims().forEach((a) => a.play());
    if (queue.length && !qRAF) qRAF = requestAnimationFrame(pump);
    if (penJobs) penRAF = requestAnimationFrame(penFrame);
  }

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

  let penRAF = 0, penJobs = null, penFrame = null;
  // move the pencil tip along each drawing job; glide between jobs with the tip lifted
  function runPen(n, jobs) {
    const pen = q('pencil');
    cancelAnimationFrame(penRAF);
    const t0 = vnow(), last = jobs[jobs.length - 1], end = last.t0 + last.dur;
    const put = ([x, y], lift = 0) => { pen.style.transform = `translate(${x + 14}px, ${y - 44 - lift}px)`; };
    pen.style.transition = 'opacity .25s';
    put(jobs[0].at(0), 30);
    penJobs = jobs;
    const frame = penFrame = () => {
      if (cur !== n || paused) return;
      const t = (vnow() - t0) / 1000;
      if (t >= jobs[0].t0 - 0.3) pen.style.opacity = 1;
      if (t > end + 0.3) { pen.style.opacity = 0; penJobs = null; return; }
      let i = jobs.findIndex((j) => t < j.t0 + j.dur);
      if (i < 0) put(last.at(1));
      else if (t >= jobs[i].t0) put(jobs[i].at((t - jobs[i].t0) / jobs[i].dur));
      else if (i === 0) put(jobs[0].at(0), 30 * Math.max(0, (jobs[0].t0 - t) / 0.3));
      else {
        const a = jobs[i - 1].at(1), b = jobs[i].at(0), g = jobs[i].t0 - (jobs[i - 1].t0 + jobs[i - 1].dur);
        const u = Math.min(1, (t - jobs[i - 1].t0 - jobs[i - 1].dur) / g);
        put([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u], 14 * Math.sin(u * Math.PI));
      }
      penRAF = requestAnimationFrame(frame);
    };
    penRAF = requestAnimationFrame(frame);
    steps[n]._dur = Math.max(steps[n].dur || 4200, (end + 1.4) * 1000);
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
      const erasing = anim && !reduce && (s.erase || []).includes(f);
      if (erasing) {
        // keep it visible, then rub it out slowly while the eraser scrubs
        const k = s.erase.indexOf(f);
        textIn(t, true, false);
        g.style.transition = 'none';
        g.style.opacity = 1;
        g.getBoundingClientRect();
        g.style.transition = `opacity 1.5s linear ${0.5 + k * 2.1}s`;
        g.style.opacity = 0;
      } else {
        g.style.opacity = visible ? 1 : 0;
      }
    });
    const jobs = [];
    let clock = s.sad ? 6.0 : 0.3;
    if (s.write && anim && !reduce) {
      // the pencil scribbles each number as it is written
      ORDER.forEach((f, idx) => {
        const [x, y] = P1[f], w = f > 9 ? 13 : 7;
        jobs.push({ t0: idx * 0.28, dur: 0.26, at: (u) => [x - w + 2 * w * u, y - 12 + 24 * Math.abs(Math.sin(u * Math.PI * 2))] });
      });
    }
    ALLMARKS.forEach((m) => {
      const el = q('m-' + m);
      const on = (s.marks || []).includes(m);
      const had = (steps[cur].marks || []).includes(m);
      const fresh = on && anim && !had && !reduce;
      if (!fresh) { if (el.tagName === 'text') textIn(el, on, false); else strokeIn(el, on, false); return; }
      if (el.tagName === 'text') {
        // the pencil writes the words left to right while they appear
        textIn(el, true, false);
        el.style.clipPath = 'inset(0 100% 0 0)';
        el.getBoundingClientRect();
        const bb = el.getBBox(), d = Math.max(0.8, bb.width / 160);
        el.style.transition = `clip-path ${d}s linear ${clock}s`;
        el.style.clipPath = 'inset(0 -5% 0 0)';
        jobs.push({ t0: clock, dur: d, at: (u) => [bb.x + bb.width * u, bb.y + bb.height * (0.55 + 0.3 * Math.sin(u * bb.width / 5))] });
        clock += d + 0.35;
      } else {
        // the pencil traces every stroke as it is drawn
        el.querySelectorAll('path').forEach((pth) => {
          const len = pth.getTotalLength(), d = Math.min(1.5, 0.3 + len / 420);
          pth.style.strokeDasharray = len;
          pth.style.transition = 'none';
          pth.style.strokeDashoffset = len;
          pth.getBoundingClientRect();
          pth.style.transition = `stroke-dashoffset ${d}s linear ${clock}s`;
          pth.style.strokeDashoffset = 0;
          jobs.push({ t0: clock, dur: d, at: (u) => { const pt = pth.getPointAtLength(len * u); return [pt.x, pt.y]; } });
          clock += d + 0.35;
        });
      }
    });
    // the pencil follows the writing
    const pen = q('pencil');
    pen.style.transition = anim && !reduce ? 'transform 0.8s ease' : 'none';
    pen.style.transform = `translate(${s.pen[0] + 14}px, ${s.pen[1] - 44}px)`;
    pen.classList.remove('flip');
    const hand = q('hand');
    hand.style.transition = 'none';
    hand.style.opacity = 0;
    pen.style.opacity = 0;
    if (jobs.length) runPen(n, jobs);
    else if (anim && !reduce && s.erase) {
      pen.style.transition = 'opacity .3s'; pen.style.opacity = 1;
      later(() => { if (cur === n) { pen.style.transition = 'opacity .5s'; pen.style.opacity = 0; } }, 4900);
    }
    if (s.swap && anim && !reduce) {
      // a hand pinches 10, lifts it over 9 and drops it out of order
      const g10 = q('n10'), g9 = q('n9');
      const at = (g, x, y, dur) => { g.style.transition = `transform ${dur}s cubic-bezier(.4,0,.3,1)`; g.style.transform = `translate(${x}px, ${y}px)`; };
      const handAt = (x, y, dur) => { hand.style.transition = `transform ${dur}s cubic-bezier(.4,0,.3,1), opacity .3s`; hand.style.transform = `translate(${x}px, ${y}px)`; };
      at(g10, P2[10][0], 190, 0.9); at(g9, P2[9][0], 190, 0.9);
      pen.style.opacity = 0;
      hand.classList.add('open');
      hand.style.transform = `translate(${P2[10][0]}px, -40px)`;
      const T = (ms, fn) => later(ms, () => { if (cur === n) fn(); });
      T(600, () => { hand.style.opacity = 1; handAt(P2[10][0], 168, 0.7); });
      T(1350, () => hand.classList.remove('open'));
      T(1650, () => { at(g10, P2[10][0], 140, 0.5); handAt(P2[10][0], 118, 0.5); });
      T(2150, () => { at(g9, P3[9][0], 190, 0.6); at(g10, P3[10][0], 140, 0.7); handAt(P3[10][0], 118, 0.7); });
      T(2950, () => { at(g10, P3[10][0], 190, 0.35); handAt(P3[10][0], 168, 0.35); });
      T(3350, () => hand.classList.add('open'));
      T(3650, () => { handAt(P3[10][0], -60, 0.7); });
      T(4300, () => { hand.style.opacity = 0; });
    }
    // reset 7's face
    const g7 = q('n7');
    g7.classList.remove('happy', 'say1', 'say2', 'bounce');
    const g13 = q('n13');
    g13.classList.remove('happy', 'say1', 'droop');
    if (s.sad && anim && !reduce) {
      // 13 trudges off to the edge with a sad face
      pen.style.opacity = 0;
      const T = (ms, fn) => later(() => { if (cur === n) fn(); }, ms);
      g13.style.transition = 'none';
      g13.style.transform = `translate(${P5[13][0]}px, 190px)`;
      T(200, () => g13.classList.add('happy', 'droop'));
      const [x1, y1] = FINAL[13], x0 = P5[13][0];
      const stepsN = 6;
      for (let h = 1; h <= stepsN; h++) {
        const fx = x0 + (x1 - x0) * h / stepsN, fy = 190 + (y1 - 190) * h / stepsN;
        T(500 + h * 380, () => { g13.style.transition = 'transform .38s linear'; g13.style.transform = `translate(${fx}px, ${fy + (h % 2 ? -6 : 0)}px)`; });
      }
      T(3000, () => g13.classList.add('say1'));
      T(5600, () => g13.classList.remove('say1', 'droop'));
      T(5900, () => g13.classList.remove('happy'));
    }
    if (s.lucky && anim && !reduce) {
      // 7 runs down on its own, gets a smiley face and cheers for itself
      pen.style.opacity = 0;
      const [x0] = P3[7], [x1, y1] = FINAL[7];
      const hops = 4;
      g7.style.transition = 'none';
      g7.style.transform = `translate(${x0}px, 190px)`;
      const T = (ms, fn) => later(() => { if (cur === n) fn(); }, ms);
      for (let h = 1; h <= hops; h++) {
        const fx = x0 + (x1 - x0) * h / hops, fy = 190 + (y1 - 190) * h / hops;
        T(150 + (h - 1) * 300, () => { g7.style.transition = 'transform .15s ease-out'; g7.style.transform = `translate(${fx - (x1 - x0) / hops / 2}px, ${fy - 34}px)`; });
        T(300 + (h - 1) * 300, () => { g7.style.transition = 'transform .15s ease-in'; g7.style.transform = `translate(${fx}px, ${fy}px)`; });
      }
      T(1500, () => g7.classList.add('happy'));
      T(1900, () => g7.classList.add('say1', 'bounce'));
      T(3100, () => { g7.classList.remove('say1'); g7.classList.add('say2'); });
      T(4400, () => g7.classList.remove('say2', 'bounce'));
      T(4700, () => g7.classList.remove('happy'));
    }
    if (s.erase && anim && !reduce) {
      pen.classList.add('flip');
      const moves = [];
      s.erase.forEach((f, k) => {
        const [x, y] = P1[f];
        const base = 0.5 + k * 2.1;
        for (let j = 0; j < 8; j++) moves.push([base * 1000 + j * 190, x + (j % 2 ? 12 : -12), y + (j % 3) * 4 - 4]);
      });
      moves.forEach(([ms, x, y]) => later(() => {
        if (cur !== n) return;
        pen.style.transition = 'transform 0.18s ease';
        pen.style.transform = `translate(${x + 14}px, ${y - 44}px)`;
      }, ms));
      later(() => { if (cur === n) pen.classList.remove('flip'); }, 4700);
    }
    cap.textContent = s.cap;
    stepN.textContent = `Step ${n + 1} of ${steps.length}`;
    prev.disabled = n === 0;
    next.disabled = n === steps.length - 1;
    cur = n;
  }

  function stop() { if (timer) cancel(timer); timer = null; thaw(); play.textContent = '▶ Play'; play.setAttribute('aria-pressed', 'false'); }
  prev.addEventListener('click', () => { stop(); show(Math.max(0, cur - 1), false); });
  next.addEventListener('click', () => { stop(); show(Math.min(steps.length - 1, cur + 1), true); });
  play.addEventListener('click', () => {
    if (timer && !paused) { freeze(); play.textContent = '▶ Play'; play.setAttribute('aria-pressed', 'false'); return; }
    play.textContent = '❚❚ Pause'; play.setAttribute('aria-pressed', 'true');
    if (timer && paused) { thaw(); return; }
    if (cur === steps.length - 1) show(0, false);
    const tick = () => {
      if (cur >= steps.length - 1) return stop();
      show(cur + 1, true);
      timer = later(tick, steps[cur]._dur || steps[cur].dur || 4200);
    };
    tick();
  });
  show(0, false);
})();
