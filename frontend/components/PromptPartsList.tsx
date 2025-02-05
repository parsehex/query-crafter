import React from 'react';
import { createSnippet, updateSnippets } from '../api/snippets';
import { useStore } from '../state';
import SnippetPart from './Snippet/Snippet';
import FilePart from './File/File';
import Directory from './Directory/Directory';
import { createFileHierarchy } from '../file-hierarchy';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Minus } from 'lucide-react';

const PromptPartsList: React.FC = () => {
	const [
		files,
		snippets,
		setSnippets,
		setFiles,
		selectedProjectId,
		selectedPromptPart,
	] = useStore((state) => [
		state.files,
		state.snippets,
		state.setSnippets,
		state.setFiles,
		state.selectedProjectId,
		state.selectedPromptPart,
	]);

	const move = async (dragIndex: number, hoverIndex: number) => {
		const dragged = snippets[dragIndex];
		let data = [...snippets];
		data.splice(dragIndex, 1); // remove dragged element
		data.splice(hoverIndex, 0, dragged); // insert dragged element at hoverIndex

		data.forEach((part, index) => {
			part.position = index;
		});

		// should only update snippets that have changed
		data = data.filter(
			(part, index) => part.position !== snippets[index].position
		);

		// combine with existing snippets, without duplicates
		const d = await updateSnippets(data);
		const updatedSnippets = d
			.reduce((acc, snippet) => {
				if (!acc.find((s) => s.id === snippet.id)) {
					acc.push(snippet);
				}
				return acc;
			}, snippets)
			.sort((a, b) => a.position - b.position);
		setSnippets(updatedSnippets);
	};

	const handleNewSnippetClick = async () => {
		if (!selectedProjectId) return;
		// get new name based on existing names
		const name = 'Snippet ' + (snippets.length + 1);
		const newSnippet = await createSnippet(selectedProjectId, { name });
		if (!newSnippet) return;
		setSnippets([...snippets, newSnippet]);
	};

	const handleClearSnippets = async () => {
		setSnippets(
			snippets.map((snippet) => {
				return {
					...snippet,
					included: false,
				};
			})
		);
	};

	const handleClearFiles = async () => {
		setFiles(
			files.map((file) => {
				return {
					...file,
					included: false,
				};
			})
		);
	};

	const fileHierarchy = createFileHierarchy(files);

	return (
		<div className="flex flex-col h-full">
			<Button
				onClick={handleNewSnippetClick}
				variant="outline"
				size="sm"
				className="mb-4"
			>
				<Plus className="h-4 w-4 mr-2" />
				New Snippet
			</Button>

			<div className="space-y-4 flex-1">
				<ScrollArea className="border rounded-md h-[35vh]">
					<div className="p-4">
						<h3 className="text-sm font-medium mb-2">
							Snippets
							<Button
								onClick={handleClearSnippets}
								variant="outline"
								size="sm"
								className="ml-2"
							>
								-
							</Button>
						</h3>
						<ul className="space-y-1">
							{snippets.map((part, index) => (
								<li key={part.name}>
									<SnippetPart
										snippet={part}
										index={index}
										selected={selectedPromptPart?.id === part.id}
										move={move}
									/>
								</li>
							))}
						</ul>
					</div>
				</ScrollArea>

				<ScrollArea className="border rounded-md h-[35vh]">
					<div className="p-4">
						<h3 className="text-sm font-medium mb-2">
							Files
							<Button
								onClick={handleClearFiles}
								variant="outline"
								size="sm"
								className="ml-2"
							>
								-
							</Button>
						</h3>
						<ul className="space-y-1">
							{fileHierarchy.children?.map((node, index) => (
								<li key={'file-' + node.path}>
									{node.promptPart ? (
										<FilePart
											file={node.promptPart as any}
											index={index}
											selected={selectedPromptPart?.id === node.promptPart.id}
										/>
									) : (
										<Directory node={node} index={index} path={node.path} />
									)}
								</li>
							))}
						</ul>
					</div>
				</ScrollArea>
			</div>
		</div>
	);
};

export default PromptPartsList;
