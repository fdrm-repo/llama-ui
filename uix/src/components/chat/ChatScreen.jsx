import { useState, useRef, useEffect } from 'react';
import ChatMessages from './ChatMessages.jsx';
import ChatForm from './ChatForm.jsx';
import { Logo } from '../misc/Logo.jsx';
import { Button } from '../ui/Button.jsx';
import { PanelLeftClose, PanelLeftOpen, X, Plus, Search, Settings, Pin } from 'lucide-react';

const SIDEBAR_ACTIONS_ITEMS = [
	{ id: 'new-chat', icon: Plus, tooltip: 'New Chat', route: null },
	{ id: 'search', icon: Search, tooltip: 'Search', route: null },
	{ id: 'settings', icon: Settings, tooltip: 'Settings', route: null },
];

const mockConversations = [
	{ id: '1', name: 'React Performance Optimization', lastModified: Date.now() - 3600000, pinned: true },
	{ id: '2', name: 'Tailwind CSS Tips', lastModified: Date.now() - 7200000, pinned: false },
	{ id: '3', name: 'API Design Discussion', lastModified: Date.now() - 86400000, pinned: false },
	{ id: '4', name: 'Database Schema Review', lastModified: Date.now() - 172800000, pinned: false },
	{ id: '5', name: 'CI/CD Pipeline Setup', lastModified: Date.now() - 259200000, pinned: false },
];

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
	{
		id: '3',
		role: 'user',
		content: 'Can you show me an example of React.memo?',
		timestamp: Date.now() - 3400000,
	},
	{
		id: '4',
		role: 'assistant',
		content: 'Here\'s a simple example:\n\n```jsx\nconst ExpensiveComponent = React.memo(({ data }) => {\n  console.log("Rendering...");\n  return <div>{data.name}</div>;\n});\n```\n\nReact.memo wraps the component and prevents re-renders when props haven\'t changed.',
		timestamp: Date.now() - 3300000,
		model: 'llama-3.1-8b',
	},
	{
		id: '5',
		role: 'system',
		content: 'Context: This conversation is about React performance optimization techniques.',
		timestamp: Date.now() - 3200000,
	},
];

function ChatScreen({ showCenteredEmpty = false }) {
	const [sidebarExpanded, setSidebarExpanded] = useState(true);
	const [messages, setMessages] = useState(showCenteredEmpty ? [] : mockMessages);
	const [isLoading, setIsLoading] = useState(false);
	const [isStreaming, setIsStreaming] = useState(false);
	const [inputValue, setInputValue] = useState('');
	const [uploadedFiles, setUploadedFiles] = useState([]);
	const [conversations] = useState(mockConversations);
	const [searchQuery, setSearchQuery] = useState('');
	const [isSearchModeActive, setIsSearchModeActive] = useState(false);
	const [logoHovered, setLogoHovered] = useState(false);
	const [innerWidth, setInnerWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
	const chatContainerRef = useRef(null);

	useEffect(() => {
		const handleResize = () => setInnerWidth(window.innerWidth);
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const isOnMobile = innerWidth <= 768;
	const filteredConversations = conversations.filter((conv) =>
		conv.name.toLowerCase().includes(searchQuery.toLowerCase())
	);
	const pinnedConversations = filteredConversations.filter((conv) => conv.pinned);
	const unpinnedConversations = filteredConversations.filter((conv) => !conv.pinned);

	const handleSend = (content, files) => {
		const newMessage = {
			id: Date.now().toString(),
			role: 'user',
			content,
			timestamp: Date.now(),
		};
		setMessages((prev) => [...prev, newMessage]);
		setInputValue('');
		setUploadedFiles([]);
	};

	const handleStop = () => {
		setIsStreaming(false);
		setIsLoading(false);
	};

	const handleFileUpload = () => {
		const mockFile = { id: Date.now().toString(), name: 'file.txt', size: 1024 };
		setUploadedFiles((prev) => [...prev, mockFile]);
	};

	const handleFileRemove = (fileId) => {
		setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
	};

	const handleNewChat = () => {
		setMessages([]);
	};

	const showCloseButton = isOnMobile || (sidebarExpanded && !false);

	return (
		<div className="flex h-screen w-full">
			<aside
				className={`fixed md:sticky top-2 left-2 md:left-0 md:ml-2 md:mt-2 pt-2 z-10 w-[calc(100dvw-1rem)] md:h-[calc(100dvh-1.125rem)] flex flex-col rounded-3xl md:rounded-2xl duration-200 ease-out ${
					sidebarExpanded
						? 'md:w-72 md:bg-muted/60 md:backdrop-blur-xl border-border shadow-md md:transition-[width,padding]'
						: 'md:w-12 transition-[width,padding]'
				} ${!sidebarExpanded && isOnMobile ? 'is-collapsed pointer-events-none' : ''}`}
			>
				{/* Header */}
				<div className="px-2 flex items-center justify-between">
					<div
						className="relative"
						onMouseEnter={() => setLogoHovered(true)}
						onMouseLeave={() => setLogoHovered(false)}
					>
						<button
							type="button"
							onClick={() => setSidebarExpanded(!sidebarExpanded)}
							className="md:h-9 md:w-9 h-10 w-10 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
							aria-label={sidebarExpanded ? 'Collapse navigation' : 'Expand navigation'}
						>
							{!sidebarExpanded && logoHovered && innerWidth > 768 ? (
								<PanelLeftOpen className="h-4 w-4" />
							) : sidebarExpanded ? (
								<PanelLeftClose className="h-4 w-4" />
							) : (
								<Logo size={sidebarExpanded ? 20 : 16} />
							)}
						</button>
					</div>

					{(sidebarExpanded || isOnMobile) && (
						<div
							className={`flex items-center transition-all duration-150 ease-out ${!sidebarExpanded && !isOnMobile ? 'opacity-0 h-0' : 'opacity-100 h-auto'}`}
						>
							<button
								type="button"
								onClick={() => setSidebarExpanded(false)}
								className="backdrop-blur-none md:h-9 md:w-9 h-10 w-10 rounded-full flex items-center justify-center hover:bg-accent transition-colors mr-1"
								aria-label="Collapse navigation"
							>
								{isOnMobile ? (
									<X className="h-4 w-4" />
								) : (
									<PanelLeftClose className="h-4 w-4" />
								)}
							</button>
						</div>
					)}
				</div>

				{/* Body */}
				<div className="mt-2 flex min-h-0 flex-1 flex-col gap-4 md:gap-1 overflow-y-auto">
					{(sidebarExpanded || isOnMobile) ? (
						<div
							className={`flex min-h-0 flex-1 flex-col gap-4 md:gap-1 ${isOnMobile ? 'transition-[opacity,height] duration-200 ease-out' : ''} ${!sidebarExpanded && isOnMobile ? 'opacity-0 h-0' : ''}`}
						>
							{isSearchModeActive ? (
								<div className="px-4 my-2">
									<div className="relative">
										<input
											type="text"
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											placeholder="Search conversations..."
											className="w-full h-9 rounded-md border border-border bg-transparent px-3 py-1 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
											autoFocus
										/>
										<button
											type="button"
											onClick={() => {
												setIsSearchModeActive(false);
												setSearchQuery('');
											}}
											className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
										>
											<X className="h-4 w-4" />
										</button>
									</div>
								</div>
							) : (
								<div className="px-2 flex flex-col gap-5 md:gap-1 mt-2 md:mt-0">
									{SIDEBAR_ACTIONS_ITEMS.map((item) => (
										<Button
											key={item.id}
											variant="ghost"
											className="w-full justify-start gap-2"
											onClick={() => {
												if (item.id === 'new-chat') handleNewChat();
												if (item.id === 'search' && isOnMobile) {
													setIsSearchModeActive(true);
												}
											}}
										>
											<item.icon className="h-4 w-4" />
											<span>{item.tooltip}</span>
										</Button>
									))}

									<div className="px-0">
										<input
											type="text"
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											placeholder="Search conversations..."
											className="w-full h-9 rounded-md border border-border bg-transparent px-3 py-1 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
										/>
									</div>
								</div>
							)}

							<div className="flex flex-col gap-1">
								{pinnedConversations.length > 0 && (
									<>
										<div className="text-muted-foreground flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium gap-1">
											<Pin className="h-3.5 w-3.5" />
											<span>Pinned</span>
										</div>
										{pinnedConversations.map((conv) => (
											<button
												key={conv.id}
												className="group/item w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors hover:bg-foreground/10"
											>
												<span className="truncate block">{conv.name}</span>
											</button>
										))}
									</>
								)}

								{filteredConversations.length > 0 && (
									<div className="text-muted-foreground flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium">
										Recent conversations
									</div>
								)}

								{unpinnedConversations.map((conv) => (
									<button
										key={conv.id}
										className="group/item w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors hover:bg-foreground/10"
									>
										<span className="truncate block">{conv.name}</span>
									</button>
								))}

								{unpinnedConversations.length === 0 && (
									<div className="px-2 py-4 text-center">
										<p className="text-sm text-muted-foreground">
											{isSearchModeActive ? 'No results found' : 'No conversations yet'}
										</p>
									</div>
								)}
							</div>
						</div>
					) : (
						<div className="flex-col gap-1 hidden md:flex mt-2">
							{SIDEBAR_ACTIONS_ITEMS.map((item) => (
								<button
									key={item.id}
									type="button"
									className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
									aria-label={item.tooltip}
									onClick={() => {
										if (item.id === 'new-chat') handleNewChat();
									}}
								>
									<item.icon className="h-4 w-4" />
								</button>
							))}
						</div>
					)}
				</div>
			</aside>

			<main className="flex-1 flex flex-col min-w-0">
				<div
					className="chat-screen flex grow flex-col min-h-[calc(100dvh-1rem)] md:min-h-full px-4 md:py-0 pt-12 pb-48 md:pb-4"
					ref={chatContainerRef}
				>
					{!showCenteredEmpty && messages.length > 0 ? (
						<ChatMessages messages={messages} />
					) : (
						<div className="flex-1 flex flex-col items-center justify-center">
							<Logo size={64} className="mb-4 text-primary" />
							<h1 className="text-2xl font-semibold tracking-tight md:text-3xl mb-2">Hello there</h1>
							<p className="text-muted-foreground md:text-lg text-center max-w-md">
								Type a message or upload files to get started
							</p>
							<div className="flex flex-wrap gap-2 mt-6 justify-center">
								{[
									'Explain quantum computing',
									'Write a poem about nature',
									'Help me debug this code',
									'What is machine learning?',
								].map((prompt) => (
									<button
										key={prompt}
										type="button"
										onClick={() => setInputValue(prompt)}
										className="px-4 py-2 rounded-full border border-border bg-background hover:bg-accent text-sm transition-colors"
									>
										{prompt}
									</button>
								))}
							</div>
						</div>
					)}

					<div
						className={`pointer-events-none md:sticky fixed mt-auto transition-all duration-200 ${
							showCenteredEmpty
								? 'md:bottom-[calc(50dvh-7rem)] 2xl:bottom-[calc(50dvh-4rem)]'
								: 'md:bottom-4'
						} bottom-2 right-2 left-2`}
						style={{ paddingTop: showCenteredEmpty ? undefined : 'var(--chat-form-padding-top)' }}
					>
						<div className="pointer-events-none flex flex-col gap-6 items-center w-full">
							{isLoading && !isStreaming && (
								<div className="chat-processing-info-container pointer-events-none relative w-full hidden md:block">
									<div className="chat-processing-info-content absolute bottom-4 left-1/2 -translate-x-1/2">
										<span className="chat-processing-info-detail pointer-events-auto backdrop-blur-sm px-3 py-1 rounded-md bg-muted text-muted-foreground text-xs">
											Processing...
										</span>
									</div>
								</div>
							)}
						</div>

						<ChatForm
							className="pointer-events-auto conversation-chat-form"
							isLoading={isLoading || isStreaming}
							onSend={handleSend}
							onStop={handleStop}
							onFileUpload={handleFileUpload}
							onFileRemove={handleFileRemove}
							uploadedFiles={uploadedFiles}
							placeholder="Type a message..."
						/>
					</div>
				</div>
			</main>
		</div>
	);
}

export { ChatScreen };
export default ChatScreen;
