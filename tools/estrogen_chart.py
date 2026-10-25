"""Draw Sohail's estrogen / menstrual cycle one-pager as SVG.
usage: python3 -I tools/estrogen_chart.py public/charts/endocrinology/estrogen.svg"""
import sys, math
W, H = 1500, 1880
INK, INK2, LINE = '#16212B', '#4A5864', '#5B6A75'
RED, DRED, BLUE, NAVY = '#C2302B', '#8B1E1E', '#1D4ED8', '#1E3A8A'
out = [f'<rect width="{W}" height="{H}" fill="#fff"/>',
       '<defs>'
       '<marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="#5B6A75"/></marker>'
       '<marker id="ahr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="#C2302B"/></marker>'
       '<marker id="ahk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="#16212B"/></marker>'
       '</defs>']

def t(x, y, s, size=17, weight=400, fill=INK, anchor='start', extra=''):
    out.append(f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" fill="{fill}" text-anchor="{anchor}"{extra}>{s}</text>')

def lines(x, y, rows, size=17, lh=23, fill=INK, anchor='start', weight=400, italic=False):
    st = ' font-style="italic"' if italic else ''
    for i, r in enumerate(rows):
        pad = (len(r) - len(r.lstrip(' '))) * 4 if anchor == 'start' else 0
        t(x + pad, y + i * lh, r.lstrip(' '), size, weight, fill, anchor, st)

def arrow(x1, y1, x2, y2, col=LINE, m='ah', w=2.2):
    out.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{col}" stroke-width="{w}" marker-end="url(#{m})"/>')

def pathc(d, col=LINE, w=2.2, m='ah', dash=''):
    da = f' stroke-dasharray="{dash}"' if dash else ''
    out.append(f'<path d="{d}" stroke="{col}" stroke-width="{w}" fill="none"{da}' + (f' marker-end="url(#{m})"' if m else '') + '/>')

def node(x, y, w, h, label, rows=1):
    out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="#F1F5F9" stroke="{INK}" stroke-width="2"/>')
    ls = label if isinstance(label, list) else [label]
    lines(x + w / 2, y + h / 2 + 6 - (len(ls) - 1) * 11, ls, 18, 22, INK, 'middle', 800)

def follicle(cx, cy, r, col=BLUE):  # the ruptured follicle "pac-man"
    a = math.radians(35)
    out.append(f'<path d="M{cx} {cy} L{cx + r*math.cos(a):.1f} {cy - r*math.sin(a):.1f} A{r} {r} 0 1 0 {cx + r*math.cos(a):.1f} {cy + r*math.sin(a):.1f} Z" fill="{col}"/>')
    for k in (-1, 0, 1):
        out.append(f'<circle cx="{cx + r*0.55:.1f}" cy="{cy + k*r*0.34:.1f}" r="{r*0.14:.1f}" fill="#fff"/>')

# ===== top: the overview =====
t(560, 34, 'An overview of why this is important', 19, 800, INK, 'start', ' text-decoration="underline"')
out.append(f'<ellipse cx="606" cy="62" rx="48" ry="16" fill="none" stroke="{RED}" stroke-width="2"/>')
lines(560, 68, ['Estrogens cause development of', 'secondary female sex characteristics'], 18, 24, RED, weight=700)
lines(590, 124, ['they are secreted at first by the ovarian', 'follicles and later by the placenta (during', 'pregnancy)'], 16, 22, DRED)
lines(560, 210, ['Progesterone maintains the uterine lining,', 'getting it ready for possible implantation', 'of a fertilized egg'], 18, 24, BLUE, weight=700)
lines(590, 290, ['it is secreted at first by the corpus luteum', 'and later by the placenta (during pregnancy)'], 16, 22, NAVY)
# estrogen side note
out.append(f'<rect x="40" y="30" width="300" height="124" rx="14" fill="#FFF7F7" stroke="{RED}" stroke-width="2" stroke-dasharray="7 5"/>')
lines(58, 62, ['Estradiol-17β is the most potent', 'version'], 16, 22)
out.append(f'<line x1="56" y1="100" x2="324" y2="100" stroke="{RED}" stroke-width="1.5" stroke-dasharray="5 4"/>')
lines(58, 126, ['Estriol is only made during pregnancy'], 16, 22)
pathc('M340 62 L558 62', RED, 2, None)

# menstrual cycle mini graph (redrawn)
gx, gy, gw, gh = 1010, 40, 300, 210
out.append(f'<rect x="990" y="20" width="490" height="326" rx="14" fill="#fff" stroke="{RED}" stroke-width="2" stroke-dasharray="9 6"/>')
t(gx, 50, 'Menstrual cycle', 20, 800)
X = lambda d: gx + d / 28 * gw
Y = lambda v: gy + 30 + gh - v * gh
out.append(f'<line x1="{gx}" y1="{Y(0)}" x2="{gx+gw}" y2="{Y(0)}" stroke="{INK}" stroke-width="1.5"/>')
for d in (0, 7, 14, 21, 28):
    t(X(d), Y(0) + 20, str(d), 13, 400, INK2, 'middle')
out.append(f'<line x1="{X(14)}" y1="{gy+40}" x2="{X(14)}" y2="{Y(0)}" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="4 4"/>')
t(X(14), gy + 36, 'ovulation', 12, 700, INK2, 'middle')
def curve(f, col, dash=''):
    pts = ' '.join(f'{X(d):.1f},{Y(f(d)):.1f}' for d in [i * 0.25 for i in range(113)])
    da = f' stroke-dasharray="{dash}"' if dash else ''
    out.append(f'<polyline points="{pts}" fill="none" stroke="{col}" stroke-width="2.6"{da}/>')
g = lambda d, m, s, a: a * math.exp(-((d - m) / s) ** 2)
curve(lambda d: 0.12 + g(d, 14, 1.1, 0.78), '#7C3AED')                       # LH
curve(lambda d: 0.16 + g(d, 14, 1.3, 0.36) + g(d, 3, 4, 0.06), '#0E7490', '6 4')  # FSH
curve(lambda d: 0.10 + g(d, 12.5, 2.4, 0.42) + g(d, 21, 3.5, 0.24), RED)       # estrogen
curve(lambda d: 0.05 + g(d, 21, 3.2, 0.5), BLUE, '2 4')                         # progesterone
for i, (lab, col) in enumerate([('LH', '#7C3AED'), ('FSH', '#0E7490'), ('Estrogen', RED), ('Progesterone', BLUE)]):
    t(gx + 4 + i * 74, Y(0) + 40, lab, 13, 800, col)
lines(1322, 82, ['FSH &amp; LH peak at', 'the middle of the', 'menstrual cycle'], 14, 19, INK2)
lines(1322, 162, ['In post-menopausal', 'women, the ovaries', 'stop secreting', 'estrogens. In response,', 'FSH &amp; LH rise to their', 'highest levels'], 14, 19, INK2)

# ===== the cycle flow =====
node(54, 468, 150, 46, 'Hypothalamus')
arrow(204, 491, 236, 491); t(240, 497, 'GnRH', 17, 800); arrow(292, 491, 324, 491)
node(326, 462, 150, 60, ['Anterior', 'Pituitary'])
# stop sign (negative feedback)
sx, sy, sr = 401, 556, 24
oct_ = ' '.join(f'{sx + sr*math.cos(math.radians(22.5 + 45*i)):.1f},{sy + sr*math.sin(math.radians(22.5 + 45*i)):.1f}' for i in range(8))
out.append(f'<polygon points="{oct_}" fill="#D62828" stroke="#fff" stroke-width="2.5"/>')
t(sx, sy + 5, 'STOP', 13, 800, '#fff', 'middle')
# FSH branch
arrow(476, 480, 520, 472); t(526, 478, 'FSH', 17, 800); arrow(570, 472, 610, 472)
node(612, 450, 112, 44, 'Ovaries')
lines(740, 428, ['causes growth of', 'ovarian follicles'], 16, 21, INK, italic=True)
for cx, r in ((790, 6), (816, 10), (854, 17)):
    out.append(f'<circle cx="{cx}" cy="482" r="{r}" fill="{BLUE}"/>')
lines(590, 520, ['causes estrogen', 'release from ovaries'], 16, 21, INK, italic=True)
out.append(f'<ellipse cx="686" cy="515" rx="42" ry="13" fill="none" stroke="{RED}" stroke-width="2"/>')
arrow(664, 548, 664, 572, RED, 'ahr'); t(676, 568, '+', 18, 800, RED)
lines(636, 596, ['the estrogen', 'prompts a surge', 'of LH release'], 16, 21, RED, weight=700, italic=True)
# LH line joins the follicle line at ovulation
arrow(476, 510, 506, 540); t(510, 562, 'LH', 17, 800)
pathc('M540 556 H880 L940 498', INK, 3, None)
pathc('M724 466 L880 466 L940 498', INK, 1.6, None)
arrow(940, 498, 1004, 498, INK, 'ahk', 3)
t(1014, 474, '<tspan font-weight="800" text-decoration="underline">OVULATION</tspan> which was prompted by that LH surge', 16, 400)
lines(1014, 500, ['refers to the rupture of the follicle,', 'releasing the egg'], 16, 21)
follicle(1130, 556, 20); out.append(f'<circle cx="1158" cy="558" r="8" fill="#E11D48"/>')
arrow(1120, 580, 1076, 740)
pathc('M1162 566 C 1200 640, 1340 600, 1346 700 L1348 732', INK, 1.8)
follicle(1062, 764, 18)
out.append('<circle cx="1352" cy="746" r="8" fill="#E11D48"/>')
lines(946, 800, ['the ruptured follicle remains', 'in the ovary, becoming a', 'Corpus Luteum (CL)'], 16, 21)
lines(1262, 778, ['the egg makes its way thru', 'the fallopian tube, hoping to', 'implant in the endometrium'], 16, 21)
arrow(1054, 870, 1054, 910)
lines(962, 936, ['the CL produces', 'Progesterone'], 16, 21, INK, weight=700)
arrow(1054, 966, 1054, 1006)
out.append(f'<rect x="938" y="1012" width="240" height="118" rx="12" fill="#F8FAFC" stroke="{INK}" stroke-width="2"/>')
lines(1058, 1040, ['high levels of', 'Estrogen from before', '+', 'high levels of', 'Progesterone now'], 16, 19, INK, 'middle', 700)
arrow(936, 1062, 466, 1062)
lines(350, 1056, ['suppresses', 'FSH &amp; LH'], 17, 22, INK, weight=700)
arrow(378, 1030, 378, 590)
arrow(1054, 1132, 1054, 1170)
lines(942, 1198, ['Thickens the endometrium', '(getting it ready to accommodate', 'a possibly fertilized egg)'], 16, 21)
arrow(1008, 1266, 904, 1334); arrow(1044, 1266, 1156, 1334)
# implantation: yes
lines(736, 1354, ['if successful implantation of a', 'fertilized ovum occurs, then the', 'trophoblast (the developing placenta)', 'begins producing HCG'], 16, 21)
arrow(846, 1440, 846, 1470)
t(740, 1494, 'HCG maintains the CL', 16, 700)
lines(760, 1518, ['HCG is thus highest early in', 'pregnancy (peaking at 8–10 weeks)', '', 'This is why HCG is measured in', 'the early detection of pregnancy'], 16, 21, NAVY, weight=700)
arrow(846, 1640, 846, 1680)
lines(708, 1704, ['when HCG levels fall, CL degenerates.', 'Placenta now takes over producing', 'Progesterone (levels of this hormone', 'peaking in the 3rd trimester)'], 16, 21)
out.append(f'<ellipse cx="740" cy="1720" rx="38" ry="13" fill="none" stroke="{RED}" stroke-width="2"/>')
# implantation: no
lines(1100, 1354, ['if successful implantation of a', 'fertilized ovum does NOT occur,', 'then HCG is NOT produced'], 16, 21)
arrow(1192, 1424, 1192, 1470)
t(1100, 1494, 'CL degenerates', 16, 700)
arrow(1192, 1506, 1192, 1540)
lines(1100, 1564, ['Estrogen &amp; Progesterone', 'levels decrease'], 16, 21, INK, weight=700)
arrow(1192, 1594, 1192, 1628)
lines(1100, 1652, ['Menstruation occurs', '(a shedding of the', 'thickened endometrium)'], 16, 21, INK, weight=700)
# placenta note
out.append(f'<rect x="300" y="1640" width="340" height="210" rx="14" fill="#FFF7F7" stroke="{RED}" stroke-width="2" stroke-dasharray="7 5"/>')
lines(318, 1670, ['Note: the Placenta also synthesizes', 'Estriol from a molecule that is only', 'produced by the fetus.', '', 'Estriol levels are monitored during', 'pregnancy b/c a fall in estriol level', 'suggests some problem with either', 'the fetus or the placenta'], 15, 21, DRED, italic=True)
pathc('M640 1736 L702 1724', RED, 1.6, None)

t(W - 20, H - 14, 'GnRH = gonadotropin-releasing hormone · FSH = follicle-stimulating hormone · LH = luteinizing hormone · HCG = human chorionic gonadotropin', 12, 400, INK2, 'end')

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="Helvetica, Arial, sans-serif" role="img" '
       'aria-label="Estrogen, progesterone and the menstrual cycle. The hypothalamus releases GnRH; the anterior pituitary releases FSH, which grows ovarian follicles and causes estrogen release; estrogen prompts an LH surge, which causes ovulation. The ruptured follicle becomes the corpus luteum, which produces progesterone. High estrogen plus progesterone suppress FSH and LH and thicken the endometrium. With implantation, HCG maintains the corpus luteum, peaking at 8 to 10 weeks; then the placenta takes over progesterone production. Without implantation, the corpus luteum degenerates, hormones fall and menstruation occurs. Notes cover estradiol, estriol, and post-menopausal FSH and LH.">\n'
       + '\n'.join(out) + '\n</svg>\n')
open(sys.argv[1], 'w').write(svg)
print('ok')
