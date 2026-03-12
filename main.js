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

// src/TemplatesExtension.ts
var TEMPLATER_DATA_PATH = ".obsidian/plugins/templater-obsidian/data.json";
var TemplatesWidget = class extends import_view.WidgetType {
  constructor(app) {
    super();
    this.app = app;
  }
  eq(_other) {
    return true;
  }
  toDOM(view) {
    const container = document.createElement("div");
    container.className = "templates-widget";
    this.renderAsync(container, view).catch(console.error);
    return container;
  }
  async renderAsync(container, editorView) {
    var _a, _b, _c;
    let templatesFolder = "";
    const templater = (_b = (_a = this.app.plugins) == null ? void 0 : _a.plugins) == null ? void 0 : _b["templater-obsidian"];
    if ((_c = templater == null ? void 0 : templater.settings) == null ? void 0 : _c.templates_folder) {
      templatesFolder = templater.settings.templates_folder;
    } else {
      try {
        const data = await this.app.vault.adapter.read(TEMPLATER_DATA_PATH);
        templatesFolder = getTemplatesFolder(data);
      } catch (e) {
      }
    }
    if (!templatesFolder) {
      container.createEl("p", {
        text: "Configure a templates folder in Templater settings.",
        cls: "templates-widget-notice"
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
function buildTemplatesExtension(app) {
  function buildDecorations(state) {
    if (state.doc.toString().trim().length > 0) {
      return import_view.Decoration.none;
    }
    const widget = import_view.Decoration.widget({
      widget: new TemplatesWidget(app),
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
var TemplatesPagePlugin = class extends import_obsidian.Plugin {
  async onload() {
    this.registerEditorExtension(buildTemplatesExtension(this.app));
  }
};
