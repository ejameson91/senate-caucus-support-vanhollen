import {
  DATA_URL,
  STATES,
  caucusMembers,
  draftMessage,
  getSenators,
} from "./senators.js";
import {
  draftHouseMessage,
  getRepresentatives,
  houseMembers,
  HOUSE_JURISDICTIONS,
} from "./representatives.js";
import { CONTACT_STATES, PREFIXES, validateExport } from "./export-data.js";

const $ = (selector) => document.querySelector(selector);
const stateSelect = $("#state");
const stateResults = $("#state-results");
const caucusList = $("#caucus-list");
const dataStatus = $("#data-status");
const houseStateSelect = $("#house-state");
const houseResults = $("#house-results");
const houseDataStatus = $("#house-data-status");
let senators = null;
let representatives = null;

stateSelect.disabled = true;
for (const [state, name] of Object.entries(STATES)) {
  const option = document.createElement("option");
  option.value = state;
  option.textContent = name;
  stateSelect.append(option);
}
for (const [state, name] of Object.entries(HOUSE_JURISDICTIONS).sort((a, b) => a[1].localeCompare(b[1]))) {
  const option = document.createElement("option");
  option.value = state;
  option.textContent = name;
  houseStateSelect.append(option);
}
for (const [state, name] of Object.entries(CONTACT_STATES)) {
  const option = document.createElement("option");
  option.value = state;
  option.textContent = name;
  $("#export-state").append(option);
}
for (const prefix of PREFIXES) {
  const option = document.createElement("option");
  option.value = prefix;
  option.textContent = prefix;
  $("#export-prefix").append(option);
}

$("#export-form").addEventListener("submit", (event) => {
  event.preventDefault();
  try {
    const campaign = $("#export-campaign").value;
    const data = validateExport({
      version: 1,
      campaign,
      contact: {
        prefix: $("#export-prefix").value,
        firstName: $("#export-first-name").value,
        lastName: $("#export-last-name").value,
        address: $("#export-address").value,
        address2: $("#export-address2").value,
        city: $("#export-city").value,
        state: $("#export-state").value,
        zip: $("#export-zip").value,
        email: $("#export-email").value,
        phone: $("#export-phone").value,
      },
      subject: campaign === "house" ? $("#house-subject").value : $("#subject").value,
      message: campaign === "house" ? $("#house-body").value : $("#body").value,
    });
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${campaign}-contact-export.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    $("#export-status").textContent = "Export downloaded. Keep it private and delete it when finished.";
  } catch (error) {
    $("#export-status").textContent = error.message;
  }
});

function card(senator) {
  const item = document.createElement("li");
  const title = document.createElement("h3");
  title.textContent = senator.name;
  item.append(title);
  const details = document.createElement("p");
  details.textContent = `${STATES[senator.state]} · ${senator.party}${senator.highlighted ? " · Highlighted" : ""}`;
  item.append(details);
  const links = document.createElement("div");
  links.className = "card-links";
  if (senator.contact || senator.website) {
    const link = document.createElement("a");
    link.href = senator.contact || senator.website;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = senator.contact
      ? "Open contact form"
      : "Visit official website";
    links.append(link);
  } else {
    const unavailable = document.createElement("span");
    unavailable.textContent = "Official link unavailable";
    links.append(unavailable);
  }
  if (senator.phone) {
    const phone = document.createElement("span");
    phone.textContent = `Office: ${senator.phone}`;
    links.append(phone);
  }
  item.append(links);
  return item;
}

function showState() {
  stateResults.replaceChildren();
  if (!stateSelect.value || !senators) return;
  const matches = senators.filter(
    (senator) => senator.state === stateSelect.value,
  );
  if (!matches.length) {
    stateResults.textContent =
      "No current senators found for this state. Check the official Senate directory.";
    return;
  }
  const list = document.createElement("ul");
  list.className = "senator-list";
  for (const senator of matches) list.append(card(senator));
  stateResults.append(list);
  if (matches.length !== 2) {
    const notice = document.createElement("p");
    notice.textContent =
      "The data does not list two senators for this state. Check the official Senate directory for vacancies or recent changes.";
    stateResults.append(notice);
  }
}

function houseCard(representative) {
  const item = document.createElement("li");
  const title = document.createElement("h3");
  title.textContent = representative.name;
  item.append(title);
  const details = document.createElement("p");
  const district = representative.district === 0 ? "At-large district" : `District ${representative.district}`;
  details.textContent = `${HOUSE_JURISDICTIONS[representative.state]} · ${district} · Democrat`;
  item.append(details);
  const links = document.createElement("div");
  links.className = "card-links";
  const url = representative.contact || representative.website;
  if (url) {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = representative.contact ? "Open official contact page" : "Visit official House website";
    links.append(link);
  } else {
    const unavailable = document.createElement("span");
    unavailable.textContent = "Official link unavailable";
    links.append(unavailable);
  }
  item.append(links);
  return item;
}

function showHouseMembers() {
  houseResults.replaceChildren();
  if (!houseStateSelect.value || !representatives) return;
  const matches = houseMembers(
    representatives.filter((representative) => representative.state === houseStateSelect.value),
  );
  if (!matches.length) {
    houseResults.textContent =
      "No current Democratic House member is listed for this state or territory. Check the official House directory.";
    return;
  }
  const list = document.createElement("ul");
  list.className = "senator-list";
  for (const representative of matches) list.append(houseCard(representative));
  houseResults.append(list);
}

stateSelect.addEventListener("change", showState);
houseStateSelect.addEventListener("change", showHouseMembers);
$("#draft-form").addEventListener("submit", (event) => {
  event.preventDefault();
  $("#body").value = draftMessage($("#sender-name").value, $("#reason").value);
  $("#copy-status").textContent =
    "Draft generated. Review and edit it before copying.";
});
$("#body").value = draftMessage("", "");
$("#house-body").value = draftHouseMessage("", "");
$("#house-draft-form").addEventListener("submit", (event) => {
  event.preventDefault();
  $("#house-body").value = draftHouseMessage($("#house-sender-name").value, $("#house-reason").value);
  $("#house-copy-status").textContent = "Draft generated. Review and edit it before copying.";
});

for (const [button, field, label, status] of [
  ["#copy-subject", "#subject", "Subject", "#copy-status"],
  ["#copy-body", "#body", "Message", "#copy-status"],
  ["#copy-house-subject", "#house-subject", "Subject", "#house-copy-status"],
  ["#copy-house-body", "#house-body", "Message", "#house-copy-status"],
]) {
  $(button).addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText($(field).value);
      $(status).textContent = `${label} copied.`;
    } catch {
      $(field).focus();
      $(field).select();
      $(status).textContent =
        `Could not copy ${label.toLowerCase()} automatically. The text is selected; copy it manually.`;
    }
  });
}

try {
  const response = await fetch(DATA_URL);
  if (!response.ok)
    throw new Error(`Data source returned HTTP ${response.status}.`);
  const memberData = await response.json();
  senators = getSenators(memberData);
  const caucus = caucusMembers(senators);
  if (!caucus.length)
    throw new Error("No Democratic caucus members were found in the data.");
  for (const senator of caucus) caucusList.append(card(senator));
  dataStatus.textContent = `${caucus.length} current senators listed, including independents identified as caucusing with Democrats.`;
  stateSelect.disabled = false;
  showState();
  representatives = houseMembers(getRepresentatives(memberData));
  if (representatives.length) {
    houseDataStatus.textContent = `${representatives.length} current Democratic House members listed by state and district. Select your district yourself.`;
    houseStateSelect.disabled = false;
    showHouseMembers();
  } else {
    houseDataStatus.textContent = "No current Democratic House members were found in the data.";
    houseStateSelect.disabled = true;
  }
} catch (error) {
  console.error("Could not load congressional member information:", error);
  dataStatus.textContent =
    "Could not load senator information. Please try again later or use the official Senate directory below.";
  stateResults.textContent =
    "Senator lookup is unavailable until the data can be loaded.";
  houseDataStatus.textContent =
    "Representative lookup is unavailable until the data can be loaded.";
  houseStateSelect.disabled = true;
}
