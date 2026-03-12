import { Plugin } from "obsidian";
import { buildTemplatesExtension } from "./TemplatesExtension";

export default class TemplatesPagePlugin extends Plugin {
	async onload(): Promise<void> {
		this.registerEditorExtension(buildTemplatesExtension(this.app));
	}
}
