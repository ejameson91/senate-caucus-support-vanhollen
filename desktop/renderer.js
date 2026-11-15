const status = document.querySelector("#status");
const open = document.querySelector("#open");
const fill = document.querySelector("#fill");
const senator = document.querySelector("#senator");
const loadTopics = document.querySelector("#load-topics");
const topic = document.querySelector("#topic");

function resetTopics() {
  topic.replaceChildren(new Option("Choose on form", ""));
  topic.disabled = true;
}

senator.addEventListener("change", () => {
  fill.disabled = true;
  loadTopics.disabled = true;
  resetTopics();
  status.textContent = "Open the selected senator's form.";
});

document.querySelector("#import").addEventListener("click", async () => {
  try {
    const result = await window.helper.importExport();
    if (result.canceled) return;
    open.disabled = false;
    fill.disabled = true;
    loadTopics.disabled = true;
    resetTopics();
    status.textContent = "Export imported. Open the supported form.";
  } catch (error) {
    open.disabled = true;
    fill.disabled = true;
    loadTopics.disabled = true;
    resetTopics();
    status.textContent = error.message;
  }
});

open.addEventListener("click", async () => {
  try {
    const selected = senator.value;
    await window.helper.openForm(selected);
    if (senator.value !== selected) return;
    fill.disabled = false;
    loadTopics.disabled = false;
    resetTopics();
    status.textContent = "Form opened. Open any collapsed form, then load topics or choose one manually on the form.";
  } catch (error) {
    fill.disabled = true;
    loadTopics.disabled = true;
    resetTopics();
    status.textContent = `Could not open form: ${error.message}`;
  }
});

loadTopics.addEventListener("click", async () => {
  const selected = senator.value;
  resetTopics();
  try {
    const options = await window.helper.loadTopics(selected);
    if (senator.value !== selected) return;
    for (const option of options) {
      const element = new Option(option.label, option.value);
      element.disabled = Boolean(option.disabled);
      topic.add(element);
    }
    topic.disabled = false;
    status.textContent = options.some((option) => option.disabled)
      ? "Some topics have ambiguous values and must be selected on the form. Choose another topic here, or leave it to select on the form."
      : "Choose a topic, or leave it to select on the form.";
  } catch (error) {
    if (senator.value === selected) status.textContent = `Could not load topics: ${error.message}`;
  }
});

fill.addEventListener("click", async () => {
  try {
    status.textContent = await window.helper.fillForm(senator.value, topic.value);
  } catch (error) {
    status.textContent = `Could not fill form: ${error.message}`;
  }
});
