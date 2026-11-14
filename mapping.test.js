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
    field, { tagName: tag, labels: [{ textContent: label }], value: "", dispatchEvent() {} },
  ]));
  controls[mapping.state[0]] = {
    tagName: "SELECT", labels: [{ textContent: mapping.state[1] }], value: "",
    options: [{ value: mapping.fullStateName ? "New York" : "NY" }], dispatchEvent() {},
  };
  const form = { getClientRects: () => [1], querySelector: (selector) => controls[selector.match(/^\[id="(.+)"\]$/)?.[1]] };
  globalThis.document = { querySelector: (selector) => selector === mapping.form ? form : null };
  return { controls, mapping: { ...mapping, stateNames: CONTACT_STATES } };
}

for (const id of ["king", "cortezmasto"]) {
  test(`${id} fills expected fields including email confirmation`, () => {
    const { controls, mapping } = mappedFixture(id);
    assert.match(fillMappedForm(data, mapping), /does not submit/);
    for (const [field, , key] of mapping.fields) {
      assert.equal(controls[field].value, key === "subject" || key === "message" ? data[key] : data.contact[key]);
    }
    assert.equal(controls[mapping.state[0]].value, id === "king" ? "NY" : "New York");
  });

  test(`${id} rejects changed fields and unsupported states before filling`, () => {
    const { controls, mapping } = mappedFixture(id);
    controls[mapping.fields.at(-1)[0]].labels[0].textContent = "Changed";
    assert.throws(() => fillMappedForm(data, mapping), /no fields were filled/);
    assert.equal(controls[mapping.fields[0][0]].value, "");
    controls[mapping.fields.at(-1)[0]].labels[0].textContent = mapping.fields.at(-1)[1];
    controls[mapping.state[0]].options = [];
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
});
