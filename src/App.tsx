import { useState } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import Player from '@/components/player';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Playlist } from './lib/types';
import Tracklist from './components/tracklist';
import { loadSavedPlaylists } from './hooks/use-file-management';
import TitleBar from './components/title-bar';

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
				<div className='fixed top-2 left-64 right-2 z-50'>
					<TitleBar />
				</div>
				<SidebarProvider className=''>
					<AppSidebar currentPlaylist={currentPlaylist} setCurrentPlaylist={setCurrentPlaylist} savedPlaylists={savedPlaylists} setSavedPlaylists={setSavedPlaylists} />
					<main className='flex-1'>
						<Tracklist playlist={currentPlaylist} onPlaylistSaved={refreshPlaylists} currentTrackIndex={currentTrackIndex} />
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
