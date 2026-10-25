"""Draw Sohail's adrenal gland one-pager as SVG.
usage: python3 -I tools/adrenal_chart.py public/charts/endocrinology/adrenal-gland.svg"""
import sys, html
e = html.escape
W, H = 1400, 1180
INK, INK2, LINE, RED = '#16212B', '#4A5864', '#5B6A75', '#B91C1C'
out = [f'<rect width="{W}" height="{H}" fill="#fff"/>',
       '<defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="#5B6A75"/></marker></defs>']

def t(x, y, s, size=17, weight=400, fill=INK, anchor='start', extra=''):
    out.append(f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" fill="{fill}" text-anchor="{anchor}"{extra}>{s}</text>')

def lines(x, y, rows, size=17, lh=24, fill=INK, anchor='start', weight=400):
    for i, r in enumerate(rows):
        pad = (len(r) - len(r.lstrip(' '))) * 4 if anchor == 'start' else 0
        t(x + pad, y + i * lh, r.lstrip(' '), size, weight, fill, anchor)

def arrow(x1, y1, x2, y2):
    out.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{LINE}" stroke-width="2.2" marker-end="url(#ah)"/>')

def box(x, y, w, h, title, rows, size=16, lh=23, title_fill=RED, foot=None):
    out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="14" fill="#FFF7F7" stroke="#F1B5B5" stroke-width="2"/>')
    out.append(f'<path d="M{x} {y+14} a14 14 0 0 1 14 -14 h{w-28} a14 14 0 0 1 14 14 v32 h-{w} Z" fill="#FDE2E2"/>')
    t(x + 18, y + 31, title, 18, 800, title_fill)
    lines(x + 18, y + 72, rows, size, lh)
    if foot:
        lines(x + 18, y + 72 + len(rows) * lh + 12, foot, size, lh, '#1D4ED8', weight=700)

# --- renin-angiotensin side ---
lines(118, 40, ['Kidney’s JG apparatus', 'senses low BP or low Na⁺'], 16, 22, INK2)
arrow(200, 70, 200, 168)
t(200, 160, 'renin', 16, 700, INK, 'middle', ' dy="0"')
out[-1] = out[-1].replace('x="200" y="160"', 'x="230" y="158"')
t(20, 196, 'Angiotensinogen', 17, 700)
arrow(168, 190, 232, 190)
t(242, 196, 'Angiotensin I', 17, 700)
arrow(352, 190, 404, 190)
t(414, 196, 'Angiotensin II', 17, 700)
arrow(530, 190, 566, 190)

# --- the gland ---
t(700, 74, 'Adrenal gland', 20, 800, INK, 'middle')
out.append('<rect x="570" y="90" width="260" height="200" rx="22" fill="#FDE68A" stroke="#B7791F" stroke-width="3"/>')
t(700, 122, 'Cortex', 19, 800, '#7C4A03', 'middle')
out.append('<circle cx="700" cy="196" r="62" fill="#A5F3FC" stroke="#0E7490" stroke-width="3"/>')
t(700, 192, 'Medulla', 17, 800, '#0E4F5C', 'middle')
t(700, 214, 'amines', 15, 400, '#0E4F5C', 'middle')
t(596, 190, 'mineralocorticoids', 14, 700, '#7C4A03', 'middle', ' transform="rotate(-90 596 190)"')
t(804, 190, 'glucocorticoids', 14, 700, '#7C4A03', 'middle', ' transform="rotate(90 804 190)"')

# --- ACTH side ---
arrow(978, 190, 836, 190)
t(988, 196, 'ACTH', 17, 700)
arrow(1128, 190, 1056, 190)
t(1138, 196, 'CRH', 17, 700)

# --- three outputs ---
arrow(600, 290, 330, 376)
arrow(800, 290, 1070, 376)
# aldosterone column
t(300, 402, 'Aldosterone', 19, 800, INK, 'middle')
arrow(300, 414, 300, 446)
lines(300, 468, ['body retains Na⁺ &amp; H₂O', 'while excreting K⁺'], 17, 24, INK, 'middle')
arrow(300, 502, 300, 534)
lines(300, 558, ['blood volume increases', '(low BP is remedied)'], 17, 24, INK, 'middle')
box(110, 636, 380, 142, 'Hyperaldosteronism = Conn syndrome',
    ['• caused by an adrenal adenoma', '• results in hypertension'])

# medulla column
out.append(f'<path d="M700 258 V330 M640 330 H760" stroke="{LINE}" stroke-width="2.2" fill="none"/>')
arrow(640, 330, 640, 372); arrow(760, 330, 760, 372)
lines(640, 396, ['Epinephrine', '(80%)'], 17, 22, INK, 'middle', 700)
lines(760, 396, ['Norepinephrine', '(20%)'], 17, 22, INK, 'middle', 700)
arrow(640, 426, 640, 488); arrow(760, 426, 760, 488)
t(700, 462, 'metabolized to', 15, 400, INK2, 'middle', ' font-style="italic"')
t(640, 510, 'Metanephrine', 17, 700, INK, 'middle')
t(760, 534, 'Normetanephrine', 17, 700, INK, 'middle')
arrow(640, 520, 692, 584); arrow(760, 544, 708, 584)
t(700, 610, 'VMA', 20, 800, INK, 'middle')
box(520, 636, 360, 216, 'Pheochromocytoma',
    ['a benign tumor of the adrenal medulla', 'which results in elevated levels of the', 'hormones and metabolites in plasma', '&amp; urine'],
    foot=['the best screening test for this', 'disease is detection of metanephrine'])

# cortisol column
t(1100, 402, 'Cortisol', 19, 800, INK, 'middle')
arrow(1100, 414, 1100, 440)
lines(920, 466, ['• elevates blood glucose via gluconeogenesis', '   (which refers to formation of glucose from', '   non carbs as in lipolysis and protein', '   catabolism)', '• depressed antibody formation', '• depressed inflammatory response'], 16, 24)
box(910, 636, 380, 166, 'Hypercortisolism = Cushing syndrome',
    ['weight gain in face (moon face) &amp;', 'abdomen; buffalo hump; thin skin;', 'easy bruising; muscle wasting;', 'low immune response'])

# --- bottom boxes ---
box(110, 900, 560, 250, 'Congenital adrenal hyperplasia',
    ['results from a genetic deficiency of 21-hydroxylase,', 'a precursor to aldosterone &amp; cortisol', '',
     'as a result, ACTH levels become elevated', '',
     'precursors (17-OH progesterone) accumulate,', 'resulting in virilization b/c precursors may be', 'shunted to produce androgens'])
box(730, 900, 560, 250, 'Hypoadrenalism can be due to:',
    ['• primary atrophy of adrenal cortex (Addison’s disease)', '• secondary adrenal insufficiency b/c of low CRH or ACTH',
     '• long term suppression of the hypothalamic-pituitary-', '   adrenal axis by glucocorticoid therapy'])
lines(748, 1080, ['symptoms include skin pigmentation, weak muscles,', 'hypotension, hyponatremia, hyperkalemia'], 16, 23, RED, weight=700)

t(1290, 1172, 'JG = juxtaglomerular · VMA = vanillylmandelic acid · ACTH = adrenocorticotropic hormone · CRH = corticotropin-releasing hormone', 12, 400, INK2, 'end')

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="Helvetica, Arial, sans-serif" role="img" '
       'aria-label="Adrenal gland. Renin-angiotensin: the kidney juxtaglomerular apparatus senses low blood pressure or low sodium and releases renin; angiotensinogen becomes angiotensin I, then angiotensin II, which stimulates the cortex to make mineralocorticoids (aldosterone): the body retains sodium and water while excreting potassium, blood volume increases. CRH stimulates ACTH, which stimulates glucocorticoids (cortisol): elevates blood glucose via gluconeogenesis, depresses antibody formation and the inflammatory response. The medulla makes amines: epinephrine 80 percent and norepinephrine 20 percent, metabolized to metanephrine and normetanephrine, then VMA. Conn syndrome, Cushing syndrome, pheochromocytoma, congenital adrenal hyperplasia and hypoadrenalism are described in boxes.">\n'
       + '\n'.join(out) + '\n</svg>\n')
open(sys.argv[1], 'w').write(svg)
print('ok')
