import { File } from '../../../types/index.js';
import { db } from '../index.js';
import { insertStatement, updateStatement } from '../sql-utils.js';

export const getFiles = async (
	columns = '*',
	where: Record<string, any> = {}
): Promise<File[]> => {
	let sql = `SELECT ${columns} FROM files`;
	const values: any[] = [];
	if (Object.keys(where).length) {
		sql += ' WHERE ';
		sql += Object.keys(where)
			.map((key) => {
				values.push(where[key]);
				return `${key} = ?`;
			})
			.join(' AND ');
	}
	return await db.all(sql, values);
};

export const getFilesByProjectId = async (
	project_id: number,
	columns = '*'
): Promise<File[]> => {
	return await db.all(`SELECT ${columns} FROM files WHERE project_id = ?`, [
		project_id,
	]);
};

export const getFileById = async (id: number, columns = '*'): Promise<File> => {
	return await db.get(`SELECT ${columns} FROM files WHERE id = ?`, [id]);
};

export const updateFile = async (
	id: number,
	file: Partial<File>
): Promise<File> => {
	const fieldsObj: Partial<File> = {
		updated_at: new Date().toISOString(),
		...file,
	};
	if (file.id) delete fieldsObj.id;

	const { sql, values } = updateStatement('files', fieldsObj, { id });
	await db.run(sql, values);
	return await getFileById(id);
};

export const createFile = async (
	project_id: number,
	file: Partial<File>
): Promise<File> => {
	const { sql, values } = insertStatement('files', {
		...file,
		project_id,
		updated_at: new Date().toISOString(),
	});
	if (file.id) delete file.id;
	const result = await db.run(sql, values);
	return await getFileById(result.lastID);
};

export const deleteFile = async (id: number): Promise<void> => {
	await db.run('DELETE FROM files WHERE id = ?', [id]);
};
