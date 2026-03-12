var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => TemplatesPagePlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian2 = require("obsidian");

// src/TemplatesView.ts
var import_obsidian = require("obsidian");

// src/templateUtils.ts
function getTemplatesFolder(data) {
  if (!data)
    return "";
  try {
    const parsed = JSON.parse(data);
    return typeof parsed.templates_folder === "string" ? parsed.templates_folder : "";
  } catch (e) {
    return "";
  }
}
function filterTemplateFiles(files, folder) {
  if (!folder)
    return [];
  const normalizedFolder = folder.endsWith("/") ? folder.slice(0, -1) : folder;
  return files.filter((file) => {
    if (!file.name.endsWith(".md"))
      return false;
    const expectedPath = `${normalizedFolder}/${file.name}`;
    return file.path === expectedPath;
  });
}

// src/TemplatesView.ts
var VIEW_TYPE_TEMPLATES = "templates-page-display";
var TEMPLATER_DATA_PATH = ".obsidian/plugins/templater-obsidian/data.json";
var TemplatesView = class extends import_obsidian.ItemView {
  constructor(leaf) {
    super(leaf);
  }
  getViewType() {
    return VIEW_TYPE_TEMPLATES;
  }
  getDisplayText() {
    return "Templates";
  }
  getIcon() {
    return "layout-template";
  }
  async onOpen() {
    await this.refresh();
  }
  async onClose() {
  }
  async refresh() {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("templates-page-container");
    const header = container.createDiv({ cls: "templates-page-header" });
    header.createEl("h4", { text: "Templates", cls: "templates-page-title" });
    const refreshBtn = header.createEl("button", {
      cls: "templates-refresh-btn",
      attr: { "aria-label": "Refresh template list" }
    });
    refreshBtn.setText("\u21BA");
    refreshBtn.addEventListener("click", () => this.refresh());
    let templatesFolder = "";
    try {
      const data = await this.app.vault.adapter.read(TEMPLATER_DATA_PATH);
      templatesFolder = getTemplatesFolder(data);
    } catch (e) {
    }
    if (!templatesFolder) {
      container.createEl("p", {
        text: "No templates folder configured. Please install the Templater plugin and set a templates folder in its settings.",
        cls: "templates-page-notice"
      });
      return;
    }
    const allFiles = this.app.vault.getFiles();
    const templateFiles = filterTemplateFiles(
      allFiles.map((f) => ({ path: f.path, name: f.name })),
      templatesFolder
    );
    if (templateFiles.length === 0) {
      container.createEl("p", {
        text: `No templates found in "${templatesFolder}".`,
        cls: "templates-page-notice"
      });
      return;
    }
    const list = container.createDiv({ cls: "templates-list" });
    for (const fileInfo of templateFiles) {
      const file = allFiles.find((f) => f.path === fileInfo.path);
      if (!file)
        continue;
      const item = list.createDiv({ cls: "template-item" });
      const nameEl = item.createSpan({
        cls: "template-name",
        text: file.basename
      });
      nameEl.setAttr("title", file.basename);
      const insertBtn = item.createEl("button", {
        cls: "insert-btn",
        text: "Insert",
        attr: { "aria-label": `Insert template: ${file.basename}` }
      });
      insertBtn.addEventListener("click", () => this.insertTemplate(file));
    }
  }
  async insertTemplate(file) {
    const activeEditor = this.app.workspace.activeEditor;
    if (!activeEditor || !activeEditor.editor) {
      new import_obsidian.Notice("Open a note first to insert a template.");
      return;
    }
    const content = await this.app.vault.read(file);
    activeEditor.editor.setValue(content);
    activeEditor.editor.setCursor({ line: 0, ch: 0 });
  }
};

// src/main.ts
var TemplatesPagePlugin = class extends import_obsidian2.Plugin {
  async onload() {
    this.registerView(
      VIEW_TYPE_TEMPLATES,
      (leaf) => new TemplatesView(leaf)
    );
    this.addRibbonIcon("layout-template", "Open Templates Page", () => {
      this.activateView();
    });
    this.addCommand({
      id: "open-templates-page",
      name: "Open Templates Page",
      callback: () => this.activateView()
    });
  }
  async onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_TEMPLATES);
  }
  async activateView() {
    const existing = this.app.workspace.getLeavesOfType(VIEW_TYPE_TEMPLATES);
    if (existing.length > 0) {
      this.app.workspace.revealLeaf(existing[0]);
      return;
    }
    const leaf = this.app.workspace.getRightLeaf(false);
    if (leaf) {
      await leaf.setViewState({ type: VIEW_TYPE_TEMPLATES, active: true });
      this.app.workspace.revealLeaf(leaf);
    }
  }
};
