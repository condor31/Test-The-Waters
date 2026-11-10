p = "qa/diff_check.js"
s = open(p, encoding="utf-8").read()
def rep(old, new):
    global s
    assert old in s, old[:50]
    s = s.replace(old, new, 1)

rep('  "30M",\n  "DRINKS SERVED",\n', '  "30M single-use cups eliminated.",\n')
rep('''  "From courtside to front-row center, r.World's reusable r.Cups are in the hands of some of your favorite celebrities.",''',
    '''  "From courtside to front-row center, r.World's reusable r.Cups, plates and other foodware are in the hands of some of your favorite celebrities.",''')
rep('  "Two priorities to make reuse mainstream nationwide.",', '  "Four ways your investment makes reuse mainstream nationwide.",')
rep('so fewer touches is what lets reuse compete with single-use on price.",', 'so fewer touches is what lets r.World compete with single-use on price.",')
rep('''  "Potential for New Categories",
  "As Extended Producer Responsibility rules land, beginning in California, reuse could extend to categories that don't have it yet, including consumer packaged goods.",
''', '''  "Legislation Is Here, and More Is Coming",
  "Extended Producer Responsibility rules are landing, beginning in California. More policy is on the way that will help reuse scale.",
  "Reuse Expands Into Consumer Packaged Goods",
  "Reuse could extend to categories that don't have it yet, starting with consumer packaged goods.",
''')
rep('''  "Michael Martin",
  "Founder & CEO",
''', '''  "Michael Martin",
  "Founder & CEO",
  "Founder and Chair of Concerts For the Environment",
''')

rep('''let failures = [];''', '''// Batch 2: strings that must keep their CURLY apostrophe (U+2019) as literal characters in the source,
// compared WITHOUT the quote normalization used above.
const exactCurlyStrings = [
  "From courtside to front-row center, r.World\\u2019s reusable r.Cups, plates and other foodware are in the hands of some of your favorite celebrities.",
  "Reuse could extend to categories that don\\u2019t have it yet, starting with consumer packaged goods.",
];

let failures = [];
for (const str of exactCurlyStrings) {
  if (!html.includes(str)) failures.push("[curly apostrophe preserved] " + str);
}''')
rep('''  console.log(`PASS: All ${expectedStrings.length} copy strings verified verbatim in index.html!`);''',
    '''  console.log(`PASS: All ${expectedStrings.length} copy strings (+ ${exactCurlyStrings.length} exact curly-apostrophe strings) verified verbatim in index.html!`);''')
open(p, "w", encoding="utf-8").write(s)
