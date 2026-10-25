// Thyroid: the feedback loop, then "where's the break?" scenarios. Captions use Sohail's chart wording.
AnimKit.mount('thyroid-anim', '/anim/thyroid.svg', (root) => {
  const AMBER = '#D97706', RED = '#DC2626', BLUE = '#1D4ED8', GRAY = '#94A3B8', TEAL = '#0F766E';
  const ORG = ['hyp', 'pit', 'thy'];
  const BASE = [...ORG, 'a-trh', 'a-tsh', 'a-t4', 'a-t3', 'a-rt3', 'a-fb', 'labs', 'body'];
  // hormone flows: rate = messengers per second (the level)
  const F = (trh, tsh, t4, t3, fb, ring = true, rt3 = true) => [
    { path: 'p-trh', rate: trh, color: TEAL },
    { path: 'p-tsh', rate: tsh, color: TEAL },
    { path: 'p-t4', rate: t4, color: AMBER, glyph: '4', ring },
    { path: 'p-t3', rate: t3, color: RED, glyph: '3', ring },
    { path: 'p-rt3', rate: rt3 ? t4 * 0.3 : 0, color: GRAY, r: 7 },
    { path: 'p-fb', rate: fb, color: BLUE, r: 5, speed: 150 },
    { path: 'p-fb2', rate: fb * 0.7, color: BLUE, r: 5, speed: 150, delay: 1.6 },
  ];
  const labs = (t4, t3, tsh) => {
    const c = (v) => (v === '↑' ? 'up' : v === '↓' ? 'dn' : 'ok');
    const w = (v) => (v === '↑' ? 'high' : v === '↓' ? 'low' : 'normal');
    return { text: { 'v-t4': w(t4), 'v-t3': w(t3), 'v-tsh': w(tsh) }, cls: { 'v-t4': 'word ' + c(t4), 'v-t3': 'word ' + c(t3), 'v-tsh': 'word ' + c(tsh) } };
  };
  const HYPO = { sym0: 'Hypothyroidism (myxedema)', sym1: 'enlarged thyroid gland', sym2: 'impaired mental acuity', sym3: 'weight gain', sym4: 'cold intolerance' };
  const HYPER = { sym0: 'Hyperthyroidism', sym1: 'muscle loss; fatigue', sym2: 'heat intolerance', sym3: 'nervousness', sym4: 'exophthalmos (bulging eyes)' };
  const OK = { sym0: 'Feeling just right', sym1: 'not too hot, not too cold', sym2: '', sym3: '', sym4: '' };
  const merge = (...o) => o.reduce((a, b) => ({ text: { ...a.text, ...b.text }, cls: { ...a.cls, ...b.cls } }), { text: {}, cls: {} });

  const n = labs('✓', '✓', '✓');
  const steps = [
    { cap: 'Thyroid hormones are run by a feedback loop, a bit like a thermostat. Let’s follow it from the top.', set: ORG, flows: [] },
    { cap: 'The <b>hypothalamus</b> releases <b>TRH</b> (thyrotropin-releasing hormone)…', add: ['a-trh'], flows: F(1.2, 0, 0, 0, 0, false, false), sound: 'blip' },
    { cap: '…which makes the <b>anterior pituitary</b> release <b>TSH</b> (thyroid-stimulating hormone)…', add: ['a-tsh'], flows: F(1.2, 1.2, 0, 0, 0), sound: 'blip' },
    { cap: '…which makes the thyroid’s follicular cells release <b>free T4</b> (somewhat active) and <b>free T3</b> (most active). There’s more free T4, but free T3 is the biologically potent molecule.', add: ['a-t4', 'a-t3'], flows: F(1.2, 1.2, 1.8, 0.7, 0, false), sound: 'pop', dur: 6500 },
    { cap: 'T4 can lose an iodine (deiodination) and become <b>reverse T3</b> (rT3), which is biologically inactive.', add: ['a-rt3', 'iod'], flows: F(1.2, 1.2, 1.8, 0.7, 0, false), sound: 'snip' },
    { cap: 'In the blood, thyroid hormones ride bound to <b>thyroxine binding globulin (TBG)</b>, pre-albumin or albumin (the gray rings).', remove: ['iod'], flows: F(1.2, 1.2, 1.8, 0.7, 0), sound: 'pop' },
    { cap: 'When there’s enough T4 and T3, they tell the hypothalamus and pituitary to ease off: <b>negative feedback</b>. Everything stays balanced.', title: 'Normal', set: [...BASE, 'ic-ok'], ...merge(n, { text: OK }), flows: F(1, 1, 1.6, 0.7, 1), sound: 'ding', dur: 6500 },
    { cap: '<b>Hashimoto thyroiditis</b> (primary hypothyroidism): TPO Ab (antithyroid peroxidase antibody) attacks the thyroid gland. Not enough thyroid hormone is produced, so TSH &amp; TRH are elevated.', mode: 'hypo1', set: [...BASE, 'ab-hashi', 'thy-sad', 'ic-cold'], ...merge(labs('↓', '↓', '↑'), { text: HYPO, cls: { thy: 'swell' } }), flows: F(2.8, 3.2, 0.35, 0.15, 0), sound: 'uhoh', dur: 8000 },
    { cap: '<b>Secondary hypothyroidism</b>: the pituitary isn’t making enough TSH, so the thyroid isn’t told to work. T4, T3 and TSH are all low.', mode: 'hypo2', set: [...BASE, 'pit-zzz', 'ic-cold'], ...merge(labs('↓', '↓', '↓'), { text: HYPO }), flows: F(2.6, 0.3, 0.35, 0.15, 0), sound: 'wah', dur: 7500 },
    { cap: '<b>Graves disease</b> (primary hyperthyroidism): antibodies bind to TSH receptors, stimulating the thyroid gland. It’s more common in women. Too much thyroid hormone is produced, so TSH &amp; TRH levels are depressed.', mode: 'hyper1', set: [...BASE, 'ab-graves', 'thy-hot', 'ic-hot'], ...merge(labs('↑', '↑', '↓'), { text: HYPER, cls: { thy: 'hot swell' } }), flows: F(0.25, 0.25, 3.4, 1.8, 2.6), sound: 'alarm', dur: 8000 },
    { cap: '<b>Secondary hyperthyroidism</b>: the pituitary makes too much TSH, so the thyroid overworks. T4, T3 and TSH are all high.', mode: 'hyper2', set: [...BASE, 'pit-hyper', 'thy-hot', 'ic-hot'], ...merge(labs('↑', '↑', '↑'), { text: HYPER, cls: { thy: 'hot' } }), flows: F(0.4, 3.2, 3.4, 1.8, 2.6), sound: 'alarm', dur: 7500 },
    { cap: 'The shortcut: if TSH goes the <b>opposite</b> way to T4, the problem is the thyroid itself (primary). If they go the <b>same</b> way, the problem is the pituitary (secondary).', set: [...ORG, 'a-trh', 'a-tsh', 'a-t4', 'a-t3', 'a-fb', 'sumtab'], flows: F(1, 1, 1.6, 0.7, 1, true, false), sound: 'cheer', dur: 7000 },
  ];
  AnimKit.StepAnim(root, steps);
});
