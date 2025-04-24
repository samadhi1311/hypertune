type Track = {
	name: string;
	handle: FileSystemFileHandle;
	url: string;
	coverArt: string | null;
};

type Playlist = {
	name: string;
	tracks: Track[];
};

type TrackMetadata = {
	title?: string;
	artist?: string;
	album?: string;
	cover?: string;
	duration?: number;
};

export { type Track, type Playlist, type TrackMetadata };
