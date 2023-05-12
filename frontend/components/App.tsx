import React from 'react';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import Editor from './Editor';
import { Project, Prompt_Part } from '../../types';
import { fetchProjects, fetchPromptParts, getTokenCount } from '../api';
import ProjectSelector from './ProjectSelector';
import PromptPartsList from './PromptPartsList';
import PreviewPromptButton from './PreviewPromptButton';
import CopyPromptButton from './CopyPromptButton';
import TokenCountDisplay from './TokenCountDisplay';
import { makePrompt } from '../utils';
import { Tooltip } from 'react-tooltip';

export const App: React.FC = () => {
	const [projects, setProjects] = useState<Project[]>([]);
	const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
		null
	);
	const [selectedPromptPart, setSelectedPromptPart] =
		useState<Prompt_Part | null>(null);
	const [promptTokenCount, setPromptTokenCount] = useState(0);
	const [includedPromptParts, setIncludedPromptParts] = useState<Prompt_Part[]>(
		[]
	);
	const [readOnly, setReadOnly] = useState(false);
	const [promptParts, setPromptParts] = useState<Prompt_Part[]>([]);
	const setPromptPart = (promptPart: Prompt_Part) => {
		const updatedPromptParts = promptParts.map((part) =>
			part.id === promptPart.id ? promptPart : part
		);
		// console.log(promptPart, updatedPromptParts);
		setPromptParts(updatedPromptParts);
	};

	useEffect(() => {
		fetchProjects().then((projects) => setProjects(projects));

		const selectedProjectId = localStorage.getItem('selectedProjectId');
		if (selectedProjectId) {
			setSelectedProjectId(Number(selectedProjectId));
		}
	}, []);

	useEffect(() => {
		if (selectedProjectId) {
			fetchPromptParts(selectedProjectId).then((promptParts) => {
				setPromptParts(promptParts);
			});
		}
		if (selectedPromptPart?.id !== -1) {
			setReadOnly(false);
		}
	}, [selectedProjectId]);

	useEffect(() => {
		if (selectedPromptPart?.id !== -1) {
			setReadOnly(false);
		}
	}, [selectedPromptPart]);

	useEffect(() => {
		const prompt = makePrompt(includedPromptParts);
		getTokenCount({ text: prompt }).then((data) => {
			setPromptTokenCount(data.token_count);
		});
	}, [includedPromptParts]);

	const updateIncludedPromptParts = () => {
		if (promptParts.length > 0) {
			const includedPromptParts = promptParts.filter((part) => part.included);
			setIncludedPromptParts(includedPromptParts);
		}
	};

	useEffect(() => {
		updateIncludedPromptParts();
		if (selectedPromptPart?.id !== -1) {
			setReadOnly(false);
		}
	}, [promptParts]);

	return (
		<div className="app">
			<main>
				<div className="left-sidebar">
					<ProjectSelector
						projects={projects}
						selectedProjectId={selectedProjectId}
						setSelectedProjectId={setSelectedProjectId}
					/>
					<div className="prompt-options">
						<CopyPromptButton
							promptParts={includedPromptParts}
							selectedProjectId={selectedProjectId}
							setPromptParts={setPromptParts}
						/>
						<PreviewPromptButton
							promptParts={includedPromptParts}
							setReadOnly={setReadOnly}
							setSelectedPromptPart={setSelectedPromptPart}
						/>
						<TokenCountDisplay tokenCount={promptTokenCount} /> /{' '}
						{includedPromptParts.length} parts
					</div>
					<PromptPartsList
						selectedProjectId={selectedProjectId}
						promptParts={promptParts}
						setPromptPart={setPromptPart}
						setPromptParts={setPromptParts}
						selectedPromptPart={selectedPromptPart}
						setSelectedPromptPart={setSelectedPromptPart}
					/>
				</div>
				<div className="right-sidebar">
					{selectedPromptPart && (
						<button
							className="close-button"
							onClick={() => setSelectedPromptPart(null)}
						>
							<FontAwesomeIcon icon={faClose} />
						</button>
					)}
					{selectedPromptPart && (
						<Editor
							promptPart={selectedPromptPart}
							setPromptPart={setPromptPart}
							readOnly={readOnly}
						/>
					)}
				</div>
			</main>
			<Tooltip id="previewButton" />
		</div>
	);
};
