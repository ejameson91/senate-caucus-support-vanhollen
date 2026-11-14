import test from "node:test";
import assert from "node:assert/strict";
import {
  caucusMembers,
  draftMessage,
  getSenators,
  officialUrl,
} from "./senators.js";

const person = (id, name, term) => ({
  id: { bioguide: id },
  name: { official_full: name },
  terms: [
    {
      type: "sen",
      state: "ME",
      start: "2025-01-03",
      end: "2031-01-03",
      ...term,
    },
  ],
});

test("selects senators in the current dataset and the full Democratic caucus", () => {
  const senators = getSenators([
    person("K000383", "Angus King", {
      party: "Independent",
      caucus: "Democrat",
    }),
    person("D", "Democrat", { party: "Democrat" }),
    person("R", "Republican", { party: "Republican" }),
    person("O", "Appointee", { party: "Republican", end: "2026-11-03" }),
    person("H", "House member", { type: "rep", party: "Democrat" }),
  ]);
  assert.equal(senators.length, 4);
  assert.deepEqual(
    caucusMembers(senators).map((senator) => senator.name),
    ["Angus King", "Democrat"],
  );
  assert.equal(senators.filter((senator) => senator.state === "ME").length, 4);
});

test("uses only official Senate URLs and handles missing form URLs", () => {
  assert.equal(
    officialUrl("http://www.king.senate.gov/contact"),
    "https://www.king.senate.gov/contact",
  );
  assert.equal(officialUrl("https://senate.gov.evil.example/"), null);
  assert.equal(officialUrl("javascript:alert(1)"), null);
  assert.equal(officialUrl("https://user@senate.gov/"), null);
  const [senator] = getSenators([
    person("D", "Senator", {
      party: "Democrat",
      url: "https://example.senate.gov/",
    }),
  ]);
  assert.equal(senator.contact, null);
  assert.equal(senator.website, "https://example.senate.gov/");
});

test("draft includes user input and a placeholder when name is missing", () => {
  const defaultDraft = draftMessage("", "");
  assert.equal(
    defaultDraft,
    [
      "Dear Senator,",
      "I urge you to support Senator Chris Van Hollen, not Senator Chuck Schumer, for Senate Majority leader. The party is in desperate need of a change in leadership, and I believe the recent midterm election gave Democrats a mandate to make that change.",
      "Senator Van Hollen would be a far better choice to lead the caucus and serve as Senate Majority Leader. I believe he will put the interests of the people ahead of big-money donors and special interest groups.",
      "Please stand with voters demanding new leadership and support Senator Van Hollen.",
      "Sincerely,\n[Your Name]",
    ].join("\n\n"),
  );
  assert.match(draftMessage(" Ada ", " My reason. "), /My reason\./);
  assert.match(draftMessage(" Ada ", ""), /Sincerely,\nAda$/);
});

test("rejects malformed or empty data", () => {
  assert.throws(() => getSenators({}), /not a list/);
  assert.throws(() => getSenators([]), /No current senators/);
});
