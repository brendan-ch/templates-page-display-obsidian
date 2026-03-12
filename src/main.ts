import { Plugin, WorkspaceLeaf } from "obsidian";
import { TemplatesView, VIEW_TYPE_TEMPLATES } from "./TemplatesView";

export default class TemplatesPagePlugin extends Plugin {
	async onload(): Promise<void> {
		this.registerView(
			VIEW_TYPE_TEMPLATES,
			(leaf: WorkspaceLeaf) => new TemplatesView(leaf)
		);

		this.addRibbonIcon("layout-template", "Open Templates Page", () => {
			this.activateView();
		});

		this.addCommand({
			id: "open-templates-page",
			name: "Open Templates Page",
			callback: () => this.activateView(),
		});
	}

	async onunload(): Promise<void> {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_TEMPLATES);
	}

	private async activateView(): Promise<void> {
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
}
