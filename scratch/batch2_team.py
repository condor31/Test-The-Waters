import re
p = "index.html"
s = open(p, encoding="utf-8").read()

pat = re.compile(r'        <!-- Slide (\d+): ([^>]*?) -->\n        <li class="carousel__slide carousel__slide--leader">.*?\n        </li>\n', re.S)
blocks = list(pat.finditer(s))
assert len(blocks) == 14, len(blocks)
start, end = blocks[0].start(), blocks[-1].end()
between = s[start:end]
slides = {m.group(2).strip(): m.group(0) for m in blocks}
before = [m.group(2).strip() for m in blocks]
print("BEFORE:", before)

order = list(before)
def swap(a, b):
    i, j = order.index(a), order.index(b)
    order[i], order[j] = order[j], order[i]
swap("Craig Swanson", "Annie Wesen")            # T31a
# T31b (Kate / Jess) intentionally NOT applied: needs input
swap("Brian Yost", "Daniel Yarano")             # T31c
order.remove("Kari Niedfeldt-Thomas")           # T31d: after Dan, before Mark
order.insert(order.index("Daniel Yarano") + 1, "Kari Niedfeldt-Thomas")
print("AFTER :", order)

# T36: Tom's bio, add final line (C10)
tom_old = 'a Milwaukee manufacturer he has run at industrial scale for decades.</p>'
assert slides["Tom Sellars"].count(tom_old) == 1
slides["Tom Sellars"] = slides["Tom Sellars"].replace(
    tom_old, 'a Milwaukee manufacturer he has run at industrial scale for decades.<br>Founder and Chair of Concerts For the Environment.</p>')

out = []
for n, name in enumerate(order, 1):
    blk = slides[name]
    blk = re.sub(r'<!-- Slide \d+: ', f'<!-- Slide {n}: ', blk, count=1)
    out.append(blk)
joined = "\n".join(b.rstrip("\n") + "\n" for b in out)
# original separators were a blank line between slides
s = s[:start] + joined.replace("        </li>\n        <!-- Slide", "        </li>\n\n        <!-- Slide") + s[end:]
open(p, "w", encoding="utf-8").write(s)
