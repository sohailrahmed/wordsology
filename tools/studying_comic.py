"""Redraw Sohail's "Overstudying for the ASCP exam" comic as a clean SVG (his panels, characters and words).
usage: python3 -I tools/studying_comic.py public/media/passing-strategy/studying2.svg"""
import sys, base64, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
font = base64.b64encode(open(os.path.join(ROOT, 'public/fonts/patrick-hand-latin-400-normal.woff2'), 'rb').read()).decode()
W, PH, GAP, TOP = 760, 214, 16, 84
H = TOP + 5 * (PH + GAP) + 6
INK, SKIN, SHIRT = '#1F2937', '#FDE68A', '#3B82F6'
out = []
add = out.append

def text(x, y, s, size=30, anchor='start', fill=INK, extra=''):
    add(f'<text x="{x}" y="{y}" font-size="{size}" text-anchor="{anchor}" fill="{fill}"{extra}>{s}</text>')

def bubble(x, y, w, lines, tail, size=30, lh=34, side='left'):
    h = len(lines) * lh + 22
    tx, ty = tail
    ex = x if side == 'left' else x + w
    a, b = y + h * 0.42, y + h * 0.72
    add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="22" fill="#fff" stroke="{INK}" stroke-width="3"/>')
    inset = 2 if side == 'left' else -2
    add(f'<path d="M{ex+inset} {a} L{tx} {ty} L{ex+inset} {b} Z" fill="#fff"/>')
    add(f'<path d="M{ex} {a} L{tx} {ty} L{ex} {b}" fill="none" stroke="{INK}" stroke-width="3" stroke-linejoin="round"/>')
    for i, l in enumerate(lines):
        text(x + 20, y + 36 + i * lh, l, size)

def door(x, y, mirror=False):
    add(f'<rect x="{x}" y="{y}" width="78" height="172" rx="4" fill="#FEF3C7" stroke="{INK}" stroke-width="4"/>')
    kx = x + 66 if mirror else x + 12
    add(f'<circle cx="{kx}" cy="{y+96}" r="5" fill="{INK}"/>')
    if mirror:  # we're inside the test room now, so the sign reads backwards
        add(f'<g transform="translate({2*x+78} 0) scale(-1 1)">')
    text(x + 39, y + 36, 'test', 25, 'middle'); text(x + 39, y + 62, 'room', 25, 'middle')
    if mirror:
        add('</g>')

def guy(cx, cy, eyes='wide', mouth='o', arms='none', small=False, skin=SKIN, shirt=SHIRT):
    s = 0.62 if small else 1
    g = f'<g transform="translate({cx} {cy}) scale({s})">'
    add(g)
    # arms first (behind the body)
    A = {'panic': 'M-30 52 C-62 30 -66 -6 -38 -22 M30 52 C62 30 66 -6 38 -22',
         'raised': 'M-30 52 L-64 8 L-58 -26 M30 52 L64 8 L58 -26',
         'chin': 'M-26 60 C-8 54 2 44 6 34',
         'grab': 'M-30 52 C-66 34 -62 -18 -34 -30 M30 52 C66 34 62 -18 34 -30'}
    if arms in A:
        add(f'<path d="{A[arms]}" fill="none" stroke="{INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>')
    if arms in ('raised',):
        add(f'<path d="M-74 -18 l-8 -4 M-74 -30 l-9 0 M74 -18 l8 -4 M74 -30 l9 0" stroke="{INK}" stroke-width="3" stroke-linecap="round"/>')
    if arms in ('panic', 'grab'):
        add(f'<path d="M-52 -40 q-6 -8 0 -16 M52 -40 q6 -8 0 -16" fill="none" stroke="{INK}" stroke-width="3" stroke-linecap="round"/>')
    add(f'<rect x="-34" y="36" width="68" height="74" rx="16" fill="{shirt}" stroke="{INK}" stroke-width="3"/>')
    add(f'<ellipse cx="0" cy="0" rx="31" ry="39" fill="{skin}" stroke="{INK}" stroke-width="3"/>')
    # eyes
    for ex in (-13, 13):
        wfill = '#fff'
        add(f'<circle cx="{ex}" cy="-10" r="11" fill="{wfill}" stroke="{INK}" stroke-width="2.5"/>')
        if eyes == 'red':
            add(f'<path d="M{ex-9} -12 l5 2 M{ex+9} -6 l-5 -1 M{ex-6} -2 l4 -3" stroke="#DC2626" stroke-width="1.8"/>')
        dy = {'up': -5, 'wide': 0, 'red': 0, 'blank': 1, 'worried': -2}.get(eyes, 0)
        dx = 3 if eyes == 'up' else 0
        add(f'<circle cx="{ex+dx}" cy="{-10+dy}" r="{3.5 if eyes=="blank" else 5}" fill="{INK}"/>')
    if eyes == 'red':
        add(f'<path d="M-26 -27 L-4 -19 M26 -27 L4 -19" stroke="{INK}" stroke-width="4" stroke-linecap="round"/>')
    if eyes == 'worried':
        add(f'<path d="M-24 -24 L-6 -30 M24 -24 L6 -30" stroke="{INK}" stroke-width="3.5" stroke-linecap="round"/>')
    M = {'o': f'<ellipse cx="0" cy="20" rx="8" ry="10" fill="#fff" stroke="{INK}" stroke-width="3"/>',
         'wavy': f'<path d="M-12 20 q4 -5 8 0 q4 5 8 0 q4 -5 8 0" fill="none" stroke="{INK}" stroke-width="3" stroke-linecap="round"/>',
         'flat': f'<path d="M-12 22 Q0 14 12 22" fill="none" stroke="{INK}" stroke-width="4" stroke-linecap="round"/>',
         'scream': f'<ellipse cx="0" cy="21" rx="15" ry="13" fill="{INK}"/><ellipse cx="0" cy="27" rx="8" ry="4" fill="#F87171"/>',
         'line': f'<path d="M-9 21 H9" stroke="{INK}" stroke-width="4" stroke-linecap="round"/>',
         'small': f'<ellipse cx="0" cy="20" rx="5" ry="3" fill="{INK}"/>'}
    add(M[mouth])
    add('</g>')

def panel(i):
    y = TOP + i * (PH + GAP)
    add(f'<rect x="20" y="{y}" width="{W-40}" height="{PH}" rx="18" fill="#fff" stroke="{INK}" stroke-width="3"/>')
    return y

text(W / 2, 52, 'Overstudying for the ASCP exam', 40, 'middle', extra=' text-decoration="underline"')

y = panel(0); door(642, y + 22)
guy(112, y + 84, 'wide', 'o', 'panic'); bubble(196, y + 26, 400, ['i forgot the', 'henderson-hasselbach derivation'], (166, y + 92))

y = panel(1); door(642, y + 22)
guy(112, y + 84, 'up', 'wavy', 'chin'); bubble(196, y + 26, 330, ['i know its in here', 'somewhere brain...'], (166, y + 84))

y = panel(2); door(642, y + 22)
guy(112, y + 92, 'wide', 'flat', 'raised'); bubble(196, y + 26, 300, ['stop playing games!', 'what was it!?'], (162, y + 82))

y = panel(3); door(642, y + 22)
guy(112, y + 84, 'red', 'scream', 'grab'); bubble(196, y + 18, 366, ['i need to remember to', 'pass this test!!!!!'], (166, y + 80))
guy(262, y + 136, 'worried', 'small', 'none', small=True, skin='#F8FAFC', shirt='#4ADE80')
bubble(312, y + 112, 280, ['im scared can i leave?'], (290, y + 132), size=26)

y = panel(4); door(44, y + 22, mirror=True)
add(f'<rect x="586" y="{y+128}" width="124" height="16" rx="4" fill="#D6B48A" stroke="{INK}" stroke-width="3"/>')
add(f'<path d="M598 {y+144} V{y+200} M698 {y+144} V{y+200}" stroke="{INK}" stroke-width="4" stroke-linecap="round"/>')
add(f'<rect x="604" y="{y+70}" width="88" height="58" rx="4" fill="#fff" stroke="{INK}" stroke-width="3" transform="rotate(-4 648 {y+99})"/>')
text(648, y + 108, '2 + 2 =', 26, 'middle', extra=f' transform="rotate(-4 648 {y+99})"')
guy(530, y + 92, 'blank', 'line')
bubble(150, y + 22, 300, ['why did we have to go', 'to school for this?'], (488, y + 76), side='right')

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" '
       'aria-label="Comic: Overstudying for the ASCP exam. A student outside the test room panics: I forgot the Henderson-Hasselbalch derivation. I know it\'s in here somewhere, brain. Stop playing games, what was it? I need to remember to pass this test! A smaller student says: I\'m scared, can I leave? Inside the test room, the question is 2 + 2 =, and the student asks: why did we have to go to school for this?">\n'
       f'<style>@font-face{{font-family:"PH";src:url(data:font/woff2;base64,{font}) format("woff2")}}text{{font-family:"PH","Patrick Hand","Comic Sans MS",cursive}}</style>\n'
       f'<rect width="{W}" height="{H}" fill="#FFFDF4"/>\n' + '\n'.join(out) + '\n</svg>\n')
open(sys.argv[1], 'w').write(svg)
print('ok', W, H)
