import test from "node:test";
import assert from "node:assert/strict";
import { fillGillibrand, fillMappedForm } from "./desktop/mapping.js";
import { FORMS, isFormUrl } from "./desktop/forms.js";
import { CONTACT_STATES } from "./export-data.js";

const fields = [
  ["input_3_1", "INPUT", "First Name*"],
  ["input_3_3", "INPUT", "Last Name*"],
  ["input_3_5", "INPUT", "Street Address*"],
  ["input_3_6", "INPUT", "Street Address (2)"],
  ["input_3_7", "INPUT", "City*"],
  ["input_3_9", "INPUT", "Zip*"],
  ["input_3_31", "INPUT", "Email Address*"],
  ["input_3_10", "INPUT", "Phone Number*"],
  ["input_3_34", "INPUT", "Subject*"],
  ["input_3_23", "TEXTAREA", "Your message to Kirsten*"],
];
const data = {
  contact: {
    firstName: "Test", lastName: "Example", address: "123 Example St",
    address2: "", city: "Example", state: "NY", zip: "10001",
    email: "test@example.com", phone: "2125550100",
  },
  subject: "Subject", message: "Message",
};

function fixture() {
  const controls = Object.fromEntries(fields.map(([id, tagName, placeholder]) => [id, {
    tagName, placeholder, value: "", dispatchEvent() {},
  }]));
  controls.input_3_32 = {
    tagName: "SELECT", value: "", options: [{ value: "NY" }], dispatchEvent() {},
  };
  const form = { querySelector: (selector) => controls[selector.slice(1)] };
  globalThis.document = { querySelector: (selector) => selector === "#gform_3" ? form : null };
  globalThis.location = { origin: "https://www.gillibrand.senate.gov", pathname: "/contact/email-me/" };
  return controls;
}

test("fills only the expected fields on the supported form", () => {
  const controls = fixture();
  assert.match(fillGillibrand(data), /does not submit/);
  assert.equal(controls.input_3_1.value, "Test");
  assert.equal(controls.input_3_32.value, "NY");
  assert.equal(controls.input_3_23.value, "Message");
});

test("does not fill anything if a field changes or the page is wrong", () => {
  const controls = fixture();
  controls.input_3_10.placeholder = "Changed";
  assert.throws(() => fillGillibrand(data), /no fields were filled/);
  assert.equal(controls.input_3_1.value, "");
  globalThis.location.origin = "https://example.com";
  assert.throws(() => fillGillibrand(data), /not the supported contact form/);
});

function mappedFixture(id) {
  const { mapping } = FORMS[id];
  const controls = Object.fromEntries(mapping.fields.map(([field, label, , tag = "INPUT"]) => [
    field, { tagName: tag, labels: [{ textContent: label, firstChild: { textContent: label } }], value: "", getClientRects: () => [1], dispatchEvent() {} },
  ]));
  controls[mapping.state[0]] = {
    tagName: mapping.stateText ? "INPUT" : "SELECT", labels: [{ textContent: mapping.state[1], firstChild: { textContent: mapping.state[1] } }], value: "",
    options: [{
      value: mapping.stateCodeSuffix ? "38_NY" : mapping.fullStateName ? "New York" : "NY",
      textContent: "New York", closest: () => null,
    }], getClientRects: () => [1], dispatchEvent() {},
  };
  if (mapping.prerequisite) {
    const [field, label, value = "Housing"] = mapping.prerequisite;
    controls[field] = { tagName: "SELECT", labels: [{ textContent: label }], value, getClientRects: () => [1] };
  }
  const form = {
    getClientRects: () => [1],
    querySelectorAll: (selector) => {
      const control = controls[selector.match(/^\[(?:id|name)="(.+)"\]$/)?.[1]];
      return control ? [control] : [];
    },
  };
  globalThis.document = { querySelector: (selector) => selector === mapping.form ? form : null };
  return { controls, mapping: { ...mapping, stateNames: CONTACT_STATES } };
}

for (const id of ["aguilar", "king", "cortezmasto", "padilla", "murphy", "schatz", "gallego", "schiff", "klobuchar", "kim", "alsobrooks", "lujan", "sanders", "schumer", "vanhollen", "coons", "booker", "markey", "slotkin", "warren", "peters", "reed", "rosen", "shaheen", "merkley", "fetterman", "hickenlooper", "ossoff", "bluntrochester", "hassan"]) {
  test(`${id} fills expected fields including email confirmation`, () => {
    const { controls, mapping } = mappedFixture(id);
    assert.match(fillMappedForm(data, mapping), /does not submit/);
    for (const [field, , key] of mapping.fields) {
      assert.equal(controls[field].value, key === "combinedAddress" ? data.contact.address : key === "subject" || key === "message" ? data[key] : data.contact[key]);
    }
    assert.equal(controls[mapping.state[0]].value, mapping.stateCodeSuffix ? "38_NY" : mapping.fullStateName ? "New York" : "NY");
  });

  test(`${id} rejects changed fields and unsupported states before filling`, () => {
    const { controls, mapping } = mappedFixture(id);
    controls[mapping.fields.at(-1)[0]].labels[0].textContent = "Changed";
    controls[mapping.fields.at(-1)[0]].labels[0].firstChild.textContent = "Changed";
    assert.throws(() => fillMappedForm(data, mapping), /no fields were filled/);
    assert.equal(controls[mapping.fields[0][0]].value, "");
    controls[mapping.fields.at(-1)[0]].labels[0].textContent = mapping.fields.at(-1)[1];
    controls[mapping.fields.at(-1)[0]].labels[0].firstChild.textContent = mapping.fields.at(-1)[1];
    if (mapping.stateText) controls[mapping.state[0]].readOnly = true;
    else controls[mapping.state[0]].options = [];
    assert.throws(() => fillMappedForm(data, mapping), /no fields were filled/);
    assert.equal(controls[mapping.fields[0][0]].value, "");
  });
}

test("Merkley fills a validated text state with its full name", () => {
  const { controls, mapping } = mappedFixture("merkley");
  fillMappedForm(data, mapping);
  assert.equal(controls[mapping.state[0]].value, "New York");
  controls[mapping.fields[0][0]].value = "";
  controls[mapping.state[0]].labels[0].textContent = "Changed";
  assert.throws(() => fillMappedForm(data, mapping), /no fields were filled/);
  assert.equal(controls[mapping.fields[0][0]].value, "");
});

test("Aguilar mapping tells users which form choices remain manual", () => {
  const { mapping } = mappedFixture("aguilar");
  assert.match(fillMappedForm(data, mapping), /Choose whether you want a response yourself/);
  assert.match(fillMappedForm(data, mapping), /does not submit/);
});

test("Ossoff combines address lines and maps territory codes", () => {
  const { controls, mapping } = mappedFixture("ossoff");
  controls[mapping.state[0]].options = [{ value: "VI" }];
  fillMappedForm({ ...data, contact: { ...data.contact, address2: "Unit 2", state: "U.S. Virgin Islands" } }, mapping);
  assert.equal(controls["form-field-field_ecb1f5b"].value, "123 Example St\nUnit 2");
  assert.equal(controls[mapping.state[0]].value, "VI");
});

test("Fetterman refuses oversized messages before filling", () => {
  const { controls, mapping } = mappedFixture("fetterman");
  controls.input_3_6.maxLength = 1200;
  assert.throws(() => fillMappedForm({ ...data, message: "x".repeat(1201) }, mapping), /length limit/);
  assert.equal(controls.input_3_1_3.value, "");
  fillMappedForm({ ...data, message: "x".repeat(1200) }, mapping);
  assert.equal(controls.input_3_6.value.length, 1200);
});

test("Slotkin selects an unambiguous state code and rejects missing or duplicate matches", () => {
  const { controls, mapping } = mappedFixture("slotkin");
  const state = controls[mapping.state[0]];
  const option = (value, label, disabled = false) => ({ value, textContent: label, disabled, closest: () => null });
  state.options = [option("8_DC", "D.C."), option("9_D.C.", "D.C."), option("56_VI", "Virgin Islands")];
  fillMappedForm({ ...data, contact: { ...data.contact, state: "DC" } }, mapping);
  assert.equal(state.value, "8_DC");
  fillMappedForm({ ...data, contact: { ...data.contact, state: "U.S. Virgin Islands" } }, mapping);
  assert.equal(state.value, "56_VI");
  controls[mapping.fields[0][0]].value = "";
  state.options = [option("2_VI", "Virgin Islands"), option("56_VI", "Virgin Islands")];
  assert.throws(() => fillMappedForm({ ...data, contact: { ...data.contact, state: "U.S. Virgin Islands" } }, mapping), /state is unavailable/);
  assert.equal(controls[mapping.fields[0][0]].value, "");
  state.options = [option("56_VI", "Virgin Islands", true)];
  assert.throws(() => fillMappedForm({ ...data, contact: { ...data.contact, state: "U.S. Virgin Islands" } }, mapping), /state is unavailable/);
  assert.equal(controls[mapping.fields[0][0]].value, "");
  state.options = [option("56_VI", "Other")];
  assert.throws(() => fillMappedForm({ ...data, contact: { ...data.contact, state: "U.S. Virgin Islands" } }, mapping), /state is unavailable/);
  assert.equal(controls[mapping.fields[0][0]].value, "");
});

test("Sanders uses its DC option and rejects oversized messages before filling", () => {
  const { controls, mapping } = mappedFixture("sanders");
  controls.State.options = [{ value: "Washington DC" }];
  const dcData = { ...data, contact: { ...data.contact, state: "DC" } };
  controls["your-message"].maxLength = 5;
  assert.throws(() => fillMappedForm(dcData, mapping), /length limit/);
  assert.equal(controls.FirstName.value, "");
  controls["your-message"].maxLength = 2000;
  fillMappedForm(dcData, mapping);
  assert.equal(controls.State.value, "Washington DC");
});

test("Sanders refuses ambiguous named controls", () => {
  const { controls, mapping } = mappedFixture("sanders");
  const form = globalThis.document.querySelector(mapping.form);
  const query = form.querySelectorAll;
  form.querySelectorAll = (selector) => selector === '[name="FirstName"]'
    ? [controls.FirstName, controls.FirstName]
    : query(selector);
  assert.throws(() => fillMappedForm(data, mapping), /no fields were filled/);
  assert.equal(controls.FirstName.value, "");
});

test("Schatz rejects unavailable territories without filling any fields", () => {
  const { controls, mapping } = mappedFixture("schatz");
  const territoryData = { ...data, contact: { ...data.contact, state: "Puerto Rico" } };
  assert.throws(() => fillMappedForm(territoryData, mapping), /state is unavailable/);
  assert.equal(controls[mapping.fields[0][0]].value, "");
});

test("Klobuchar maps exported territory names to the form's abbreviations", () => {
  const { controls, mapping } = mappedFixture("klobuchar");
  controls[mapping.state[0]].options = [{ value: "VI" }];
  fillMappedForm({ ...data, contact: { ...data.contact, state: "U.S. Virgin Islands" } }, mapping);
  assert.equal(controls[mapping.state[0]].value, "VI");
});

for (const id of ["padilla", "murphy"]) {
  test(`${id} requires its initial selection and visible fields`, () => {
    const { controls, mapping } = mappedFixture(id);
    controls[mapping.prerequisite[0]].value = "";
    assert.throws(() => fillMappedForm(data, mapping), /initial selection/);
    assert.equal(controls[mapping.fields[0][0]].value, "");
    if (mapping.prerequisite[2]) {
      controls[mapping.prerequisite[0]].value = "help";
      assert.throws(() => fillMappedForm(data, mapping), /initial selection/);
      assert.equal(controls[mapping.fields[0][0]].value, "");
    }
    controls[mapping.prerequisite[0]].value = mapping.prerequisite[2] || "Housing";
    controls[mapping.fields[1][0]].getClientRects = () => [];
    assert.throws(() => fillMappedForm(data, mapping), /no fields were filled/);
    assert.equal(controls[mapping.fields[0][0]].value, "");
  });
}

test("reports that a collapsed form must be opened before filling", () => {
  const { controls, mapping } = mappedFixture("cortezmasto");
  globalThis.document.querySelector = () => ({ getClientRects: () => [] });
  assert.throws(() => fillMappedForm(data, mapping), /form is hidden/);
  assert.equal(controls[mapping.fields[0][0]].value, "");
});

test("only the exact configured form origin and path are accepted", () => {
  const url = FORMS.king.url;
  assert.equal(isFormUrl("https://www.king.senate.gov/contact/", url), true);
  assert.equal(isFormUrl("https://www.king.senate.gov.evil.example/contact", url), false);
  assert.equal(isFormUrl("https://www.king.senate.gov/other", url), false);
  assert.equal(isFormUrl("not a url", url), false);
  assert.equal(isFormUrl(FORMS.aguilar.url, FORMS.aguilar.url), true);
  assert.equal(isFormUrl("https://aguilar.house.gov/other", FORMS.aguilar.url), false);
});

test("Slotkin's shared outreach URL requires the exact form query", () => {
  const url = FORMS.slotkin.url;
  assert.equal(isFormUrl(url, url), true);
  assert.equal(isFormUrl(url.replace("SenSlotkin", "AnotherOffice"), url), false);
  assert.equal(isFormUrl(url.replace("100053", "100054"), url), false);
  assert.equal(isFormUrl(url.split("?")[0], url), false);
  assert.equal(isFormUrl(`${url}&extra=1`, url), false);
});
