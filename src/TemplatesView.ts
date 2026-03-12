import { ItemView, Notice, TFile, WorkspaceLeaf } from "obsidian";
import { getTemplatesFolder, filterTemplateFiles } from "./templateUtils";

export const VIEW_TYPE_TEMPLATES = "templates-page-display";
const TEMPLATER_DATA_PATH = ".obsidian/plugins/templater-obsidian/data.json";

export class TemplatesView extends ItemView {
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType(): string {
		return VIEW_TYPE_TEMPLATES;
	}

	getDisplayText(): string {
		return "Templates";
	}

	getIcon(): string {
		return "layout-template";
	}

	async onOpen(): Promise<void> {
		await this.refresh();
	}

	async onClose(): Promise<void> {}

	async refresh(): Promise<void> {
		const container = this.containerEl.children[1] as HTMLElement;
		container.empty();
		container.addClass("templates-page-container");

		// Header
		const header = container.createDiv({ cls: "templates-page-header" });
		header.createEl("h4", { text: "Templates", cls: "templates-page-title" });
		const refreshBtn = header.createEl("button", {
			cls: "templates-refresh-btn",
			attr: { "aria-label": "Refresh template list" },
		});
		refreshBtn.setText("↺");
		refreshBtn.addEventListener("click", () => this.refresh());

		// Read Templater settings — try live plugin object first, fall back to data.json
		let templatesFolder = "";
		const templater = (this.app as any).plugins?.plugins?.["templater-obsidian"];
		if (templater?.settings?.templates_folder) {
			templatesFolder = templater.settings.templates_folder;
		} else {
			try {
				const data = await this.app.vault.adapter.read(TEMPLATER_DATA_PATH);
				templatesFolder = getTemplatesFolder(data);
			} catch {
				// Templater not installed or data.json unreadable
			}
		}

		if (!templatesFolder) {
			container.createEl("p", {
				text: "No templates folder configured. Please install the Templater plugin and set a templates folder in its settings.",
				cls: "templates-page-notice",
			});
			return;
		}

		// Get template files
		const allFiles = this.app.vault.getFiles();
		const templateFiles = filterTemplateFiles(
			allFiles.map((f) => ({ path: f.path, name: f.name })),
			templatesFolder
		);

		if (templateFiles.length === 0) {
			container.createEl("p", {
				text: `No templates found in "${templatesFolder}".`,
				cls: "templates-page-notice",
			});
			return;
		}

		// Render template list
		const list = container.createDiv({ cls: "templates-list" });
		for (const fileInfo of templateFiles) {
			const file = allFiles.find((f) => f.path === fileInfo.path);
			if (!file) continue;

			const item = list.createDiv({ cls: "template-item" });
			const nameEl = item.createSpan({
				cls: "template-name",
				text: file.basename,
			});
			nameEl.setAttr("title", file.basename);

			const insertBtn = item.createEl("button", {
				cls: "insert-btn",
				text: "Insert",
				attr: { "aria-label": `Insert template: ${file.basename}` },
			});
			insertBtn.addEventListener("click", () => this.insertTemplate(file));
		}
	}

	private async insertTemplate(file: TFile): Promise<void> {
		const activeEditor = this.app.workspace.activeEditor;
		if (!activeEditor || !activeEditor.editor) {
			new Notice("Open a note first to insert a template.");
			return;
		}

		const content = await this.app.vault.read(file);
		activeEditor.editor.setValue(content);
		activeEditor.editor.setCursor({ line: 0, ch: 0 });
	}
}
