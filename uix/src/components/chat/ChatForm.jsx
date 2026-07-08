import { useState, useRef, useEffect } from 'react';
import { ArrowUp, Square, Paperclip, Mic, Settings, X, Plus } from 'lucide-react';
import { Button } from '../ui/Button.jsx';

function ChatForm({
	onSend,
	onStop,
	onFileUpload,
	disabled = false,
	isLoading = false,
	placeholder = 'Type a message...',
	className,
	uploadedFiles = [],
	onFileRemove,
}) {
	const [inputValue, setInputValue] = useState('');
	const textareaRef = useRef(null);

	const canSubmit = inputValue.trim().length > 0 || uploadedFiles.length > 0;

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!canSubmit || disabled) return;
		onSend?.(inputValue, uploadedFiles);
		setInputValue('');
	};

	const handleKeyDown = (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e);
		}
	};

	const handleTextareaChange = (e) => {
		setInputValue(e.target.value);
	};

	useEffect(() => {
		const textarea = textareaRef.current;
		if (!textarea) return;
		textarea.style.height = 'auto';
		textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
	}, [inputValue]);

	return (
		<form
			onSubmit={handleSubmit}
			className={`relative ${className || ''}`}
		>
			<div
				className="overflow-hidden rounded-4xl md:rounded-3xl backdrop-blur-md border border-border bg-background"
				data-slot="input-area"
			>
				{uploadedFiles.length > 0 && (
					<div className="flex gap-2 px-5 py-3 overflow-x-auto">
						{uploadedFiles.map((file, i) => (
							<div
								key={file.id || i}
								className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md text-sm shrink-0"
							>
								<span className="truncate max-w-[150px]">{file.name}</span>
								<button
									type="button"
									onClick={() => onFileRemove?.(file.id || String(i))}
									className="text-muted-foreground hover:text-foreground"
								>
									<X size={14} />
								</button>
							</div>
						))}
					</div>
				)}

				<div className="flex-column relative min-h-12 items-center rounded-4xl md:rounded-3xl py-2 pb-2.25 shadow-sm transition-all focus-within:shadow-md md:py-3">
					<textarea
						ref={textareaRef}
						value={inputValue}
						onChange={handleTextareaChange}
						onKeyDown={handleKeyDown}
						placeholder={placeholder}
						disabled={disabled}
						className="px-5 py-1.5 md:pt-0 bg-transparent resize-none outline-none w-full min-h-[40px] max-h-[200px] text-foreground placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
						rows={1}
					/>

					<div className="flex items-center gap-2 px-3 mt-auto">
						<button
							type="button"
							onClick={() => onFileUpload?.()}
							className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
							aria-label="Attach files"
						>
							<Paperclip size={18} />
						</button>

						<div className="flex-1" />

						{isLoading ? (
							<Button
								type="button"
								variant="secondary"
								onClick={onStop}
								className="group h-8 w-8 rounded-full p-0 hover:bg-destructive/10"
								title="Stop generation"
							>
								<Square className="h-8 w-8 fill-muted-foreground stroke-muted-foreground group-hover:fill-destructive group-hover:stroke-destructive" />
							</Button>
						) : (
							<Button
								type="submit"
								disabled={!canSubmit || disabled}
								className="md:h-8 md:w-8 h-9 w-9 rounded-full p-0 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
							>
								<span className="sr-only">Send</span>
								<ArrowUp className="h-12 w-12" />
							</Button>
						)}
					</div>
				</div>
			</div>
		</form>
	);
}

export { ChatForm };
export default ChatForm;
