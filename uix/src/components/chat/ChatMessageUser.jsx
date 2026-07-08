import { useState, useRef, useEffect } from 'react';

function ChatMessageUser({ message, className }) {
	const [isMultiline, setIsMultiline] = useState(false);
	const messageRef = useRef(null);

	useEffect(() => {
		if (!messageRef.current || !message.content?.trim()) return;

		if (message.content.includes('\n')) {
			setIsMultiline(true);
			return;
		}

		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const element = entry.target;
				const estimatedSingleLineHeight = 24;
				setIsMultiline(element.offsetHeight > estimatedSingleLineHeight * 1.5);
			}
		});

		resizeObserver.observe(messageRef.current);
		return () => resizeObserver.disconnect();
	}, [message.content]);

	return (
		<div className={`chat-message-user group flex flex-col items-end gap-3 md:gap-2 ${className || ''}`}>
			{message.attachments?.length > 0 && (
				<div className="mb-2 max-w-[80%] flex gap-2 flex-wrap">
					{message.attachments.map((att, i) => (
						<div key={i} className="text-xs bg-muted px-2 py-1 rounded-md">
							{att.name || `Attachment ${i + 1}`}
						</div>
					))}
				</div>
			)}

			{message.content?.trim() && (
				<div
					ref={messageRef}
					className="chat-message-user-bubble max-w-[80%] overflow-y-auto rounded-[1.125rem] border-none bg-primary/5 px-3.75 py-1.5 backdrop-blur-md data-[multiline]:py-2.5 dark:bg-primary/15"
					data-multiline={isMultiline ? '' : undefined}
					style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
				>
					<span className="text-md whitespace-pre-wrap">{message.content}</span>
				</div>
			)}

			{message.timestamp && (
				<div className="max-w-[80%] flex items-center gap-2 text-xs text-muted-foreground">
					<span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
				</div>
			)}
		</div>
	);
}

export { ChatMessageUser };
export default ChatMessageUser;
