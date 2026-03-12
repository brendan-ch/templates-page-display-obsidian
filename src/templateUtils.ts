/**
 * Parses Templater's data.json and returns the configured templates folder path.
 * Returns empty string if the data is invalid or the key is not set.
 */
export function getTemplatesFolder(data: string): string {
	if (!data) return "";
	try {
		const parsed = JSON.parse(data);
		return (typeof parsed.templates_folder === "string") ? parsed.templates_folder : "";
	} catch {
		return "";
	}
}

/**
 * Filters a list of files to only those that are .md files directly inside
 * the given templates folder (top-level only, no subfolders).
 */
export function filterTemplateFiles(
	files: { path: string; name: string }[],
	folder: string
): { path: string; name: string }[] {
	if (!folder) return [];

	const normalizedFolder = folder.endsWith("/") ? folder.slice(0, -1) : folder;

	return files.filter((file) => {
		if (!file.name.endsWith(".md")) return false;
		const expectedPath = `${normalizedFolder}/${file.name}`;
		return file.path === expectedPath;
	});
}
