"""Draw the hematopoiesis chart (Sohail's original layout) as SVG.
usage: python3 -I tools/hematopoiesis_chart.py public/charts/hematology/hematopoiesis.svg"""
import sys, html
e = html.escape
W, H = 1150, 610
INK, INK2, TEAL, LINE = '#16212B', '#4A5864', '#0E6A80', '#7C8B96'
out = [f'<rect width="{W}" height="{H}" fill="#fff"/>',
       '<defs><marker id="ah" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="#7C8B96"/></marker></defs>']

def t(x, y, s, size=16, weight=400, fill=INK, anchor='middle'):
    out.append(f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" fill="{fill}" text-anchor="{anchor}">{e(s)}</text>')

def pill(cx, y, w, label, style='solid', h=40, size=17):
    if style == 'solid':
        out.append(f'<rect x="{cx-w/2}" y="{y}" width="{w}" height="{h}" rx="{h/2}" fill="{TEAL}"/>')
        t(cx, y + h/2 + 6, label, size, 800, '#fff')
    elif style == 'outline':
        out.append(f'<rect x="{cx-w/2}" y="{y}" width="{w}" height="{h}" rx="10" fill="#fff" stroke="{TEAL}" stroke-width="2.5"/>')
        t(cx, y + h/2 + 6, label, size, 800, TEAL)
    else:  # chip
        out.append(f'<rect x="{cx-w/2}" y="{y}" width="{w}" height="{h}" rx="10" fill="#EEF2F5" stroke="#C9D3DA" stroke-width="1.2"/>')
        t(cx, y + h/2 + 5, label, size, 700, INK)

def arrow(x1, y1, x2, y2):
    out.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2-6}" stroke="{LINE}" stroke-width="2.5" marker-end="url(#ah)"/>')

def lines(d):
    out.append(f'<path d="{d}" stroke="{LINE}" stroke-width="2.5" fill="none"/>')

t(40, 42, 'Hematopoiesis', 26, 800, INK, 'start')

# top of the tree
TOP = 444
pill(TOP, 64, 260, 'Pluripotent stem cell')
arrow(TOP, 104, TOP, 128)
pill(TOP, 128, 280, 'Hematopoietic stem cell')
MY, LY = 249, 638
lines(f'M{TOP} 168 V190 M{MY} 190 H{LY}')
arrow(MY, 190, MY, 212)
arrow(LY, 190, LY, 212)
pill(MY, 212, 270, 'Myeloid progenitor cell', 'outline')
pill(LY, 212, 230, 'Lymphoid stem cell', 'outline')

# myeloid line: four end cells
leaves = [(72, 'Megakaryocyte'), (190, 'Erythrocyte'), (308, 'Monocyte'), (426, 'Granulocyte')]
lines(f'M{MY} 252 V274 M{leaves[0][0]} 274 H{leaves[-1][0]}')
for x, name in leaves:
    arrow(x, 274, x, 298)
    pill(x, 298, 112, name, 'chip', 38, 14)

# lymphoid stage bands, keyed to Sohail's coloured brackets
BX, BW = 500, W - 500 - 18
bands = [
    (282, 140, '#1D4ED8', '#EFF6FF', [
        ('Antigen-INDEPENDENT lymphopoiesis', 800),
        ('takes place in the primary lymphoid tissue:', 400),
        ('T cells form in the thymus,', 400),
        ('B cells in the bone marrow', 400)]),
    (432, 52, '#B91C1C', '#FEF2F2', [
        ('The cells then enter the blood', 800)]),
    (494, 100, '#BE185D', '#FCE8F1', [
        ('Then they go on to secondary lymphoid tissue', 400),
        ('(spleen and lymph nodes), where', 400),
        ('antigen-DEPENDENT lymphopoiesis occurs', 800)]),
]
for y, h, col, tint, txt in bands:
    out.append(f'<rect x="{BX}" y="{y}" width="{BW}" height="{h}" rx="12" fill="{tint}"/>')
    out.append(f'<rect x="{BX}" y="{y}" width="6" height="{h}" rx="3" fill="{col}"/>')
    ty = y + h/2 - (len(txt) - 1) * 12 + 6
    for s, wgt in txt:
        t(784, ty, s, 16, wgt, col if wgt == 800 else INK, 'start')
        ty += 24

# T and B columns
TX, BXc = 574, 702
lines(f'M{LY} 252 V268 M{TX} 268 H{BXc}')
for x, pre, mature in [(TX, 'pre-T cell', 'T lymphocyte'), (BXc, 'pre-B cell', 'B lymphocyte')]:
    arrow(x, 268, x, 296)
    pill(x, 296, 120, pre, 'chip', 36, 15)
    arrow(x, 332, x, 366)
    pill(x, 366, 122, mature, 'outline', 40, 15)
    # down through the blood into secondary tissue
    out.append(f'<line x1="{x}" y1="406" x2="{x}" y2="{580}" stroke="{LINE}" stroke-width="2.5" marker-end="url(#ah)"/>')

out.append('<circle cx="590" cy="458" r="0"/>')

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="Helvetica, Arial, sans-serif" role="img" '
       'aria-label="Hematopoiesis. A pluripotent stem cell gives rise to the hematopoietic stem cell, which splits into the myeloid progenitor cell and the lymphoid stem cell. The myeloid progenitor gives rise to megakaryocytes, erythrocytes, monocytes and granulocytes. The lymphoid stem cell gives rise to pre-T cells, which become T lymphocytes, and pre-B cells, which become B lymphocytes. This antigen-independent lymphopoiesis takes place in the primary lymphoid tissue: T cells form in the thymus and B cells in the bone marrow. The cells then enter the blood, then go on to secondary lymphoid tissue, the spleen and lymph nodes, where antigen-dependent lymphopoiesis occurs.">\n'
       + '\n'.join(o for o in out if 'r="0"' not in o) + '\n</svg>\n')
open(sys.argv[1], 'w').write(svg)
print('ok')
