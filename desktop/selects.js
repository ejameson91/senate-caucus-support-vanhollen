export function readTopics(config) {
  const form = document.querySelector(config.form);
  if (!form) throw new Error("The contact form was not found or has changed.");
  if (!form.getClientRects().length)
    throw new Error("The contact form is hidden. Open it on the senator's page, then load topics again.");
  const select = form.querySelector(`[id="${config.topic[0]}"]`);
  if (!select || select.tagName !== "SELECT" || select.disabled ||
      select.labels?.[0]?.textContent.trim() !== config.topic[1])
    throw new Error("The topic field was not found or has changed.");
  const options = [...select.options]
    .filter((option) => option.value && !option.disabled && !option.closest("optgroup:disabled"))
    .map((option) => ({ value: option.value, label: option.textContent.trim() }));
  if (!options.length || options.length > 500 ||
      options.some((option) => !option.label || option.value.length > 500 || option.label.length > 500) ||
      new Set(options.map((option) => option.value)).size !== options.length)
    throw new Error("The topic options are unavailable or ambiguous. Select a topic manually.");
  return options;
}

export function prepareSelections(config, prefix, topic) {
  const form = document.querySelector(config.form);
  if (!form) throw new Error("The contact form was not found or has changed.");
  if (!form.getClientRects().length)
    throw new Error("The contact form is hidden. Open it on the senator's page, then try filling again.");
  const find = ([id, label]) => {
    const select = form.querySelector(`[id="${id}"]`);
    if (!select || select.tagName !== "SELECT" || select.disabled ||
        select.labels?.[0]?.textContent.trim() !== label)
      throw new Error("A selection field has changed; no fields were filled. Complete the form manually.");
    return select;
  };
  const selected = [];
  const warnings = [];
  if (prefix && config.prefix) {
    const select = find(config.prefix);
    const matches = [...select.options].filter((option) =>
      option.value && !option.disabled && !option.closest("optgroup:disabled") &&
      option.textContent.trim() === prefix);
    if (matches.length === 1) selected.push([select, matches[0].value]);
    else warnings.push("Your prefix is not available; choose it manually.");
  } else if (prefix && !config.prefix) {
    warnings.push("This form has no supported prefix field.");
  } else if (!prefix && config.prefixRequired) {
    warnings.push("Choose the required prefix on the form.");
  }
  if (topic) {
    const select = find(config.topic);
    if (config.requireCurrentTopic && select.value !== topic.value)
      throw new Error("Choose the same topic on the senator's form first; no fields were filled.");
    const matches = [...select.options].filter((option) =>
      option.value === topic.value && option.textContent.trim() === topic.label &&
      option.value && !option.disabled && !option.closest("optgroup:disabled"));
    if (matches.length !== 1)
      throw new Error("The selected topic is no longer available; reload topics. No fields were filled.");
    selected.push([select, matches[0].value]);
  } else {
    warnings.push("Choose a topic on the form.");
  }
  return { selected, warnings };
}
