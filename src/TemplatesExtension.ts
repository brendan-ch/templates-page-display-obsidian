import { App, TFile } from "obsidian";
import { Extension, StateField } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView, WidgetType } from "@codemirror/view";
import { filterTemplateFiles } from "./templateUtils";

class TemplatesWidget extends WidgetType {
	constructor(private app: App, private folder: string) {
		super();
	}

	eq(other: TemplatesWidget): boolean {
		return this.folder === other.folder;
	}

	toDOM(view: EditorView): HTMLElement {
		const container = document.createElement("div");
		container.className = "templates-widget";
		this.renderAsync(container, view).catch(console.error);
		return container;
	}

	private async renderAsync(
		container: HTMLElement,
		editorView: EditorView
	): Promise<void> {
		if (!this.folder) {
			container.createEl("p", {
				text: "Set a templates folder in plugin settings.",
				cls: "templates-widget-notice",
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
				cls: "templates-widget-notice",
			});
			return;
		}

		container.createEl("h4", {
			text: "Templates",
			cls: "templates-widget-title",
		});
		const list = container.createDiv({ cls: "templates-list" });

		for (const fileInfo of templateFiles) {
			const file = allFiles.find((f) => f.path === fileInfo.path);
			if (!file) continue;

			const item = list.createDiv({ cls: "template-item" });
			item
				.createSpan({ cls: "template-name", text: file.basename })
				.setAttr("title", file.basename);

			const btn = item.createEl("button", {
				cls: "insert-btn",
				text: "Insert",
				attr: { "aria-label": `Insert template: ${file.basename}` },
			});
			btn.addEventListener("click", () =>
				this.insertTemplate(file, editorView)
			);
		}
	}

	private async insertTemplate(
		file: TFile,
		editorView: EditorView
	): Promise<void> {
		const content = await this.app.vault.read(file);
		editorView.dispatch({
			changes: {
				from: 0,
				to: editorView.state.doc.length,
				insert: content,
			},
		});
	}
}

export function buildTemplatesExtension(
	app: App,
	getFolder: () => string
): Extension {
	function buildDecorations(
		state: import("@codemirror/state").EditorState
	): DecorationSet {
		if (state.doc.toString().trim().length > 0) {
			return Decoration.none;
		}
		// Obsidian's live preview creates sub-editors for table cells. If the
		// main editor has content while this state is empty, we're inside a
		// table cell (or similar embedded editor) — don't show the widget.
		const mainContent = app.workspace.activeEditor?.editor?.getValue();
		if (mainContent && mainContent.trim().length > 0) {
			return Decoration.none;
		}
		const folder = getFolder();
		const widget = Decoration.widget({
			widget: new TemplatesWidget(app, folder),
			block: true,
			side: 1,
		});
		return Decoration.set([widget.range(state.doc.length)]);
	}

	return StateField.define<DecorationSet>({
		create: (state) => buildDecorations(state),
		update: (decos, tr) =>
			tr.docChanged ? buildDecorations(tr.state) : decos,
		provide: (f) => EditorView.decorations.from(f),
	});
}
