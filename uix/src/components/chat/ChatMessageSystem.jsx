import { useState, useEffect, useRef } from 'react';

function ChatMessageSystem({ message, className }) {
	const [isMultiline, setIsMultiline] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);
	const [contentHeight, setContentHeight] = useState(0);
	const messageRef = useRef(null);
	const MAX_HEIGHT = 200;

	useEffect(() => {
		if (!messageRef.current || !message.content?.trim()) return;

		if (message.content.includes('\n')) {
			setIsMultiline(true);
		}

		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const element = entry.target;
				const estimatedSingleLineHeight = 24;
				setIsMultiline(element.offsetHeight > estimatedSingleLineHeight * 1.5);
				setContentHeight(element.scrollHeight);
			}
		});

		resizeObserver.observe(messageRef.current);
		return () => resizeObserver.disconnect();
	}, [message.content]);

	const showExpandButton = contentHeight > MAX_HEIGHT;

	return (
		<div
			className={`group flex flex-col items-end gap-3 md:gap-2 ${className || ''}`}
			role="group"
			aria-label="System message with actions"
		>
			{message.content?.trim() && (
				<div className="relative max-w-[80%]">
					<button
						className={`group/expand w-full text-left ${!isExpanded && showExpandButton ? 'cursor-pointer' : 'cursor-auto'}`}
						onClick={showExpandButton && !isExpanded ? () => setIsExpanded(true) : undefined}
						type="button"
					>
						<div
							className="overflow-y-auto rounded-[1.125rem] border-2 border-dashed border-border/50 bg-muted px-3.75 py-1.5 data-[multiline]:py-2.5"
							data-multiline={isMultiline ? '' : undefined}
							style={{
								border: '2px dashed hsl(var(--border) / 0.5)',
								maxHeight: 'var(--max-message-height)',
								overflowWrap: 'anywhere',
								wordBreak: 'break-word',
							}}
						>
							<div
								className={`relative transition-all duration-300 ${isExpanded ? 'cursor-text select-text' : 'select-none'}`}
								style={!isExpanded && showExpandButton ? { maxHeight: `${MAX_HEIGHT}px` } : { maxHeight: 'none' }}
							>
								<span
									ref={messageRef}
									className={`text-md whitespace-pre-wrap ${isExpanded ? 'cursor-text' : ''}`}
								>
									{message.content}
								</span>

								{!isExpanded && showExpandButton && (
									<>
										<div className="pointer-events-none absolute right-0 bottom-0 left-0 h-48 bg-gradient-to-t from-muted to-transparent" />
										<div className="pointer-events-none absolute right-0 bottom-4 left-0 flex justify-center opacity-0 transition-opacity group-hover/expand:opacity-100">
											<button
												type="button"
												className="rounded-full px-4 py-1.5 text-xs shadow-md border border-border bg-background hover:bg-accent"
												onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }}
											>
												Show full system message
											</button>
										</div>
									</>
								)}
							</div>

							{isExpanded && showExpandButton && (
								<div className="mb-2 flex justify-center">
									<button
										type="button"
										className="rounded-full px-4 py-1.5 text-xs border border-border bg-background hover:bg-accent"
										onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
									>
										Collapse System Message
									</button>
								</div>
							)}
						</div>
					</button>
				</div>
			)}

			{message.timestamp && (
				<div className="max-w-[80%] text-xs text-muted-foreground">
					{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
				</div>
			)}
		</div>
	);
}

export { ChatMessageSystem };
export default ChatMessageSystem;
