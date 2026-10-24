"""Draw the granulocytosis / leukemia flowchart (Sohail's cancer-flow-chart) as SVG.
usage: python3 -I tools/leukemia_chart.py public/charts/hematology/cancer-flow-chart.svg"""
import sys, html
e = html.escape
W, H = 1000, 800
INK, INK2, LINE = '#16212B', '#4A5864', '#5B6A75'
PINK, PINK_T = '#BE185D', '#FDF2F7'
PURP, PURP_T = '#5B21B6', '#F5F3FF'
out = [f'<rect width="{W}" height="{H}" fill="#fff"/>',
       '<defs>' + ''.join(f'<marker id="ah{i}" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="{c}"/></marker>' for i, c in enumerate(['#5B6A75', '#BE185D', '#5B21B6'])) + '</defs>']

def t(x, y, s, size=17, weight=400, fill=INK, anchor='middle'):
    out.append(f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" fill="{fill}" text-anchor="{anchor}">{s}</text>')

def arrow(d, col=LINE, w=2.5):
    out.append(f'<path d="{d}" stroke="{col}" stroke-width="{w}" fill="none" marker-end="url(#ah{['#5B6A75', PINK, PURP].index(col)})"/>')

def yesno(x, y, s, fill):
    out.append(f'<rect x="{x-26}" y="{y-17}" width="52" height="26" rx="13" fill="{fill}"/>')
    t(x, y + 1, s, 14, 800, '#fff')

# 1. the starting question
out.append('<rect x="250" y="20" width="660" height="62" rx="14" fill="#FEFCE8" stroke="#EAB308" stroke-width="3.5"/>')
t(580, 59, '↑ WBC count + an absolute granulocytosis?', 22, 800)
arrow('M580 82 V136')
yesno(580, 114, 'Yes', '#15803D')

# 2. blasts in peripheral blood?
out.append('<ellipse cx="580" cy="182" rx="200" ry="42" fill="#fff" stroke="#16212B" stroke-width="2.5"/>')
t(580, 189, 'Blasts in peripheral blood?', 21, 800)
arrow('M380 182 H276')
yesno(328, 182, 'No', '#B91C1C')
out.append('<rect x="20" y="140" width="250" height="84" rx="12" fill="#F1F5F9" stroke="#94A3B8" stroke-width="2"/>')
t(145, 176, 'It’s a non-malignant', 17, 700)
t(145, 200, 'granulocytic abnormality', 17, 700)

out.append('<path d="M580 224 V262 M260 262 H760" stroke="#5B6A75" stroke-width="2.5" fill="none"/>')
arrow('M260 262 V296')
arrow('M760 262 V296')
yesno(580, 252, 'Yes', '#15803D')

# 3a. chronic side (pink, like the original)
out.append(f'<rect x="60" y="300" width="400" height="110" rx="14" fill="{PINK_T}" stroke="{PINK}" stroke-width="3"/>')
t(260, 346, 'Blasts &lt; 10%', 22, 800, PINK)
t(260, 378, 'in blood and bone marrow (BM)', 17)
arrow('M260 410 V446', PINK, 3)
t(260, 474, 'Chronic myeloproliferative neoplasm', 19, 800, PINK)
t(260, 496, '(chronic myeloproliferative disorder)', 15, 400, INK2)
out.append(f'<rect x="40" y="514" width="440" height="170" rx="14" fill="#fff" stroke="{PINK}" stroke-width="2"/>')
for i, (name, old) in enumerate([('Chronic myelogenous leukemia (CML)', ''),
                                 ('Primary myelofibrosis', '(idiopathic myelofibrosis)'),
                                 ('Polycythemia vera', ''),
                                 ('Essential thrombocythemia', '')]):
    y = 552 + i * 36
    t(64, y, e(name) + (f' <tspan font-size="14" fill="{INK2}">{e(old)}</tspan>' if old else ''), 18, 600, INK, 'start')

# 3b. acute side (purple)
out.append(f'<rect x="540" y="300" width="440" height="110" rx="14" fill="{PURP_T}" stroke="{PURP}" stroke-width="3"/>')
t(760, 330, 'Blasts in BM', 17, 700, INK2)
t(760, 362, '&gt; 30% <tspan font-size="16" font-weight="600" fill="#4A5864">(FAB)</tspan>', 22, 800, PURP)
t(760, 392, '≥ 20% <tspan font-size="16" font-weight="600" fill="#4A5864">(WHO)</tspan>', 22, 800, PURP)
arrow('M760 410 V508', PURP, 3)
out.append(f'<rect x="560" y="514" width="400" height="252" rx="14" fill="#fff" stroke="{PURP}" stroke-width="2"/>')
t(760, 550, 'Acute myelogenous leukemia (AML)', 19, 800, PURP)
for i in range(8):
    col, row = divmod(i, 4)
    x, y = 680 + col * 160, 594 + row * 48
    out.append(f'<rect x="{x-58}" y="{y-24}" width="116" height="36" rx="10" fill="{PURP_T}"/>')
    t(x, y, f'AML-M{i}', 18, 800, PURP)

t(20, 788, 'FAB = French-American-British classification · WHO = World Health Organization', 13, 400, INK2, 'start')

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="Helvetica, Arial, sans-serif" role="img" '
       'aria-label="Increased WBC count plus an absolute granulocytosis? If yes: blasts in peripheral blood? If no, it is a non-malignant granulocytic abnormality. If yes, two paths. Blasts under 10 percent in blood and bone marrow: chronic myeloproliferative neoplasm (chronic myeloproliferative disorder): chronic myelogenous leukemia, primary myelofibrosis (idiopathic myelofibrosis), polycythemia vera, essential thrombocythemia. Blasts in bone marrow over 30 percent (FAB) or at least 20 percent (WHO): acute myelogenous leukemia, AML-M0 through AML-M7.">\n'
       + '\n'.join(out) + '\n</svg>\n')
open(sys.argv[1], 'w').write(svg)
print('ok')
