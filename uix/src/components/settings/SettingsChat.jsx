import { useState } from 'react';
import { Button } from '../ui/Button.jsx';
import { Settings, RefreshCw, FlaskConical } from 'lucide-react';

const settingsSections = [
	{ slug: 'general', title: 'General', icon: Settings },
	{ slug: 'models', title: 'Models', icon: Settings },
	{ slug: 'mcp-servers', title: 'MCP Servers', icon: Settings },
	{ slug: 'appearance', title: 'Appearance', icon: Settings },
	{ slug: 'advanced', title: 'Advanced', icon: Settings },
	{ slug: 'tools', title: 'Tools', icon: Settings },
	{ slug: 'import-export', title: 'Import / Export', icon: Settings },
];

const mockFields = [
	{ key: 'theme', label: 'Theme', type: 'select', options: [
		{ value: 'light', label: 'Light' },
		{ value: 'dark', label: 'Dark' },
		{ value: 'system', label: 'System' },
	]},
	{ key: 'sendOnEnter', label: 'Send on Enter', type: 'checkbox' },
	{ key: 'showSystemMessage', label: 'Show system message in conversations', type: 'checkbox' },
	{ key: 'disableAutoScroll', label: 'Disable auto-scroll', type: 'checkbox' },
	{ key: 'keepStatsVisible', label: 'Keep stats visible', type: 'checkbox' },
	{ key: 'maxTokens', label: 'Max Tokens', type: 'input', help: 'Maximum number of tokens to generate' },
	{ key: 'temperature', label: 'Temperature', type: 'input', help: 'Controls randomness in responses' },
	{ key: 'systemMessage', label: 'System Message', type: 'textarea', help: 'Default system message for all conversations' },
];

function SettingsChat() {
	const [activeSection, setActiveSection] = useState('general');
	const [localConfig, setLocalConfig] = useState({
		theme: 'system',
		sendOnEnter: true,
		showSystemMessage: true,
		disableAutoScroll: false,
		keepStatsVisible: false,
		maxTokens: '',
		temperature: '',
		systemMessage: '',
	});

	const handleConfigChange = (key, value) => {
		setLocalConfig((prev) => ({ ...prev, [key]: value }));
	};

	const handleSave = () => {
		alert('Settings saved!');
	};

	const handleReset = () => {
		setLocalConfig({
			theme: 'system',
			sendOnEnter: true,
			showSystemMessage: true,
			disableAutoScroll: false,
			keepStatsVisible: false,
			maxTokens: '',
			temperature: '',
			systemMessage: '',
		});
	};

	const currentSection = settingsSections.find((s) => s.slug === activeSection) || settingsSections[0];

	return (
		<div className="mx-auto flex h-full w-full flex-col md:pl-8">
			<div className="flex flex-1 flex-col gap-4 md:flex-row">
				<div className="sticky top-2 hidden w-64 flex-col self-start bg-background py-4 md:flex gap-6">
					<div className="flex items-center gap-2 py-2">
						<Settings className="h-5 w-5 md:h-6 md:w-6" />
						<h1 className="text-xl font-semibold md:text-2xl">Settings</h1>
					</div>

					<nav className="space-y-1">
						{settingsSections.map((section) => (
							<button
								key={section.slug}
								onClick={() => setActiveSection(section.slug)}
								className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
									activeSection === section.slug
										? 'bg-accent text-accent-foreground'
										: 'text-muted-foreground hover:bg-accent'
								}`}
							>
								<section.icon className="h-4 w-4" />
								<span className="ml-2">{section.title}</span>
							</button>
						))}
					</nav>
				</div>

				<div className="mx-auto max-w-3xl flex-1">
					<div className="space-y-6 p-4 md:p-6 md:pt-28">
						<div className="grid">
							<div className="mb-6 flex items-center gap-2 border-b border-border/30 pb-6 md:flex">
								<currentSection.icon className="h-5 w-5" />
								<h3 className="text-lg font-semibold">{currentSection.title}</h3>
							</div>

							<div className="space-y-6">
								{mockFields.map((field) => (
									<div key={field.key} className="space-y-2">
										{field.type === 'input' && (
											<>
												<label className="flex items-center gap-1.5 text-sm font-medium">
													{field.label}
												</label>
												<input
													type={field.isPositiveInteger ? 'number' : 'text'}
													value={localConfig[field.key] || ''}
													onChange={(e) => handleConfigChange(field.key, e.target.value)}
													placeholder={field.help || ''}
													className="w-full h-9 rounded-md border border-border bg-transparent px-3 py-1 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
												/>
												{field.help && (
													<p className="mt-1 text-xs text-muted-foreground">{field.help}</p>
												)}
											</>
										)}

										{field.type === 'textarea' && (
											<>
												{field.label && (
													<label className="block flex items-center gap-1.5 text-sm font-medium">
														{field.label}
													</label>
												)}
												<textarea
													value={localConfig[field.key] || ''}
													onChange={(e) => handleConfigChange(field.key, e.target.value)}
													placeholder=""
													className="min-h-[10rem] w-full md:max-w-3xl rounded-md border border-border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
												/>
												{field.help && (
													<p className="mt-1 text-xs text-muted-foreground">{field.help}</p>
												)}
												{field.key === 'systemMessage' && (
													<div className="mt-3 flex items-center gap-2">
														<input
															type="checkbox"
															id="showSystemMessage"
															checked={localConfig.showSystemMessage}
															onChange={(e) => handleConfigChange('showSystemMessage', e.target.checked)}
															className="h-4 w-4 rounded border-border"
														/>
														<label htmlFor="showSystemMessage" className="cursor-pointer text-sm font-normal">
															Show system message in conversations
														</label>
													</div>
												)}
											</>
										)}

										{field.type === 'select' && (
											<>
												<label className="flex items-center gap-1.5 text-sm font-medium">
													{field.label}
												</label>
												<select
													value={localConfig[field.key] || ''}
													onChange={(e) => handleConfigChange(field.key, e.target.value)}
													className="w-full h-9 rounded-md border border-border bg-transparent px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
												>
													{field.options?.map((option) => (
														<option key={option.value} value={option.value}>
															{option.label}
														</option>
													))}
												</select>
											</>
										)}

										{field.type === 'checkbox' && (
											<div className="flex items-start space-x-3">
												<input
													type="checkbox"
													id={field.key}
													checked={localConfig[field.key] || false}
													onChange={(e) => handleConfigChange(field.key, e.target.checked)}
													className="mt-1 h-4 w-4 rounded border-border"
												/>
												<div className="space-y-1">
													<label htmlFor={field.key} className="flex cursor-pointer items-center gap-1.5 pt-1 pb-0.5 text-sm leading-none font-medium">
														{field.label}
														{field.isExperimental && <FlaskConical className="h-3.5 w-3.5 text-muted-foreground" />}
													</label>
												</div>
											</div>
										)}
									</div>
								))}
							</div>
						</div>

						<div className="mt-8 border-t border-border/30 pt-6">
							<p className="text-xs text-muted-foreground">Settings are saved in browser's localStorage</p>
						</div>
					</div>

					<div className="flex justify-end gap-2 p-4 md:p-6 md:pt-0">
						<Button variant="outline" onClick={handleReset}>
							<RefreshCw className="h-3 w-3 mr-1" />
							Reset
						</Button>
						<Button onClick={handleSave}>Save</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

export { SettingsChat };
