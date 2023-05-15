import express from 'express';
import cors from 'cors';
import path from 'path';
// import Router from 'express-static-gzip';
import projectsRouter from './routes/projects.js';
import snippetsRouter from './routes/snippets.js';
import filesRouter from './routes/files.js';
import summaryRouter from './routes/summary.js';
import tokenCountRouter from './routes/token_count.js';
import { initializeDatabase } from './db/index.js';
import { scanProjectsRoot } from './project-scanner.js';
import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

console.log('Starting server...');

const app = express();
const port = 8080;

export const startServer = async () => {
	await initializeDatabase();
	console.log('Initialized database');

	// scans and populates database with projects and prompt parts according to project folder files
	await scanProjectsRoot();
	console.log('Scanned projects root');

	app.use(cors());
	app.use(express.json());

	const staticPath = path.join(__dirname, '../frontend');
	app.use(express.static(staticPath));

	app.use(projectsRouter);
	app.use(snippetsRouter);
	app.use(filesRouter);
	app.use(summaryRouter);
	app.use(tokenCountRouter);

	// app.use('/', Router(staticPath, { enableBrotli: true }));

	app.get('/', (req, res) => {
		res.sendFile(path.join(staticPath, 'index.html'));
	});

	app.listen(port, () => {
		console.log(`Server is running on port ${port}`);
	});
};
