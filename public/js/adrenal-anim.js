// Adrenal gland: renin–angiotensin–aldosterone, CRH–ACTH–cortisol, the medulla, then five diseases.
// Captions use Sohail's chart wording wherever the chart says it.
AnimKit.mount('adrenal-anim', '/anim/adrenal.svg', (root) => {
  const TEAL = '#0F766E', AMBER = '#D97706', ORANGE = '#EA580C', RED = '#DC2626', PURPLE = '#7C3AED', BLUE = '#0284C7', GRAY = '#64748B';
  const L = { renin: 1, chain: 1, ang: 1, ald: 1, crh: 1, acth: 1, cort: 1, epi: 1.4, nor: 0.4, na: 1, k: 0.8, glu: 0.8, andro: 0 };
  const F = (o = {}) => {
    const v = { ...L, ...o };
    return [
      { path: 'p-renin', rate: v.renin, color: TEAL },
      { path: 'p-a1', rate: v.chain, color: GRAY, r: 5 },
      { path: 'p-a2', rate: v.chain, color: GRAY, r: 5 },
      { path: 'p-ang', rate: v.ang, color: GRAY, speed: 110 },
      { path: 'p-ald', rate: v.ald, color: AMBER, speed: 100 },
      { path: 'p-crh', rate: v.crh, color: TEAL },
      { path: 'p-acth', rate: v.acth, color: TEAL, speed: 130 },
      { path: 'p-cort', rate: v.cort, color: ORANGE, speed: 100 },
      { path: 'p-epi', rate: v.epi, color: RED },
      { path: 'p-nor', rate: v.nor, color: '#F87171' },
      { path: 'p-na', rate: v.na, color: PURPLE, glyph: 'Na', r: 12 },
      { path: 'p-h2o', rate: v.na, color: BLUE, r: 7, delay: 0.4 },
      { path: 'p-k', rate: v.k, color: ORANGE, glyph: 'K', r: 11 },
      { path: 'p-glu', rate: v.glu, color: '#F59E0B', r: 6, speed: 50 },
      { path: 'p-andro', rate: v.andro, color: RED, r: 7 },
    ];
  };
  const ONLY = (keys) => F(Object.fromEntries(Object.keys(L).map((k) => [k, keys[k] || 0])));
  const NORMAL = ['gland', 'g-parts', 'kid', 'kid-happy', 'gauge', 'a-renin', 'c-1', 'a-a1', 'c-2', 'a-a2', 'c-3', 'a-ang', 'hp', 'a-crh', 'a-acth', 'a-ald', 'a-cort', 'a-med', 'a-met', 'vessel', 'sugar', 'shield'];
  const without = (arr, ...x) => arr.filter((i) => !x.includes(i));

  const steps = [
    { cap: 'The adrenal gland sits on top of the kidney. It has an outer <b>cortex</b> and an inner <b>medulla</b>.', set: ['gland'], flows: [] },
    { cap: 'The cortex makes <b>mineralocorticoids</b> (the salt hormone, aldosterone) and <b>glucocorticoids</b> (the sugar hormone, cortisol). The medulla makes <b>amines</b>.', add: ['g-parts'], sound: 'pop' },
    { cap: 'The kidney’s <b>JG (juxtaglomerular) apparatus</b> senses low BP or low Na⁺…', add: ['kid', 'kid-worry', 'gauge'], cls: { needle: 'lo' }, sound: 'uhoh' },
    { cap: '…and releases <b>renin</b>. Angiotensinogen becomes <b>angiotensin I</b>, then <b>angiotensin II</b>.', add: ['a-renin', 'c-1', 'a-a1', 'c-2', 'a-a2', 'c-3'], cls: { needle: 'lo' }, flows: ONLY({ renin: 1.2, chain: 1 }), sound: 'snip', dur: 6000 },
    { cap: 'Angiotensin II stimulates the cortex to make <b>aldosterone</b>.', add: ['a-ang', 'a-ald'], cls: { needle: 'lo' }, flows: ONLY({ renin: 1.2, chain: 1, ang: 1, ald: 1.2 }), sound: 'blip' },
    { cap: 'Aldosterone makes the body retain <b>Na⁺ &amp; H₂O</b> while excreting <b>K⁺</b>. Blood volume increases, so low BP is remedied.', add: ['vessel', 'kid-happy'], remove: ['kid-worry'], cls: { needle: 'ok slow', vtube: 'full' }, flows: ONLY({ renin: 0.6, chain: 0.6, ang: 0.6, ald: 1.2, na: 1.3, k: 1 }), sound: 'splash', dur: 7000 },
    { cap: 'On the other side: the hypothalamus releases <b>CRH</b> (corticotropin-releasing hormone), the anterior pituitary releases <b>ACTH</b> (adrenocorticotropic hormone), and ACTH stimulates the cortex to make <b>cortisol</b>.', add: ['hp', 'a-crh', 'a-acth', 'a-cort'], cls: { needle: 'ok' }, flows: ONLY({ renin: 0.6, chain: 0.6, ang: 0.6, ald: 0.8, na: 0.8, k: 0.6, crh: 1.2, acth: 1.2, cort: 1.2 }), sound: 'blip', dur: 7000 },
    { cap: 'Cortisol elevates <b>blood glucose</b> via gluconeogenesis (forming glucose from non-carbs, as in lipolysis and protein catabolism). It also depresses antibody formation and the inflammatory response.', add: ['sugar', 'shield'], cls: { needle: 'ok', sug: 'mid', shd: 'dim' }, flows: F({ epi: 0, nor: 0 }), sound: 'pop', dur: 7500 },
    { cap: 'The medulla releases <b>epinephrine (80%)</b> and <b>norepinephrine (20%)</b>. They’re metabolized to metanephrine and normetanephrine, then to <b>VMA</b> (vanillylmandelic acid).', add: ['a-med', 'a-met'], cls: { needle: 'ok', sug: 'mid', shd: 'dim' }, flows: F(), sound: 'pop', dur: 7000 },
    { cap: 'That’s the whole gland working normally. Now tap a disease to see what goes wrong.', set: NORMAL, cls: { needle: 'ok', sug: 'mid', shd: 'dim' }, flows: F(), sound: 'ding' },
    { cap: '<b>Hyperaldosteronism = Conn syndrome</b>: caused by an adrenal adenoma, it results in hypertension.', mode: 'conn', set: [...NORMAL, 'tum-conn'], cls: { needle: 'hi', vtube: 'full', sug: 'mid', shd: 'dim' }, flows: F({ renin: 0.2, chain: 0.2, ang: 0.2, ald: 3.5, na: 3, k: 2.6 }), sound: 'alarm', dur: 7500 },
    { cap: '<b>Hypercortisolism = Cushing syndrome</b>: weight gain in the face (moon face) &amp; abdomen; buffalo hump; thin skin; easy bruising; muscle wasting; low immune response.', mode: 'cushing', set: [...NORMAL, 'moon'], cls: { needle: 'ok', sug: 'hi', shd: 'vdim' }, flows: F({ cort: 3.5, glu: 2.6 }), sound: 'boing', dur: 8000 },
    { cap: '<b>Pheochromocytoma</b>: a benign tumor of the adrenal medulla, which results in elevated levels of the hormones and metabolites in plasma &amp; urine. The best screening test for this disease is detection of <b>metanephrine</b>.', mode: 'pheo', set: [...NORMAL, 'tum-pheo', 'met-ring'], cls: { needle: 'ok', sug: 'mid', shd: 'dim' }, flows: F({ epi: 4, nor: 2 }), sound: 'alarm', dur: 8500 },
    { cap: '<b>Congenital adrenal hyperplasia</b>: a genetic deficiency of 21-hydroxylase (21-OH), an enzyme needed to make aldosterone &amp; cortisol. As a result, ACTH levels become elevated. Precursors (17-OH progesterone) accumulate, resulting in virilization b/c they may be shunted to produce <b>androgens</b>.', mode: 'cah', set: [...NORMAL, 'block', 'a-andro'], cls: { cortex: 'swell', needle: 'ok', sug: 'lo', shd: '' }, flows: F({ crh: 2.4, acth: 3.6, ald: 0, cort: 0, na: 0, k: 0, glu: 0, andro: 3 }), sound: 'uhoh', dur: 9500 },
    { cap: '<b>Hypoadrenalism</b>, e.g. primary atrophy of the adrenal cortex (<b>Addison’s disease</b>): weak muscles, hypotension, hyponatremia; in Addison’s also skin pigmentation and hyperkalemia.', mode: 'addison', set: [...without(NORMAL, 'kid-happy'), 'kid-worry'], cls: { cortex: 'shrink', needle: 'lo', vtube: 'thin', sug: 'lo', shd: '' }, flows: F({ renin: 2.4, chain: 2, ang: 2, ald: 0.3, cort: 0.3, crh: 2.4, acth: 3.4, na: 0.3, k: 0, glu: 0.3 }), dur: 8500 },
  ];
  AnimKit.StepAnim(root, steps);
});
