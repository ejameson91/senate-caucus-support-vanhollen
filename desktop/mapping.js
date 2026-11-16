export function fillGillibrand(data) {
  if (location.origin !== "https://www.gillibrand.senate.gov" ||
      location.pathname.replace(/\/+$/, "") !== "/contact/email-me")
    throw new Error("The page is not the supported contact form.");
  const form = document.querySelector("#gform_3");
  if (!form) throw new Error("The contact form was not found or has changed.");
  const fields = [
    ["input_3_1", "INPUT", "First Name*", data.contact.firstName],
    ["input_3_3", "INPUT", "Last Name*", data.contact.lastName],
    ["input_3_5", "INPUT", "Street Address*", data.contact.address],
    ["input_3_6", "INPUT", "Street Address (2)", data.contact.address2],
    ["input_3_7", "INPUT", "City*", data.contact.city],
    ["input_3_9", "INPUT", "Zip*", data.contact.zip],
    ["input_3_31", "INPUT", "Email Address*", data.contact.email],
    ["input_3_10", "INPUT", "Phone Number*", data.contact.phone],
    ["input_3_34", "INPUT", "Subject*", data.subject],
    ["input_3_23", "TEXTAREA", "Your message to Kirsten*", data.message],
  ];
  const controls = fields.map(([id, tag, placeholder, value]) => {
    const control = form.querySelector(`#${id}`);
    if (!control || control.tagName !== tag || control.placeholder !== placeholder || control.disabled || control.readOnly)
      throw new Error("The contact form has changed; no fields were filled. Complete it manually.");
    return [control, value];
  });
  const state = form.querySelector("#input_3_32");
  if (!state || state.tagName !== "SELECT" || state.disabled ||
      ![...state.options].some((option) => option.value === data.contact.state))
    throw new Error("The state field has changed; no fields were filled. Complete the form manually.");
  controls.push([state, data.contact.state]);
  for (const [control, value] of controls) {
    control.value = value;
    control.dispatchEvent(new Event("input", { bubbles: true }));
    control.dispatchEvent(new Event("change", { bubbles: true }));
  }
  return "Fields filled. Review them, select an issue, complete any CAPTCHA, and submit yourself. The helper does not submit forms.";
}

export function fillMappedForm(data, mapping) {
  const form = document.querySelector(mapping.form);
  if (!form) throw new Error("The contact form was not found or has changed.");
  if (!form.getClientRects().length)
    throw new Error("The contact form is hidden. Open the form on the senator's page, then try filling again.");
  const find = (id, tag, label) => {
    const controls = form.querySelectorAll(`[${mapping.byName ? "name" : "id"}="${id}"]`);
    const control = controls.length === 1 ? controls[0] : null;
    const actualLabel = mapping.byName
      ? control?.labels?.[0]?.firstChild?.textContent.trim()
      : control?.labels?.[0]?.textContent.trim();
    if (!control || control.tagName !== tag || control.disabled || control.readOnly ||
        (mapping.requireVisible && !control.getClientRects().length) ||
        actualLabel !== label)
      throw new Error("The contact form has changed; no fields were filled. Complete it manually.");
    return control;
  };
  if (mapping.prerequisite) {
    const [id, label, expected] = mapping.prerequisite;
    const control = find(id, "SELECT", label);
    if (!control.value || (expected && control.value !== expected))
      throw new Error("Complete the initial selection on the senator's form before filling.");
  }
  const controls = mapping.fields.map(([id, label, key, tag = "INPUT"]) => [
    find(id, tag, label),
    key === "subject" || key === "message" ? data[key]
      : key === "combinedAddress" ? [data.contact.address, data.contact.address2].filter(Boolean).join("\n")
        : data.contact[key],
  ]);
  const state = find(mapping.state[0], mapping.stateText ? "INPUT" : "SELECT", mapping.state[1]);
  let stateValue = mapping.stateValues?.[data.contact.state] ||
    (mapping.fullStateName ? mapping.stateNames[data.contact.state] : data.contact.state);
  if (mapping.stateCodeSuffix && stateValue) {
    const stateLabel = mapping.stateLabels?.[data.contact.state] || mapping.stateNames[data.contact.state];
    const matches = [...state.options].filter((option) =>
      /^\d+_/.test(option.value) && option.value.endsWith(`_${stateValue}`) &&
      option.textContent.trim() === stateLabel && !option.disabled && !option.closest("optgroup:disabled"));
    stateValue = matches.length === 1 ? matches[0].value : "";
  }
  if (!stateValue || (!mapping.stateText && ![...state.options].some((option) => option.value === stateValue)))
    throw new Error("Your state is unavailable on this form; no fields were filled. Complete it manually.");
  controls.push([state, stateValue]);
  if (mapping.enforceLength && controls.some(([control, value]) => control.maxLength > 0 && value.length > control.maxLength))
    throw new Error("A value exceeds this form's length limit; no fields were filled. Shorten it and try again.");
  for (const [control, value] of controls) {
    control.value = value;
    control.dispatchEvent(new Event("input", { bubbles: true }));
    control.dispatchEvent(new Event("change", { bubbles: true }));
  }
  return "Fields filled. Review them, select any required title and topic, complete any CAPTCHA, and submit yourself. The helper does not submit forms.";
}
