import { createPortal } from 'react-dom';
import { useTheme } from './theme-provider';

export default function BackgroundEffect({ cover }: { cover: string | undefined }) {
	const { theme } = useTheme();
	return createPortal(
		<div className='fixed inset-0 z-[-1]'>
			{cover ? (
				<img src={cover} className={theme === 'dark' ? 'w-full h-full object-cover blur-3xl opacity-25' : 'w-full h-full object-cover blur-3xl opacity-50'} />
			) : (
				<div className='fixed h-full w-full bg-gradient-to-br from-muted to-background' />
			)}
		</div>,
		document.body
	);
}
