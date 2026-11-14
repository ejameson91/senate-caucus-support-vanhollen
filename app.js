import {
  DATA_URL,
  STATES,
  caucusMembers,
  draftMessage,
  getSenators,
} from "./senators.js";

const $ = (selector) => document.querySelector(selector);
const stateSelect = $("#state");
const stateResults = $("#state-results");
const caucusList = $("#caucus-list");
const dataStatus = $("#data-status");
let senators = null;

stateSelect.disabled = true;
for (const [state, name] of Object.entries(STATES)) {
  const option = document.createElement("option");
  option.value = state;
  option.textContent = name;
  stateSelect.append(option);
}

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

stateSelect.addEventListener("change", showState);
$("#draft-form").addEventListener("submit", (event) => {
  event.preventDefault();
  $("#body").value = draftMessage($("#sender-name").value, $("#reason").value);
  $("#copy-status").textContent =
    "Draft generated. Review and edit it before copying.";
});
$("#body").value = draftMessage("", "");

for (const [button, field, label] of [
  ["#copy-subject", "#subject", "Subject"],
  ["#copy-body", "#body", "Message"],
]) {
  $(button).addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText($(field).value);
      $("#copy-status").textContent = `${label} copied.`;
    } catch {
      $(field).focus();
      $(field).select();
      $("#copy-status").textContent =
        `Could not copy ${label.toLowerCase()} automatically. The text is selected; copy it manually.`;
    }
  });
}

try {
  const response = await fetch(DATA_URL);
  if (!response.ok)
    throw new Error(`Data source returned HTTP ${response.status}.`);
  senators = getSenators(await response.json());
  const caucus = caucusMembers(senators);
  if (!caucus.length)
    throw new Error("No Democratic caucus members were found in the data.");
  for (const senator of caucus) caucusList.append(card(senator));
  dataStatus.textContent = `${caucus.length} current senators listed, including independents identified as caucusing with Democrats.`;
  stateSelect.disabled = false;
  showState();
} catch (error) {
  console.error("Could not load senator information:", error);
  dataStatus.textContent =
    "Could not load senator information. Please try again later or use the official Senate directory below.";
  stateResults.textContent =
    "Senator lookup is unavailable until the data can be loaded.";
}
