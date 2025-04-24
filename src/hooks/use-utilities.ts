import { TrackMetadata } from '@/lib/types';
import { parseBlob } from 'music-metadata';

// Format time display (mm:ss)
const formatTime = (seconds: number) => {
	if (!seconds || isNaN(seconds)) return '0:00';
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

// Extract metadata
const extractMetadata = async (url: string) => {
	try {
		const response = await fetch(url);
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
			title: metadata.common.title || 'Unknown Track',
			artist: metadata.common.artist || 'Unknown Artist',
			album: metadata.common.album || 'Unknown Album',
			duration: metadata.format.duration || 0,
		} as TrackMetadata;
	} catch {
		return {
			cover: '',
			title: 'Unknown Track',
			artist: 'Unknown Artist',
			album: 'Unknown Album',
			duration: 0,
		} as TrackMetadata;
	}
};

export { formatTime, extractMetadata };
