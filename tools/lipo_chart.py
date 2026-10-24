"""Draw the lipoproteins chart (Sohail's original layout) as SVG.
usage: python3 -I lipo_chart.py <out.svg>"""
import sys, html
e = html.escape
W, H = 900, 820
INK, INK2 = '#16212B', '#4A5864'
TEAL = '#0E6A80'
out = [f'<rect width="{W}" height="{H}" fill="#fff"/>',
       '<defs><marker id="ah" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="#0E6A80"/></marker></defs>']

def t(x, y, s, size=16, weight=400, fill=INK, anchor='start', italic=False):
    st = ' font-style="italic"' if italic else ''
    out.append(f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" fill="{fill}" text-anchor="{anchor}"{st}>{s}</text>')

def card(x, y, w, h, name, comp, comp_color, apo, steps, accent=TEAL):
    out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="14" fill="#fff" stroke="#D5DDE3" stroke-width="1.5"/>')
    out.append(f'<path d="M{x} {y+14} a14 14 0 0 1 14 -14 h{w-28} a14 14 0 0 1 14 14 v32 h-{w} Z" fill="{accent}"/>')
    t(x + 18, y + 31, e(name), 20, 800, '#fff')
    # composition chip
    cw = 11 * len(comp) + 24
    out.append(f'<rect x="{x+w-cw-12}" y="{y+9}" width="{cw}" height="28" rx="14" fill="#fff"/>')
    t(x + w - 12 - cw / 2, y + 29, e(comp), 15, 800, comp_color, 'middle')
    # apoprotein tag
    out.append(f'<rect x="{x}" y="{y+h+8}" width="150" height="30" rx="15" fill="#EEF2F5" stroke="#C9D3DA" stroke-width="1.2"/>')
    t(x + 75, y + h + 28, e('Apoprotein ' + apo), 14, 700, INK2, 'middle')
    # body: steps centered, joined by small arrows (like the handwritten original)
    ty = y + 76
    cx = x + w / 2
    for i, lines in enumerate(steps):
        for ln in lines:
            t(cx, ty, e(ln), 16, anchor='middle')
            ty += 22
        if i < len(steps) - 1:
            out.append(f'<line x1="{cx}" y1="{ty-10}" x2="{cx}" y2="{ty+6}" stroke="{INK2}" stroke-width="2" marker-end="url(#ah)"/>')
            ty += 28

t(40, 40, 'Lipoproteins', 26, 800)
t(40, 70, 'Water-insoluble dietary lipids plus their transport vehicle, the apolipoproteins', 16, 400, INK2)

L, CW = 40, 470
card(L, 100, CW, 200, 'Chylomicrons', '90% triglyceride', '#1D4ED8', 'B-48', [
    ['(Exogenous) dietary triglycerides from the intestine'],
    ['Transported out to circulation and various tissues'],
    ['Ultimately degraded in the liver']])
out.append(f'<line x1="{L+CW/2}" y1="340" x2="{L+CW/2}" y2="364" stroke="{TEAL}" stroke-width="3" marker-end="url(#ah)"/>')
card(L, 370, CW, 170, 'VLDL', '55% triglyceride', '#1D4ED8', 'B-100', [
    ['Synthesized in the liver from endogenous triglycerides'],
    ['Goes out to the blood and deposits triglycerides', 'into body tissues, eventually turning into LDL']])
out.append(f'<line x1="{L+CW/2}" y1="580" x2="{L+CW/2}" y2="604" stroke="{TEAL}" stroke-width="3" marker-end="url(#ah)"/>')
card(L, 610, CW, 150, 'LDL', '50% cholesterol', '#B91C1C', 'B-100', [
    ['Brings cholesterol into peripheral cells for', 'membrane and hormone synthesis'],
], accent='#B91C1C')
t(L + CW/2, 740, 'But it can also bring cholesterol to artery walls', 16, 700, '#B91C1C', 'middle')

# HDL on the right, opposing LDL
HX, HW = 580, 290
card(HX, 370, HW, 150, 'HDL', '50% protein', '#15803D', 'A-1', [
    ['Synthesized in the liver; removes', 'excess cholesterol from', 'peripheral tissues']], accent='#15803D')
out.append('<path d="M760 560 L534 684" stroke="#15803D" stroke-width="4" fill="none"/>')
out.append('<path d="M524 666 L544 702" stroke="#15803D" stroke-width="5" stroke-linecap="round"/>')
t(680, 640, 'HDL counteracts LDL', 15, 700, '#15803D')

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="Helvetica, Arial, sans-serif" role="img" '
       'aria-label="Lipoproteins. Chylomicrons, 90 percent triglyceride, apoprotein B-48: exogenous dietary triglycerides from the intestine are transported to circulation and tissues and ultimately degraded in the liver. They lead to VLDL, 55 percent triglyceride, apoprotein B-100: synthesized in the liver from endogenous triglycerides, deposits triglycerides into tissues and eventually turns into LDL. LDL, 50 percent cholesterol, apoprotein B-100: brings cholesterol into peripheral cells for membrane and hormone synthesis, but can also bring cholesterol to artery walls. HDL, 50 percent protein, apoprotein A-1: synthesized in the liver, removes excess cholesterol from peripheral tissues and counteracts LDL.">\n'
       + '\n'.join(out) + '\n</svg>\n')
open(sys.argv[1], 'w').write(svg)
print('ok')
