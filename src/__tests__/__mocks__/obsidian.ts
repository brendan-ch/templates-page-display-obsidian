// Minimal mock for the obsidian module used in tests
export class Notice {
	constructor(public message: string) {}
}

export class ItemView {
	app: unknown;
	leaf: unknown;
	containerEl: HTMLElement;

	constructor(leaf: unknown) {
		this.leaf = leaf;
		this.containerEl = document.createElement("div");
	}

	getViewType(): string { return ""; }
	getDisplayText(): string { return ""; }
	async onOpen(): Promise<void> {}
	async onClose(): Promise<void> {}
}

export class Plugin {}
export class WorkspaceLeaf {}
export class TFile {
	path: string;
	name: string;
	extension: string;
	constructor(path: string, name: string, extension: string) {
		this.path = path;
		this.name = name;
		this.extension = extension;
	}
}
