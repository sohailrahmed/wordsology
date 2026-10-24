"""Draw the Gram-positive cocci identification flowchart as a single, publication-style SVG.

usage: python3 -I gpc_chart.py <out.svg>
Content is transcribed from Sohail's original chart (gram-pos-cocci2.png).
"""
import sys, textwrap, html

W, H = 2200, 1290
FONT = "Helvetica, Arial, sans-serif"
INK, INK2, LINE = '#16212B', '#4A5864', '#9AA8B3'
STAPH, STREP, ENT = '#0F766E', '#3949AB', '#B45309'
out = []
e = html.escape

def text(x, y, s, size=15, weight=400, fill=INK, anchor='start', italic=False, extra=''):
    st = ' font-style="italic"' if italic else ''
    out.append(f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" fill="{fill}" text-anchor="{anchor}"{st}{extra}>{s}</text>')

def line(pts, color=LINE, w=2.5):
    d = 'M' + ' L'.join(f'{x} {y}' for x, y in pts)
    out.append(f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{w}" stroke-linejoin="round"/>')

def badge(x, y, s, color):
    out.append(f'<circle cx="{x}" cy="{y}" r="13" fill="#fff" stroke="{color}" stroke-width="2.5"/>')
    text(x, y + 5.5, s, 15, 800, color, 'middle')

def genus(cx, y, name, color, w=300):
    out.append(f'<rect x="{cx-w/2}" y="{y}" width="{w}" height="50" rx="25" fill="{color}"/>')
    text(cx, y + 32, name, 20, 700, '#fff', 'middle', italic=True)
    return y + 50

def node(cx, y, label, color, w=230):
    out.append(f'<rect x="{cx-w/2}" y="{y}" width="{w}" height="44" rx="10" fill="#fff" stroke="{color}" stroke-width="2.5"/>')
    text(cx, y + 28, label, 17, 700, color, 'middle', italic=True)
    return y + 44

def test(cx, y, label, w=None):
    w = w or max(120, 11 * len(label) + 40)
    out.append(f'<rect x="{cx-w/2}" y="{y}" width="{w}" height="34" rx="17" fill="#EEF2F5" stroke="#C9D3DA" stroke-width="1.5"/>')
    text(cx, y + 23, e(label), 15, 700, INK2, 'middle')
    return y + 34

def test2(cx, y, top, bottom, w=170):
    """Two tests read together, stacked like Sohail's original (e.g. PYR over 6.5% NaCl)."""
    out.append(f'<rect x="{cx-w/2}" y="{y}" width="{w}" height="56" rx="18" fill="#EEF2F5" stroke="#C9D3DA" stroke-width="1.5"/>')
    text(cx, y + 23, e(top), 15, 700, INK2, 'middle')
    out.append(f'<line x1="{cx-w/2+22}" y1="{y+29}" x2="{cx+w/2-22}" y2="{y+29}" stroke="#C9D3DA" stroke-width="1"/>')
    text(cx, y + 47, e(bottom), 15, 700, INK2, 'middle')
    return y + 56

def badge2(x, y, a, b, color):
    """One result for each stacked test, stacked the same way."""
    badge(x, y, a, color)
    badge(x, y + 28, b, color)

def card(cx, y, title, bullets, color, w=250, sub=None):
    """A bullet may be ('art', height, draw_fn) to reserve space for a drawing: draw_fn(x, y, w)."""
    wrap = int((w - 34) / 7.6)
    rows = []
    for b in bullets:
        if isinstance(b, tuple):
            rows.append(b)
            continue
        parts = textwrap.wrap(b, wrap)
        rows.append(('text', 21, '• ' + parts[0]))
        rows += [('text', 21, '  ' + p) for p in parts[1:]]
    h = 52 + (22 if sub else 0) + sum(r[1] for r in rows) + 12
    x = cx - w / 2
    out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="12" fill="#fff" stroke="#D5DDE3" stroke-width="1.5"/>')
    out.append(f'<path d="M{x} {y+12} a12 12 0 0 1 12 -12 h{w-24} a12 12 0 0 1 12 12 v28 h-{w} Z" fill="{color}"/>')
    text(x + 16, y + 27, e(title), 17, 700, '#fff', italic=True)
    ty = y + 62
    if sub:
        text(x + 16, ty, e(sub), 13, 700, color, extra=' letter-spacing="0.5"')
        ty += 22
    for kind, rh, payload in rows:
        if kind == 'text':
            text(x + 16, ty, e(payload).replace('  ', '&#160;&#160;&#160;'), 15, 400, INK)
        else:
            payload(x, ty - 15, w)
        ty += rh
    return y + h

# ---------- Sohail's cute memory drawings ----------
GRAM = '#7B3FA0'  # Gram-positive purple
def grapes(x, y):
    # staphylococci: grape-like cluster
    pts = [(0,0),(11,-3),(22,1),(5,10),(16,9),(27,11),(10,19),(21,20),(15,29),(-4,13),(31,-1)]
    for dx, dy in pts:
        out.append(f'<circle cx="{x+dx}" cy="{y+dy}" r="6" fill="{GRAM}" stroke="#fff" stroke-width="1.2"/>')

def chain(x, y):
    # streptococci: chain of cocci
    import math
    for i in range(10):
        cx = x + i * 12.5
        cy = y + 9 * math.sin(i / 1.6)
        out.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="6.6" fill="{GRAM}" stroke="#fff" stroke-width="1.2"/>')

import base64, os
def lancets(x, y, w):
    # three pairs of lancet-shaped (pointed-oval) diplococci, end to end
    for i in range(3):
        cx = x + 26 + i * 70
        for dx in (0, 27):
            out.append(f'<path d="M{cx+dx} {y+14} q13 -11 26 0 q-13 11 -26 0 Z" fill="#1B1B1B"/>')

def whatami(x, y, w):
    src = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'media', 'questions', 'whatami.png')
    data = base64.b64encode(open(src, 'rb').read()).decode()
    iw = w - 24
    out.append(f'<image x="{x+12}" y="{y}" width="{iw}" height="{iw/2:.0f}" href="data:image/png;base64,{data}"/>')

def syringe(x, y, w):
    # needle + "So treat these strains with vancomycin (vanquishmycin)"
    g = f'<g transform="translate({x+20} {y+4}) rotate(35)">'
    g += '<rect x="0" y="6" width="34" height="12" rx="2" fill="#fff" stroke="#1B1B1B" stroke-width="2"/>'
    g += '<rect x="2" y="8" width="18" height="8" fill="#9F1239" opacity=".75"/>'
    g += '<rect x="-8" y="10" width="8" height="4" fill="#1B1B1B"/><rect x="-11" y="4" width="3" height="16" fill="#1B1B1B"/>'
    g += '<path d="M34 10 H42 V14 H34 Z" fill="#1B1B1B"/><path d="M42 11.2 H60 V12.8 H42 Z" fill="#1B1B1B"/></g>'
    out.append(g)
    text(x + 76, y + 14, 'So treat these strains', 15, 700, INK)
    text(x + 76, y + 35, 'with vancomycin', 15, 700, INK)
    text(x + 76, y + 56, '(vanquishmycin)', 15, 400, '#9F1239', italic=True)

out.append(f'<rect width="{W}" height="{H}" fill="#fff"/>')

# ---------- title + catalase ----------
text(W / 2, 46, 'Gram-positive cocci', 30, 800, INK, 'middle')
test(W / 2, 70, 'Catalase', 150)
line([(W/2, 104), (W/2, 120), (505, 120), (505, 150)])
line([(W/2, 120), (1620, 120), (1620, 150)])
badge(505, 128, '+', STAPH)
badge(1620, 128, '−', STREP)

# ---------- STAPH side ----------
A, B, C, D = 150, 385, 620, 860
genus(505, 150, 'Staphylococcus · Micrococcus', STAPH, 330)
grapes(690, 166)
line([(505, 200), (505, 215)])
test(505, 215, 'Coagulase', 140)
line([(505, 249), (505, 262), (A, 262), (A, 290)]); badge(A, 268, '+', STAPH)
line([(505, 262), (C, 262), (C, 290)]); badge(C, 268, '−', STAPH)

aureus_bottom = card(A, 290, 'S. aureus (& S. intermedius)', [
    'Salt tolerant; beta hemolytic',
    'Exfoliative toxins and enterotoxins; exfoliative toxin causes scalded skin syndrome',
    'Hyaluronidase',
    'Tampon use linked to toxic shock syndrome (TSS)',
    'About 50% of people carry it on skin and nares',
], STAPH, 260, None)
mrsa_y = aureus_bottom + 46
out.append(f'<path d="M{A} {aureus_bottom} V{mrsa_y}" stroke="#9F1239" stroke-width="2.5" stroke-dasharray="6 5"/>')
text(A - 10, aureus_bottom + 20, 'Methicillin-', 13, 700, '#9F1239', 'end')
text(A - 10, aureus_bottom + 37, 'resistant', 13, 700, '#9F1239', 'end')
card(A, mrsa_y, 'MRSA', [
    'Beta-lactamase inactivates penicillin/ampicillin',
    ('art', 66, syringe),
], '#9F1239', 260)

node(C, 290, 'Coag-neg staph · Micrococcus', STAPH, 280)
line([(C, 334), (C, 350)])
test2(C, 350, 'Microdase', 'Bacitracin', 170)
line([(C, 406), (C, 420), (B, 420), (B, 488)]); badge2(B, 436, '+', 'S', STAPH)
line([(C, 420), (D, 420), (D, 488)]); badge2(D, 436, '−', 'R', STAPH)

card(B, 488, 'Micrococcus', [
    'Microdase (modified oxidase) positive',
    'Bacitracin susceptible',
], STAPH, 220)
node(D, 488, 'Coag-neg staph', STAPH, 210)
line([(D, 532), (D, 548)])
test(D, 548, 'Novobiocin', 140)
line([(D, 582), (D, 596), (C, 596), (C, 623)]); badge(C, 602, 'S', STAPH)
line([(D, 596), (D, 638)])
badge(D, 611, 'R', STAPH)

card(C, 623, 'S. epidermidis', [
    'Novobiocin zone of inhibition > 16 mm',
    'Hospital-acquired, opportunistic: surgical wounds; enters via catheters to cause UTIs',
    'Glycocalyx (capsule, slime layer, biofilm)',
    ('art', 118, whatami),
], STAPH, 240)
card(D, 638, 'S. saprophyticus', [
    'UTIs in sexually active females',
], STAPH, 200)

# ---------- STREP side ----------
genus(1620, 150, 'Streptococcus · Enterococcus', STREP, 330)
chain(1800, 175)
line([(1620, 200), (1620, 215)])
test(1620, 215, 'Hemolysis on blood agar', 230)
AL, BE = 1270, 1930
line([(1620, 249), (1620, 262), (AL, 262), (AL, 280)])
line([(1620, 262), (BE, 262), (BE, 280)])
node(AL, 280, 'Alpha hemolytic', STREP, 210)
node(BE, 280, 'Beta hemolytic', STREP, 210)

# alpha
line([(AL, 324), (AL, 340)])
test(AL, 340, 'Optochin', 130)
E, F = 1150, 1400
line([(AL, 374), (AL, 388), (E, 388), (E, 415)]); badge(E, 394, 'S', STREP)
line([(AL, 388), (F, 388), (F, 415)]); badge(F, 394, 'R', STREP)
card(E, 415, 'S. pneumoniae', [
    'Optochin zone > 14 mm',
    'Lancet-shaped diplococci (in pairs)',
    ('art', 30, lancets),
    'Glistening, wet, domed colonies',
    'Bile soluble',
    'Quellung reaction positive (capsular swelling)',
    'Requires CO₂; grows on brain-heart infusion, trypticase soy and chocolate agar',
    'Polysaccharide capsule protects it from phagocytosis',
    'Pneumonia and meningitis in adults; otitis media in children',
], STREP, 250)
test(F, 415, 'Bile esculin', 140)
VI = 1570
line([(F, 449), (F, 463), (VI, 463), (VI, 490)]); badge(VI, 469, '−', STREP)
card(VI, 490, 'Viridans streptococci', [
    'Normal flora of the upper respiratory tract',
    'Cause dental infections; in the bloodstream, subacute bacterial endocarditis',
    'S. anginosus group grows in low O₂; abscesses of brain and abdomen',
], STREP, 250)

# beta
line([(BE, 324), (BE, 340)])
test2(BE, 340, 'PYR', 'Bacitracin', 150)
PY, HI = 1830, 2070
line([(BE, 396), (BE, 410), (PY, 410), (PY, 476)]); badge2(PY, 426, '+', 'S', STREP)
line([(BE, 410), (HI, 410), (HI, 476)]); badge2(HI, 426, '−', 'R', STREP)
card(PY, 476, 'S. pyogenes (Group A)', [
    'Strep throat', 'Scarlet fever',
], STREP, 220)
# Sohail's memory hooks: HIPPurate = hippo, CAMP = orange arrow (drawn as vectors so they stay sharp)
hx, hy = HI - 72, 476
out.append(f'''<g transform="translate({hx} {hy}) scale(1.22)" aria-label="Hippurate">
  <ellipse cx="48" cy="32" rx="42" ry="22" fill="#1B1B1B"/>
  <rect x="74" y="14" width="38" height="26" rx="12" fill="#1B1B1B"/>
  <ellipse cx="108" cy="30" rx="10" ry="11" fill="#1B1B1B"/>
  <circle cx="82" cy="13" r="5" fill="#1B1B1B"/><circle cx="92" cy="12" r="5" fill="#1B1B1B"/>
  <rect x="16" y="44" width="11" height="18" rx="3" fill="#1B1B1B"/><rect x="31" y="46" width="11" height="16" rx="3" fill="#1B1B1B"/>
  <rect x="58" y="46" width="11" height="16" rx="3" fill="#1B1B1B"/><rect x="73" y="44" width="11" height="18" rx="3" fill="#1B1B1B"/>
  <path d="M7 28 q-6 2 -7 8" stroke="#1B1B1B" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="99" cy="21" r="2" fill="#fff"/>
  <text x="50" y="37" font-size="13" font-weight="800" fill="#fff" text-anchor="middle" letter-spacing="0.5">HIPPURATE</text>
</g>''')
ax, ay = HI - 62, 558
out.append(f'''<g transform="translate({ax} {ay}) scale(1.1)" aria-label="CAMP test">
  <path d="M0 8 H72 V0 L112 22 L72 44 V36 H0 Z" fill="#F28C28"/>
  <text x="10" y="29" font-size="17" font-weight="800" fill="#fff" letter-spacing="1">CAMP</text>
</g>''')
GB = 1960
line([(HI, 607), (HI, 620), (GB, 620), (GB, 688)])
badge2(GB, 636, '+', '+', STREP)
card(GB, 688, 'S. agalactiae (Group B)', [
    'Bile NEG',
    'Normal flora of the genitourinary tract',
    'Can pass to the baby: neonatal sepsis, meningitis, pneumonia',
    'Antiphagocytic capsule contains sialic acid',
], STREP, 240)
line([(HI, 620), (2165, 620), (2165, 957), (2125, 957)]); badge2(2165, 636, '−', '−', STREP)
test(2050, 940, 'Bile esculin', 150)
line([(2050, 974), (2050, 1008)]); badge(2050, 990, '−', STREP)
card(2050, 1008, 'Beta strep, not A, B, or D', [
    'Other beta-hemolytic streptococci',
], STREP, 250)

# shared bile-esculin-positive path -> Enterococcus / Group D
PN = 1640
line([(F, 449), (F, 463), (1290, 463)], LINE)  # stub keeps the T visually closed
line([(1290, 463), (1290, 985), (PN, 985), (PN, 1000)])
badge(1290, 480, '+', STREP)
line([(1975, 957), (1890, 957), (1890, 985), (PN, 985)])
badge(1935, 957, '+', STREP)
test2(PN, 1000, 'PYR', '6.5% NaCl', 150)
EN, GD = 1500, 1780
line([(PN, 1056), (PN, 1070), (EN, 1070), (EN, 1136)]); badge2(EN, 1086, '+', '+', ENT)
line([(PN, 1070), (GD, 1070), (GD, 1136)]); badge2(GD, 1086, '−', '−', ENT)
card(EN, 1136, 'Enterococcus', ['PYR +, grows in 6.5% NaCl'], ENT, 230)
card(GD, 1136, 'Group D (non-enterococcal)', ['PYR −, no growth in 6.5% NaCl'], ENT, 250)

# ---------- footer ----------
text(40, H - 24, 'Sohail Ahmed, MLS(ASCP) · wordsology.org', 14, 600, INK2)
text(W - 40, H - 24, '+ positive   − negative   S susceptible   R resistant', 14, 600, INK2, 'end')

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="{FONT}" role="img" '
       'aria-label="Identification flowchart for gram-positive cocci, starting with catalase: Staphylococcus and Micrococcus on the positive side, Streptococcus and Enterococcus on the negative side.">\n'
       + '\n'.join(out) + '\n</svg>\n')
open(sys.argv[1], 'w').write(svg)
print('ok')
