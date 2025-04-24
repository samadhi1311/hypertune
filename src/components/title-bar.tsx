import { getCurrentWindow } from '@tauri-apps/api/window';
import { Button } from './ui/button';
import { useEffect } from 'react';
import { MinusIcon, SquareIcon, XIcon } from 'lucide-react';

export default function TitleBar() {
	useEffect(() => {
		const appWindow = getCurrentWindow();

		document.getElementById('titlebar-minimize')?.addEventListener('click', () => {
			appWindow.minimize();
		});

		document.getElementById('titlebar-maximize')?.addEventListener('click', () => {
			appWindow.toggleMaximize();
		});

		document.getElementById('titlebar-close')?.addEventListener('click', () => {
			appWindow.close();
		});
	}, []);
	return (
		<header
			data-tauri-drag-region
			className='flex flex-row items-center justify-between gap-4 bg-sidebar/80 rounded-md border border-border inset-shadow-[0px_0px_32px] inset-shadow-border/50 backdrop-blur-xl p-2'>
			<div className='flex items-center gap-1 pl-2 text-muted-foreground'>
				<img src='hypertune.svg' className='size-8 aspect-square' />
				<img src='hypertune-wordmark.svg' className='h-8 opacity-80' />
			</div>

			<div className='flex gap-2'>
				<Button className='size-7' variant='ghost' id='titlebar-minimize'>
					<MinusIcon strokeWidth={2} className='text-muted-foreground' />
				</Button>
				<Button className='size-7' variant='ghost' id='titlebar-maximize'>
					<SquareIcon strokeWidth={2} className='size-3 text-muted-foreground' />
				</Button>
				<Button className='size-7' variant='ghost' id='titlebar-close'>
					<XIcon strokeWidth={2} className='text-muted-foreground' />
				</Button>
			</div>
		</header>
	);
}
