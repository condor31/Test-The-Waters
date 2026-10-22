/**
 * US Reuse Legislation Map Configuration
 *
 * TODO: [CONFIRM] State list and status categories pending from Mac Sellars / Jessica Johnston.
 *
 * How to update:
 * 1. Modify or add categories in `MAP_CATEGORIES`.
 * 2. Assign state two-letter codes (lowercase) to category IDs in `STATE_STATUSES`.
 *    Unassigned states automatically fall under the default category ('other').
 */

export const MAP_CATEGORIES = [
  {
    id: "passed",
    label: "EPR Legislation Passed (7 states) as of [month 2026]",
    color: "#8a2be2", // r.World Purple
    description: "Extended Producer Responsibility legislation enacted requiring reuse infrastructure."
  },
  {
    id: "pending",
    label: "Bills Introduced / In Process (12+ states)",
    color: "#ff0099", // r.World Magenta
    description: "Active EPR or reuse legislation currently introduced or moving through committee."
  },
  {
    id: "other",
    label: "Other States",
    color: "#d5dae0", // Neutral Slate Grey with clear visibility against white
    description: "Monitoring reuse policy or preparing legislation."
  }
];

export const STATE_STATUSES = {
  // Enacted / Passed EPR Laws (7 states)
  ca: "passed",
  co: "passed",
  me: "passed",
  or: "passed",
  mn: "passed",
  md: "passed",
  wa: "passed",

  // Bills Introduced / In Process (12 states)
  ct: "pending",
  ga: "pending",
  hi: "pending",
  il: "pending",
  ma: "pending",
  ne: "pending",
  nj: "pending",
  ny: "pending",
  nc: "pending",
  ri: "pending",
  tn: "pending",
  wi: "pending"
};

export const WASH_HUBS = [
  { id: "la", name: "Los Angeles", x: 86, y: 355 },
  { id: "sf", name: "San Francisco Bay Area", x: 38, y: 257 },
  { id: "den", name: "Denver", x: 328, y: 258 },
  { id: "msp", name: "Minneapolis", x: 526, y: 150 },
  { id: "dc", name: "Baltimore / D.C.", x: 804, y: 249 }
];

export const STATE_NAMES = {
  al: "Alabama", ak: "Alaska", az: "Arizona", ar: "Arkansas", ca: "California",
  co: "Colorado", ct: "Connecticut", de: "Delaware", dc: "District of Columbia",
  fl: "Florida", ga: "Georgia", hi: "Hawaii", id: "Idaho", il: "Illinois",
  in: "Indiana", ia: "Iowa", ks: "Kansas", ky: "Kentucky", la: "Louisiana",
  me: "Maine", md: "Maryland", ma: "Massachusetts", mi: "Michigan", mn: "Minnesota",
  ms: "Mississippi", mo: "Missouri", mt: "Montana", ne: "Nebraska", nv: "Nevada",
  nh: "New Hampshire", nj: "New Jersey", nm: "New Mexico", ny: "New York",
  nc: "North Carolina", nd: "North Dakota", oh: "Ohio", ok: "Oklahoma", or: "Oregon",
  pa: "Pennsylvania", ri: "Rhode Island", sc: "South Carolina", sd: "South Dakota",
  tn: "Tennessee", tx: "Texas", ut: "Utah", vt: "Vermont", va: "Virginia",
  wa: "Washington", wv: "West Virginia", wi: "Wisconsin", wy: "Wyoming"
};
