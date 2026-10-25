"""Redraw Sohail's "animal pee borne" cartoon (Leptospira question) as a clean SVG, sized for the homepage card (3:2).
usage: python3 -I tools/micro_cartoon.py public/media/questions/micropic1.svg"""
import sys, base64, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
font = base64.b64encode(open(os.path.join(ROOT, 'public/fonts/patrick-hand-latin-400-normal.woff2'), 'rb').read()).decode()
W, H = 900, 600
INK, PEE = '#1F2937', '#FACC15'
o = []
add = o.append

def text(x, y, s, size=34, anchor='start', fill=INK, extra=''):
    add(f'<text x="{x}" y="{y}" font-size="{size}" text-anchor="{anchor}" fill="{fill}"{extra}>{s}</text>')

add(f'<rect x="5" y="5" width="{W-10}" height="{H-10}" rx="26" fill="#FFFDF4" stroke="{INK}" stroke-width="5"/>')
# the question
text(44, 66, 'A human may become infected with', 36)
add(f'<text x="44" y="110" font-size="36" fill="{INK}"><tspan fill="#2563EB" text-decoration="underline">(what organism?)</tspan> by exposure to urine</text>')
text(44, 154, '(or soil infected by urine) from these troublemakers…', 36)

# ground and puddles
add(f'<path d="M30 548 H{W-30}" stroke="#D6CFB8" stroke-width="3" stroke-dasharray="10 9" stroke-linecap="round"/>')
for cx, rx in ((318, 46), (566, 40)):
    add(f'<ellipse cx="{cx}" cy="546" rx="{rx}" ry="9" fill="{PEE}" opacity=".8"/>')
    add(f'<path d="M{cx-rx+10} 540 q6 -10 12 0 M{cx+rx-26} 538 q5 -8 10 0" fill="none" stroke="#EAB308" stroke-width="2.5" stroke-linecap="round"/>')

# ---- the cow (standing on her hind legs, like the original) ----
add('<g id="cow" transform="translate(214 546) scale(0.86) translate(-214 -546)">')
add(f'<rect x="166" y="492" width="30" height="50" rx="8" fill="#fff" stroke="{INK}" stroke-width="3.5"/><rect x="166" y="526" width="30" height="18" rx="5" fill="{INK}"/>')
add(f'<rect x="232" y="492" width="30" height="50" rx="8" fill="#fff" stroke="{INK}" stroke-width="3.5"/><rect x="232" y="526" width="30" height="18" rx="5" fill="{INK}"/>')
add(f'<rect x="148" y="262" width="132" height="246" rx="58" fill="#fff" stroke="{INK}" stroke-width="3.5"/>')
for cx, cy, rx, ry, rot in ((182, 320, 18, 24, -20), (246, 372, 22, 16, 15), (176, 430, 14, 20, 10), (240, 470, 16, 12, 0), (262, 300, 10, 14, 0)):
    add(f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{INK}" transform="rotate({rot} {cx} {cy})"/>')
add(f'<ellipse cx="214" cy="470" rx="22" ry="12" fill="#FBCFE8" stroke="{INK}" stroke-width="2.5"/>')  # udder
# arms
add(f'<path d="M156 300 C120 330 118 370 138 392" fill="none" stroke="{INK}" stroke-width="4" stroke-linecap="round"/><path d="M272 298 C306 320 312 352 300 372" fill="none" stroke="{INK}" stroke-width="4" stroke-linecap="round"/>')
# collar and bell
add(f'<rect x="166" y="252" width="98" height="18" rx="8" fill="#DC2626" stroke="{INK}" stroke-width="3"/>')
add(f'<path d="M216 268 q-14 4 -14 22 h28 q0 -18 -14 -22z" fill="#FACC15" stroke="{INK}" stroke-width="3"/><circle cx="216" cy="294" r="4" fill="{INK}"/>')
# head
add(f'<path d="M176 176 l-18 -22 l26 8 z M252 172 l18 -24 l-6 30 z" fill="#E5E7EB" stroke="{INK}" stroke-width="3" stroke-linejoin="round"/>')
add(f'<ellipse cx="214" cy="204" rx="46" ry="54" fill="#fff" stroke="{INK}" stroke-width="3.5"/>')
add(f'<ellipse cx="244" cy="190" rx="13" ry="17" fill="{INK}"/>')
add(f'<ellipse cx="226" cy="238" rx="36" ry="22" fill="#FBCFE8" stroke="{INK}" stroke-width="3"/><circle cx="214" cy="238" r="4" fill="{INK}"/><circle cx="238" cy="238" r="4" fill="{INK}"/>')
add(f'<circle cx="196" cy="196" r="10" fill="#fff" stroke="{INK}" stroke-width="2.5"/><circle cx="199" cy="198" r="5" fill="{INK}"/>')
add(f'<circle cx="232" cy="194" r="10" fill="#fff" stroke="{INK}" stroke-width="2.5"/><circle cx="235" cy="196" r="5" fill="{INK}"/>')
add(f'<path d="M184 180 l18 -6 M226 176 l16 2" stroke="{INK}" stroke-width="3" stroke-linecap="round"/>')  # cheeky brows
add('</g>')
# her stream
add(f'<path d="M224 486 C256 492 292 506 314 540" fill="none" stroke="{PEE}" stroke-width="6" stroke-linecap="round" stroke-dasharray="14 7"/>')

# ---- the label ----
for i, w in enumerate(('animal', 'pee', 'borne')):
    text(452, 330 + i * 54, w, 50, 'middle')

# ---- the rat ----
add('<g id="rat">')
add(f'<path d="M708 470 C780 470 820 430 800 380 C786 344 812 320 840 330" fill="none" stroke="#C08457" stroke-width="7" stroke-linecap="round"/>')
add(f'<ellipse cx="676" cy="446" rx="56" ry="78" fill="#A1683A" stroke="{INK}" stroke-width="3.5" transform="rotate(10 676 446)"/>')
add(f'<ellipse cx="664" cy="458" rx="30" ry="48" fill="#D9A273" transform="rotate(10 664 458)"/>')
add(f'<path d="M650 518 l-10 26 h26 M700 518 l4 26 h24" fill="none" stroke="{INK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>')
add(f'<path d="M640 404 C618 420 612 440 618 452 M700 400 C716 418 718 436 710 448" fill="none" stroke="{INK}" stroke-width="4" stroke-linecap="round"/>')
# head
add(f'<ellipse cx="658" cy="350" rx="44" ry="36" fill="#A1683A" stroke="{INK}" stroke-width="3.5"/>')
add(f'<path d="M620 354 L586 364 L620 374 Z" fill="#A1683A" stroke="{INK}" stroke-width="3" stroke-linejoin="round"/><circle cx="586" cy="364" r="6" fill="#F472B6" stroke="{INK}" stroke-width="2"/>')
add(f'<ellipse cx="652" cy="306" rx="15" ry="20" fill="#F9A8D4" stroke="{INK}" stroke-width="3"/><ellipse cx="684" cy="310" rx="15" ry="20" fill="#F9A8D4" stroke="{INK}" stroke-width="3"/>')
add(f'<circle cx="640" cy="344" r="6" fill="{INK}"/><circle cx="642" cy="342" r="2" fill="#fff"/>')
add(f'<path d="M600 358 l-26 -10 M600 366 l-28 2 M602 372 l-24 12" stroke="{INK}" stroke-width="2" stroke-linecap="round"/>')
add(f'<path d="M626 386 q8 6 16 0" fill="none" stroke="{INK}" stroke-width="2.5" stroke-linecap="round"/>')
add('</g>')
add(f'<path d="M646 500 C620 504 590 516 572 540" fill="none" stroke="{PEE}" stroke-width="6" stroke-linecap="round" stroke-dasharray="14 7"/>')

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" '
       'aria-label="Cartoon: a cow and a rat urinating, with the words animal pee borne. A human may become infected with (what organism?) by exposure to urine, or soil infected by urine, from these troublemakers.">\n'
       f'<style>@font-face{{font-family:"PH";src:url(data:font/woff2;base64,{font}) format("woff2")}}text{{font-family:"PH","Patrick Hand","Comic Sans MS",cursive}}</style>\n'
       + '\n'.join(o) + '\n</svg>\n')
open(sys.argv[1], 'w').write(svg)
print('ok')
