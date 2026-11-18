import test from "node:test";
import assert from "node:assert/strict";
import {
  draftHouseMessage,
  getRepresentatives,
  houseMembers,
  officialHouseUrl,
} from "./representatives.js";

const person = (id, name, term) => ({
  id: { bioguide: id },
  name: { official_full: name },
  terms: [{ type: "rep", state: "CA", district: 1, party: "Democrat", ...term }],
});

test("selects only current Democratic representatives with valid districts", () => {
  const reps = getRepresentatives([
    person("A", "Ami Bera", { district: 6, url: "http://bera.house.gov/" }),
    person("B", "Republican", { party: "Republican" }),
    person("C", "Senator", { type: "sen" }),
    person("D", "Missing district", { district: null }),
    person("E", "Territory delegate", { state: "VI", district: 0 }),
  ]);
  assert.deepEqual(reps.map((rep) => [rep.name, rep.state, rep.district]), [
    ["Ami Bera", "CA", 6],
    ["Territory delegate", "VI", 0],
  ]);
  assert.equal(reps[0].website, "https://bera.house.gov/");
});

test("builds a representative name from first and last when the source omits official_full", () => {
  const member = person("W000832", "placeholder", { state: "CA", district: 14 });
  member.name = { first: "Aisha", last: "Wahab" };
  assert.equal(getRepresentatives([member])[0].name, "Aisha Wahab");
});

test("orders House members by jurisdiction and district", () => {
  const reps = [
    { name: "Second district", state: "CA", district: 2 },
    { name: "First district", state: "CA", district: 1 },
    { name: "At large", state: "DE", district: 0 },
  ];
  assert.deepEqual(houseMembers(reps).map((rep) => rep.name), [
    "First district",
    "Second district",
    "At large",
  ]);
});

test("accepts only official House office domains and upgrades HTTP", () => {
  assert.equal(officialHouseUrl("http://aguilar.house.gov/email-me"), "https://aguilar.house.gov/email-me");
  assert.equal(officialHouseUrl("https://house.gov/"), "https://house.gov/");
  assert.equal(officialHouseUrl("https://house.gov.evil.example/"), null);
  assert.equal(officialHouseUrl("https://example.com/"), null);
  assert.equal(officialHouseUrl("javascript:alert(1)"), null);
  assert.equal(officialHouseUrl("https://user@aguilar.house.gov/"), null);
});

test("uses a vetted official contact page when the upstream record has no form URL", () => {
  const [aguilar] = getRepresentatives([
    person("A000371", "Pete Aguilar", {
      state: "CA",
      district: 33,
      url: "https://aguilar.house.gov/",
    }),
  ]);
  assert.equal(aguilar.contact, "https://aguilar.house.gov/email-me/");
  const [other] = getRepresentatives([
    person("UNKNOWN", "Other Member", { url: "https://other.house.gov/" }),
  ]);
  assert.equal(other.contact, null);
});

test("provides direct official contact pages for the first directory batch", () => {
  const entries = [
    ["A000370", "Alma S. Adams", "NC", 12, "https://adamsforms.house.gov/contact/"],
    ["A000371", "Pete Aguilar", "CA", 33, "https://aguilar.house.gov/email-me/"],
    ["A000380", "Gabe Amo", "RI", 1, "https://amo.house.gov/contact"],
    ["A000381", "Yassamin Ansari", "AZ", 3, "https://ansari.house.gov/contact/email-me"],
    ["A000148", "Jake Auchincloss", "MA", 4, "https://auchincloss.house.gov/contact/emailme?1"],
  ];
  const reps = getRepresentatives(entries.map(([id, name, state, district]) =>
    person(id, name, { state, district })));
  assert.deepEqual(reps.map((rep) => rep.contact), entries.map((entry) => entry[4]));
});

test("adds the House speaker request and optional personal reason to the draft", () => {
  const message = draftHouseMessage(" Ada ", " My reason. ");
  assert.match(message, /^Dear Representative,/);
  assert.match(message, /not to vote for Representative Hakeem Jeffries for Speaker of the House/);
  assert.match(message, /My reason\./);
  assert.match(message, /Sincerely,\nAda$/);
  assert.match(draftHouseMessage("", ""), /Sincerely,\n\[Your Name\]$/);
});

