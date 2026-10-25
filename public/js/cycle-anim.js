// The 28-day menstrual cycle as a scrubbable timeline, with a "pregnant" switch.
// Hormone curves match the shapes on Sohail's estrogen chart; captions use the chart's wording.
AnimKit.mount('cycle-anim', '/anim/cycle.svg', (root) => {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = root.querySelector('svg');
  const q = (id) => svg.querySelector('#' + id);
  const cap = root.querySelector('.ca-cap');
  const slider = root.querySelector('.cy-slider');
  const prev = root.querySelector('[data-ca="prev"]'), next = root.querySelector('[data-ca="next"]'), play = root.querySelector('[data-ca="play"]');
  const modeBtns = [...root.querySelectorAll('[data-preg]')];
  const clock = AnimKit.Clock(root);
  const snd = AnimKit.Sound(root.querySelector('[data-ca="sound"]'), clock);
  const reduce = AnimKit.reduce;

  // ----- hormone levels by day (t = 1..28) -----
  const g = (d, m, s, a) => a * Math.exp(-(((d - m) / s) ** 2));
  const H = {
    LH: (d) => 0.12 + g(d, 14, 1.1, 0.78),
    FSH: (d) => 0.16 + g(d, 14, 1.3, 0.36) + g(d, 3, 4, 0.06),
    E: (d, p) => (p && d > 21 ? 0.34 + (d - 21) * 0.02 : 0.10 + g(d, 12.5, 2.4, 0.42) + g(d, 21, 3.5, 0.24)),
    P: (d, p) => (p && d > 21 ? 0.55 + (d - 21) * 0.012 : 0.05 + g(d, 21, 3.2, 0.5)),
    HCG: (d, p) => (p && d > 21.5 ? Math.min(0.62, ((d - 21.5) ** 2) * 0.016) : 0),
  };
  const COLORS = { LH: '#7C3AED', FSH: '#0E7490', E: '#DC2626', P: '#1D4ED8', HCG: '#16A34A' };
  const NAMES = { LH: 'LH', FSH: 'FSH', E: 'Estrogen', P: 'Progesterone', HCG: 'HCG' };
  const X = (t) => 60 + ((t - 1) / 27) * 500;
  const Y = (v) => 250 - v * 205;

  // ticks and legend
  [1, 7, 14, 21, 28].forEach((d) => {
    const tx = document.createElementNS(NS, 'text');
    tx.setAttribute('x', X(d)); tx.setAttribute('y', 302); tx.setAttribute('class', 'sm'); tx.style.fontSize = '14px';
    tx.textContent = d; q('cy-ticks').appendChild(tx);
  });
  const legend = q('cy-legend');
  Object.keys(NAMES).forEach((k, i) => {
    const gr = document.createElementNS(NS, 'g'); gr.setAttribute('id', 'lg-' + k);
    gr.innerHTML = `<rect x="${70 + i * 96}" y="8" width="14" height="5" rx="2" fill="${COLORS[k]}"/><text x="${88 + i * 96}" y="16" class="sm" style="text-anchor:start;font-size:15px;font-weight:700;fill:${COLORS[k]}">${NAMES[k]}</text>`;
    legend.appendChild(gr);
  });
  function curves(preg) {
    const box = q('cy-curves'); box.textContent = '';
    Object.keys(H).forEach((k) => {
      if (k === 'HCG' && !preg) return;
      const pts = [];
      for (let t = 1; t <= 28.001; t += 0.2) pts.push(`${X(t).toFixed(1)},${Y(H[k](t, preg)).toFixed(1)}`);
      const pl = document.createElementNS(NS, 'polyline');
      pl.setAttribute('points', pts.join(' ')); pl.setAttribute('fill', 'none');
      pl.setAttribute('stroke', COLORS[k]); pl.setAttribute('stroke-width', k === 'HCG' ? 4 : 3);
      if (k === 'FSH') pl.setAttribute('stroke-dasharray', '7 5');
      if (k === 'P') pl.setAttribute('stroke-dasharray', '2 5');
      if (k === 'P') pl.setAttribute('stroke-linecap', 'round');
      box.appendChild(pl);
    });
    q('lg-HCG').style.opacity = preg ? 1 : 0;
  }

  // ----- what the student reads on each day -----
  function caption(d, preg) {
    if (d < 6) return 'Days 1–5: <b>menstruation</b>. The CL from last cycle degenerated, estrogen &amp; progesterone fell, and the thickened endometrium is shed.';
    if (d < 11.5) return '<b>FSH</b> causes growth of ovarian follicles and estrogen release from the ovaries. Estrogen rebuilds the endometrium.';
    if (d < 13.5) return 'The estrogen prompts a <b>surge of LH</b> release.';
    if (d < 15) return '<b>OVULATION</b>, prompted by that LH surge: the follicle ruptures, releasing the egg. FSH &amp; LH peak at the middle of the menstrual cycle.';
    if (d < 18.5) return 'The ruptured follicle remains in the ovary, becoming a <b>corpus luteum (CL)</b>. The egg makes its way through the fallopian tube. The CL produces <b>progesterone</b>.';
    if (d < 21.5 || (!preg && d < 24.5)) return 'High estrogen + high progesterone <b>suppress FSH &amp; LH</b>. Progesterone thickens the endometrium, getting it ready to accommodate a possibly fertilized egg.';
    if (!preg) return 'No implantation, so <b>HCG is NOT produced</b>. The CL degenerates, estrogen &amp; progesterone decrease, and menstruation occurs (back to day 1).';
    if (d < 25) return '<b>Implantation!</b> The trophoblast (the developing placenta) begins producing <b>HCG</b>.';
    return '<b>HCG maintains the CL</b>, so progesterone stays high and the lining isn’t shed: no period. HCG is highest early in pregnancy (peaking at 8–10 weeks), which is why it’s measured to detect pregnancy.';
  }

  // ----- draw a given day -----
  let day = 1, preg = false, flowsOn = '';
  const flows = AnimKit.Flows(svg, clock);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, u) => a + (b - a) * clamp(u, 0, 1);
  const tube = q('cy-tube'), tubeLen = tube.getTotalLength();
  const drops = q('cy-drops');
  for (let i = 0; i < 6; i++) { const c = document.createElementNS(NS, 'circle'); c.setAttribute('r', 5); c.setAttribute('fill', '#DC2626'); drops.appendChild(c); }

  function render(t) {
    day = t;
    const d = t;
    q('cy-clip').setAttribute('width', X(d) - 40);
    q('cy-cursor').setAttribute('x1', X(d)); q('cy-cursor').setAttribute('x2', X(d));
    q('cy-day').textContent = `Day ${Math.floor(d)}`;
    // ovary: follicle grows, ruptures, becomes CL
    const fol = q('cy-fol-c'), rupt = q('cy-rupt'), cl = q('cy-cl'), egg = q('cy-egg');
    let lbl = '';
    if (d < 14) {
      fol.setAttribute('r', lerp(9, 40, (d - 1) / 12.5)); fol.style.opacity = 1; rupt.style.opacity = 0; cl.setAttribute('r', 0);
      lbl = d < 6 ? '' : 'growing follicle';
    } else if (d < 15) {
      fol.style.opacity = 0;
      const r = 40, a = 0.6;
      rupt.setAttribute('d', `M770 160 L${770 + r * Math.cos(a)} ${160 + r * Math.sin(a)} A${r} ${r} 0 1 1 ${770 + r * Math.cos(a)} ${160 - r * Math.sin(a)} Z`);
      rupt.setAttribute('transform', 'rotate(65 770 160)'); rupt.style.opacity = 1; cl.setAttribute('r', 0); lbl = 'ovulation!';
    } else {
      fol.style.opacity = 0; rupt.style.opacity = lerp(1, 0, (d - 15) / 1.2);
      const dying = !preg && d > 24;
      cl.setAttribute('r', dying ? lerp(30, 12, (d - 24) / 4) : lerp(20, preg && d > 22 ? 36 : 30, (d - 15) / 4));
      cl.setAttribute('fill', dying ? (d > 26 ? '#F5F5F4' : '#FDE68A') : '#FACC15');
      lbl = dying ? 'CL degenerates' : 'corpus luteum (CL)';
    }
    q('cy-ovlbl').textContent = lbl;
    // egg
    if (d < 14) { egg.setAttribute('cx', 770); egg.setAttribute('cy', 160); egg.style.opacity = d < 6 ? 0 : 1; egg.setAttribute('r', lerp(3, 6, (d - 6) / 7)); }
    else {
      const u = clamp((d - 14) / (preg ? 7 : 5), 0, 1);
      const p = tube.getPointAtLength(u * tubeLen);
      egg.setAttribute('cx', p.x); egg.setAttribute('cy', p.y); egg.setAttribute('r', 6);
      egg.style.opacity = preg ? (d < 21 ? 1 : 0) : clamp((19.5 - d) / 1.5, 0, 1);
    }
    // embryo implants (pregnant)
    const emb = q('cy-embryo');
    emb.setAttribute('r', preg && d >= 21 ? lerp(6, 11, (d - 21) / 6) : 0);
    q('cy-emblbl').textContent = preg && d >= 21 ? 'implanted' : '';
    // endometrium thickness
    let th;
    if (d < 6) th = lerp(70, 14, (d - 1) / 4.5);
    else if (d < 14) th = lerp(14, 44, (d - 6) / 8);
    else if (d < 23) th = lerp(44, 78, (d - 14) / 9);
    else th = preg ? 80 : lerp(78, 72, (d - 23) / 5);
    const lin = q('cy-lining'); lin.setAttribute('y', 440 - th); lin.setAttribute('height', th + 2);
    // menstrual drops
    [...drops.children].forEach((c, i) => {
      const on = d < 5.6;
      const ph = ((d * 2.2 + i * 0.37) % 1);
      c.setAttribute('cx', 90 + i * 70); c.setAttribute('cy', 478 + ph * 50);
      c.style.opacity = on ? 1 - ph : 0;
    });
    // pituitary signals
    q('cy-plus').style.opacity = d >= 11 && d < 14.5 ? 1 : 0;
    q('cy-stop').style.opacity = d >= 18.5 && (preg || d < 25.5) ? 1 : 0;
    const key = `${Math.round(H.FSH(d) * 6)}|${Math.round(H.LH(d) * 6)}|${preg && d > 22 ? 1 : 0}`;
    if (key !== flowsOn) {
      flowsOn = key;
      const sup = d >= 18.5 && (preg || d < 25.5);
      flows.set([
        { path: 'cy-p-gnrh', rate: sup ? 0.3 : 1, color: '#0F766E', speed: 50 },
        { path: 'cy-p-fsh', rate: H.FSH(d) * 5, color: '#0E7490', speed: 60 },
        { path: 'cy-p-lh', rate: H.LH(d) * 5, color: '#7C3AED', speed: 60 },
        { path: 'cy-hcgpath', rate: preg && d > 22 ? 2 : 0, color: '#16A34A', r: 6, speed: 110 },
      ]);
    }
    cap.innerHTML = caption(d, preg);
    slider.value = d;
  }

  // ----- playing through the month -----
  const KEYS = [1, 8, 12.5, 14, 16.5, 20, 22.5, 26.5, 28];
  let playing = false, stopTick = null, last = 0, crossed = new Set();
  function speedAt(d) { return d > 11.5 && d < 15 ? 0.55 : d > 20.5 && d < 23 ? 0.8 : 1.3; } // days per second, slower at the big moments
  function cues(a, b) {
    const hit = (x) => a < x && b >= x;
    if (hit(14)) snd.S.pop();
    if (hit(11.6)) snd.S.blip(1.3);
    if (hit(18.6)) snd.S.thud();
    if (preg && hit(21)) snd.S.cheer();
    if (hit(1.2)) snd.S.splash();
  }
  function stop() {
    if (stopTick) stopTick(); stopTick = null; playing = false; clock.resume();
    play.textContent = '▶ Play'; play.setAttribute('aria-pressed', 'false');
  }
  function start() {
    playing = true; last = clock.now();
    play.textContent = '❚❚ Pause'; play.setAttribute('aria-pressed', 'true');
    if (day >= 28) render(1);
    stopTick = clock.tick((now) => {
      const dt = (now - last) / 1000; last = now;
      const nd = Math.min(28, day + dt * speedAt(day));
      cues(day, nd);
      render(nd);
      if (nd >= 28) stop();
    });
  }
  play.addEventListener('click', () => {
    if (playing && !clock.paused) { clock.pause(); play.textContent = '▶ Play'; play.setAttribute('aria-pressed', 'false'); return; }
    if (playing && clock.paused) { last = clock.now(); clock.resume(); play.textContent = '❚❚ Pause'; play.setAttribute('aria-pressed', 'true'); return; }
    start();
  });
  const jump = (dir) => {
    stop();
    const k = dir > 0 ? KEYS.find((x) => x > day + 0.05) : [...KEYS].reverse().find((x) => x < day - 0.05);
    if (k !== undefined) { cues(day, k); render(k); }
  };
  [prev, next, play, ...modeBtns].forEach((btn) => btn.addEventListener('pointerdown', snd.unlock));
  prev.addEventListener('click', () => jump(-1));
  next.addEventListener('click', () => jump(1));
  slider.addEventListener('input', () => { stop(); render(+slider.value); });
  modeBtns.forEach((b) => b.addEventListener('click', () => {
    preg = b.dataset.preg === '1';
    modeBtns.forEach((x) => x.classList.toggle('active', x === b));
    curves(preg); flowsOn = ''; render(day);
    if (preg && day < 21) { /* nudge students to watch it happen */ }
  }));
  curves(false); render(1);
  if (reduce) play.disabled = true;
});
