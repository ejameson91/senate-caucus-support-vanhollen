import { fillGillibrand, fillMappedForm } from "./mapping.js";

export const FORMS = {
  gillibrand: {
    name: "Kirsten Gillibrand",
    url: "https://www.gillibrand.senate.gov/contact/email-me/",
    fill: fillGillibrand,
    selects: {
      form: "#gform_3",
      topic: ["input_3_20", "issue(Required)"],
      prefix: ["input_3_4", "prefix"],
    },
  },
  king: {
    name: "Angus King",
    url: "https://www.king.senate.gov/contact",
    fill: fillMappedForm,
    selects: {
      form: '[id="EF6E3EF5-C2D4-9C1C-1649-BD1D51840BC3"]',
      topic: ["input-EFFE74ED-C7CC-D044-49D2-3B1B3C8DC9F8", "Please select the topic area that most closely aligns with your message*"],
    },
    mapping: {
      form: '[id="EF6E3EF5-C2D4-9C1C-1649-BD1D51840BC3"]',
      fields: [
        ["input-EFEFBB82-E5AD-43BF-317C-6365EAD5F540", "First Name*", "firstName"],
        ["input-EFEFBC04-A1C6-A99B-E17A-465BF19BB596", "Last Name*", "lastName"],
        ["input-EFF6FADA-AC70-B16D-6B17-9B9B5EB61A8B", "Street Address*", "address"],
        ["input-EFF6FB47-E02D-9697-9371-0740F1AA154C", "Street Address (2)", "address2"],
        ["input-EFF6FC50-9F27-52E9-FC8A-9E973337F5A7", "City*", "city"],
        ["input-EFF6FE05-FD47-9CAE-592B-DD721DE754D5", "Zip*", "zip"],
        ["input-EFF948B7-026A-A6A4-00B1-846C8E5E9C5B", "Preferred Phone*", "phone"],
        ["email", "E-mail*", "email"],
        ["input-C7C6BFDA-A10F-8024-D3ED-889AC2304F7D", "Verify E-mail*", "email"],
        ["input-3E2E3A97-EC40-4905-D23E-5027DF4B2878", "Please enter the specific subject of your message*", "subject"],
        ["input-F6C4EB2B-E12A-A1F7-6979-6D62DF9DA6AE", "Comments*", "message", "TEXTAREA"],
      ],
      state: ["input-EFF6FD8D-9A59-4FE6-D179-F465F1938DF2", "State*"],
    },
  },
  cortezmasto: {
    name: "Catherine Cortez Masto",
    url: "https://www.cortezmasto.senate.gov/contact/connect/",
    fill: fillMappedForm,
    selects: {
      form: "#gform_2",
      topic: ["input_2_17", "Message Topic*"],
      prefix: ["input_2_39", "Prefix*"],
      prefixRequired: true,
    },
    mapping: {
      form: "#gform_2",
      fields: [
        ["input_2_2", "First Name*", "firstName"],
        ["input_2_3", "Last Name*", "lastName"],
        ["input_2_6_1", "Street Address *", "address"],
        ["input_2_6_2", "Address Line 2", "address2"],
        ["input_2_6_3", "City *", "city"],
        ["input_2_6_5", "ZIP Code *", "zip"],
        ["input_2_41", "Phone Number*", "phone"],
        ["input_2_9", "Enter Email", "email"],
        ["input_2_9_2", "Confirm Email", "email"],
        ["input_2_11", "Message Subject*", "subject"],
        ["input_2_12", "Message*", "message", "TEXTAREA"],
      ],
      state: ["input_2_6_4", "State *"],
      fullStateName: true,
    },
  },
  padilla: {
    name: "Alex Padilla",
    url: "https://www.padilla.senate.gov/contact/contact-form/",
    fill: fillMappedForm,
    selects: {
      form: "#gform_1",
      topic: ["input_1_17", "Message Topic*"],
      prefix: ["input_1_1", "Prefix*"],
      prefixRequired: true,
    },
    mapping: {
      form: "#gform_1",
      prerequisite: ["input_1_23", "What can we help you with?", "contact"],
      requireVisible: true,
      fields: [
        ["input_1_2", "First Name*", "firstName"],
        ["input_1_3", "Last Name*", "lastName"],
        ["input_1_6_1", "Street Address *", "address"],
        ["input_1_6_2", "Address Line 2", "address2"],
        ["input_1_6_3", "City *", "city"],
        ["input_1_6_5", "ZIP Code *", "zip"],
        ["input_1_7", "Phone Number*", "phone"],
        ["input_1_9", "Enter Email", "email"],
        ["input_1_9_2", "Confirm Email", "email"],
        ["input_1_11", "Message Subject*", "subject"],
        ["input_1_12", "Message*", "message", "TEXTAREA"],
      ],
      state: ["input_1_6_4", "State *"],
      fullStateName: true,
    },
  },
  murphy: {
    name: "Chris Murphy",
    url: "https://www.murphy.senate.gov/contact",
    fill: fillMappedForm,
    selects: {
      form: '[id="FE378C8B-ECA5-FC96-D7EE-18EE82AE3ABD"]',
      topic: ["issue-type", "Message Topic*"],
      prefix: ["prefixtoggle", "Prefix*"],
      prefixRequired: true,
      requireCurrentTopic: true,
    },
    mapping: {
      form: '[id="FE378C8B-ECA5-FC96-D7EE-18EE82AE3ABD"]',
      prerequisite: ["issue-type", "Message Topic*"],
      requireVisible: true,
      fields: [
        ["input-0D9C1CBF-0FA9-F521-7BE3-D60FBF8BC532", "First Name*", "firstName"],
        ["input-021E6848-A43A-487E-E67F-09444047A2BC", "Last Name*", "lastName"],
        ["input-02A611A6-C6E3-A8FD-5992-EE40147D726A", "Street Address*", "address"],
        ["input-02A611E7-D86B-7139-AD0F-692B62A62CD2", "Street Address (2)", "address2"],
        ["input-02A61225-E09F-EA85-FAF0-D225ED392435", "City*", "city"],
        ["input-02A612A3-005B-4DF1-0308-92EB04712239", "Zip*", "zip"],
        ["input-02C9EBF2-9068-15B3-76C7-3DFE96C5D370", "Phone Number", "phone"],
        ["email", "Email*", "email"],
        ["input-02D398F5-DCDB-34E1-6593-048598518F1D", "Verify Email*", "email"],
        ["input-02E0E441-9477-3987-8977-A4EC9BDD0DBD", "Please enter the subject of your message*", "subject"],
        ["input-02E45FD5-BD42-AF0E-8834-08C8C725558F", "Comments*", "message", "TEXTAREA"],
      ],
      state: ["input-02A61263-CB93-EA3B-18F7-572F08EA57F4", "State*"],
    },
  },
};

export function isFormUrl(value, expected) {
  try {
    const url = new URL(value);
    const target = new URL(expected);
    return url.origin === target.origin &&
      url.pathname.replace(/\/+$/, "") === target.pathname.replace(/\/+$/, "");
  } catch {
    return false;
  }
}
