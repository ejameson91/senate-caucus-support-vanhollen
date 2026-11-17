export function readTopics(config) {
  const form = document.querySelector(config.form);
  if (!form) throw new Error("The contact form was not found or has changed.");
  if (!form.getClientRects().length)
    throw new Error("The contact form is hidden. Open it on the senator's page, then load topics again.");
  if (!config.topic) throw new Error("This form has no topic field.");
  let options;
  if (config.topicCheckbox) {
    const group = form.querySelector(`[data-name="${config.topic[0]}"]`);
    if (!group || group.parentElement?.querySelector(":scope > label")?.textContent.trim() !== config.topic[1])
      throw new Error("The topic field was not found or has changed.");
    options = [...group.querySelectorAll(`input[name="${config.topic[0]}"]`)]
      .filter((control) => control.type === "checkbox" && !control.disabled)
      .map((control) => ({ value: control.value, label: control.labels?.[0]?.textContent.trim() || "" }));
  } else {
    const select = form.querySelector(`[id="${config.topic[0]}"]`);
    if (!select || select.tagName !== "SELECT" || select.disabled ||
        (config.topicName ? select.name : select.labels?.[0]?.textContent.trim()) !== config.topic[1] ||
        (config.topicPlaceholder && select.options[0]?.textContent.trim() !== config.topicPlaceholder))
      throw new Error("The topic field was not found or has changed.");
    if (config.requireVisible && !select.getClientRects().length)
      throw new Error("The topic field is hidden. Complete the initial steps on the senator's page, then load topics again.");
    options = [...select.options]
      .filter((option) => option.value && !option.disabled && !option.closest("optgroup:disabled") &&
        !(config.topicPlaceholder && option === select.options[0]))
      .map((option) => ({ value: option.value, label: option.textContent.trim() }));
  }
  if (!options.length || options.length > 500 ||
      options.some((option) => !option.label || option.value.length > 500 || option.label.length > 500))
    throw new Error("The topic options are unavailable or ambiguous. Select a topic manually.");
  const counts = new Map();
  for (const option of options) counts.set(option.value, (counts.get(option.value) || 0) + 1);
  for (const option of options) {
    if (counts.get(option.value) > 1) option.disabled = true;
  }
  return options;
}

export function prepareSelections(config, prefix, topic) {
  const form = document.querySelector(config.form);
  if (!form) throw new Error("The contact form was not found or has changed.");
  if (!form.getClientRects().length)
    throw new Error("The contact form is hidden. Open it on the senator's page, then try filling again.");
  const find = ([id, label]) => {
    const controls = form.querySelectorAll(`[${config.byName ? "name" : "id"}="${id}"]`);
    const select = controls.length === 1 ? controls[0] : null;
    const actualLabel = config.topicName && id === config.topic?.[0] ? select?.name
      : config.byName
      ? select?.labels?.[0]?.firstChild?.textContent.trim()
      : select?.labels?.[0]?.textContent.trim();
    if (!select || select.tagName !== "SELECT" || select.disabled ||
        actualLabel !== label ||
        (config.topicPlaceholder && id === config.topic?.[0] && select.options[0]?.textContent.trim() !== config.topicPlaceholder))
      throw new Error("A selection field has changed; no fields were filled. Complete the form manually.");
    if (config.requireVisible && !select.getClientRects().length)
      throw new Error("A selection field is hidden; no fields were filled. Complete the initial steps on the senator's page and try again.");
    return select;
  };
  const selected = [];
  const warnings = [];
  if (prefix && config.prefix) {
    if (config.prefixText) {
      const input = form.querySelector(`[id="${config.prefix[0]}"]`);
      if (!input || input.tagName !== "INPUT" || input.type !== "text" || input.disabled || input.readOnly ||
          input.labels?.[0]?.textContent.trim() !== config.prefix[1])
        throw new Error("The prefix field has changed; no fields were filled. Complete the form manually.");
      selected.push([input, prefix]);
    } else {
      const select = find(config.prefix);
      const matches = [...select.options].filter((option) =>
        option.value && !option.disabled && !option.closest("optgroup:disabled") &&
        option.textContent.trim() === prefix);
      if (matches.length === 1) selected.push([select, matches[0].value]);
      else warnings.push("Your prefix is not available; choose it manually.");
    }
  } else if (prefix && !config.prefix) {
    warnings.push("This form has no supported prefix field.");
  } else if (!prefix && config.prefixRequired) {
    warnings.push("Choose the required prefix on the form.");
  }
  if (topic && !config.topic)
    throw new Error("This form has no topic field; no fields were filled.");
  if (topic) {
    if (config.topicCheckbox) {
      const group = form.querySelector(`[data-name="${config.topic[0]}"]`);
      if (!group || group.parentElement?.querySelector(":scope > label")?.textContent.trim() !== config.topic[1])
        throw new Error("The topic field was not found or has changed; no fields were filled.");
      const controls = [...group.querySelectorAll(`input[name="${config.topic[0]}"]`)];
      const matches = controls.filter((control) =>
        control.type === "checkbox" && !control.disabled && control.value === topic.value);
      if (matches.length !== 1 || matches[0].labels?.[0]?.textContent.trim() !== topic.label ||
          controls.some((control) => control.type !== "checkbox" || control.disabled))
        throw new Error("The selected topic is no longer available; reload topics. No fields were filled.");
      selected.push([matches[0], topic.value, controls]);
    } else {
      const select = find(config.topic);
      if (config.requireCurrentTopic && select.value !== topic.value)
        throw new Error("Choose the same topic on the senator's form first; no fields were filled.");
      const matches = [...select.options].filter((option) =>
        option.value === topic.value && option.value && !option.disabled &&
        !option.closest("optgroup:disabled") &&
        !(config.topicPlaceholder && option === select.options[0]));
      if (matches.length !== 1 || matches[0].textContent.trim() !== topic.label)
        throw new Error("The selected topic is no longer available; reload topics. No fields were filled.");
      selected.push([select, matches[0].value]);
    }
  } else if (config.topic) {
    warnings.push("Choose a topic on the form.");
  } else {
    warnings.push("This form has no topic field.");
  }
  return { selected, warnings };
}
