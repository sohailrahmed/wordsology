"""Draw Sohail's thyroid one-pager as SVG.
usage: python3 -I tools/thyroid_chart.py public/charts/endocrinology/thyroid.svg"""
import sys
W, H = 1240, 1040
INK, INK2, LINE, RED, BLUE = '#16212B', '#4A5864', '#5B6A75', '#B91C1C', '#1D4ED8'
out = [f'<rect width="{W}" height="{H}" fill="#fff"/>',
       '<defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="#5B6A75"/></marker></defs>']

def t(x, y, s, size=17, weight=400, fill=INK, anchor='start', extra=''):
    out.append(f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" fill="{fill}" text-anchor="{anchor}"{extra}>{s}</text>')

def lines(x, y, rows, size=17, lh=24, fill=INK, anchor='start', weight=400):
    for i, r in enumerate(rows):
        t(x, y + i * lh, r, size, weight, fill, anchor)

def arrow(x1, y1, x2, y2, col=LINE):
    out.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{col}" stroke-width="2.2" marker-end="url(#ah)"/>')

def oval(cx, cy, label):
    out.append(f'<ellipse cx="{cx}" cy="{cy}" rx="96" ry="36" fill="#6EE7B7" stroke="#047857" stroke-width="2.5"/>')
    ls = label if isinstance(label, list) else [label]
    lines(cx, cy + 6 - (len(ls) - 1) * 11, ls, 18, 22, '#053B2B', 'middle', 800)

# ---- the axis ----
AX = 430
oval(AX, 50, 'Hypothalamus')
arrow(AX, 86, AX, 140); t(AX + 12, 120, 'TRH', 17, 800)
oval(AX, 180, ['Anterior', 'Pituitary'])
arrow(AX, 216, AX, 262); t(AX + 12, 246, 'TSH', 17, 800)
# thyroid gland (butterfly)
out.append(f'<path d="M{AX-20} 300 C {AX-60} 262, {AX-122} 270, {AX-118} 330 C {AX-114} 384, {AX-62} 398, {AX-28} 368 C {AX-12} 356, {AX+12} 356, {AX+28} 368 C {AX+62} 398, {AX+114} 384, {AX+118} 330 C {AX+122} 270, {AX+60} 262, {AX+20} 300 C {AX+8} 312, {AX-8} 312, {AX-20} 300 Z" fill="#F7B7A3" stroke="#B4533A" stroke-width="2.5"/>')
out.append(f'<rect x="{AX-18}" y="262" width="36" height="22" rx="8" fill="#CBD5E1" stroke="#64748B" stroke-width="2"/>')
lines(AX, 332, ['Thyroid gland', '(follicular cells)'], 16, 20, '#5A1F12', 'middle', 700)
arrow(AX - 30, 392, AX - 66, 440); arrow(AX + 30, 392, AX + 66, 440)
for cx, lab, sub in ((AX - 76, 'FT4', ['(somewhat', 'active)']), (AX + 76, 'FT3', ['(most active)'])):
    out.append(f'<ellipse cx="{cx}" cy="462" rx="34" ry="20" fill="#EEF2FF" stroke="{BLUE}" stroke-width="2.5"/>')
    t(cx, 468, lab, 18, 800, BLUE, 'middle')
    lines(cx, 504, sub, 15, 19, INK2, 'middle')
arrow(AX - 112, 462, AX - 212, 462)
t(AX - 162, 452, 'deiodination', 14, 400, INK2, 'middle')
t(AX - 240, 468, 'rT3', 18, 800, INK, 'middle')
t(AX - 240, 504, '(inactive)', 15, 400, INK2, 'middle')
# negative feedback bracket
out.append(f'<path d="M{AX+110} 462 H{AX+190} V50 H{AX+104}" stroke="{BLUE}" stroke-width="2.5" fill="none"/>')
out.append(f'<path d="M{AX+190} 180 H{AX+104}" stroke="{BLUE}" stroke-width="2.5" fill="none"/>')
for y in (50, 180):
    out.append(f'<path d="M{AX+104} {y-12} V{y+12}" stroke="{BLUE}" stroke-width="3"/>')
t(AX + 200, 290, 'negative feedback', 14, 700, BLUE, 'start', f' transform="rotate(90 {AX+200} 290)"')

# ---- lab pattern table ----
TX, TY = 760, 70
cols = [TX, TX + 268, TX + 330, TX + 392, TX + 460]
t(cols[1] + 31, TY - 12, 'T4', 17, 800, INK, 'middle'); t(cols[2] + 31, TY - 12, 'T3', 17, 800, INK, 'middle'); t(cols[3] + 34, TY - 12, 'TSH', 17, 800, INK, 'middle')
rows = [('Primary hypothyroidism', '↓', '↓', '↑'), ('Secondary hypothyroidism', '↓', '↓', '↓'),
        ('Primary hyperthyroidism', '↑', '↑', '↓'), ('Secondary hyperthyroidism', '↑', '↑', '↑')]
for i, (name, a, b, c) in enumerate(rows):
    y = TY + i * 48
    out.append(f'<rect x="{TX}" y="{y}" width="{cols[4]-TX}" height="48" fill="{"#F8FAFC" if i % 2 else "#fff"}" stroke="#CBD5E1" stroke-width="1.5"/>')
    t(TX + 14, y + 31, name, 17, 600)
    for k, v in enumerate((a, b, c)):
        col = RED if v == '↑' else BLUE
        t((cols[k + 1] + cols[k + 2]) / 2, y + 33, v, 26, 800, col, 'middle')
for xx in cols[1:4]:
    out.append(f'<line x1="{xx}" y1="{TY}" x2="{xx}" y2="{TY+192}" stroke="#CBD5E1" stroke-width="1.5"/>')
t(TX, TY + 222, '↑ increased · ↓ decreased', 14, 400, INK2)

# ---- binding facts ----
out.append(f'<rect x="20" y="560" width="{W-40}" height="104" rx="12" fill="#F8FAFC" stroke="{INK}" stroke-width="2"/>')
lines(40, 592, ['• Thyroid hormones circulate in the blood bound to thyroxine binding globulin (TBG) or pre-albumin or albumin',
                '• while the quantity of free T4 is greater, free T3 is the biologically potent molecule',
                '• reverse T3 is biologically inactive'], 17, 28, INK, weight=700)

# ---- diseases ----
def head(x, y, s):
    t(x, y, s, 19, 800, RED, 'start', ' text-decoration="underline"')
head(40, 710, 'Hypothyroidism (myxedema)')
lines(40, 738, ['symptoms: enlarged thyroid gland; impaired mental', 'acuity; weight gain; cold intolerance'], 17, 24, RED)
lines(40, 836, ['Hashimoto thyroiditis is due to an autoimmune disease', 'in which TPO Ab (antithyroid peroxidase antibody)', 'attacks the thyroid gland'], 17, 24, RED)
lines(70, 918, ['not enough thyroid hormone is produced,', 'so TSH &amp; TRH are elevated'], 17, 24, RED, weight=700)
head(660, 710, 'Hyperthyroidism')
lines(660, 738, ['symptoms: muscle loss; fatigue; heat intolerance;', 'nervousness; exophthalmos'], 17, 24, RED)
lines(660, 798, ['“Thyroid storm” refers to the life-threatening', 'complication of uncontrolled thyrotoxicosis', '(excess thyroid hormones)'], 17, 24, RED)
lines(660, 884, ['Graves disease occurs when antibodies bind to TSH', 'receptors, stimulating the thyroid gland.', 'It’s more common in women.'], 17, 24, RED)
lines(690, 966, ['too much thyroid hormone is produced', 'so TSH &amp; TRH levels are depressed'], 17, 24, RED, weight=700)

t(W - 20, H - 8, 'TRH = thyrotropin-releasing hormone · TSH = thyroid-stimulating hormone · FT4/FT3 = free thyroxine / free triiodothyronine · rT3 = reverse T3', 12, 400, INK2, 'end')

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="Helvetica, Arial, sans-serif" role="img" '
       'aria-label="Thyroid. The hypothalamus releases TRH; the anterior pituitary releases TSH; the thyroid follicular cells release free T4 (somewhat active) and free T3 (most active), which feed back negatively. T4 is deiodinated to inactive reverse T3. Table: primary hypothyroidism T4 down, T3 down, TSH up; secondary hypothyroidism all down; primary hyperthyroidism T4 up, T3 up, TSH down; secondary hyperthyroidism all up. Thyroid hormones circulate bound to TBG, prealbumin or albumin. Hypothyroidism and Hashimoto thyroiditis; hyperthyroidism, thyroid storm and Graves disease are described.">\n'
       + '\n'.join(out) + '\n</svg>\n')
open(sys.argv[1], 'w').write(svg)
print('ok')
