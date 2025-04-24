import { getCurrentWindow } from '@tauri-apps/api/window';
import { Button } from './ui/button';
import { useEffect } from 'react';

export default function TitleBar() {
	useEffect(() => {
		const appWindow = getCurrentWindow();

		document.getElementById('titlebar-minimize')?.addEventListener('click', () => {
			appWindow.minimize();
		});

		document.getElementById('titlebar-close')?.addEventListener('click', () => {
			appWindow.close();
		});
	}, []);
	return (
		<header data-tauri-drag-region className='flex flex-row items-center justify-end'>
			<Button id='titlebar-minimize'>Minimize</Button>
			<Button id='titlebar-close'>Close</Button>
		</header>
	);
}
