import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatTime } from '@/hooks/use-utilities';
import { Playlist, TrackMetadata } from '@/lib/types';
import { parseBlob } from 'music-metadata';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { savePlaylist } from '@/hooks/use-file-management';
import { Input } from '@/components/ui/input';
import { MusicIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Tracklist({ playlist, onPlaylistSaved, currentTrackIndex }: { playlist: Playlist; onPlaylistSaved: () => void; currentTrackIndex: number }) {
	const [metadataList, setMetadataList] = useState<TrackMetadata[]>([]);
	const [playlistName, setPlaylistName] = useState('');
	const [dialogOpen, setDialogOpen] = useState(false);

	useEffect(() => {
		const fetchMetadata = async () => {
			const result: TrackMetadata[] = await Promise.all(
				playlist.tracks.map(async (track) => {
					try {
						const response = await fetch(track.url);
						const blob = await response.blob();
						const metadata = await parseBlob(blob);
						const cover = metadata.common.picture?.[0];
						let imageUrl = '';

						if (cover) {
							const picBlob = new Blob([cover.data], { type: cover.format });
							imageUrl = URL.createObjectURL(picBlob);
						}

						return {
							cover: imageUrl,
							title: metadata.common.title || track.name,
							artist: metadata.common.artist || 'Unknown Artist',
							album: metadata.common.album || 'Unknown Album',
							duration: metadata.format.duration,
						};
					} catch {
						return {
							cover: '',
							title: track.name,
							artist: 'Unknown Artist',
							album: 'Unknown Album',
							duration: 0,
						};
					}
				})
			);

			setMetadataList(result);
		};

		fetchMetadata();
	}, [playlist]);

	const handleClose = async () => {
		await savePlaylist(playlistName, playlist.tracks);
		setDialogOpen(false);

		if (onPlaylistSaved) {
			onPlaylistSaved();
		}
	};

	return (
		<div className='p-4 bg-sidebar/80 rounded-md border border-input inset-shadow-[0px_0px_32px] inset-shadow-border/50 h-[calc(100vh-calc(var(--spacing)*53))] overflow-hidden mt-17 mr-2'>
			<ScrollArea className='w-full h-full'>
				<div className='flex flex-row justify-between p-2 items-center my-8'>
					<h3 className='text-4xl font-medium tracking-tighter text-muted-foreground capitalize'>{playlist.name}</h3>
					<Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
						<DialogTrigger asChild>
							<Button>Save Playlist</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Save your playlist?</DialogTitle>
								<DialogDescription>Enter a title for your playlist.</DialogDescription>
								<Input type='text' placeholder='Playlist name' onChange={(e) => setPlaylistName(e.target.value)} />
							</DialogHeader>

							<DialogFooter>
								<Button onClick={handleClose}>Save Playlist</Button>
								<DialogClose>Cancel</DialogClose>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>

				<Table>
					<TableHeader>
						<TableRow>
							<TableHead></TableHead>
							<TableHead>Title</TableHead>
							<TableHead>Artists</TableHead>
							<TableHead>Album</TableHead>
							<TableHead>Duration</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{metadataList.map((track, index) => (
							<TableRow
								className={
									index === currentTrackIndex ? 'outline outline-border p-px bg-sidebar/20 inset-shadow-[0px_0px_32px] inset-shadow-border/50' : 'hover:bg-muted/50 transition-colors'
								}
								key={track.title}>
								<TableCell className='rounded-l-md border-l border-transparent'>
									{track.cover ? (
										<img src={track.cover} className='size-16 object-cover rounded' />
									) : (
										<div className='size-16 bg-muted rounded flex items-center justify-center'>
											<MusicIcon className='text-muted-foreground' />
										</div>
									)}
								</TableCell>
								<TableCell>{track.title}</TableCell>
								<TableCell>{track.artist || 'Unknown Artist'}</TableCell>
								<TableCell>{track.album || ''}</TableCell>
								<TableCell className='rounded-r-md border-r-2 border-transparent'>{formatTime(track.duration || 0)}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</ScrollArea>
		</div>
	);
}
