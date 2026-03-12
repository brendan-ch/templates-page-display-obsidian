import { App, Plugin, PluginSettingTab, Setting } from "obsidian";
import { buildTemplatesExtension } from "./TemplatesExtension";

interface PluginSettings {
	templatesFolder: string;
}

const DEFAULT_SETTINGS: PluginSettings = {
	templatesFolder: "",
};

export default class TemplatesPagePlugin extends Plugin {
	settings: PluginSettings;

	async onload(): Promise<void> {
		await this.loadSettings();
		this.addSettingTab(new TemplatesSettingTab(this.app, this));
		this.registerEditorExtension(
			buildTemplatesExtension(this.app, () => this.settings.templatesFolder)
		);
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}

class TemplatesSettingTab extends PluginSettingTab {
	constructor(app: App, private plugin: TemplatesPagePlugin) {
		super(app, plugin);
	}

	display(): void {
		this.containerEl.empty();
		new Setting(this.containerEl)
			.setName("Templates folder")
			.setDesc("Path to your templates folder (e.g. Templates)")
			.addText((text) =>
				text
					.setPlaceholder("Templates")
					.setValue(this.plugin.settings.templatesFolder)
					.onChange(async (value) => {
						this.plugin.settings.templatesFolder = value.trim();
						await this.plugin.saveSettings();
					})
			);
	}
}
