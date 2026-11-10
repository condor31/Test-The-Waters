import re
base = "public/assets/"
layers = [  # (file, left, top, width)  -- positions straight from .footer-logo__* in css/styles.css
 ("4c5208ba0b02775022f892d83a69f2f9896270ea.svg", 18, 35, 123),  # ring
 ("d323647b43eadc0a4f86d2049d5ff591995f29e7.svg", 10, 0, 116),   # swirl
 ("edcc8edb4c22bc67f66350c7eb06babdd36dc758.svg", 0, 43, 13),    # stroke
 ("f795dddfb4adcb537e2701c5759d66ee462ff07e.svg", 25, 35, 87),   # wordmark
 ("7b005613add16597d4c11600cb26a4b7a023d767.svg", 42, 75, 62),   # sub (reusables)
 ("3e67ce9de1ab218a39cb9022e13c93599b1199b7.svg", 142, 36, 6),   # tm
]
out = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 148 113" width="148" height="113" role="img" aria-label="r.World">',
       '<title>r.World</title>']
for f, left, top, width in layers:
    t = open(base + f, encoding="utf-8").read()
    m = re.search(r'<svg[^>]*\bwidth="([\d.]+)"[^>]*\bheight="([\d.]+)"[^>]*viewBox="0 0 ([\d.]+) ([\d.]+)"[^>]*>', t)
    w, h, vw, vh = map(float, m.groups())
    inner = t[m.end():t.rindex("</svg>")]
    inner = re.sub(r'\sid="[^"]*"', '', inner).strip()
    sx = width / vw
    sy = sx * (vh / vh)  # keep proportional (layers were exported at natural aspect ratio)
    out.append(f'<g transform="translate({left} {top}) scale({sx:.5f})">{inner}</g>')
out.append('</svg>\n')
open(base + "ttw/rworld-logo.svg", "w", encoding="utf-8").write("\n".join(out))
print(len("\n".join(out)), "bytes")
