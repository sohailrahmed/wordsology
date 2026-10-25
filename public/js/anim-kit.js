// Shared toolkit for Wordsology's step-through chart animations (endocrinology and later ones).
// Gives each animation: a pausable clock, synthesized sound effects with an on/off button,
// a Back / Play / Next stepper with captions, "jump" chips for scenarios, and hormone
// "messenger" dots that flow along arrows (more dots per second = higher hormone level).
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';

  // ---------- pausable clock ----------
  function Clock(root) {
    let paused = false, pausedAt = 0, offset = 0, queue = [], raf = 0;
    const tickers = new Set(), onPause = [];
    const now = () => (paused ? pausedAt : performance.now()) - offset;
    const anims = () => (root.getAnimations ? root.getAnimations({ subtree: true }) : []);
    function loop() {
      raf = 0;
      if (paused) return;
      const t = now();
      const due = queue.filter((j) => j.at <= t);
      queue = queue.filter((j) => j.at > t);
      due.forEach((j) => j.fn());
      tickers.forEach((f) => f(t));
      if (queue.length || tickers.size) raf = requestAnimationFrame(loop);
    }
    const kick = () => { if (!raf && !paused) raf = requestAnimationFrame(loop); };
    return {
      now,
      later(ms, fn) { const j = { at: now() + ms, fn }; queue.push(j); kick(); return j; },
      cancel(j) { queue = queue.filter((x) => x !== j); },
      clear() { queue = []; },
      tick(f) { tickers.add(f); kick(); return () => tickers.delete(f); },
      get paused() { return paused; },
      pause() { if (paused) return; paused = true; pausedAt = performance.now(); anims().forEach((a) => a.pause()); onPause.forEach((f) => f(true)); },
      resume() { if (!paused) return; offset += performance.now() - pausedAt; paused = false; anims().forEach((a) => a.play()); onPause.forEach((f) => f(false)); kick(); },
      onPause(f) { onPause.push(f); },
    };
  }

  // ---------- sound (Web Audio, no files) ----------
  function Sound(btn, clock) {
    let on = true;
    try { on = localStorage.getItem('wsSound') !== 'off'; } catch (e) { /* storage blocked */ }
    let ac = null, master = null, noiseBuf = null, live = [];
    function ctx() {
      if (!on) return null;
      if (!ac) {
        const C = window.AudioContext || window.webkitAudioContext;
        if (!C) return null;
        ac = new C(); master = ac.createGain(); master.gain.value = 0.5; master.connect(ac.destination);
        const len = ac.sampleRate; noiseBuf = ac.createBuffer(1, len, ac.sampleRate);
        const d = noiseBuf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      }
      if (ac.state === 'suspended' && !clock.paused) ac.resume();
      return ac;
    }
    const keep = (n) => { live.push(n); return n; };
    function hush() { live.forEach((n) => { try { n.stop(); } catch (e) { /* done */ } }); live = []; }
    function tone(type, f0, f1, dur, vol, at = 0) {
      const a = ctx(); if (!a) return; const t = a.currentTime + at;
      const o = keep(a.createOscillator()); o.type = type;
      o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
      const g = a.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(master); o.start(t); o.stop(t + dur + 0.02);
    }
    function noise(dur, freq, q, vol, at = 0) {
      const a = ctx(); if (!a) return; const t = a.currentTime + at;
      const n = keep(a.createBufferSource()); n.buffer = noiseBuf; n.loop = true;
      const bp = a.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = q;
      const g = a.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      n.connect(bp).connect(g).connect(master); n.start(t); n.stop(t + dur + 0.02);
    }
    const S = {
      pop() { tone('sine', 900, 320, 0.09, 0.22); },
      ding() { tone('sine', 1320, 1300, 0.5, 0.18); tone('sine', 1980, 1960, 0.35, 0.06); },
      boing() { tone('sine', 260, 640, 0.16, 0.25); },
      blip(up = 1) { tone('triangle', 620 * up, 640 * up, 0.08, 0.12); },
      cheer() { [523, 659, 784, 1047].forEach((f, i) => tone('triangle', f, f * 1.02, 0.13, 0.16, i * 0.08)); },
      uhoh() { tone('triangle', 520, 500, 0.16, 0.18); tone('triangle', 392, 380, 0.28, 0.18, 0.18); },
      wah() { [392, 370, 349, 330].forEach((f, i) => tone('sawtooth', f, f * 0.98, i === 3 ? 0.9 : 0.42, 0.07, i * 0.47)); },
      whoosh() { noise(0.45, 900, 0.7, 0.25); },
      snip() { noise(0.06, 4200, 2, 0.35); noise(0.06, 3600, 2, 0.3, 0.09); },
      thud() { tone('sine', 110, 55, 0.14, 0.32); },
      alarm() { [0, 0.22, 0.44].forEach((d) => tone('square', 880, 860, 0.14, 0.05, d)); },
      splash() { noise(0.35, 700, 0.5, 0.3); tone('sine', 500, 200, 0.2, 0.08); },
    };
    function paint() { if (btn) { btn.textContent = on ? '🔊 Sound on' : '🔇 Sound off'; btn.setAttribute('aria-pressed', String(on)); } }
    if (btn) btn.addEventListener('click', () => {
      on = !on; if (!on) hush(); else ctx();
      try { localStorage.setItem('wsSound', on ? 'on' : 'off'); } catch (e) { /* storage blocked */ }
      paint();
    });
    paint();
    clock.onPause((p) => { if (ac) { if (p) ac.suspend(); else if (on) ac.resume(); } });
    // phones only allow sound to start during a tap: call this from a button's pointerdown
    function unlock() {
      const a = ctx(); if (!a) return;
      if (a.state === 'suspended') a.resume();
      const b = a.createBuffer(1, 1, 22050), src = a.createBufferSource();
      src.buffer = b; src.connect(a.destination); src.start(0);
    }
    return { S, hush, unlock };
  }

  // ---------- hormone messenger flows ----------
  function Flows(svg, clock) {
    let layer = svg.querySelector('.flows');
    if (!layer) { layer = document.createElementNS(NS, 'g'); layer.setAttribute('class', 'flows'); svg.appendChild(layer); }
    let stopTick = null;
    const state = new Map(); // path id -> {dots, rate}
    function clear() { if (stopTick) stopTick(); stopTick = null; layer.textContent = ''; state.clear(); }
    function set(list) {
      clear();
      if (reduce || !list || !list.length) return;
      const t0 = clock.now();
      const items = list.filter((f) => f.rate > 0).map((f) => {
        const path = svg.querySelector('#' + f.path);
        if (!path) return null;
        const len = path.getTotalLength();
        const speed = f.speed || 70; // px per second
        const travel = len / speed, gap = 1 / f.rate;
        const n = Math.ceil(travel / gap) + 1;
        const dots = [];
        for (let k = 0; k < n; k++) {
          const g = document.createElementNS(NS, 'g');
          g.setAttribute('class', 'dot ' + (f.cls || ''));
          const c = document.createElementNS(NS, 'circle');
          c.setAttribute('r', f.r || (f.glyph ? 10 : 6));
          c.setAttribute('fill', f.color || '#7C3AED');
          if (f.ring) { c.setAttribute('stroke', '#94A3B8'); c.setAttribute('stroke-width', '4'); }
          g.appendChild(c);
          if (f.glyph) {
            const tx = document.createElementNS(NS, 'text');
            tx.setAttribute('y', '4'); tx.setAttribute('text-anchor', 'middle'); tx.textContent = f.glyph;
            g.appendChild(tx);
          }
          g.style.opacity = 0;
          layer.appendChild(g); dots.push(g);
        }
        return { path, len, speed, travel, gap, n, dots, delay: (f.delay || 0) * 1000 };
      }).filter(Boolean);
      stopTick = clock.tick((t) => {
        items.forEach((it) => {
          const el = (t - t0 - it.delay) / 1000;
          it.dots.forEach((d, k) => {
            let u = el - k * it.gap;
            if (u < 0) { d.style.opacity = 0; return; }
            u %= it.n * it.gap;
            if (u > it.travel) { d.style.opacity = 0; return; }
            const p = it.path.getPointAtLength(u * it.speed);
            const fade = Math.min(1, u / 0.15, (it.travel - u) / 0.15);
            d.style.opacity = fade;
            d.setAttribute('transform', `translate(${p.x} ${p.y})`);
          });
        });
      });
    }
    return { set, clear };
  }

  // ---------- reveal helpers ----------
  function drawIn(el, delay) {
    const paths = el.matches('path,line,polyline,circle,ellipse,rect') ? [el] : el.querySelectorAll('path,line,polyline');
    paths.forEach((p, k) => {
      if (!p.getTotalLength) return;
      const len = p.getTotalLength();
      p.style.transition = 'none';
      p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
      p.getBoundingClientRect();
      p.style.transition = `stroke-dashoffset ${Math.min(1.2, 0.35 + len / 700)}s ease ${delay + k * 0.15}s`;
      p.style.strokeDashoffset = 0;
    });
  }
  function undraw(el) {
    el.querySelectorAll('path,line,polyline').forEach((p) => { p.style.transition = 'none'; p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; });
  }

  // ---------- the stepper ----------
  // step: { cap, title, add:[ids], remove:[ids], set:[ids], mode, cls:{id:'classes'}, text:{id:'string'},
  //         flows:[{path,rate,color,glyph,...}], play(ctx), dur }
  function StepAnim(root, steps) {
    const svg = root.querySelector('svg');
    const q = (id) => svg.querySelector('#' + id);
    const cap = root.querySelector('.ca-cap'), stepN = root.querySelector('.ca-step');
    const prev = root.querySelector('[data-ca="prev"]'), next = root.querySelector('[data-ca="next"]'), play = root.querySelector('[data-ca="play"]');
    const chips = [...root.querySelectorAll('[data-jump]')];
    const clock = Clock(root);
    const snd = Sound(root.querySelector('[data-ca="sound"]'), clock);
    const flows = Flows(svg, clock);
    const reveal = [...svg.querySelectorAll('[data-r]')];
    let cur = -1, timer = null, playing = false, lastCls = {};

    const onSet = (n) => {
      let s = new Set();
      for (let i = 0; i <= n; i++) {
        const st = steps[i];
        if (st.set) s = new Set(st.set);
        (st.add || []).forEach((x) => s.add(x));
        (st.remove || []).forEach((x) => s.delete(x));
      }
      return s;
    };

    function show(n, animate) {
      const s = steps[n];
      const was = cur >= 0 ? onSet(cur) : new Set();
      const now = onSet(n);
      clock.clear(); snd.hush();
      if (timer && !playing) timer = null;
      const anim = animate && !reduce;
      // newly shown pieces appear one after another (short stagger, capped)
      const order = [...(s.add || []), ...(s.set || [])].filter((id) => !was.has(id));
      reveal.forEach((el) => {
        const id = el.id, on = now.has(id), had = was.has(id);
        el.classList.toggle('on', on);
        if (on && !had && anim) {
          const k = Math.min(5, Math.max(0, order.indexOf(id)));
          el.style.transitionDelay = (k * 0.3) + 's';
          if (el.classList.contains('dr')) drawIn(el, k * 0.3);
        } else {
          el.style.transitionDelay = '0s';
          if (el.classList.contains('dr')) undraw(el);
        }
      });
      Object.entries(lastCls).forEach(([id, c]) => { const el = q(id); if (el) el.classList.remove(...c.split(' ').filter(Boolean)); });
      lastCls = s.cls || {};
      Object.entries(lastCls).forEach(([id, c]) => { const el = q(id); if (el) el.classList.add(...c.split(' ').filter(Boolean)); });
      Object.entries(s.text || {}).forEach(([id, t]) => { const el = q(id); if (el) el.textContent = t; });
      root.dataset.mode = s.mode || '';
      flows.set(s.flows);
      if (anim && s.play) s.play({ T: (ms, fn) => clock.later(ms, () => { if (cur === n) fn(); }), S: snd.S, q, svg });
      if (anim && s.sound) snd.S[s.sound]();
      cap.innerHTML = s.cap;
      if (stepN) stepN.textContent = `Step ${n + 1} of ${steps.length}`;
      prev.disabled = n === 0; next.disabled = n === steps.length - 1;
      chips.forEach((c) => c.classList.toggle('active', +c.dataset.jump === n));
      cur = n;
    }
    function stop() {
      if (timer) clock.cancel(timer);
      timer = null; playing = false; clock.resume();
      play.textContent = '▶ Play'; play.setAttribute('aria-pressed', 'false');
    }
    function tick() {
      if (cur >= steps.length - 1) return stop();
      show(cur + 1, true);
      timer = clock.later(steps[cur].dur || 5200, tick);
    }
    [prev, next, play, ...chips].forEach((btn) => btn.addEventListener('pointerdown', snd.unlock));
    prev.addEventListener('click', () => { stop(); show(Math.max(0, cur - 1), true); });
    next.addEventListener('click', () => { stop(); show(Math.min(steps.length - 1, cur + 1), true); });
    chips.forEach((c) => c.addEventListener('click', () => { stop(); show(+c.dataset.jump, true); }));
    play.addEventListener('click', () => {
      if (playing && !clock.paused) { clock.pause(); play.textContent = '▶ Play'; play.setAttribute('aria-pressed', 'false'); return; }
      play.textContent = '❚❚ Pause'; play.setAttribute('aria-pressed', 'true');
      if (playing && clock.paused) { clock.resume(); return; }
      playing = true;
      if (cur === steps.length - 1) show(0, false);
      tick();
    });
    show(0, false);
    return { show, clock, snd, flows };
  }

  // Load an animation's SVG file into its container, then hand it to the animation's script.
  async function mount(id, svgUrl, build) {
    const root = document.getElementById(id);
    if (!root) return;
    const holder = root.querySelector('.ea-stage');
    try {
      const res = await fetch(svgUrl);
      holder.innerHTML = await res.text();
      build(root);
    } catch (e) {
      holder.textContent = 'This animation could not load. The chart below has everything it shows.';
    }
  }

  window.AnimKit = { Clock, Sound, Flows, StepAnim, mount, reduce };
})();
