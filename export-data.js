import { STATES } from "./senators.js";

export const CONTACT_STATES = {
  ...STATES,
  DC: "District of Columbia",
  "American Samoa": "American Samoa",
  Guam: "Guam",
  "Northern Marianas Islands": "Northern Mariana Islands",
  "Puerto Rico": "Puerto Rico",
  "U.S. Virgin Islands": "U.S. Virgin Islands",
};

export const PREFIXES = ["Mr.", "Ms.", "Mrs.", "Mx.", "X.", "Dr.", "Miss", "Professor", "Dean", "The Honorable", "Prefer not to identify"];

export const CONTACT_FIELDS = [
  "firstName",
  "lastName",
  "address",
  "address2",
  "city",
  "state",
  "zip",
  "email",
  "phone",
];

export function validateExport(value) {
  if (!value || typeof value !== "object" || Array.isArray(value) || value.version !== 1)
    throw new Error("This is not a supported contact export.");
  if (Object.hasOwn(value, "campaign") && !["senate", "house"].includes(value.campaign))
    throw new Error("Choose a valid campaign.");
  if (!value.contact || typeof value.contact !== "object" || Array.isArray(value.contact))
    throw new Error("The contact details are missing.");
  const contact = {};
  for (const field of CONTACT_FIELDS) {
    const text = value.contact[field];
    if (typeof text !== "string" || text.length > 500)
      throw new Error(`Invalid contact field: ${field}.`);
    contact[field] = text.trim();
  }
  const prefix = Object.hasOwn(value.contact, "prefix") ? value.contact.prefix : "";
  if (typeof prefix !== "string" || (prefix !== "" && !PREFIXES.includes(prefix)))
    throw new Error("Invalid prefix.");
  contact.prefix = prefix;
  for (const field of ["firstName", "lastName", "address", "city", "state", "zip", "email", "phone"]) {
    if (!contact[field]) throw new Error(`Contact field required: ${field}.`);
  }
  if (!Object.hasOwn(CONTACT_STATES, contact.state))
    throw new Error("Choose a valid state.");
  if (typeof value.subject !== "string" || !value.subject.trim() || value.subject.length > 500)
    throw new Error("A subject of at most 500 characters is required.");
  if (typeof value.message !== "string" || !value.message.trim() || value.message.length > 20000)
    throw new Error("A message of at most 20,000 characters is required.");
  const result = { version: 1, contact, subject: value.subject.trim(), message: value.message.trim() };
  if (Object.hasOwn(value, "campaign")) result.campaign = value.campaign;
  if (new TextEncoder().encode(JSON.stringify(result, null, 2)).length > 65536)
    throw new Error("The contact export exceeds the 64 KB limit.");
  return result;
}

export function validateExportForCampaign(value, expectedCampaign) {
  if (!["senate", "house"].includes(expectedCampaign))
    throw new Error("Choose a valid campaign.");
  const data = validateExport(value);
  if (data.campaign && data.campaign !== expectedCampaign) {
    const campaignName = data.campaign[0].toUpperCase() + data.campaign.slice(1);
    throw new Error(`This is a ${campaignName} export. Import it in the ${campaignName} Form Helper.`);
  }
  return { data, campaignVerified: data.campaign === expectedCampaign };
}
