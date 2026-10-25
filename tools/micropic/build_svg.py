import base64, sys
png = base64.b64encode(open(__import__('os').path.join(__import__('os').path.dirname(__file__), 'micro_4x.png'),'rb').read()).decode()
F = "Arial, Helvetica, sans-serif"
q = [  # (baseline y, content) at 4x scale; matches the original line positions
 (102, 'A human may become infected with'),
 (178, '<tspan fill="#1D4ED8" text-decoration="underline">(what organism?)</tspan> by exposure to'),
 (254, 'urine (or soil contaminated by urine) from'),
 (330, 'these troublemakers…'),
]
SERIF = "Georgia, 'Times New Roman', Times, serif"
CAL = "Calibri, Carlito, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
t = ''.join(f'<text x="92" y="{y}" font-family="{SERIF}" font-style="italic" font-size="58" fill="#000">{s}</text>' for y, s in q)
t += ''.join(f'<text x="372" y="{y}" font-family="{CAL}" font-size="70" fill="#000">{w}</text>' for y, w in ((728, 'animal'), (820, 'pee'), (912, 'borne')))
svg = ('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="1200" viewBox="0 0 1200 1200" role="img" '
 'aria-label="Cartoon of a cow and a rat urinating, labeled animal pee borne. A human may become infected with (what organism?) by exposure to urine (or soil contaminated by urine) from these troublemakers.">'
 f'<image width="1200" height="1200" href="data:image/png;base64,{png}"/>{t}</svg>\n')
open(sys.argv[1],'w').write(svg); print('ok')
