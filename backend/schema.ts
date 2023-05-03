export const createProjectsTable = `
CREATE TABLE IF NOT EXISTS projects (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name VARCHAR(255) UNIQUE NOT NULL,
	description TEXT,
	ignore_files TEXT,
	created_at TIMESTAMP
);
`;

export const createPromptPartsTable = `
CREATE TABLE IF NOT EXISTS prompt_parts (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	project_id INTEGER,
	name VARCHAR(255), -- If file part_type, this is a relative path to the file including extension. Snippets don't have extensions (but can I guess).
	content TEXT DEFAULT '', -- If file part_type, this is the file content. If snippet part_type, this is the snippet content.
	summary TEXT DEFAULT '', -- If file part_type, this is a summary generated by GPT 3.5. Snippet summary not yet implemented.
	included BOOLEAN DEFAULT 1,
	part_type VARCHAR(25), -- 'file' or 'snippet'
	position INTEGER,
	created_at TIMESTAMP,
	updated_at TIMESTAMP,
	FOREIGN KEY (project_id) REFERENCES projects (id),
	UNIQUE (project_id, name)
);
`;
