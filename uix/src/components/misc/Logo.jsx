import logoSvg from '../../assets/logo.svg?url';

function Logo({ className, style, size = 32 }) {
	return (
		<div
			className={className}
			style={{
				width: size,
				height: size,
				display: 'inline-flex',
				alignItems: 'center',
				justifyContent: 'center',
				...style,
			}}
		>
			<img
				src={logoSvg}
				alt="Logo"
				style={{ width: '100%', height: '100%', objectFit: 'contain' }}
				draggable={false}
			/>
		</div>
	);
}

export { Logo };
