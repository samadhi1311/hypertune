import { useState } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import Player from '@/components/player';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Playlist } from './lib/types';
import Tracklist from './components/tracklist';
import { loadSavedPlaylists } from './hooks/use-file-management';

// Define a default empty playlist
const defaultPlaylist: Playlist = {
	name: 'No Playlist Selected',
	tracks: [],
};

function App() {
	const [currentPlaylist, setCurrentPlaylist] = useState<Playlist>(defaultPlaylist);
	const [savedPlaylists, setSavedPlaylists] = useState<Playlist[]>([]);
	const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);

	const refreshPlaylists = async () => {
		const playlists = await loadSavedPlaylists();
		setSavedPlaylists(playlists);
	};

	return (
		<>
			<ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
				<SidebarProvider className=''>
					<AppSidebar currentPlaylist={currentPlaylist} setCurrentPlaylist={setCurrentPlaylist} savedPlaylists={savedPlaylists} setSavedPlaylists={setSavedPlaylists} />
					<main className='flex flex-col w-full h-full'>
						<section className='flex flex-col justify-between h-full'>
							<div className='h-full flex flex-col gap-4'>
								<Tracklist playlist={currentPlaylist} onPlaylistSaved={refreshPlaylists} currentTrackIndex={currentTrackIndex} />
							</div>
						</section>
					</main>
				</SidebarProvider>
				<div className='fixed bottom-0 inset-x-0 z-50'>
					<Player playlist={currentPlaylist} onTrackChange={setCurrentTrackIndex} />
				</div>
			</ThemeProvider>
		</>
	);
}

export default App;
