import React from 'react';
import { ControlledMenu, MenuItem, ClickEvent } from '@szhsin/react-menu';
import { File } from '../../../types';
import { deleteFile, updateFile } from '../../api/files';
import { useStore } from '../../state';

interface ContextMenuProps {
	file: File;
	menuOpen: boolean;
	setMenuOpen: (open: boolean) => void;
	anchorRef: React.RefObject<HTMLElement>;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
	file,
	menuOpen,
	setMenuOpen,
	anchorRef,
}) => {
	const [files, setFiles, setFile] = useStore((state) => [
		state.files,
		state.setFiles,
		state.setFile,
	]);
	const handleMenuIgnoreFile = () => {
		// get project
		// update project's ignore_file to include this file's name
		// note because the way the project scanner works, we should add just the file's name, not the full path (which is the promptPart.name)
	};
	const handleMenuUseSummary = async () => {
		const data = { ...file };
		data.use_summary = !data.use_summary;
		const updatedFile = await updateFile(data.id, data);
		if (!updatedFile) return;
		setFile(updatedFile);
	};
	const handleMenuUseTitle = async () => {
		const data = { ...file };
		data.use_title = !data.use_title;
		const updatedFile = await updateFile(data.id, data);
		if (!updatedFile) return;
		setFile(updatedFile);
	};
	const handleMenuMoveUp = () => {};
	const handleMenuMoveDown = () => {};
	const handleMenuDelete = async () => {
		const { id } = file;
		await deleteFile(id);
		const newFiles = files.filter((part) => part.id !== id);
		setFiles(newFiles);
	};

	const handleItemClick = (e: ClickEvent) => {
		e.stopPropagation = true;
		e.syntheticEvent.preventDefault();
		e.syntheticEvent.stopPropagation();
		const value:
			| 'ignore-file'
			| 'use-summary'
			| 'use-title'
			| 'move-up'
			| 'move-down'
			| 'delete' = e.value;
		switch (value) {
			case 'ignore-file':
				handleMenuIgnoreFile();
				break;
			case 'use-summary':
				handleMenuUseSummary();
				break;
			case 'use-title':
				handleMenuUseTitle();
				break;
			case 'move-up':
				handleMenuMoveUp();
				break;
			case 'move-down':
				handleMenuMoveDown();
				break;
			case 'delete':
				handleMenuDelete();
				break;
			default:
				console.log('unhandled menu item', value);
				break;
		}
	};

	return (
		<ControlledMenu
			arrow={true}
			state={menuOpen ? 'open' : 'closed'}
			onClose={() => setMenuOpen(false)}
			anchorRef={anchorRef}
			position="anchor"
			direction="right"
			align="center"
			portal={true}
			onItemClick={handleItemClick}
		>
			<MenuItem value="ignore-file">Ignore File</MenuItem>

			{file.summary && (
				<MenuItem
					type="checkbox"
					value="use-summary"
					checked={file.use_summary}
				>
					Use Summary
				</MenuItem>
			)}
			<MenuItem type="checkbox" value="use-title" checked={file.use_title}>
				Use Title
			</MenuItem>
			<MenuItem value="move-up">Move Up</MenuItem>
			<MenuItem value="move-down">Move Down</MenuItem>
			<MenuItem value="delete">Delete</MenuItem>
		</ControlledMenu>
	);
};
