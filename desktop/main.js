import { app, BrowserWindow, dialog, ipcMain, session } from "electron";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { CONTACT_STATES, validateExport } from "../export-data.js";
import { FORMS, isFormUrl } from "./forms.js";
import { prepareSelections, readTopics } from "./selects.js";

const directory = dirname(fileURLToPath(import.meta.url));
let mainWindow;
const formWindows = new Map();
const topicsByForm = new Map();
let contactData;

function getForm(id) {
  if (typeof id !== "string" || !Object.hasOwn(FORMS, id))
    throw new Error("Select a supported senator.");
  return FORMS[id];
}

function requireMain(event) {
  if (!mainWindow || event.sender !== mainWindow.webContents)
    throw new Error("Unauthorized request.");
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 720,
    height: 680,
    webPreferences: {
      preload: join(directory, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  mainWindow.webContents.on("will-navigate", (event) => event.preventDefault());
  await mainWindow.loadFile(join(directory, "index.html"));
}

ipcMain.handle("import-export", async (event) => {
  requireMain(event);
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    filters: [{ name: "Contact export", extensions: ["json"] }],
  });
  if (result.canceled) return { canceled: true };
  contactData = undefined;
  try {
    const path = result.filePaths[0];
    if ((await stat(path)).size > 65536) throw new Error("The file is larger than 64 KB.");
    contactData = validateExport(JSON.parse(await readFile(path, "utf8")));
    return { imported: true };
  } catch (error) {
    throw new Error(`Could not import the export: ${error.message}`);
  }
});

ipcMain.handle("open-form", async (event, id) => {
  requireMain(event);
  const form = getForm(id);
  if (!contactData) throw new Error("Import a contact export first.");
  const existing = formWindows.get(id);
  if (existing && !existing.isDestroyed()) {
    existing.focus();
    return;
  }
  const formSession = session.fromPartition("form-helper");
  formSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
  const formWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    title: `Senator ${form.name} contact form`,
    webPreferences: { session: formSession, contextIsolation: true, sandbox: true, nodeIntegration: false },
  });
  formWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  formWindow.webContents.on("will-navigate", (navigation, url) => {
    if (!isFormUrl(url, form.url)) navigation.preventDefault();
  });
  formWindows.set(id, formWindow);
  formWindow.on("closed", () => {
    formWindows.delete(id);
    topicsByForm.delete(id);
  });
  try {
    await formWindow.loadURL(form.url);
  } catch (error) {
    if (formWindow && !formWindow.isDestroyed()) formWindow.close();
    throw error;
  }
});

function getOpenForm(id) {
  const form = getForm(id);
  const formWindow = formWindows.get(id);
  if (!formWindow || formWindow.isDestroyed()) throw new Error("Open the contact form first.");
  if (!isFormUrl(formWindow.webContents.getURL(), form.url))
    throw new Error("The supported contact form is not open.");
  return { form, formWindow };
}

ipcMain.handle("load-topics", async (event, id) => {
  requireMain(event);
  const { form, formWindow } = getOpenForm(id);
  topicsByForm.delete(id);
  const topics = await formWindow.webContents.executeJavaScript(
    `(${readTopics.toString()})(${JSON.stringify(form.selects)})`,
  );
  topicsByForm.set(id, topics);
  return topics;
});

ipcMain.handle("fill-form", async (event, id, topicValue) => {
  requireMain(event);
  const { form, formWindow } = getOpenForm(id);
  if (!contactData) throw new Error("Import a contact export first.");
  if (typeof topicValue !== "string") throw new Error("Invalid topic selection.");
  const topic = topicValue ? topicsByForm.get(id)?.find((item) => item.value === topicValue && !item.disabled) : null;
  if (topicValue && !topic) throw new Error("Load topics again and choose a topic.");
  const result = await formWindow.webContents.executeJavaScript(
    `(() => {
      const data = ${JSON.stringify(contactData)};
      const selection = (${prepareSelections.toString()})(${JSON.stringify(form.selects)}, data.contact.prefix, ${JSON.stringify(topic)});
      (${form.fill.toString()})(data, ${JSON.stringify({ ...form.mapping, stateNames: CONTACT_STATES })});
      for (const [control, value] of selection.selected) {
        control.value = value;
        control.dispatchEvent(new Event("input", { bubbles: true }));
        control.dispatchEvent(new Event("change", { bubbles: true }));
      }
      return ["Fields filled. Review all fields, complete any CAPTCHA, and submit yourself. The helper does not submit forms.", ...selection.warnings].join(" ");
    })()`,
  );
  formWindow.focus();
  return result;
});

app.whenReady().then(createWindow);
app.on("window-all-closed", () => app.quit());
