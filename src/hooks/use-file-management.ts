import { Track, Playlist } from '@/lib/types';
import { get, set } from 'idb-keyval';

const verifyPermission = async (handle: FileSystemFileHandle) => {
	const options = { mode: 'read' };
	// @ts-ignore
	if ((await handle.queryPermission(options)) === 'granted') return true;

	// @ts-ignore
	if ((await handle.requestPermission(options)) === 'granted') return true;
	return false;
};

const handleFiles = async () => {
	// @ts-ignore
	const handles = await window.showOpenFilePicker({ multiple: true, types: [{ description: 'Audio Files', accept: { 'audio/*': ['.mp3', '.wav', '.ogg'] } }] });

	const tracks: Track[] = await Promise.all(
		handles.map(async (handle: any) => {
			const file = await handle.getFile();
			return {
				name: file.name,
				handle,
				url: URL.createObjectURL(file),
				coverArt: null,
			};
		})
	);

	return { name: 'Current Playlist', tracks };
};

const savePlaylist = async (name: string, playlist: Track[]) => {
	const serialized = playlist.map((track) => ({ name: track.name, handle: track.handle }));
	const saved = (await get('playlists')) || {};
	saved[name] = serialized;
	await set('playlists', saved);
};

const loadSavedPlaylists = async () => {
	const saved = (await get('playlists')) || {};
	const playlists: Playlist[] = [];

	for (const name in saved) {
		const tracks = await Promise.all(
			saved[name].map(async ({ name, handle }: any) => {
				if (!(await verifyPermission(handle))) {
					console.warn('Permission denied for loading playlists.');
					return null;
				}
				const file = await handle.getFile();
				return {
					name,
					handle,
					url: URL.createObjectURL(file),
					coverArt: null,
				};
			})
		);
		playlists.push({ name, tracks });
	}

	return playlists;
};

const loadPlaylistByName = async (name: string): Promise<Playlist | undefined> => {
	const saved = (await get('playlists')) || {};
	if (!saved[name]) return undefined;

	const tracks = (await Promise.all(
		saved[name].map(async ({ name, handle }: any) => {
			if (!(await verifyPermission(handle))) {
				console.warn(`Permission denied for accessing ${name}.`);
				return null;
			}
			const file = await handle.getFile();
			return {
				name,
				handle,
				url: URL.createObjectURL(file),
				coverArt: null,
			};
		})
	)) as Track[];

	const filtered = tracks.filter(Boolean);
	return { name, tracks: filtered };
};

const deletePlaylist = async (name: string): Promise<boolean> => {
	try {
		const saved = (await get('playlists')) || {};
		if (!saved[name]) {
			console.warn(`Playlist "${name}" not found.`);
			return false;
		}

		delete saved[name];
		await set('playlists', saved);
		console.log(`Playlist "${name}" successfully deleted.`);
		return true;
	} catch (error) {
		console.error(`Error deleting playlist "${name}":`, error);
		return false;
	}
};

export { verifyPermission, handleFiles, savePlaylist, loadSavedPlaylists, loadPlaylistByName, deletePlaylist };
