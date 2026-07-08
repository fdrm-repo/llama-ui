import { forwardRef } from 'react';

const buttonVariants = {
	default: 'bg-primary text-primary-foreground hover:bg-primary/90',
	destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
	outline: 'border border-border bg-transparent hover:bg-accent hover:text-accent-foreground',
	secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
	ghost: 'hover:bg-accent hover:text-accent-foreground',
	link: 'text-primary underline-offset-4 hover:underline',
	icon: 'h-9 w-9 rounded-full p-0',
};

const Button = forwardRef(({ className, variant = 'default', size = 'default', ...props }, ref) => {
	const baseClasses = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';

	const variantClasses = buttonVariants[variant] || buttonVariants.default;
	const sizeClasses = size === 'icon' ? 'h-9 w-9' : size === 'sm' ? 'h-8 rounded-md px-3 text-xs' : size === 'lg' ? 'h-10 rounded-md px-8' : 'h-9 px-4 py-2';

	return (
		<button
			className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className || ''}`}
			ref={ref}
			{...props}
		/>
	);
});

Button.displayName = 'Button';

export { Button };
