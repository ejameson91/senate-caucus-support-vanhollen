export const DATA_URL =
  "https://unitedstates.github.io/congress-legislators/legislators-current.json";

export const STATES = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
};

const HIGHLIGHTED = new Set([
  "G000555",
  "S001194",
  "C001113",
  "K000383",
  "G000574",
]);

export function officialUrl(value) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    if (url.hostname !== "senate.gov" && !url.hostname.endsWith(".senate.gov"))
      return null;
    if (url.username || url.password) return null;
    url.protocol = "https:";
    return url.href;
  } catch {
    return null;
  }
}

export function getSenators(data) {
  if (!Array.isArray(data)) throw new Error("Senator data is not a list.");
  const senators = data.flatMap((person) => {
    if (!Array.isArray(person.terms)) return [];
    const term = person.terms.at(-1);
    if (term?.type !== "sen" || !Object.hasOwn(STATES, term.state)) return [];
    const name = person.name?.official_full;
    if (typeof name !== "string" || !name.trim()) return [];
    return [
      {
        id: person.id?.bioguide,
        name,
        state: term.state,
        party: term.party || "Unknown",
        caucus: term.party === "Democrat" || term.caucus === "Democrat",
        highlighted: HIGHLIGHTED.has(person.id?.bioguide),
        contact: officialUrl(term.contact_form),
        website: officialUrl(term.url),
        phone: typeof term.phone === "string" ? term.phone : "",
      },
    ];
  });
  if (senators.length === 0)
    throw new Error("No current senators were found in the data.");
  return senators;
}

export function caucusMembers(senators) {
  return senators
    .filter((senator) => senator.caucus)
    .sort(
      (a, b) =>
        Number(b.highlighted) - Number(a.highlighted) ||
        a.name.localeCompare(b.name),
    );
}

export function draftMessage(name, reason) {
  const paragraphs = [
    "Dear Senator,",
    "I urge you to support Senator Chris Van Hollen, not Senator Chuck Schumer, for Senate Democratic leader. The party is in desperate need of a change in leadership, and I believe the recent midterm election gave Democrats a mandate to make that change.",
    "Senator Van Hollen would be a far better choice to lead the caucus and, if Democrats hold the majority, serve as Senate Majority Leader. I believe he will put the interests of the people ahead of big-money donors and special interest groups.",
  ];
  if (reason.trim()) paragraphs.push(reason.trim());
  paragraphs.push(
    "Please stand with voters demanding new leadership and support Senator Van Hollen.",
    `Sincerely,\n${name.trim() || "[Your name]"}`,
  );
  return paragraphs.join("\n\n");
}
