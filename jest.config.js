/** @type {import('jest').Config} */
module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	testMatch: ["**/src/__tests__/**/*.test.ts"],
	moduleNameMapper: {
		"^obsidian$": "<rootDir>/src/__tests__/__mocks__/obsidian.ts",
	},
};
