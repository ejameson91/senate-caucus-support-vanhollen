import test from "node:test";
import assert from "node:assert/strict";
import { validateExport, validateExportForCampaign } from "./export-data.js";

const sample = (campaign = "senate") => ({
  version: 1,
  campaign,
  contact: {
    firstName: " Test ", lastName: " Example ", address: "123 Example St",
    address2: "", city: "Example", state: "NY", zip: "10001",
    email: "test@example.com", phone: "2125550100",
  },
  subject: " Subject ", message: " Message ",
});

test("validates and normalizes a contact export", () => {
  const data = validateExport(sample());
  assert.equal(data.contact.firstName, "Test");
  assert.equal(data.contact.prefix, "");
  assert.equal(data.subject, "Subject");
  assert.equal(data.message, "Message");
  assert.equal(data.campaign, "senate");
  assert.deepEqual(Object.keys(data), ["version", "contact", "subject", "message", "campaign"]);
  const dc = sample();
  dc.contact.state = "DC";
  assert.equal(validateExport(dc).contact.state, "DC");
  const territory = sample();
  territory.contact.state = "Puerto Rico";
  assert.equal(validateExport(territory).contact.state, "Puerto Rico");
  const withPrefix = sample();
  withPrefix.contact.prefix = "Mx.";
  assert.equal(validateExport(withPrefix).contact.prefix, "Mx.");
});

test("validates campaign labels and rejects exports for the other helper", () => {
  const senate = validateExportForCampaign(sample("senate"), "senate");
  assert.equal(senate.campaignVerified, true);
  const house = validateExportForCampaign(sample("house"), "house");
  assert.equal(house.campaignVerified, true);
  assert.throws(() => validateExportForCampaign(sample("senate"), "house"), /Senate export/);
  assert.throws(() => validateExportForCampaign(sample("house"), "senate"), /House export/);
  assert.throws(() => validateExport({ ...sample(), campaign: "other" }), /campaign/);
  assert.throws(() => validateExportForCampaign(sample(), "other"), /campaign/);

  const legacy = sample();
  delete legacy.campaign;
  assert.equal(validateExportForCampaign(legacy, "house").campaignVerified, false);
});

test("rejects malformed, incomplete, and oversized exports", () => {
  assert.throws(() => validateExport(null), /supported contact export/);
  assert.throws(() => validateExport({ ...sample(), version: 2 }), /supported contact export/);
  const invalidPrefix = sample();
  invalidPrefix.contact.prefix = null;
  assert.throws(() => validateExport(invalidPrefix), /prefix/);
  invalidPrefix.contact.prefix = "Made up";
  assert.throws(() => validateExport(invalidPrefix), /prefix/);
  const missing = sample();
  missing.contact.phone = " ";
  assert.throws(() => validateExport(missing), /phone/);
  const invalidState = sample();
  invalidState.contact.state = "XX";
  assert.throws(() => validateExport(invalidState), /state/);
  assert.throws(() => validateExport({ ...sample(), message: "x".repeat(20001) }), /message/);
  const oversized = sample();
  oversized.message = "中".repeat(20000);
  oversized.contact.address = "中".repeat(500);
  oversized.contact.address2 = "中".repeat(500);
  oversized.contact.city = "中".repeat(500);
  oversized.contact.firstName = "中".repeat(500);
  assert.throws(() => validateExport(oversized), /64 KB/);
});
