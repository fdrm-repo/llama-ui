import { useState } from 'react';
import { NewChat } from './pages/NewChat.jsx';
import { Chat } from './pages/Chat.jsx';

function App() {
	const [activeView, setActiveView] = useState('chat');

	return (
		<main className="flex h-screen w-full">
			{activeView === 'newChat' && <NewChat />}
			{activeView === 'chat' && <Chat />}
		</main>
	);
}

export default App;
