import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { FORMS } from "./desktop/forms.js";
import { prepareSelections, readTopics } from "./desktop/selects.js";

test("office picker is ordered by surname without changing its default", () => {
  const html = readFileSync(new URL("./desktop/index.html", import.meta.url), "utf8");
  const picker = html.match(/<select id="senator">([\s\S]*?)<\/select>/);
  assert.ok(picker);
  const options = [...picker[1].matchAll(/<option value="([^"]+)"( selected)?>([^<]+)<\/option>/g)];
  assert.deepEqual(options.map((option) => option[1]), [
    "alsobrooks", "bluntrochester", "booker", "coons", "cortezmasto", "fetterman", "gallego", "gillibrand",
    "hassan", "hickenlooper", "kim", "king", "klobuchar", "lujan", "markey", "merkley", "murphy", "ossoff",
    "padilla", "peters", "reed", "rosen", "sanders", "schatz", "schiff", "schumer", "shaheen", "slotkin", "vanhollen", "warren",
  ]);
  for (const [, id, , name] of options) assert.equal(name, FORMS[id].pickerLabel || FORMS[id].name);
  assert.deepEqual(options.filter((option) => option[2]).map((option) => option[1]), ["gillibrand"]);

  const houseHtml = readFileSync(new URL("./desktop/house.html", import.meta.url), "utf8");
  const housePicker = houseHtml.match(/<select id="senator">([\s\S]*?)<\/select>/);
  assert.ok(housePicker);
  assert.deepEqual(
    [...housePicker[1].matchAll(/<option value="([^"]+)">([^<]+)<\/option>/g)]
      .map((option) => [option[1], option[2]]),
    [["aguilar", "Pete Aguilar"]],
  );
});

function fixture(id) {
  const config = FORMS[id].selects;
  const option = (value, label, disabled = false) => ({
    value, textContent: label, disabled, closest: () => null,
  });
  const topic = {
    tagName: "SELECT", labels: [{ textContent: config.topic[1] }],
    options: [option("", "Select"), option("GOV", "Government Reform"), option("H", "Housing", true)],
  };
  const prefix = config.prefixText
    ? { tagName: "INPUT", type: "text", labels: [{ textContent: config.prefix[1] }] }
    : { tagName: "SELECT", labels: [{ textContent: config.prefix?.[1] }],
        options: [option("", "Select"), option("Dr.", "Dr.")] };
  const controls = { [config.topic[0]]: topic };
  if (config.prefix) controls[config.prefix[0]] = prefix;
  const form = {
    getClientRects: () => [1],
    querySelector: (selector) => controls[selector.match(/^\[id="(.+)"\]$/)?.[1]],
    querySelectorAll: (selector) => {
      const control = controls[selector.match(/^\[(?:id|name)="(.+)"\]$/)?.[1]];
      return control ? [control] : [];
    },
  };
  globalThis.document = { querySelector: (selector) => selector === config.form ? form : null };
  return { config, form, topic, prefix };
}

for (const id of ["aguilar", "gillibrand", "king", "cortezmasto", "padilla", "murphy", "schatz", "gallego", "schiff", "klobuchar", "kim", "alsobrooks", "lujan", "schumer", "vanhollen", "coons", "booker", "markey", "slotkin", "warren", "peters", "reed", "rosen", "shaheen", "merkley", "fetterman", "hickenlooper", "ossoff", "bluntrochester", "hassan"]) {
  test(`${id} loads selectable topics and prepares the chosen topic`, () => {
    const { config, topic } = fixture(id);
    if (config.requireCurrentTopic) topic.value = "GOV";
    const options = readTopics(config);
    assert.deepEqual(options, [{ value: "GOV", label: "Government Reform" }]);
    const result = prepareSelections(config, "", options[0]);
    assert.deepEqual(result.selected, [[topic, "GOV"]]);
    assert.deepEqual(result.warnings, config.prefixRequired ? ["Choose the required prefix on the form."] : []);
  });

  test(`${id} rejects stale topics before filling`, () => {
    const { config } = fixture(id);
    if (config.requireCurrentTopic) globalThis.document.querySelector(config.form).querySelector(`[id="${config.topic[0]}"]`).value = "GOV";
    assert.throws(() => prepareSelections(config, "", { value: "GOV", label: "Old label" }), /no longer available/);
  });
}

test("Sanders loads checkbox topics and prepares the named prefix and issue", () => {
  const config = FORMS.sanders.selects;
  const prefix = {
    tagName: "SELECT", labels: [{ firstChild: { textContent: " Prefix" } }],
    options: [{ value: "Dr.", textContent: "Dr.", disabled: false, closest: () => null }],
  };
  const issues = [
    { type: "checkbox", value: "Housing", labels: [{ textContent: "Housing" }] },
    { type: "checkbox", value: "Agriculture", labels: [{ textContent: "Agriculture" }] },
  ];
  const group = {
    parentElement: { querySelector: () => ({ textContent: "Legislative Issue *" }) },
    querySelectorAll: () => issues,
  };
  globalThis.document = {
    querySelector: () => ({
      getClientRects: () => [1],
      querySelector: (selector) => selector === '[data-name="Topic"]' ? group : null,
      querySelectorAll: (selector) => selector === '[name="Prefix"]' ? [prefix] : [],
    }),
  };
  assert.deepEqual(readTopics(config), [
    { value: "Housing", label: "Housing" },
    { value: "Agriculture", label: "Agriculture" },
  ]);
  const result = prepareSelections(config, "Dr.", { value: "Housing", label: "Housing" });
  assert.deepEqual(result.selected, [[prefix, "Dr."], [issues[0], "Housing", issues]]);
  issues[0].labels[0].textContent = "Changed";
  assert.throws(() => prepareSelections(config, "Dr.", { value: "Housing", label: "Housing" }), /no fields were filled/i);
});

test("Murphy's helper topic must match the topic already selected on the form", () => {
  const { config, topic } = fixture("murphy");
  topic.value = "Housing";
  assert.throws(() => prepareSelections(config, "", { value: "GOV", label: "Government Reform" }), /same topic/);
});

test("handles available, unavailable, and absent prefixes without guessing", () => {
  const { config, prefix } = fixture("cortezmasto");
  assert.deepEqual(prepareSelections(config, "Dr.", null).selected, [[prefix, "Dr."]]);
  assert.match(prepareSelections(config, "Mx.", null).warnings[0], /not available/);
  assert.match(prepareSelections(config, "", null).warnings[0], /required prefix/);
  const king = fixture("king");
  assert.match(prepareSelections(king.config, "Dr.", null).warnings[0], /no supported prefix/);
});

test("Kim's text prefix is filled only when the expected editable input exists", () => {
  const { config, prefix } = fixture("kim");
  assert.deepEqual(prepareSelections(config, "Dr.", null).selected, [[prefix, "Dr."]]);
  prefix.readOnly = true;
  assert.throws(() => prepareSelections(config, "Dr.", null), /no fields were filled/);
  prefix.readOnly = false;
  prefix.type = "hidden";
  assert.throws(() => prepareSelections(config, "Dr.", null), /no fields were filled/);
});

test("detects changed and hidden topic controls and disables ambiguous choices", () => {
  const { config, form, topic } = fixture("king");
  topic.labels[0].textContent = "Changed";
  assert.throws(() => readTopics(config), /changed/);
  topic.labels[0].textContent = config.topic[1];
  topic.options.push({ ...topic.options[1], textContent: "Another topic" });
  assert.deepEqual(readTopics(config), [
    { value: "GOV", label: "Government Reform", disabled: true },
    { value: "GOV", label: "Another topic", disabled: true },
  ]);
  assert.throws(() => prepareSelections(config, "", { value: "GOV", label: "Another topic" }), /no longer available/);
  form.getClientRects = () => [];
  assert.throws(() => readTopics(config), /hidden/);
});
