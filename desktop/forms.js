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
