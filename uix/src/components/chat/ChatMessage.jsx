import ChatMessageUser from './ChatMessageUser.jsx';
import ChatMessageAssistant from './ChatMessageAssistant.jsx';
import ChatMessageSystem from './ChatMessageSystem.jsx';

function ChatMessage({ message, toolMessages = [], isLastAssistantMessage, className }) {
	if (message.role === 'system') {
		return <ChatMessageSystem message={message} className={className} />;
	}

	if (message.role === 'user') {
		return <ChatMessageUser message={message} className={className} />;
	}

	return (
		<ChatMessageAssistant
			message={message}
			toolMessages={toolMessages}
			isLastAssistantMessage={isLastAssistantMessage}
			className={className}
		/>
	);
}

export { ChatMessage };
export default ChatMessage;
