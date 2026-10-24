"""Draw Sohail's non-malignant neutrophilic disorders mind map as SVG.
usage: python3 -I tools/granulocyte_chart.py public/charts/hematology/granulocyte-abnormalities.svg"""
import sys, html
e = html.escape
W, H = 1160, 790
INK, INK2, LINE = '#16212B', '#4A5864', '#7C8B96'
FUNC, CYTO, NUC = '#0E6A80', '#7C3AED', '#1D4ED8'
CYT_FILL, CYT_EDGE, NUC_FILL = '#F7E8F0', '#D9A9C2', '#5B2C83'
out = [f'<rect width="{W}" height="{H}" fill="#fff"/>']

def t(x, y, s, size=16, weight=400, fill=INK, anchor='middle'):
    out.append(f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" fill="{fill}" text-anchor="{anchor}">{s}</text>')

def link(d, col=LINE):
    out.append(f'<path d="{d}" stroke="{col}" stroke-width="2.5" fill="none"/>')

def branch(cx, cy, label, col):
    w = 11 * len(label) + 36
    out.append(f'<rect x="{cx-w/2}" y="{cy-19}" width="{w}" height="38" rx="19" fill="{col}"/>')
    t(cx, cy + 6, e(label), 17, 800, '#fff')

def card(x, y, w, h, name, col, body, art=None):
    out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="14" fill="#fff" stroke="#D5DDE3" stroke-width="1.5"/>')
    names = name if isinstance(name, list) else [name]
    extra = 24 * (len(names) - 1)
    out.append(f'<path d="M{x} {y+14} a14 14 0 0 1 14 -14 h{w-28} a14 14 0 0 1 14 14 v{28+extra} h-{w} Z" fill="{col}"/>')
    for i, nm in enumerate(names):
        t(x + w/2, y + 28 + i * 24, e(nm), 19, 800, '#fff')
    if art:
        art(x + w/2, y + 98 + extra)
    ty = y + extra + (172 if art else 80)
    for ln in body:
        t(x + w/2, ty, ln, 16)
        ty += 23

# --- little neutrophil drawings (Sohail's memory hooks) ---
def cyto(cx, cy, r=40):
    out.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{CYT_FILL}" stroke="{CYT_EDGE}" stroke-width="2"/>')

def lobes(cx, cy):
    for dx, dy in [(-15, 6), (0, -8), (15, 6)]:
        out.append(f'<circle cx="{cx+dx}" cy="{cy+dy}" r="9.5" fill="{NUC_FILL}"/>')
    out.append(f'<path d="M{cx-15} {cy+6} L{cx} {cy-8} L{cx+15} {cy+6}" stroke="{NUC_FILL}" stroke-width="4" fill="none"/>')

def chediak(cx, cy):
    cyto(cx, cy)
    lobes(cx - 4, cy + 8)
    for gx, gy, r in [(-18, -20, 7), (14, -22, 8), (24, 8, 6.5), (-26, 10, 5.5)]:
        out.append(f'<circle cx="{cx+gx}" cy="{cy+gy}" r="{r}" fill="#9D4EDD" stroke="#5B2C83" stroke-width="1.2"/>')

def may_hegglin(cx, cy):
    cyto(cx - 22, cy)
    lobes(cx - 26, cy + 6)
    out.append(f'<ellipse cx="{cx-14}" cy="{cy-22}" rx="13" ry="4.5" fill="#7FA7D9" transform="rotate(-18 {cx-14} {cy-22})"/>')
    # giant platelet beside the cell
    out.append(f'<circle cx="{cx+42}" cy="{cy+8}" r="19" fill="#EBDDF3" stroke="#B48ACB" stroke-width="2"/>')
    for gx, gy in [(-6, -4), (5, 3), (-2, 9), (7, -8)]:
        out.append(f'<circle cx="{cx+42+gx}" cy="{cy+8+gy}" r="2.4" fill="#7E4FA3"/>')
    t(cx + 42, cy + 44, 'giant platelet', 12, 600, INK2)

def alder(cx, cy):
    cyto(cx, cy)
    lobes(cx, cy + 4)
    import math
    for i in range(16):
        a = i * 2 * math.pi / 16
        rr = 30 if i % 2 else 24
        out.append(f'<circle cx="{cx + rr*math.cos(a):.1f}" cy="{cy + rr*math.sin(a):.1f}" r="3.2" fill="#3B1A57"/>')

def pelger(cx, cy):
    cyto(cx, cy)
    out.append(f'<circle cx="{cx-14}" cy="{cy}" r="12" fill="{NUC_FILL}"/>')
    out.append(f'<circle cx="{cx+14}" cy="{cy}" r="12" fill="{NUC_FILL}"/>')
    out.append(f'<rect x="{cx-14}" y="{cy-3.5}" width="28" height="7" fill="{NUC_FILL}"/>')

# --- the map ---
CX, CY = 470, 116
link(f'M{CX+170} {CY-26} L800 74')            # to nuclear
link(f'M{CX-120} {CY+46} L250 286')           # to functional
link(f'M{CX+90} {CY+52} L760 286')            # to cytoplasmic
out.append(f'<ellipse cx="{CX}" cy="{CY}" rx="210" ry="62" fill="#FCE8F1" stroke="#BE185D" stroke-width="3"/>')
t(CX, CY - 6, 'Non-malignant', 24, 800, '#BE185D')
t(CX, CY + 24, 'neutrophilic disorders', 24, 800, '#BE185D')

# nuclear
branch(812, 74, 'Nuclear abnormalities', NUC)
link('M932 74 H950', NUC)
card(950, 20, 190, 228, 'Pelger-Huët', NUC, ['Dumbbell / peanut-', 'shaped nucleus'], pelger)

# functional
branch(250, 300, 'Functional disorders', FUNC)
link('M250 319 V336 M160 336 H450 M160 336 V352 M450 336 V352', FUNC)
card(20, 352, 280, 300, ['Chronic granulomatous', 'disease (CGD)'], FUNC, [
    'Sex-linked: males', '',
    'Can’t produce the oxidative', 'burst (NADPH oxidase defect),', 'so they can’t kill bacteria'])
card(320, 352, 260, 300, 'Chédiak-Higashi', FUNC, [
    'Fusion of 1° + 2° granules,', 'so they’re unable to', 'degranulate to kill bacteria'], chediak)

# cytoplasmic
branch(760, 300, 'Cytoplasmic abnormalities', CYTO)
link('M760 319 V336 M740 336 H1015 M740 336 V352 M1015 336 V352', CYTO)
card(610, 352, 260, 300, 'May-Hegglin', CYTO, [
    'Cigar-shaped,', 'Döhle-like inclusions', '',
    'Giant platelets,', 'thrombocytopenia', '+ bleeding'], may_hegglin)
card(890, 352, 250, 260, 'Alder-Reilly', CYTO, [
    'Large 1° granules in a', 'single or multiple', 'cell lines <tspan fill="#DB2777" font-weight="800">*</tspan>'], alder)

# Sohail's pink note
out.append('<path d="M1015 612 V640" stroke="#DB2777" stroke-width="2.5"/>')
out.append('<path d="M1008 622 L1015 610 L1022 622" stroke="#DB2777" stroke-width="2.5" fill="none"/>')
out.append('<rect x="890" y="640" width="250" height="96" rx="14" fill="#FDF2F8" stroke="#DB2777" stroke-width="2" stroke-dasharray="7 5"/>')
for i, ln in enumerate(['<tspan font-weight="800">* Differentiate from toxic</tspan>', '<tspan font-weight="800">granulation</tspan>, which is', 'present in neutrophils alone']):
    t(1015, 668 + i * 23, ln, 16, 400, '#9D174D')

t(20, 772, '1° = primary (azurophilic) granules · 2° = secondary (specific) granules · NADPH = nicotinamide adenine dinucleotide phosphate', 13, 400, INK2, 'start')

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="Helvetica, Arial, sans-serif" role="img" '
       'aria-label="Non-malignant neutrophilic disorders. Nuclear abnormalities: Pelger-Huet, a dumbbell or peanut-shaped nucleus. Functional disorders: chronic granulomatous disease, sex-linked, in males, cannot produce the oxidative burst because of an NADPH oxidase defect, so they cannot kill bacteria; Chediak-Higashi, fusion of primary and secondary granules so they are unable to degranulate to kill bacteria. Cytoplasmic abnormalities: May-Hegglin, cigar-shaped Dohle-like inclusions, giant platelets, thrombocytopenia and bleeding; Alder-Reilly, large primary granules in a single or multiple cell lines. Differentiate Alder-Reilly from toxic granulation, which is present in neutrophils alone.">\n'
       + '\n'.join(out) + '\n</svg>\n')
open(sys.argv[1], 'w').write(svg)
print('ok')
