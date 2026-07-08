import { useState, useEffect, useRef } from 'react';

function ChatMessageAssistant({ message, toolMessages = [], isLastAssistantMessage, className }) {
	const [lastUserMessageHeight, setLastUserMessageHeight] = useState(0);
	const [assistantMarginTop, setAssistantMarginTop] = useState(0);
	const assistantRef = useRef(null);

	useEffect(() => {
		if (!assistantRef.current) return;

		const computedStyle = getComputedStyle(assistantRef.current);
		setAssistantMarginTop(Math.round(parseFloat(computedStyle.marginTop)));

		const chatMessageEl = assistantRef.current.closest('.chat-message');
		const previousChatMessage = chatMessageEl?.previousElementSibling;
		const userMessageEl = previousChatMessage?.querySelector('.chat-message-user');

		if (!userMessageEl) {
			setLastUserMessageHeight(0);
			return;
		}

		const updateHeight = () => {
			const rect = userMessageEl.getBoundingClientRect();
			const marginTop = Math.round(parseFloat(getComputedStyle(userMessageEl).marginTop));
			setLastUserMessageHeight(Math.round(rect.height + marginTop));
		};

		updateHeight();
		const resizeObserver = new ResizeObserver(updateHeight);
		resizeObserver.observe(userMessageEl);
		return () => resizeObserver.disconnect();
	}, []);

	return (
		<div
			ref={assistantRef}
			className={`chat-message-assistant text-md group w-full leading-7.5 ${className || ''}`}
			style={{
				'--last-user-message-height': lastUserMessageHeight > 0 ? `${lastUserMessageHeight}px` : undefined,
				'--assistant-margin-top': assistantMarginTop > 0 ? `${assistantMarginTop}px` : undefined,
			}}
			role="group"
			aria-label="Assistant message with actions"
		>
			{message.content?.trim() && (
				<div className="prose prose-sm dark:prose-invert max-w-none">
					<p className="text-foreground whitespace-pre-wrap">{message.content}</p>
				</div>
			)}

			{!message.content?.trim() && isLastAssistantMessage && (
				<div className="flex items-center gap-2 text-muted-foreground">
					<div className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse" />
					<span className="text-sm">Processing...</span>
				</div>
			)}

			{message.timestamp && (
				<div className="info my-6 grid gap-4 tabular-nums">
					<div className="inline-flex flex-wrap items-start gap-2 text-xs text-muted-foreground">
						{message.model && (
							<span className="cursor-pointer hover:text-foreground" onClick={() => navigator.clipboard.writeText(message.model)}>
								{message.model}
							</span>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

export { ChatMessageAssistant };
export default ChatMessageAssistant;
