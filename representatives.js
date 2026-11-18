import { STATES } from "./senators.js";

export const HOUSE_JURISDICTIONS = {
  ...STATES,
  DC: "District of Columbia",
  GU: "Guam",
  AS: "American Samoa",
  MP: "Northern Mariana Islands",
  PR: "Puerto Rico",
  VI: "U.S. Virgin Islands",
};

const HOUSE_CONTACT_URLS = {
  A000370: "https://adamsforms.house.gov/contact/",
  A000371: "https://aguilar.house.gov/email-me/",
  A000380: "https://amo.house.gov/contact",
  A000381: "https://ansari.house.gov/contact/email-me",
  A000148: "https://auchincloss.house.gov/contact/emailme?1",
};

export function officialHouseUrl(value) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol) ||
        (url.hostname !== "house.gov" && !url.hostname.endsWith(".house.gov")) ||
        url.username || url.password)
      return null;
    url.protocol = "https:";
    return url.href;
  } catch {
    return null;
  }
}

export function getRepresentatives(data) {
  if (!Array.isArray(data)) throw new Error("Representative data is not a list.");
  return data.flatMap((person) => {
    if (!Array.isArray(person.terms)) return [];
    const term = person.terms.at(-1);
    const id = person.id?.bioguide;
    const name = person.name?.official_full ||
      [person.name?.first, person.name?.middle, person.name?.last, person.name?.suffix]
        .filter((part) => typeof part === "string" && part.trim())
        .join(" ");
    if (term?.type !== "rep" || term.party !== "Democrat" ||
        !Object.hasOwn(HOUSE_JURISDICTIONS, term.state) ||
        !Number.isInteger(term.district) || term.district < 0 ||
        typeof id !== "string" || typeof name !== "string" || !name.trim())
      return [];
    return [{
      id,
      name: name.trim(),
      state: term.state,
      district: term.district,
      party: term.party,
      contact: officialHouseUrl(term.contact_form) ||
        officialHouseUrl(HOUSE_CONTACT_URLS[id]),
      website: officialHouseUrl(term.url),
    }];
  });
}

export function houseMembers(representatives) {
  return representatives.slice().sort((a, b) =>
    HOUSE_JURISDICTIONS[a.state].localeCompare(HOUSE_JURISDICTIONS[b.state]) ||
    a.district - b.district ||
    a.name.localeCompare(b.name));
}

export function draftHouseMessage(name, reason) {
  const paragraphs = [
    "Dear Representative,",
    "I urge you not to vote for Representative Hakeem Jeffries for Speaker of the House.",
  ];
  if (reason.trim()) paragraphs.push(reason.trim());
  paragraphs.push(
    "Please consider the views of your constituents when deciding whom to support for Speaker.",
    `Sincerely,\n${name.trim() || "[Your Name]"}`,
  );
  return paragraphs.join("\n\n");
}
