import test from "node:test";
import assert from "node:assert/strict";
import { FORMS } from "./desktop/forms.js";
import { prepareSelections, readTopics } from "./desktop/selects.js";

function fixture(id) {
  const config = FORMS[id].selects;
  const option = (value, label, disabled = false) => ({
    value, textContent: label, disabled, closest: () => null,
  });
  const topic = {
    tagName: "SELECT", labels: [{ textContent: config.topic[1] }],
    options: [option("", "Select"), option("GOV", "Government Reform"), option("H", "Housing", true)],
  };
  const prefix = {
    tagName: "SELECT", labels: [{ textContent: config.prefix?.[1] }],
    options: [option("", "Select"), option("Dr.", "Dr.")],
  };
  const controls = { [config.topic[0]]: topic };
  if (config.prefix) controls[config.prefix[0]] = prefix;
  const form = {
    getClientRects: () => [1],
    querySelector: (selector) => controls[selector.match(/^\[id="(.+)"\]$/)?.[1]],
  };
  globalThis.document = { querySelector: (selector) => selector === config.form ? form : null };
  return { config, form, topic, prefix };
}

for (const id of ["gillibrand", "king", "cortezmasto", "padilla", "murphy"]) {
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

test("detects changed, hidden, and ambiguous topic controls", () => {
  const { config, form, topic } = fixture("king");
  topic.labels[0].textContent = "Changed";
  assert.throws(() => readTopics(config), /changed/);
  topic.labels[0].textContent = config.topic[1];
  topic.options.push({ ...topic.options[1] });
  assert.throws(() => readTopics(config), /ambiguous/);
  form.getClientRects = () => [];
  assert.throws(() => readTopics(config), /hidden/);
});
