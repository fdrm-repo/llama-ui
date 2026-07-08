import { useState, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage.jsx';

function ChatMessages({ messages = [], className }) {
	const [isVisible, setIsVisible] = useState(false);
	const scrollContainerRef = useRef(null);
	const [showScrollDown, setShowScrollDown] = useState(false);

	useEffect(() => {
		requestAnimationFrame(() => setIsVisible(true));
	}, []);

	useEffect(() => {
		const container = scrollContainerRef.current;
		if (!container) return;

		const handleScroll = () => {
			const distanceFromBottom =
				container.scrollHeight - container.clientHeight - container.scrollTop;
			setShowScrollDown(distanceFromBottom > 300);
		};

		container.addEventListener('scroll', handleScroll);
		return () => container.removeEventListener('scroll', handleScroll);
	}, []);

	const scrollToBottom = () => {
		const container = scrollContainerRef.current;
		if (container) {
			container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
		}
	};

	return (
		<div
			ref={scrollContainerRef}
			className={`flex-1 overflow-y-auto px-4 md:py-0 pt-12 transition-opacity duration-500 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'} ${className || ''}`}
		>
			<div className="mx-auto mt-12 w-full max-w-3xl flex flex-col gap-6">
				{messages.map((msg) => (
					<div key={msg.id} className="chat-message">
						<ChatMessage
							message={msg}
							toolMessages={msg.toolMessages || []}
							isLastAssistantMessage={msg.isLastAssistantMessage}
							className="mx-auto w-full"
						/>
					</div>
				))}
			</div>

			{showScrollDown && (
				<div className="pointer-events-auto flex justify-center relative h-0">
					<button
						onClick={scrollToBottom}
						className="h-9 w-9 rounded-full bg-accent text-accent-foreground absolute bottom-4 shadow-md flex items-center justify-center hover:bg-accent/80 transition-colors"
						aria-label="Scroll to bottom"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							<path d="m6 9 6 6 6-6" />
						</svg>
					</button>
				</div>
			)}
		</div>
	);
}

export { ChatMessages };
export default ChatMessages;
