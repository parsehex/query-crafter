import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './style.scss';
import { App } from './components/App';

const root = createRoot(document.getElementById('root') as HTMLDivElement);
root.render(
	<DndProvider backend={HTML5Backend}>
		<App />
	</DndProvider>
);
