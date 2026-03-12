import { getTemplatesFolder, filterTemplateFiles } from "../templateUtils";

describe("getTemplatesFolder", () => {
	it("returns the folder path from valid Templater data.json", () => {
		const data = JSON.stringify({ templates_folder: "Templates", other_key: true });
		expect(getTemplatesFolder(data)).toBe("Templates");
	});

	it("returns empty string when templates_folder key is missing", () => {
		const data = JSON.stringify({ other_key: "value" });
		expect(getTemplatesFolder(data)).toBe("");
	});

	it("returns empty string when JSON is invalid", () => {
		expect(getTemplatesFolder("not valid json")).toBe("");
	});

	it("returns empty string when data is an empty string", () => {
		expect(getTemplatesFolder("")).toBe("");
	});

	it("returns empty string when templates_folder is explicitly empty", () => {
		const data = JSON.stringify({ templates_folder: "" });
		expect(getTemplatesFolder(data)).toBe("");
	});
});

describe("filterTemplateFiles", () => {
	const files = [
		{ path: "Templates/daily.md", name: "daily.md" },
		{ path: "Templates/meeting.md", name: "meeting.md" },
		{ path: "Templates/sub/nested.md", name: "nested.md" },
		{ path: "OtherFolder/note.md", name: "note.md" },
		{ path: "Templates/readme.txt", name: "readme.txt" },
	];

	it("returns only .md files directly in the templates folder", () => {
		const result = filterTemplateFiles(files, "Templates");
		expect(result).toHaveLength(2);
		expect(result.map(f => f.name)).toEqual(["daily.md", "meeting.md"]);
	});

	it("excludes files in subfolders of the templates folder", () => {
		const result = filterTemplateFiles(files, "Templates");
		expect(result.find(f => f.name === "nested.md")).toBeUndefined();
	});

	it("excludes .md files outside the templates folder", () => {
		const result = filterTemplateFiles(files, "Templates");
		expect(result.find(f => f.name === "note.md")).toBeUndefined();
	});

	it("excludes non-.md files in the templates folder", () => {
		const result = filterTemplateFiles(files, "Templates");
		expect(result.find(f => f.name === "readme.txt")).toBeUndefined();
	});

	it("returns empty array when folder is empty string", () => {
		const result = filterTemplateFiles(files, "");
		expect(result).toHaveLength(0);
	});

	it("returns empty array when no files match", () => {
		const result = filterTemplateFiles(files, "NonExistent");
		expect(result).toHaveLength(0);
	});

	it("handles folder path with trailing slash", () => {
		const result = filterTemplateFiles(files, "Templates/");
		expect(result).toHaveLength(2);
	});
});
