import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { handleFiles, loadPlaylistByName, loadSavedPlaylists } from '@/hooks/use-file-management';
import { Playlist } from '@/lib/types';
import { useEffect } from 'react';

export function AppSidebar({
	// currentPlaylist,
	setCurrentPlaylist,
	savedPlaylists,
	setSavedPlaylists,
}: {
	currentPlaylist: Playlist;
	setCurrentPlaylist: (playlist: Playlist) => void;
	savedPlaylists: Playlist[];
	setSavedPlaylists: (playlists: Playlist[]) => void;
}) {
	useEffect(() => {
		loadPlaylists();
	}, []);

	const handleClick = async () => {
		const playlist = await handleFiles();
		setCurrentPlaylist(playlist);
	};

	const loadPlaylists = async () => {
		const playlists = await loadSavedPlaylists();
		setSavedPlaylists(playlists);
	};

	const loadPlaylist = async (name: string) => {
		const playlist = await loadPlaylistByName(name);

		if (!playlist) return;
		setCurrentPlaylist(playlist);
	};

	// const handleDeletePlaylist = async (name: string) => {
	// 	const success = await deletePlaylist(name);
	// 	if (success) {
	// 		loadPlaylists();

	// 		if (currentPlaylist.name === name) {
	// 			setCurrentPlaylist({
	// 				name: 'No Playlist Selected',
	// 				tracks: [],
	// 			});
	// 		}
	// 	}
	// };

	return (
		<Sidebar variant='floating'>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Your playlists</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{savedPlaylists.length > 0 ? (
								savedPlaylists.map((playlist) => (
									<SidebarMenuItem key={playlist.name}>
										<SidebarMenuButton onClick={() => loadPlaylist(playlist.name)}>{playlist.name}</SidebarMenuButton>
									</SidebarMenuItem>
								))
							) : (
								<p>No saved playlists</p>
							)}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
				<SidebarGroup>
					<SidebarGroupLabel>Delete Playlist</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton onClick={loadPlaylists}>Load Playlists</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton onClick={handleClick}>Select Audio Files</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
				<div className='max-w-sm h-full w-full p-4'></div>
			</SidebarContent>
		</Sidebar>
	);
}
