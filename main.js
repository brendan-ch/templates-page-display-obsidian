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
var import_obsidian = require("obsidian");

// src/TemplatesExtension.ts
var import_state = require("@codemirror/state");
var import_view = require("@codemirror/view");

// src/templateUtils.ts
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

// src/TemplatesExtension.ts
var TemplatesWidget = class extends import_view.WidgetType {
  constructor(app, folder) {
    super();
    this.app = app;
    this.folder = folder;
  }
  eq(other) {
    return this.folder === other.folder;
  }
  toDOM(view) {
    const container = document.createElement("div");
    container.className = "templates-widget";
    this.renderAsync(container, view).catch(console.error);
    return container;
  }
  async renderAsync(container, editorView) {
    if (!this.folder) {
      container.createEl("p", {
        text: "Set a templates folder in plugin settings.",
        cls: "templates-widget-notice"
      });
      return;
    }
    const allFiles = this.app.vault.getFiles();
    const templateFiles = filterTemplateFiles(
      allFiles.map((f) => ({ path: f.path, name: f.name })),
      this.folder
    );
    if (templateFiles.length === 0) {
      container.createEl("p", {
        text: `No templates found in "${this.folder}".`,
        cls: "templates-widget-notice"
      });
      return;
    }
    container.createEl("h4", {
      text: "Templates",
      cls: "templates-widget-title"
    });
    const list = container.createDiv({ cls: "templates-list" });
    for (const fileInfo of templateFiles) {
      const file = allFiles.find((f) => f.path === fileInfo.path);
      if (!file)
        continue;
      const item = list.createDiv({ cls: "template-item" });
      item.createSpan({ cls: "template-name", text: file.basename }).setAttr("title", file.basename);
      const btn = item.createEl("button", {
        cls: "insert-btn",
        text: "Insert",
        attr: { "aria-label": `Insert template: ${file.basename}` }
      });
      btn.addEventListener(
        "click",
        () => this.insertTemplate(file, editorView)
      );
    }
  }
  async insertTemplate(file, editorView) {
    const content = await this.app.vault.read(file);
    editorView.dispatch({
      changes: {
        from: 0,
        to: editorView.state.doc.length,
        insert: content
      }
    });
  }
};
function buildTemplatesExtension(app, getFolder) {
  function buildDecorations(state) {
    var _a, _b;
    if (state.doc.toString().trim().length > 0) {
      return import_view.Decoration.none;
    }
    const mainContent = (_b = (_a = app.workspace.activeEditor) == null ? void 0 : _a.editor) == null ? void 0 : _b.getValue();
    if (mainContent && mainContent.trim().length > 0) {
      return import_view.Decoration.none;
    }
    const folder = getFolder();
    const widget = import_view.Decoration.widget({
      widget: new TemplatesWidget(app, folder),
      block: true,
      side: 1
    });
    return import_view.Decoration.set([widget.range(state.doc.length)]);
  }
  return import_state.StateField.define({
    create: (state) => buildDecorations(state),
    update: (decos, tr) => tr.docChanged ? buildDecorations(tr.state) : decos,
    provide: (f) => import_view.EditorView.decorations.from(f)
  });
}

// src/main.ts
var DEFAULT_SETTINGS = {
  templatesFolder: ""
};
var TemplatesPagePlugin = class extends import_obsidian.Plugin {
  async onload() {
    await this.loadSettings();
    this.addSettingTab(new TemplatesSettingTab(this.app, this));
    this.registerEditorExtension(
      buildTemplatesExtension(this.app, () => this.settings.templatesFolder)
    );
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
var TemplatesSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    this.containerEl.empty();
    new import_obsidian.Setting(this.containerEl).setName("Templates folder").setDesc("Path to your templates folder (e.g. Templates)").addText(
      (text) => text.setPlaceholder("Templates").setValue(this.plugin.settings.templatesFolder).onChange(async (value) => {
        this.plugin.settings.templatesFolder = value.trim();
        await this.plugin.saveSettings();
      })
    );
  }
};
