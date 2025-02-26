import { app, BrowserWindow, ipcMain } from 'electron';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const ENV_PATH = path.resolve(app.getPath('userData'), '.env');

dotenv.config({ path: ENV_PATH });

let mainWindow: BrowserWindow | null = null;
let envSetupWindow: BrowserWindow | null = null;

const REQUIRED_ENV_VARS = ['PROJECTS_ROOT'];

function isEnvComplete() {
	return REQUIRED_ENV_VARS.every((key) => process.env[key]);
}

async function writePreloadScript(content: string) {
	await fs.writeFile(path.resolve(__dirname, '../../preload.js'), content);
}

const createMainWindow = async () => {
	await writePreloadScript(`
			console.log('Preload ran');
			const { contextBridge, ipcRenderer } = require('electron');
			contextBridge.exposeInMainWorld('electron', {
					IS_CHAT_ENABLED: ${!!process.env.OPENAI_API_KEY},
					ipcRendererSend: ipcRenderer.send.bind(ipcRenderer),
					ipcRendererOn: ipcRenderer.on.bind(ipcRenderer),
					ipcRendererRemoveListener: ipcRenderer.removeListener.bind(ipcRenderer),
			});
	`);

	process.env.IS_ELECTRON = 'true';
	mainWindow = new BrowserWindow({
		width: 1200,
		minWidth: 600,
		height: 800,
		minHeight: 400,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: path.resolve(__dirname, '../../preload.js'),
		},
	});

	mainWindow.loadFile(path.join(__dirname, 'frontend/index.html'));

	return mainWindow;
};

const createEnvSetupWindow = async () => {
	await writePreloadScript(`
			console.log('Preload ran');
			const { contextBridge, ipcRenderer } = require('electron');
			contextBridge.exposeInMainWorld('electron', {
					saveEnv: (data) => ipcRenderer.send('save-env', data)
			});
	`);

	envSetupWindow = new BrowserWindow({
		width: 600,
		height: 500,
		resizable: false,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: path.resolve(__dirname, '../../preload.js'),
		},
	});

	envSetupWindow.loadFile(path.join(__dirname, './env-setup.html'));
	envSetupWindow.on('closed', () => (envSetupWindow = null));
};

ipcMain.on('save-env', async (_, envData) => {
	const envContent = Object.entries(envData)
		.map(([key, value]) => `${key}=${value}`)
		.join('\n');

	console.log(envContent);
	await fs.writeFile(ENV_PATH, envContent, { flag: 'w' });
	// app.relaunch();
	app.quit();
});

app.on('ready', async () => {
	if (!isEnvComplete()) {
		createEnvSetupWindow();
	} else {
		console.log('Starting backend', path.resolve(__dirname, 'backend'));
		const window = await createMainWindow();
		const backendProcess = await import('file://' + path.resolve(__dirname, 'backend/index.js'));
		await backendProcess.waitUntilStarted();
		window?.reload();
	}
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});
