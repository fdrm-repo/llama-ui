import { ChatScreen } from '../components/chat/ChatScreen.jsx';

const mockMessages = [
	{
		id: '1',
		role: 'user',
		content: 'How do I optimize React performance?',
		timestamp: Date.now() - 3600000,
	},
	{
		id: '2',
		role: 'assistant',
		content: 'React performance optimization involves several techniques:\n\n1. **Use React.memo** for component memoization\n2. **Implement useMemo and useCallback** for expensive computations\n3. **Code splitting** with dynamic imports\n4. **Virtualization** for long lists\n5. **Optimize re-renders** by keeping state local\n\nWould you like me to dive deeper into any of these techniques?',
		timestamp: Date.now() - 3500000,
		model: 'llama-3.1-8b',
	},
];

function Chat() {
	return (
		<ChatScreen showCenteredEmpty={false} />
	);
}

export { Chat };
