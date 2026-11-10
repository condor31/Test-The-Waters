const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.resolve(__dirname, "../index.html"), "utf8");

// Normalize curly vs straight quotes and html entities for testing match
function norm(str) {
  return str
    .replace(/<[^>]+>/g, " ")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&sect;/g, "§")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

const normHtml = norm(html);

const expectedStrings = [
  // Module 1 & 2
  "r.World Turned Reuse Into a Headliner",
  "We've been crushing single-use waste with a nationwide movement toward reuse. Help us crush it more.",
  "GET ON THE LIST",
  "30M single-use cups eliminated.",
  "150+",
  "CITIES",
  "30+",
  "STATES",
  "10,000+",
  "LIVE EVENTS",

  // Module 3
  "The Biggest Names in Sports and Entertainment Drink With Us",
  "From courtside to front-row center, r.World's reusable r.Cups, plates and other foodware are in the hands of some of your favorite celebrities.",
  "Pedro Pascal",
  "Meryl Streep and Martin Short",
  "Leonardo DiCaprio",
  "Flea",
  "Selena Gomez and Benny Blanco",
  "Jack Johnson",
  "Rhea Seehorn",
  "JOIN NOTIFICATION LIST",

  // Module 4
  "You've Probably Seen Us Live",
  "From airlines and 70,000-seat stadiums to iconic concert venues and nationwide tours, corporate and university campuses, conference centers, hospitals, and more r.World powers reuse wherever single-use waste is created.",

  // Module 5
  "Reuse Wins. Here's the Loop.",
  "Pour, return, clean, pour again. Up to 300 times per cup.",
  "Pour",
  "Return",
  "Clean",
  "Reuse",

  // Module 6
  "Five Parts. One Machine. Built to Scale.",
  "The same proprietary process runs everywhere single-use waste is created.",
  "JOIN THE NOTIFICATION LIST",

  // Module 7
  "Proof From Some of the Biggest Stages",
  "High-volume venues with massive crowds. On average, 90% of r.World reuse products are returned",
  "and 90% of r.World's clients stay for more reuse, too.",
  "Sphere",
  "600K cups returned",
  "Red Rocks Amphitheatre",
  "830K cups returned",
  "Merriweather Post Pavilion",
  "850K cups returned",
  "Crypto.com Arena",
  "1.5M cups returned",
  "CHS Field",
  "380K cups + foodware returned",
  "LA Memorial Coliseum",
  "65K cups returned",
  "Average share of delivered reusable items returned, Nov 2021–Oct 2026 (start date reflects r.World's 2021 shift to a full reuse model). Source: r.World internal operational data (r.Turn platform, customer invoices and delivery/pickup records).",
  "Share of customers who continued their programs vs. those who ended them, Nov 2021–Oct 2026. Source: r.World internal customer data and contract renewals.",

  // Module 8
  "r.World Goes Way Beyond the Stage Too",
  "Same engine. Bigger settings.",
  "Healthcare",
  "Corporate & College Campuses",
  "Travel & Hospitality",

  // Module 9
  "State After State Is Catching Up With r.World's Vision",
  "Reuse-friendly legislation and EPR are fueling a growing nationwide movement.",

  // Module 10
  "Better for Facilities, People and Planet",
  "Reuse keeps single-use waste out of landfills and the environment, saves cost on disposables and helps users consume with less hesitation.",
  "More than 1M pounds of CO2",
  "never generated",
  "Reuse pays off and then some.",
  "Lower costs",
  "Less waste hauling and less labor spent on cleanup.",
  "More revenue",
  "Potential sales lift, sponsorships on every cup, and a sustainability fee.",
  "Built for you",
  "We design each program to make the numbers work.",
  "Getting cheaper",
  "We're driving costs down every year toward single-use parity.",

  // Module 11
  "Recognized for Doing It Right",
  "Some of the nation's top media outlets have covered our work on the ground.",

  // Module 12
  "Where Your Investment Goes to Work",
  "Four ways your investment makes reuse mainstream nationwide.",
  "More Sanitization Centers",
  "Sanitization centers are what open new markets. The network can only serve what it can reach and wash, so adding centers is what lets r.World say yes to a new city.",
  "Deeper Automation",
  "Automation lowers the cost per item. Every touch an item needs adds cost, so fewer touches is what lets r.World compete with single-use on price.",
  "Legislation Is Here, and More Is Coming",
  "Extended Producer Responsibility rules are landing, beginning in California. More policy is on the way that will help reuse scale.",
  "Reuse Expands Into Consumer Packaged Goods",
  "Reuse could extend to categories that don't have it yet, starting with consumer packaged goods.",
  "The full allocation will be in r.World's offering statement when filed with the SEC.",

  // Module 12.5: Leadership (T14)
  "Leadership Built for the Industries We Serve",
  "Leadership & Board",
  "Michael Martin",
  "Founder & CEO",
  "Founder and Chair of Concerts For the Environment",

  // Module 13
  "Ok, Cool. What Happens Now?",

  // Module 14
  "Ready to Help r.World Crush It Some More?",

  // Disclaimer (T21 / C03)
  "No person depicted has endorsed or sponsored r.World or this offering. Images are used for illustrative purposes and remain the property of their respective owners.",
];

// Batch 2: strings that must keep their CURLY apostrophe (U+2019) as literal characters in the source,
// compared WITHOUT the quote normalization used above.
const exactCurlyStrings = [
  "From courtside to front-row center, r.World\u2019s reusable r.Cups, plates and other foodware are in the hands of some of your favorite celebrities.",
  "Reuse could extend to categories that don\u2019t have it yet, starting with consumer packaged goods.",
];

let failures = [];
for (const str of exactCurlyStrings) {
  if (!html.includes(str)) failures.push("[curly apostrophe preserved] " + str);
}
for (const str of expectedStrings) {
  if (!normHtml.includes(norm(str))) {
    failures.push(str);
  }
}

if (failures.length === 0) {
  console.log(`PASS: All ${expectedStrings.length} copy strings (+ ${exactCurlyStrings.length} exact curly-apostrophe strings) verified verbatim in index.html!`);
} else {
  console.error(`FAIL: ${failures.length} strings not found:`);
  failures.forEach((f) => console.error(" - " + f));
  process.exit(1);
}

